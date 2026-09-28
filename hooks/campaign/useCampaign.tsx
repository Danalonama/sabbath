import { useCampaignQuery } from "@/graphql/campaign/useCampaignQuery";
import { useGenerateLinksMutation } from "@/graphql/campaign/useGenrateLinksMutation";
import { createContext, useContext, useMemo, useState } from "react";
import {
  CampaignGroupViewPerMode,
  CampaignViewerMode,
  Url,
} from "types/campaigns/campaigns";

export default function useCampaign(id: string) {
  const { loading, campaign } = useCampaignQuery({ id });
  const [generateCampaignLinksMutation, { loading: generatingLinks }] =
    useGenerateLinksMutation();

  const generateCampaignLinks = async () => {
    try {
      await generateCampaignLinksMutation({ variables: { id } });
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  const getNumberOfUrlsInGroup = useMemo<CampaignGroupViewPerMode>(() => {
    if (campaign?.urls) {
      return {
        channel: new Set(campaign.urls?.map((obj: Url) => obj.channel.name))
          .size,
        audience: new Set(
          campaign.urls
            ?.filter((obj: Url) => obj.audience)
            .map((obj: Url) => obj.audience!.name)
        ).size,
        all: new Set(campaign.urls).size,
      };
    } else {
      return { channel: "‎ ‎", audience: "‎ ‎", all: "‎ ‎" };
    }
  }, [campaign]);

  return {
    loading,
    campaign,
    generateCampaignLinks,
    generatingLinks,
    getNumberOfUrlsInGroup,
    isLaunched: campaign?.launched || false,
  };
}

export interface GroupViewerContextType {
  setSelectedGroup: (group: CampaignViewerMode) => void;
  selectedGroup: CampaignViewerMode;
  countPerGroup: CampaignGroupViewPerMode;
}

export const GroupViewerContext = createContext<GroupViewerContextType>({
  setSelectedGroup: () => {},
  selectedGroup: "channel",
  countPerGroup: { channel: "‎ ‎", audience: "‎ ‎", all: "‎ ‎" },
});

export function useGroupViewerContext() {
  return useContext(GroupViewerContext);
}

export function useGroupViewer(countPerGroup: CampaignGroupViewPerMode) {
  const [selectedGroup, setSelectedGroup] =
    useState<CampaignViewerMode>("channel");

  return { selectedGroup, setSelectedGroup, countPerGroup };
}
