import MapboxHandler from "@/lib/mapbox/mapboxHandler";
import { getFilterRule } from "@/lib/utils/componentsUtils/filter";
import { BasicObject, PolygonListItem, FilterObject } from "@/types";
import { atom } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import {
  handleCurrentLayer,
  handleCurrentPolygon,
  handleIsLayoutChanged,
} from "./map-atoms";
import { handleGroupAtom, handleUserAtom } from "../user-atoms";
import { convertPointToLngLat } from "@/lib/utils/handlers/mapbox";
import { LayerFilterList } from "@/constants/constants";
import { getKalpiGenericFilters } from "@/constants/map/generic-filters";

const currentFiltersBlocksAtom = atomWithReset<number[]>([]);

const currentFiltersBlocksSelectedTypeAtom = atomWithReset<string[]>([]);

const currentFilterLayerBlockAtom = atomWithReset<string>("");

const externalFilterTypeAtom = atomWithReset<BasicObject>({});

const currentFiltersAtom = atomWithReset<BasicObject>({});

const currentLayerFilterAtom = atomWithReset<string[]>([]);

const currentToggleLegendFilterAtom = atomWithReset<string[][]>([]);

const currentNegateFiltersAtom = atomWithReset<string[]>([]);

const currentGenericKalpiFiltersAtom = atomWithReset<BasicObject>({});

const currentGenericKalpiNegateFiltersAtom = atomWithReset<string[]>([]);

const currentLayerFilterDefinitionAtom = atom<BasicObject>({});

const currentPolygonsListAtom = atomWithReset<PolygonListItem[]>([]);

const isPolygonsListOpenAtom = atom<boolean>(false);

const isPolygonsListSelectedAtom = atom<boolean>(false);

export const filterShowAtom = atom(false);

export const isCurrentPolygonListLoadingAtom = atom(false);

export const handleFilterShown = atom(
  (get) => get(filterShowAtom),
  (get, set) => {
    set(filterShowAtom, !get(filterShowAtom));
    if (!get(handleCurrentFiltersBlocks).length) {
      set(handleCurrentFiltersBlocks, "add", 1);
    }
  },
);

export const handleCurrentFiltersBlocks = atom(
  (get) => get(currentFiltersBlocksAtom),
  (get, set, type: "add" | "remove" | typeof RESET, id?: number | string) => {
    switch (type) {
      case RESET:
        set(filterShowAtom, false);
        set(currentFiltersBlocksAtom, RESET);
        set(handleCurrentFiltersBlocksSelectedType, RESET);
        set(handleCurrentFilters, RESET);
        break;
      case "add":
        if (typeof id === "number") {
          set(currentFiltersBlocksAtom, [id]);
          break;
        }
        set(currentFiltersBlocksAtom, [
          ...get(handleCurrentFiltersBlocks),
          get(getLastBlockId) + 1,
        ]);
        break;
      case "remove":
        if (id) {
          const newFiltersBlocks = [...get(handleCurrentFiltersBlocks)].filter(
            (filter) => filter + "" !== id,
          );
          !newFiltersBlocks.length && set(filterShowAtom, false);
          set(handleCurrentFilters, id + "", [], false);
          set(currentFiltersBlocksAtom, newFiltersBlocks);
          if (get(handleCurrentFilterLayerBlock) === id + "")
            set(handleCurrentFilterLayerBlock, RESET);
        }
        break;
    }
  },
);

export const handleCurrentFiltersBlocksSelectedType = atom(
  (get) => get(currentFiltersBlocksSelectedTypeAtom),
  (get, set, action: "add" | "remove" | typeof RESET, type?: string) => {
    if (action === RESET) {
      set(currentFiltersBlocksSelectedTypeAtom, RESET);
      return;
    }
    if (!type) {
      return;
    }
    const prevFilterBlocks = get(currentFiltersBlocksSelectedTypeAtom);
    if (action === "remove") {
      set(
        currentFiltersBlocksSelectedTypeAtom,
        prevFilterBlocks.filter((block) => block !== type),
      );
    } else if (action === "add" && !prevFilterBlocks.includes(type)) {
      set(currentFiltersBlocksSelectedTypeAtom, [...prevFilterBlocks, type]);
    }
  },
);

export const getLastBlockId = atom((get) => {
  const prevFiltersBlocks = get(handleCurrentFiltersBlocks);
  return prevFiltersBlocks[prevFiltersBlocks.length - 1];
});

export const handleCurrentFilterLayerBlock = atom(
  (get) => get(currentFilterLayerBlockAtom),
  (get, set, id: string | typeof RESET) => {
    set(currentFilterLayerBlockAtom, id);
  },
);

export const handleExternalFilterType = atom(
  (get) => get(externalFilterTypeAtom),
  (get, set, id: string | typeof RESET, type?: string) => {
    set(externalFilterTypeAtom, id === RESET ? RESET : { [id]: type });
  },
);

