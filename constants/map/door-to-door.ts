export const DOOR_TO_DOOR_SOURCE_ID = "door-to-door-source";
export const DOOR_TO_DOOR_LAYER_ID = "door-to-door-points";

export const DOOR_TO_DOOR_ICON_IDS = {
  pledged: "circle-check",
  declined: "circle-negative",
  needs_follow_up: "circle-clock",
  other: "circle-Info",
} as const;

export type DoorToDoorIconKey = keyof typeof DOOR_TO_DOOR_ICON_IDS;
