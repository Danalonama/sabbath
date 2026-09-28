import { useCampaignsQuery } from "@/graphql/campaigns/useCampaignsQuery";
import {
  AnalyticsCampaignGql,
  CampaignOrderDirection,
  CampaignOrderField,
} from "@/types/campaigns/campaigns";
import { createContext, useMemo, useState } from "react";

const PAGE_SIZE = 10;
const SKELETON_ROWS_COUNT = 6;

export type CampaignSortState = {
  orderBy: CampaignOrderField;
  orderDirection: CampaignOrderDirection;
};

export type CampaignTableRecord = AnalyticsCampaignGql & {
  __isSkeleton?: boolean;
};

const DEFAULT_SORT: CampaignSortState = {
  orderBy: "CREATED_AT",
  orderDirection: "DESC",
};

const createSkeletonRows = (count: number): CampaignTableRecord[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `skeleton-${index}`,
    orgId: "",
    name: "",
    kpi: "",
    createdAt: "",
    launched: false,
    channels: [],
    __isSkeleton: true,
  }));

export default function useCampaignsList(
  selectedKPI: string,
  dates: [string | null, string | null],
  searchTerm = "",
) {
  const [sort, setSort] = useState<CampaignSortState>(DEFAULT_SORT);
  const normalizedSearchTerm = searchTerm.trim();

  const {
    loading,
    campaigns,
    totalCount,
    pageInfo,
    isFetchingMore,
    isAnalyticsLoading,
    loadNextPage,
  } = useCampaignsQuery({
    orderBy: sort.orderBy,
    orderDirection: sort.orderDirection,
    first: PAGE_SIZE,
    ...(selectedKPI !== "All" ? { kpi: selectedKPI } : {}),
    ...(dates[0] ? { startDate: dates[0] } : {}),
    ...(dates[1] ? { endDate: dates[1] } : {}),
    ...(normalizedSearchTerm ? { searchPattern: normalizedSearchTerm } : {}),
  });

  const campaignsDisplay = useMemo(() => {
    if (loading) {
      return createSkeletonRows(PAGE_SIZE);
    }

    if (isFetchingMore && pageInfo.hasNextPage) {
      return [...campaigns, ...createSkeletonRows(SKELETON_ROWS_COUNT)];
    }

    return campaigns;
  }, [campaigns, isFetchingMore, loading, pageInfo.hasNextPage]);

  return {
    loading,
    campaigns: campaignsDisplay,
    totalCount,
    hasNextPage: pageInfo.hasNextPage,
    isFetchingMore,
    isAnalyticsLoading,
    loadNextPage,
    sort,
    setSort,
  };
}

export const MaxClicksContext = createContext<any>(null);