export const handleCurrentFilters = atom(
  (get) => get(currentFiltersAtom),
  async (
    get,
    set,
    id: string | typeof RESET,
    filters: FilterObject[] = [],
    negate?: boolean,
  ) => {
    const mapHandler = MapboxHandler.getInstance();
    if (id === RESET) {
      set(currentFiltersAtom, RESET);
      set(currentNegateFiltersAtom, []);
      set(handlePolygonsListOpen, false);
      set(handleIsPolygonsListSelected, false);
      set(handleCurrentLayerFilter, RESET);
      set(handleCurrentFilterLayerBlock, RESET);
      set(currentToggleLegendFilterAtom, RESET);
      set(currentGenericKalpiFiltersAtom, RESET);
      set(currentGenericKalpiNegateFiltersAtom, RESET);
      if (mapHandler.checkIfInitialized()) {
        mapHandler.setLayerFilter();
      }
      return;
    }
    const newFilters = { ...get(currentFiltersAtom) };

    if (filters?.length) {
      newFilters[id] = filters;
    } else {
      if (id in newFilters) {
        delete newFilters[id];
      }
    }

    const negateFilters = get(currentNegateFiltersAtom);
    const newNegateFilters = negate
      ? [...negateFilters, id]
      : negateFilters.filter((e: string) => e !== id);

    get(handlePolygonsListOpen) && set(handlePolygonsListOpen, false);
    set(currentFiltersAtom, newFilters);
    set(currentNegateFiltersAtom, newNegateFilters);

    if (get(handleCurrentFilterLayerBlock) === id) {
      set(handleCurrentLayerFilter, filters?.length ? filters[0] : RESET);
    }

    const filterRule = getFilterRule(newFilters, newNegateFilters, get(handleCurrentLayer)?.filter);
    mapHandler.setLayerFilter(filterRule);
  },
);

export const isLegendFilterNegate = atom((get) =>
  get(currentNegateFiltersAtom).includes(get(handleCurrentFilterLayerBlock)),
);

export const handleCurrentLayerFilter = atom(
  (get) => get(currentLayerFilterAtom),
  (get, set, filter: FilterObject | typeof RESET) => {
    if (filter === RESET) {
      set(currentLayerFilterAtom, RESET);
      return;
    }
    set(currentLayerFilterAtom, filter.values as string[]);
  },
);

export const handleToggleLegendFilter = atom(
  (get) => get(currentToggleLegendFilterAtom),
  (get, set, value: string) => {
    const layerBlock = get(handleCurrentFilterLayerBlock);
    if (!layerBlock) {
      const filterBlocks = get(handleCurrentFiltersBlocks);
      set(
        handleCurrentFiltersBlocks,
        "add",
        !filterBlocks.length ? 1 : undefined,
      );
      const lastAddedBlock = get(getLastBlockId) + "";
      set(handleExternalFilterType, lastAddedBlock, "layer");
      set(handleCurrentFilterLayerBlock, lastAddedBlock);
    }
    const newLayerBlock = get(handleCurrentFilterLayerBlock);
    if (newLayerBlock) {
      const prevValues = get(handleCurrentLayerFilter);
      const parsedPrevValues = prevValues.every(
        (value) =>
          value.length === 2 &&
          (Array.isArray(value[0]) || typeof value[0] === "string"),
      )
        ? prevValues.map((value) => JSON.stringify(value))
        : prevValues;
      let newValues: any[] = [];
      if (JSON.stringify(parsedPrevValues).includes(JSON.stringify(value))) {
        newValues = parsedPrevValues.filter(
          (prevValue) => JSON.stringify(prevValue) !== JSON.stringify(value),
        );
      } else {
        newValues = [...parsedPrevValues, value];
      }
      set(
        currentToggleLegendFilterAtom,
        newValues.map((value) => [value]),
      );
    }
    if (!get(handleFilterShown)) {
      set(handleFilterShown);
    }
  },
);

export const handleCurrentLayerFilterDefinition = atom(
  (get) => get(currentLayerFilterDefinitionAtom),
  (get, set, legendObject: BasicObject) => {
    const { legend, type } = legendObject;
    const filterDef: {
      fields: string[];
      options: string[];
      rangeLabelOffset?: number;
    } = {
      fields: [],
      options: [],
    };
    switch (type) {
      case "step":
        filterDef.fields = [legend.field];
        filterDef.options = legend.steps.map((step: BasicObject) => step.range);
        filterDef.rangeLabelOffset = legend.steps.length === 3 ? 1 : 0;
        break;
      case "bivector":
        filterDef.fields = [legend.field, legend.steps[0].value.field];
        let tempOptions: any[] = [];
        legend.steps.forEach((firstStep: BasicObject) => {
          firstStep.value.steps.forEach((secondStep: BasicObject) => {
            tempOptions.push([firstStep.range, secondStep.range]);
          });
        });
        filterDef.options = tempOptions;
        break;
      case "compass":
        filterDef.fields = [legend.field, legend.steps[0].field];
        let compassOptions: any[] = [];
        legend.steps.forEach((firstStep: BasicObject) => {
          firstStep.steps.forEach((secondStep: BasicObject) => {
            compassOptions.push([firstStep.value, secondStep.value]);
          });
        });
        filterDef.options = compassOptions;
        break;
      case "bivector-custom":
        filterDef.fields = [legend.field, legend.field];
        Object.keys(legend).forEach((group: string) => {
          if (group !== "field") {
            Object.values(legend[group]).forEach((entry: any) => {
              let value = entry?.value;
              filterDef.options.push(value as string);
            });
          }
        });
        break;
    }
    set(currentLayerFilterDefinitionAtom, filterDef);
  },
);

