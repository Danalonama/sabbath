import {
  SignageFilterValue,
  SignageImplementationStatus,
  SignageSortValue,
} from "@/types";

export const SIGNAGE_SOURCE_ID = "signage-source";
export const SIGNAGE_LAYER_ID = "signage-points";
export const SIGNAGE_SELECTED_LAYER_ID = "signage-points-selected";

export const DEFAULT_SIGNAGE_ACTIVITY_TYPES = [
  "palrig",
  "bilboard",
  "operational",
];

export const SIGNAGE_STATUSES = ["suggestion", "implemented"] as const;

export const signageFilterValue = (activityType: string, status: string) =>
  `${activityType}:${status}`;

export const SIGNAGE_FILTER_VALUES = DEFAULT_SIGNAGE_ACTIVITY_TYPES.flatMap(
  (activityType) =>
    SIGNAGE_STATUSES.map((status) => signageFilterValue(activityType, status)),
);

export const signageActivityToColorIcon = (activityType: string) => {
  switch (activityType) {
    case "palrig":
      return "orange";
    case "bilboard":
      return "brown";
    case "operational":
      return "pink";
    default:
      return "light-blue";
  }
};

export const signageActivityStatusIcon = (status: string) => {
  switch (status) {
    case "suggestion":
      return "suggestion";
    case "implemented":
      return "done";
    default:
      return "suggestion";
  }
};

export const signageActivityToColor = (activityType: string) => {
  switch (activityType) {
    case "palrig":
      return "#FF5714";
    case "bilboard":
      return "#B08045";
    case "operational":
      return "#FA41E2";
    default:
      return "gray";
  }
};

export const SIGNAGE_FILTER_OPTIONS: {
  label: string;
  value: SignageFilterValue;
}[] = [
  { label: "all", value: "all" },
  { label: "suggestion", value: "suggestion" },
  { label: "implemented", value: "implemented" },
];

export const SIGNAGE_SORT_OPTIONS: {
  label: string;
  value: SignageSortValue;
}[] = [
  { label: "newest", value: "newest" },
  { label: "oldest", value: "oldest" },
  { label: "type", value: "type" },
  { label: "status", value: "status" },
];
