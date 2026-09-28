import { BasicObject } from "@/types";

export const DEMS_PARTY_MEMBERS_SOURCE_ID = "composite";
export const DEMS_PARTY_MEMBERS_SOURCE_LAYER = "dems_party_members";
export const DEMS_PARTY_MEMBERS_STYLE_LAYER_ID = "dems-party-members";
export const DEMS_PARTY_MEMBERS_LAYER_ID = "dems-party-members-points";
export const PARTY_SUPPORTERS_SOURCE_ID = "beyahad-party-supporters";
export const PARTY_SUPPORTERS_SOURCE_URL =
  "mapbox://agam-integration.beyahad_party_supporters";
export const PARTY_SUPPORTERS_SOURCE_LAYER = "beyahad_party_supporters";

export type DemsPartyMembersLayerConfig = {
  enabled: boolean;
  source: string;
  sourceUrl?: string;
  sourceLayer: string;
  addressField: string;
  partyMembersField: string;
  layerLabel?: string;
  valueLabel?: string;
};

export const getDemsPartyMembersLayerConfig = (
  metadata: BasicObject = {},
): DemsPartyMembersLayerConfig => {
  const rawConfig =
    metadata.partyAudienceLayer ||
    metadata.partySupportersLayer ||
    metadata.demsPartyMembersLayer ||
    metadata.partyMembersLayer ||
    metadata.democratsPartyMembersLayer ||
    {};
  const isPartySupportersLayer =
    rawConfig.kind === "party_supporters" ||
    rawConfig.type === "party_supporters" ||
    Boolean(metadata.partySupportersLayer) ||
    Boolean(metadata.addPartySupportersLayer);

  const enabled =
    rawConfig.enabled ??
    rawConfig.enhanced ??
    metadata.addPartyAudienceLayer ??
    metadata.addPartySupportersLayer ??
    metadata.addDemsPartyMembersLayer ??
    metadata.addDemocratsPartyMembersLayer ??
    metadata.addPartyMembersLayer ??
    false;

  return {
    enabled: Boolean(enabled),
    source:
      rawConfig.source ||
      (isPartySupportersLayer
        ? PARTY_SUPPORTERS_SOURCE_ID
        : DEMS_PARTY_MEMBERS_SOURCE_ID),
    sourceUrl:
      rawConfig.sourceUrl ||
      rawConfig.url ||
      (isPartySupportersLayer ? PARTY_SUPPORTERS_SOURCE_URL : undefined),
    sourceLayer:
      rawConfig.sourceLayer ||
      (isPartySupportersLayer
        ? PARTY_SUPPORTERS_SOURCE_LAYER
        : DEMS_PARTY_MEMBERS_SOURCE_LAYER),
    addressField: rawConfig.addressField || "address",
    partyMembersField:
      rawConfig.valueField ||
      rawConfig.partySupportersField ||
      rawConfig.partyMembersField ||
      (isPartySupportersLayer ? "party_supporters" : "party_members"),
    layerLabel:
      rawConfig.layerLabel ||
      rawConfig.label ||
      (isPartySupportersLayer ? "תומכים" : undefined),
    valueLabel:
      rawConfig.valueLabel ||
      (isPartySupportersLayer ? "תומכי המפלגה:" : undefined),
  };
};
