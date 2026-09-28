import { BasicObject } from "@/types";
import { atom } from "jotai";

const navigationLinksAtom = atom<BasicObject[]>([]);

export const blockLinkNavigationAtom = atom<boolean>(false);

export const handleNavigationLinks = atom(
  (get) => get(navigationLinksAtom),
  (get, set, links: BasicObject[]) => set(navigationLinksAtom, links)
);
