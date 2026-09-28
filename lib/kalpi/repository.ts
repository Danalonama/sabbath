import { KalpiFeature } from "@/types";
import { KalpiLayerConfig } from "@/constants/map/kalpi";
import { LngLat } from "mapbox-gl";

export type KalpiApiRecord = {
  id?: string | null;
  city_cluster_code?: string | null;
  location?: string | null;
  place?: string | null;
  national_rank?: string | number | null;
  potential_group?: string | null;
  coordinates?: string | number[] | { lat?: number; lng?: number } | null;
  properties?: Record<string, any> | null;
};

function parseKalpiCoordinates(
  value: KalpiApiRecord["coordinates"],
): LngLat | undefined {
  if (!value) {
    return undefined;
  }

  if (Array.isArray(value) && value.length >= 2) {
    return new LngLat(Number(value[0]), Number(value[1]));
  }

  if (!Array.isArray(value) && typeof value === "object") {
    const lng = Number(value.lng);
    const lat = Number(value.lat);
    if (!Number.isNaN(lng) && !Number.isNaN(lat)) {
      return new LngLat(lng, lat);
    }
    return undefined;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parseKalpiCoordinates(parsed);
    } catch (_error) {
      const parts = value.split(",").map((part: string) => Number(part.trim()));
      if (parts.length >= 2 && parts.every((part: number) => !Number.isNaN(part))) {
        return new LngLat(parts[0], parts[1]);
      }
    }
  }

  return undefined;
}

export function mapApiKalpiToFeature(record: KalpiApiRecord): KalpiFeature {
  const properties = record.properties || {};
  const id = String(
    record.city_cluster_code ||
      record.id ||
      properties.city_cluster_code ||
      properties.id ||
      "",
  );

  return {
    id,
    location: String(
      record.location || record.place || properties.location || properties.place || id,
    ),
    rank:
      record.national_rank ??
      properties.national_rank ??
      properties.DEMO_national_rank,
    potentialGroup:
      record.potential_group ??
      properties.potential_group ??
      properties.DEMO_potential_group,
    coordinates: parseKalpiCoordinates(record.coordinates),
    properties: {
      ...properties,
      ...(record.city_cluster_code ? { city_cluster_code: record.city_cluster_code } : {}),
      ...(record.location ? { location: record.location } : {}),
      ...(record.place ? { place: record.place } : {}),
      ...(record.national_rank !== undefined
        ? { national_rank: record.national_rank }
        : {}),
      ...(record.potential_group ? { potential_group: record.potential_group } : {}),
    },
  };
}

function getKalpiValue(
  kalpi: KalpiFeature,
  field: string,
  orgPrefix?: string,
) {
  const prefixedField = orgPrefix ? `${orgPrefix}_${field}` : field;
  const record = kalpi as KalpiFeature & Record<string, unknown>;
  return (
    kalpi.properties[field] ??
    record[field] ??
    kalpi.properties[prefixedField] ??
    record[prefixedField]
  );
}

function getOrgKalpiValue(
  kalpi: KalpiFeature,
  field: string,
  orgPrefix?: string,
) {
  const record = kalpi as KalpiFeature & Record<string, unknown>;
  return (
    kalpi.properties[field] ??
    record[field] ??
    getKalpiValue(kalpi, field, orgPrefix)
  );
}

function toRankNumber(value: unknown) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0
    ? numericValue
    : undefined;
}

function getCompletenessScore(kalpi: KalpiFeature) {
  return Object.values(kalpi.properties || {}).filter(
    (value) => value !== undefined && value !== null && value !== "",
  ).length;
}

function chooseBetterKalpi(current: KalpiFeature, candidate: KalpiFeature) {
  return getCompletenessScore(candidate) > getCompletenessScore(current)
    ? candidate
    : current;
}

export function normalizeKalpisForPanel(
  kalpis: KalpiFeature[],
  config: KalpiLayerConfig,
) {
  const orgRankField = config.rankField;
  const byClusterCode = new Map<string, KalpiFeature>();

  kalpis.forEach((kalpi) => {
    const clusterCode = String(
      getKalpiValue(kalpi, config.idField) ||
        getKalpiValue(kalpi, "city_cluster_code") ||
        kalpi.id,
    );

    if (!clusterCode) {
      return;
    }

    const existing = byClusterCode.get(clusterCode);
    byClusterCode.set(
      clusterCode,
      existing ? chooseBetterKalpi(existing, kalpi) : kalpi,
    );
  });

  return Array.from(byClusterCode.values())
    .sort((kalpiA, kalpiB) => {
      const rankA =
        toRankNumber(getOrgKalpiValue(kalpiA, orgRankField)) ||
        Number.MAX_SAFE_INTEGER;
      const rankB =
        toRankNumber(getOrgKalpiValue(kalpiB, orgRankField)) ||
        Number.MAX_SAFE_INTEGER;
      const clusterCodeA = String(getKalpiValue(kalpiA, "city_cluster_code"));
      const clusterCodeB = String(getKalpiValue(kalpiB, "city_cluster_code"));
      return rankA - rankB || clusterCodeA.localeCompare(clusterCodeB);
    });
}
