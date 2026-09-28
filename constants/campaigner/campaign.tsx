import { CampaignIcon, Target } from "@/components/Icons";
import { ReactNode } from "react";
import { CampaignWizardData } from "@/types";
import { CampaignViewerMode } from "types/campaigns/campaigns";
import { UseTranslationType } from "types/general";

export type CampaignHeaderEntryDef = {
  name: keyof CampaignWizardData;
  icon: ReactNode;
  format?: (entry: string, translate?: UseTranslationType) => string;
  postLaunch?: boolean;
};

export const CAMPAIGN_TITLE_VALUES: CampaignHeaderEntryDef[] = [
  {
    name: "name",
    icon: <CampaignIcon className=" !h-4 !w-4" />,
  },
  {
    name: "kpi",
    icon: <Target className="!w-5" />,
    format: (entry: string, translate?: UseTranslationType) =>
      translate ? translate(entry) || "" : "",
  },
  {
    name: "launchedAt",
    icon: <img src="/images/icons/calendar.svg" alt="calendar" />,
    format: (date?: string) => {
      const finalDate = date ? new Date(date) : new Date();
      return finalDate.toLocaleDateString("en-GB").replace(/\//g, "-");
    },
    postLaunch: true,
  },
];

export const CAMPAIGN_URL_VIEW: {
  option: CampaignViewerMode;
  icon: ReactNode;
  dataKey: string;
}[] = [
  {
    option: "channel",
    icon: <img src="/images/icons/lightning.svg" alt="activity" />,
    dataKey: "channels",
  },
  {
    option: "audience",
    icon: <img src="/images/icons/people.svg" alt="people" />,
    dataKey: "audience",
  },
  {
    option: "all",
    icon: (
      <img src="/images/icons/people-lightning.svg" alt="people and activity" />
    ),
    dataKey: "all",
  },
];
