import {
  DemsPartyMembersLayerConfig,
  getDemsPartyMembersLayerConfig,
} from "@/constants/map/dems-party-members";
import { BasicObject } from "@/types";
import { atom } from "jotai";
import { handleGroupAtom } from "../user-atoms";

export const demsPartyMembersLayerConfigAtom =
  atom<DemsPartyMembersLayerConfig>((get) => {
    const group = get(handleGroupAtom) as BasicObject;
    return (
      group.demsPartyMembersLayerConfig || getDemsPartyMembersLayerConfig()
    );
  });