export const genericKalpiFilterDefinitionsAtom = atom((get) => {
  const group = get(handleGroupAtom) as BasicObject;
  const config = group.kalpiLayerConfig;
  if (!config?.enhanced) {
    return [];
  }

  return getKalpiGenericFilters(config, group.genericMapFilters);
});

export const handleGenericKalpiFilters = atom(
  (get) => get(currentGenericKalpiFiltersAtom),
  (
    get,
    set,
    id: string | typeof RESET,
    filters: FilterObject[] = [],
    negate?: boolean,
  ) => {
    if (id === RESET) {
      set(currentGenericKalpiFiltersAtom, RESET);
      set(currentGenericKalpiNegateFiltersAtom, RESET);
      return;
    }

    set(currentGenericKalpiFiltersAtom, (currentFilters) => {
      const nextFilters = { ...currentFilters };
      if (filters.length) {
        nextFilters[id] = filters;
      } else {
        delete nextFilters[id];
      }
      return nextFilters;
    });

    set(currentGenericKalpiNegateFiltersAtom, (currentNegateFilters) =>
      negate
        ? [...new Set([...currentNegateFilters, id])]
        : currentNegateFilters.filter((filterId) => filterId !== id),
    );
  },
);

export const genericKalpiFilterRuleAtom = atom((get) =>
  getFilterRule(
    get(currentGenericKalpiFiltersAtom),
    get(currentGenericKalpiNegateFiltersAtom),
    ["all"],
  ),
);

export const genericKalpiFiltersMatchAtom = atom((get) => {
  const filters = get(currentGenericKalpiFiltersAtom);
  const negateFilters = get(currentGenericKalpiNegateFiltersAtom);

  return (properties: BasicObject) =>
    Object.keys(filters).every((filterId) => {
      const shouldNegate = negateFilters.includes(filterId);
      const filterMatches = (filter: FilterObject) => {
        if (filter.type !== "match" || Array.isArray(filter.field)) {
          return true;
        }

        const propertyValue = properties[filter.field];
        return (filter.values as string[]).some(
          (value) => String(propertyValue) === String(value),
        );
      };

      return shouldNegate
        ? (filters[filterId] as FilterObject[]).every(
            (filter) => !filterMatches(filter),
          )
        : (filters[filterId] as FilterObject[]).some(filterMatches);
    });
});

export const handleCurrentLayerFilterListDef = atom((get) => {
  const layer = get(handleCurrentLayer);
  const layerName = layer?.name || "gen";
  return LayerFilterList[layerName]
    ? LayerFilterList[layerName]
    : LayerFilterList["gen"];
});

export const handlePolygonsListOpen = atom(
  (get) => get(isPolygonsListOpenAtom),
  (get, set, open: boolean) => {
    set(isPolygonsListOpenAtom, open);
    set(handleIsLayoutChanged, open);
    if (open) {
      set(handleCurrentPolygonsList);
      set(handleCurrentPolygon, RESET);
    } else {
      set(handleIsPolygonsListSelected, false);
    }
  },
);

export const handleCurrentPolygonsList = atom(
  (get) => get(currentPolygonsListAtom),
  async (get, set) => {
    const user = get(handleUserAtom);
    const currentFilters = get(handleCurrentFilters);
    const currentNegateFilters = get(currentNegateFiltersAtom);
    const isYeshatid = Object.keys(currentFilters).some((filterKey) =>
      currentFilters[filterKey].some((filter: BasicObject) =>
        typeof filter.field === "string"
          ? filter.field.toLowerCase().includes("yeshatid")
          : filter.field.some((field: string) =>
              field.toLowerCase().includes("yeshatid"),
            ),
      ),
    );
  },
);

export const handleListPolygonClick = atom(
  (get) => get(handleCurrentPolygon),
  (get, set, point: string) => {
    const mapHandler = MapboxHandler.getInstance();
    const location = convertPointToLngLat(point);
    mapHandler.setRemotePolygonSelect(location, "polygonsListSelect");
  },
);

export const handleIsPolygonsListSelected = atom(
  (get) => get(isPolygonsListSelectedAtom),
  (get, set, open: boolean) => {
    set(isPolygonsListSelectedAtom, open);
    if (!open) {
      set(handleCurrentPolygon, RESET);
    }
  },
);

export function resetAllMapFilterAtoms(set: any) {
  const resetMapAtoms = [handleCurrentFiltersBlocks];
  resetMapAtoms.forEach((mapAtom) => set(mapAtom, RESET));
}
