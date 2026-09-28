import { BasicObject } from "@/types";
import { normalizeGenericMapFilters } from "./generic-filters";

export const KALPI_SOURCE_ID = "composite";
export const KALPI_SOURCE_LAYER = "kalpi_location_mts";
export const KALPI_LEGACY_LAYER_ID = "kalpi-locations";
export const KALPI_ENHANCED_CIRCLE_LAYER_ID = "kalpi-locations-enhanced";
export const KALPI_ENHANCED_SELECTED_LAYER_ID =
  "kalpi-locations-enhanced-selected";
export const KALPI_BASE_ICON_ID = "base_kalpi";
export const KALPI_ACTIVE_ICON_ID = "base_kalpi_active";
export const KALPI_DEFAULT_ICON_COLOR = "#8A94A6";
export const KALPI_DEFAULT_ICON_ID = `${KALPI_BASE_ICON_ID}_default`;

export const KALPI_BASE_FIELDS = {
  id: "city_cluster_code",
  location: "location",
  legacyLocation: "place",
  nationalRank: "national_rank",
  potentialGroup: "potential_group",
};

export const DEFAULT_KALPI_POTENTIAL_GROUP_COLORS: Record<string, string> = {
  platinum: "platinum",
  gold: "gold",
  silver: "silver",
  bronze: "bronze",
  high: "gold",
  medium: "silver",
  low: "bronze",
  none: "platinum",
  "1": "platinum",
  "2": "gold",
  "3": "silver",
  "4": "bronze",
};

export const DEFAULT_KALPI_ICON_GRADIENTS: Record<string, string[]> = {
  platinum: ["#EBE8E5", "#FFFCFA", "#EDEDF0", "#D9D6D6", "#B8B5B8"],
  gold: ["#FFE04D", "#FFF299", "#FFD600", "#CC9E00"],
  silver: ["#BFBFBF", "#D9D9D9", "#B2B2B2", "#8C8C8C"],
  bronze: ["#AA672A", "#CC8C47", "#EBB873", "#C2803D", "#AA672A"],
};

export const KALPI_ICON_GRADIENT_SCHEMES: Record<
  string,
  Record<string, string[]>
> = {
  default: DEFAULT_KALPI_ICON_GRADIENTS,
};

export const getKalpiGradientStops = (
  fillValue: string,
  gradients: Record<string, string[]> = DEFAULT_KALPI_ICON_GRADIENTS,
) => gradients[fillValue] || gradients[fillValue.toLowerCase()];

export const getKalpiCssBackground = (
  fillValue: string,
  gradients: Record<string, string[]> = DEFAULT_KALPI_ICON_GRADIENTS,
) => {
  const stops = getKalpiGradientStops(fillValue, gradients);
  return stops?.length
    ? `linear-gradient(180deg, ${stops.join(", ")})`
    : fillValue;
};

export const getKalpiIconImageId = (
  value: string,
  base = KALPI_BASE_ICON_ID,
) => {
  const normalizedValue =
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "_")
      .replace(/^_+|_+$/g, "") || "value";

  return `${base}_${normalizedValue}`;
};

const toOrgPrefix = (value?: string) =>
  (value || "")
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();

export type KalpiLayerConfig = {
  enhanced: boolean;
  orgPrefix: string;
  source: string;
  sourceLayer: string;
  legacyLayerId: string;
  idField: string;
  locationField: string;
  legacyLocationField: string;
  rankField: string;
  potentialGroupField: string;
  iconColorField: string;
  colors: Record<string, string>;
  gradients: Record<string, string[]>;
  gradientScheme: string;
  tableFields?: string[];
};

export const getKalpiLayerConfig = (
  metadata: BasicObject = {},
  orgName?: string,
): KalpiLayerConfig => {
  const rawConfig =
    metadata.kalpiLayer || metadata.enhancedKalpiLayer || metadata.kalpi || {};
  const enhanced =
    rawConfig.enhanced ??
    rawConfig.enabled ??
    metadata.enhancedKalpiLayerEnabled ??
    metadata.robustKalpiLayer ??
    false;
  const orgPrefix = toOrgPrefix(
    rawConfig.orgPrefix || rawConfig.organizationPrefix || orgName,
  );
  const prefixedField = (field: string) =>
    orgPrefix ? `${orgPrefix}_${field}` : field;
  const configuredOrgField = (field?: string) => {
    if (!field) {
      return undefined;
    }
    return orgPrefix && !field.toUpperCase().startsWith(`${orgPrefix}_`)
      ? prefixedField(field)
      : field;
  };
  const potentialGroupField =
    configuredOrgField(rawConfig.potentialGroupField) ||
    prefixedField(KALPI_BASE_FIELDS.potentialGroup);
  const configuredGradientSchemes = {
    ...KALPI_ICON_GRADIENT_SCHEMES,
    ...(rawConfig.gradientSchemes || rawConfig.iconGradientSchemes || {}),
  };
  const gradientScheme =
    rawConfig.gradientScheme || rawConfig.iconGradientScheme || "default";
  const selectedGradients =
    configuredGradientSchemes[gradientScheme] ||
    configuredGradientSchemes.default ||
    DEFAULT_KALPI_ICON_GRADIENTS;

  return {
    enhanced: Boolean(enhanced),
    orgPrefix,
    source: rawConfig.source || KALPI_SOURCE_ID,
    sourceLayer: rawConfig.sourceLayer || KALPI_SOURCE_LAYER,
    legacyLayerId: rawConfig.legacyLayerId || KALPI_LEGACY_LAYER_ID,
    idField: rawConfig.idField || KALPI_BASE_FIELDS.id,
    locationField: rawConfig.locationField || KALPI_BASE_FIELDS.location,
    legacyLocationField:
      rawConfig.legacyLocationField || KALPI_BASE_FIELDS.legacyLocation,
    rankField:
      configuredOrgField(rawConfig.rankField) ||
      prefixedField(KALPI_BASE_FIELDS.nationalRank),
    potentialGroupField,
    iconColorField:
      configuredOrgField(
        rawConfig.iconColorField ||
          rawConfig.colorField ||
          rawConfig.fillColorField,
      ) || potentialGroupField,
    colors: {
      ...DEFAULT_KALPI_POTENTIAL_GROUP_COLORS,
      ...(rawConfig.colors || rawConfig.potentialGroupColors || {}),
    },
    gradients: {
      ...DEFAULT_KALPI_ICON_GRADIENTS,
      ...selectedGradients,
      ...(rawConfig.gradients || rawConfig.iconGradients || {}),
    },
    gradientScheme,
    tableFields: rawConfig.tableFields,
  };
};

export const getGenericMapFiltersFromMetadata = (metadata: BasicObject = {}) =>
  normalizeGenericMapFilters(
    metadata.genericMapFilters ||
      metadata.basicMapFilters ||
      metadata.mapFilters ||
      metadata.filters,
  );
