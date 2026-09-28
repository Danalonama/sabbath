type ID = string;

export interface QueryReturn {
  loading: boolean;
}

export type Channel = {
  id: ID;
  name: string;
  utm_source?: string;
  utm_medium?: string;
  category: string;
  icon: string;
};

export type Audience = {
  id?: ID;
  name: string;
  size: number;
};

export type Url = {
  url: string | null;
  channel: Channel;
  audience?: Audience;
};

export type PerformanceGroup = {
  name: string;
  clicks: number;
  percent: number;
};

export type CampaignGql = {
  id: ID;
  orgId: string;
  name: string;
  kpi: string;
  baseLink?: string;
  createdAt: string;
  launched: boolean;
  launchedAt?: string;
  topChannels?: PerformanceGroup;
  topAudiences?: PerformanceGroup;
};

export type AnalyticsCampaignGql = CampaignGql & {
  totalClicks?: number;
  totalConverted?: number;
  percentClicks?: number;
  percentConverted?: number;
  channels?: Channel[];
};

export type CampaignOrderField =
  | "NAME"
  | "CREATED_AT"
  | "TOTAL_CLICKS"
  | "TOTAL_CONVERTED"
  | "PERCENT_CLICKS"
  | "PERCENT_CONVERTED"
  | "LAUNCH_DATE";

export type CampaignOrderDirection = "ASC" | "DESC";

export type CampaignPageInfo = {
  hasNextPage: boolean;
  endCursor: string | null;
};

export type CampaignsCountGql = {
  All: number;
  [key: string]: number;
};

export type CampaignViewerMode = "channel" | "audience" | "all";

export type PerformanceType = "clicks" | "converted";

export type CampaignGroupViewPerMode = Record<
  CampaignViewerMode,
  number | "loading" | "‎ ‎"
>;
