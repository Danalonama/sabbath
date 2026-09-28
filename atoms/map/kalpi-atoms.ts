import { getKalpiLayerConfig, KalpiLayerConfig } from "@/constants/map/kalpi";
import { normalizeKalpisForPanel } from "@/lib/kalpi/repository";
import MapboxHandler from "@/lib/mapbox/mapboxHandler";
import { BasicObject, KalpiFeature } from "@/types";
import { atom } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import { handleGroupAtom } from "../user-atoms";
import { genericKalpiFiltersMatchAtom } from "./map-filter-atoms";

const selectedKalpiIdAtom = atomWithReset<string>("");
const kalpiPanelOpenAtom = atomWithReset(false);
const loadedKalpisAtom = atom<KalpiFeature[]>([]);
const kalpisHydratedFromApiAtom = atom(false);

export const kalpiLayerConfigAtom = atom<KalpiLayerConfig>((get) => {
  const group = get(handleGroupAtom) as BasicObject;
  return group.kalpiLayerConfig || getKalpiLayerConfig();
});

export const hasEnhancedKalpiAccessAtom = atom(
  (get) => get(kalpiLayerConfigAtom).enhanced,
);

export const handleSelectedKalpiAtom = atom(
  (get) => get(selectedKalpiIdAtom),
  (get, set, kalpiId: string) => {
    set(selectedKalpiIdAtom, kalpiId);
    set(kalpiPanelOpenAtom, Boolean(kalpiId));
    set(handleLoadedKalpisAtom);
  },
);

export const handleKalpiPanelOpenAtom = atom(
  (get) => get(kalpiPanelOpenAtom),
  (get, set, open: boolean | typeof RESET) => {
    if (open === RESET) {
      set(kalpiPanelOpenAtom, RESET);
      set(selectedKalpiIdAtom, RESET);
      set(loadedKalpisAtom, []);
      set(kalpisHydratedFromApiAtom, false);
      return;
    }
    set(kalpiPanelOpenAtom, open);
    if (open) {
      set(handleLoadedKalpisAtom);
    } else {
      set(selectedKalpiIdAtom, "");
    }
  },
);

export const handleLoadedKalpisAtom = atom(
  (get) => {
    const matchesGenericFilters = get(genericKalpiFiltersMatchAtom);
    return get(loadedKalpisAtom).filter((kalpi) =>
      matchesGenericFilters({ ...kalpi.properties, ...kalpi }),
    );
  },
  (get, set) => {
    if (get(kalpisHydratedFromApiAtom)) {
      return;
    }
    const mapHandler = MapboxHandler.getInstance();
    const config = get(kalpiLayerConfigAtom);
    set(
      loadedKalpisAtom,
      normalizeKalpisForPanel(mapHandler.getKalpiFeatures(config), config),
    );
  },
);

export const handleKalpisHydrationAtom = atom(
  null,
  (_get, set, kalpis: KalpiFeature[], hydratedFromApi?: boolean) => {
    set(loadedKalpisAtom, kalpis);
    set(kalpisHydratedFromApiAtom, hydratedFromApi ?? kalpis.length > 0);
  },
);

export const handleKalpiTableRowClickAtom = atom(
  null,
  (get, set, kalpi: KalpiFeature) => {
    set(selectedKalpiIdAtom, kalpi.id);
    const mapHandler = MapboxHandler.getInstance();
    if (kalpi.coordinates) {
      mapHandler.focusOnPoint(kalpi.coordinates, 15);
    }
  },
);
