import {
  Audience,
  CampaignVariables,
  CampaignWizardData,
  WizardStepDefinition,
} from "@/types";
import { atom } from "jotai";
import { atomWithReset, loadable, RESET, useResetAtom } from "jotai/utils";
import { useCallback } from "react";
import { messageAtom } from "../message-atom";
import { createApolloAtomFetcher } from "@/lib/apollo/hooks/atom/atomsFetcher";
import { PREFORM_CAMPAIGN_SEARCH } from "@/graphql/hooks/campaigner/campaign/useCampaignSearch";
import { gqlMutate } from "@/lib/apollo/hooks/runGqlMutation";
import { CREATE_CAMPAIGN_MUTATION } from "@/graphql/hooks/campaigner/campaign/useCreateCampaign";
import { UPDATE_CAMPAIGN_MUTATION } from "@/graphql/hooks/campaigner/campaign/useUpdateCampaign";
import { INSERT_DATA_POST_LAUNCH_MUTATION } from "@/graphql/hooks/campaigner/campaign/useInsertDataPostLaunch";

export const initialCampaignFetchAtom = atomWithReset<boolean>(false);

export const wizardStepsDefinitionAtom = atom<WizardStepDefinition[]>([]);

const activeStepIndexAtom = atomWithReset<number>(0);

const savedWizardDataAtom = atomWithReset<{ id?: string }>({});

export const campaignWizardDataAtom = atomWithReset<CampaignWizardData>({});

export const createdCampaignWizardDataAtom = atomWithReset<CampaignWizardData>(
  {},
);

export const addedDataPostLaunchAtom = atomWithReset<{
  id: string | undefined;
  channels: string[];
  audiences: Audience[];
}>({
  id: undefined,
  channels: [],
  audiences: [],
});

export const currentStepValidatorAtom = atomWithReset<
  (() => Promise<boolean>) | null
>(null);

export const loadOnSaveAtom = atomWithReset<boolean>(false);

export const handleStepNavigation = atom(
  (get) => get(activeStepIndexAtom),
  async (get, set, action: typeof RESET | "next" | "previous") => {
    if (action === RESET) {
      set(activeStepIndexAtom, RESET);
      return;
    }
    const allSteps = get(wizardStepsDefinitionAtom);
    const currentStepIndex = get(activeStepIndexAtom);
    const validator = get(currentStepValidatorAtom);

    if (action === "next") {
      if (validator) {
        const isValid = await validator();
        if (!isValid) return; // block navigation
      }
      // If not last step, increment
      if (currentStepIndex < allSteps.length - 1) {
        set(activeStepIndexAtom, currentStepIndex + 1);
      } else {
        set(handleSaveWizardData, true);
      }
    } else if (action === "previous") {
      if (currentStepIndex > 0) {
        set(activeStepIndexAtom, currentStepIndex - 1);
      }
    }
  },
);

export const handleSaveAndCloseWizardButton = atom(
  null,
  (get, set, showModal: () => void) => {
    const campaignData = get(campaignWizardDataAtom);
    if (!campaignData.name || !campaignData.kpi) {
      showModal();
      return;
    }
    set(handleSaveWizardData);
  },
);

export const handleSaveWizardData = atom(
  (get) => get(savedWizardDataAtom),
  async (get, set, launch?: boolean) => {
    const validator = get(currentStepValidatorAtom);
    if (validator) {
      const isValid = await validator();
      if (!isValid) return; // block navigation
    }

    const campaign = { ...get(campaignWizardDataAtom) };
    const messageApi = get(messageAtom);
    set(loadOnSaveAtom, true);
    try {
      // ---- prep & mapping (same as before) ----
      const isEditing = Boolean(campaign.id);
      const isLaunched = Boolean(campaign?.launched) || false;
      if (!campaign.createdAt) {
        campaign.createdAt = new Date().toISOString();
      }

      if (isLaunched) {
        const addedData = get(addedDataPostLaunchAtom);
        const variables = {
          campaignId: addedData.id,
          channelIds: addedData.channels || [],
          audiences:
            addedData?.audiences
              ?.filter((audience) => audience.name)
              .map((audience) => {
                return {
                  name: audience.name,
                  size:
                    typeof audience.size === "string"
                      ? parseInt(audience.size)
                      : audience.size,
                };
              }) || [],
        };
        const result = await gqlMutate(
          INSERT_DATA_POST_LAUNCH_MUTATION,
          variables,
        );
        set(savedWizardDataAtom, {
          id: addedData.id,
        });
      } else {
        const variables: CampaignVariables = {
          ...(isEditing
            ? { id: campaign.id }
            : { createdAt: campaign.createdAt }),
          name: campaign.name,
          kpi: campaign.kpi,
          channelIds: campaign.channels?.map((c) => c.id) || [],
          audiences:
            campaign?.audiences
              ?.filter((audience) => audience.name)
              .map((audience) => {
                return {
                  name: audience.name,
                  size:
                    typeof audience.size === "string"
                      ? parseInt(audience.size)
                      : audience.size,
                };
              }) || [],
          baseLink: campaign.baseLink,
        };

        if (launch) {
          variables.launch = true;
        }

        const result = isEditing
          ? await gqlMutate(UPDATE_CAMPAIGN_MUTATION, variables)
          : await gqlMutate(CREATE_CAMPAIGN_MUTATION, variables);
        // adjust for whatever your schema returns
        set(
          savedWizardDataAtom,
          isEditing ? result.updateCampaign : result.createCampaign,
        );
      }
      messageApi?.success(
        `Campaign ${isEditing ? "updated" : "created"} successfully!`,
      );
    } catch (error) {
      console.error(error);
      messageApi?.error("Failed to save the campaign.");
    } finally {
      set(loadOnSaveAtom, false);
    }
  },
);

export const handleCampaignDataAtom = atom(
  (get) => get(campaignWizardDataAtom),
  (get, set, data) => {},
);

export function useResetAllWizardAtoms() {
  const resetWizardAtoms = [
    activeStepIndexAtom,
    initialCampaignFetchAtom,
    createdCampaignWizardDataAtom,
    campaignWizardDataAtom,
    savedWizardDataAtom,
    loadOnSaveAtom,
    currentStepValidatorAtom,
  ];
  const resetWizardAtomsFunctions = resetWizardAtoms.map((wizAtom) =>
    useResetAtom(wizAtom),
  );

  return useCallback(() => {
    resetWizardAtomsFunctions.forEach((resetFunction) => resetFunction());
  }, [...resetWizardAtoms]);
}

const searchCampaignTermAtom = atom<string | null>(null);

export const handleSearchCampaignTerm = atom(
  (get) => get(searchCampaignTermAtom),
  (get, set, name: string) => {
    set(searchCampaignTermAtom, name);
  },
);
