import { SignageActivity, SignageActivityInput, SignageCoordinates, SignageState } from "@/types";

export type SignageApiRecord = {
  id: string;
  org_id: string;
  type: string;
  status: string;
  address: string;
  statzone_id?: string | null;
  coordinates: string;
  description?: string | null;
  created_at?: string | null;
};

export function getDefaultSignageState(): SignageState {
  return {
    activities: [],
    selectedActivityId: null,
    filter: "all",
    sort: "newest",
    isModeEnabled: false,
  };
}

export function serializeSignageCoordinates(coordinates: SignageCoordinates) {
  return JSON.stringify({
    lat: coordinates.lat,
    lng: coordinates.lng,
  });
}

export function parseSignageCoordinates(value: string): SignageCoordinates {
  try {
    const parsed = JSON.parse(value);

    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.lat === "number" &&
      typeof parsed.lng === "number"
    ) {
      return { lat: parsed.lat, lng: parsed.lng };
    }

    if (
      Array.isArray(parsed) &&
      parsed.length === 2 &&
      typeof parsed[0] === "number" &&
      typeof parsed[1] === "number"
    ) {
      return { lng: parsed[0], lat: parsed[1] };
    }
  } catch (_error) {
    const parts = value.split(",").map((entry) => Number(entry.trim()));
    if (parts.length === 2 && parts.every((entry) => !Number.isNaN(entry))) {
      return { lng: parts[0], lat: parts[1] };
    }
  }

  return { lat: 0, lng: 0 };
}

export function mapApiSignageToActivity(record: SignageApiRecord): SignageActivity {
  return {
    id: record.id,
    orgId: record.org_id,
    activityType: record.type,
    implementationStatus:
      record.status === "implemented" ? "implemented" : "suggestion",
    address: record.address,
    statzoneId: record.statzone_id ?? undefined,
    coordinates: parseSignageCoordinates(record.coordinates),
    comment: record.description ?? undefined,
    createdAt: record.created_at ?? new Date().toISOString(),
    updatedAt: record.created_at ?? new Date().toISOString(),
  };
}

export function mapActivityInputToCreateSignageInput(input: SignageActivityInput) {
  return {
    type: input.activityType,
    status: input.implementationStatus,
    address: input.address,
    coordinates: serializeSignageCoordinates(input.coordinates),
    description: input.comment,
  };
}
