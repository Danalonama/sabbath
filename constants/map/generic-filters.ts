import { BasicObject } from "@/types";
import { KalpiLayerConfig } from "./kalpi";

export type GenericMapFilterTarget = "kalpi";

export type GenericMapFilterValue = {
  value: string;
  label?: string;
};

export type GenericMapFilterConfig = {
  id: string;
  target: GenericMapFilterTarget;
  field: string;
  label: string;
  values: GenericMapFilterValue[];
  sourceLayer?: string;
  icon?: string;
  enabled?: boolean;
  order?: number;
};

const KALPI_LEAN_FILTER_VALUES = [
  "Core",
  "Base",
  "PersuationHighVote",
  "PersuationLowVote",
  "GOTV",
  "None",
];

const normalizeFilterValue = (value: unknown): GenericMapFilterValue | null => {
  if (typeof value === "string" || typeof value === "number") {
    return { value: String(value) };
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const entry = value as BasicObject;
  const rawValue = entry.value ?? entry.key ?? entry.id;
  if (rawValue === undefined || rawValue === null || rawValue === "") {
    return null;
  }

  return {
    value: String(rawValue),
    label: entry.label ? String(entry.label) : undefined,
  };
};

const normalizeFilterValues = (values: unknown): GenericMapFilterValue[] => {
  if (Array.isArray(values)) {
    return (
      values
        .map(normalizeFilterValue)
        .filter(Boolean) as GenericMapFilterValue[]
    ).reverse();
  }

  if (values && typeof values === "object") {
    return Object.entries(values as Record<string, unknown>)
      .map(([value, label]) => ({
        value,
        label:
          label === undefined || label === null ? undefined : String(label),
      }))
      .reverse();
  }

  return [];
};

export const normalizeGenericMapFilters = (
  filters: unknown,
): GenericMapFilterConfig[] => {
  if (!Array.isArray(filters)) {
    return [];
  }

  return filters
    .map((filter, index) => {
      if (!filter || typeof filter !== "object") {
        return null;
      }

      const entry = filter as BasicObject;
      const target = entry.target || entry.layer;
      const field = entry.field;
      const values = normalizeFilterValues(entry.values || entry.options || []);

      if (target !== "kalpi" || !field || !values.length) {
        return null;
      }

      return {
        id: String(entry.id || `generic-${target}-${field}`),
        target,
        field: String(field),
        label: String(entry.label || entry.name || field),
        values,
        sourceLayer:
          entry.sourceLayer || entry.source_layer
            ? String(entry.sourceLayer || entry.source_layer)
            : undefined,
        icon: entry.icon ? String(entry.icon) : undefined,
        enabled: entry.enabled !== false,
        order: Number(
          entry.order ?? entry.sortOrder ?? entry.sort_order ?? index,
        ),
      } satisfies GenericMapFilterConfig;
    })
    .filter(Boolean)
    .sort(
      (first, second) => (first!.order ?? 0) - (second!.order ?? 0),
    ) as GenericMapFilterConfig[];
};

export const getDefaultKalpiGenericFilters = (
  config: KalpiLayerConfig,
): GenericMapFilterConfig[] => {
  if (!config.enhanced || !config.orgPrefix) {
    return [];
  }

  return [
    {
      id: "kalpi-potential-group",
      target: "kalpi",
      field: config.potentialGroupField,
      label: "Kalpi potential group",
      values: ["low", "medium", "high"].map((value) => ({ value })),
      sourceLayer: config.sourceLayer,
      icon: "icons/ballot_black",
      enabled: true,
      order: 0,
    },
    {
      id: "kalpi-lean",
      target: "kalpi",
      field: `${config.orgPrefix}_lean_str`,
      label: "Kalpi lean",
      values: KALPI_LEAN_FILTER_VALUES.map((value) => ({ value })),
      sourceLayer: config.sourceLayer,
      icon: "icons/ballot_black",
      enabled: true,
      order: 1,
    },
  ];
};

export const getKalpiGenericFilters = (
  config: KalpiLayerConfig,
  filters: GenericMapFilterConfig[] = [],
) => {
  const defaults = getDefaultKalpiGenericFilters(config);
  const configured = filters.filter(
    (filter) =>
      filter.enabled !== false &&
      filter.target === "kalpi" &&
      (!filter.sourceLayer || filter.sourceLayer === config.sourceLayer),
  );
  const configuredIds = new Set(configured.map((filter) => filter.id));

  return [
    ...configured,
    ...defaults.filter((filter) => !configuredIds.has(filter.id)),
  ];
};
