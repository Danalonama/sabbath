import { BasicObject, CampaignWizardData, Channel } from "@/types";
import { atom } from "jotai";
import { GET_CHANNELS } from "@/graphql/hooks/campaigner/general/useChannels";
import { gqlQuery } from "@/lib/apollo/hooks/runGqlQuery";

export const channelsAtom = atom<Channel[]>([]);

export const campaignsAtom = atom<BasicObject | null>(null);

export const campaignDataAtom = atom<CampaignWizardData | null>(null);

export const initialQueryFetch = [
  {
    atom: channelsAtom,
    query: GET_CHANNELS,
    extractor: (data: BasicObject) => data.channels,
  },
];

const fetchDataWithRetry = async (fetchAtom: any, retries: number = 3) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const fetchedData = await gqlQuery(fetchAtom.query);
      const formattedData = fetchAtom.extractor
        ? fetchAtom.extractor(fetchedData)
        : fetchedData;
      return formattedData;
    } catch (error) {
      if (attempt === retries - 1) {
        throw error;
      }
    }
  }
};

export const initialFetchCampaignerAtoms = initialQueryFetch.map(
  (fetchAtom) => {
    return {
      ...fetchAtom,
      fetchFunction: atom(
        async (get) => {
          return await fetchDataWithRetry(fetchAtom);
        },
        (get, set, data: any[]) => {
          set(fetchAtom.atom as any, data);
        },
      ),
    };
  },
);
