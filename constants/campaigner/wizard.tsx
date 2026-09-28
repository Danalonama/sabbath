// wizard-config.ts
import { NamingAndKpiStep } from "@/components/Campaigner/Wizard/steps/NamingAndKpiStep";
import { ChannelsStep } from "@/components/Campaigner/Wizard/steps/ChannelsStep";
import { AudienceStep } from "@/components/Campaigner/Wizard/steps/AudienceStep";
import {
  AudienceComponentDef,
  AudienceKey,
  BasicObject,
  WizardStepDefinition,
} from "@/types";
import { ReactElement } from "react";
import CsvUpload from "@/components/Campaigner/Wizard/CsvUpload";
import GeoAudience from "@/components/Campaigner/Wizard/GeoAudience";

export const CAMPAIGNS_ROUTE = "/campaigns";

export const CREATE_NEW_CAMPAIGN_ROUTE = `${CAMPAIGNS_ROUTE}/new`;

export const CAMPAIGN_ROUTE = (id: string) => `${CAMPAIGNS_ROUTE}/${id}`;

export const EDIT_CAMPAIGN_ROUTE = (id: string) => `${CAMPAIGN_ROUTE(id)}/edit`;

export const BASE_INSERT_NEw_DATA_POST_LAUNCH_OBJECT = (id: string) => {
  return { id: id, channels: [], audiences: [] };
};

export const WIZARD_STEPS_CONFIG: WizardStepDefinition[] = [
  {
    key: "naming-and-kpi",
    title: "Naming & KPI",
    component: <NamingAndKpiStep />,
  },
  {
    key: "channels",
    title: "Channels",
    component: <ChannelsStep />,
  },
  {
    key: "audience",
    title: "Audience",
    component: <AudienceStep />,
  },
];

export const NAMING_KPI_FORM_CONFIG = [
  {
    name: "kpi",
    type: "kpi",
    required: true,
    rules: [{ required: true, message: "${required}" }],
  },
  {
    name: "name",
    type: "search",
    required: true,
    rules: [{ required: true, message: "${required}" }],
  },
  {
    name: "baseLink",
    type: "input",
    required: true,
    rules: [
      { required: true, message: "${required}" },
      { type: "url", message: "${url}" },
      { pattern: /^(?!.*utm_).*$/, message: "${utm_warning}" },
    ],
    inputValues: { placeholder: "https://example.com" },
  },
];

export const BASE_KPI = [
  "AWARENESS",
  "FUNDRAISING",
  "SELLING_MERCHANDISE",
  "NEW_SUPPORTERS_RECRUITMENT",
  "VOLUNTEERS_RECRUITMENT",
];

const CATEGORY_ORDER = ["direct", "organic", "paid", "physical"];

export const getCategoryRank = (cat: string) => {
  const rank = CATEGORY_ORDER.indexOf(cat);
  return rank === -1 ? Number.MAX_SAFE_INTEGER : rank;
};

export const CHANNELS_ORDER_PRIORITY_LEGEND = {
  facebook: 1,
  instagram: 2,
  meta: 3,
  email: 4,
  newsletter: 5,
};

export const AUDIENCE_EXPLANATION_CONFIG: { [key: string]: ReactElement } = {
  manual: <img src="/images/icons/pencil.svg" />,
  csv: <img src="/images/icons/upload.svg" />,
  geo: <img src="/images/icons/location.svg" />,
};

export const AUDIENCE_FIELDS: BasicObject = {
  name: { type: "text" },
  size: { type: "number", editable: true },
};

export const INITIAL_AUDIENCE_FIELDS = {
  type: undefined,
  name: "",
  size: null,
};

export const AUDIENCE_TYPE_DEF: AudienceKey[] = ["csv", "geo"];
