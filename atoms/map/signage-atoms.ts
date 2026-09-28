import MapboxHandler from "@/lib/mapbox/mapboxHandler";
import {
  SignageActivity,
  SignageFilterValue,
  SignageLayerFilterType,
  SignageSortValue,
  SignageState,
  BasicObject,
  FilterObject,
} from "@/types";
import { atom } from "jotai";
import { FeatureCollection, Point } from "geojson";
import { LngLat } from "mapbox-gl";
import {
  signageActivityStatusIcon,
  signageActivityToColor,
  signageActivityToColorIcon,
  signageFilterValue,
} from "@/constants/map/signage";
import { handleIsLayoutChanged, handleIsSignageVisibleAtom } from "./map-atoms";
import {
  handleCurrentFiltersBlocks,
  handleExternalFilterType,
  handleFilterShown,
  getLastBlockId,
} from "./map-filter-atoms";

const signageActivitiesAtom = atom<SignageActivity[]>([]);
const signageModeAtom = atom(false);
const signageSelectedActivityIdAtom = atom<string | null>(null);
const signageFilterAtom = atom<SignageFilterValue>("all");
const signageSortAtom = atom<SignageSortValue>("newest");
const signageFilterBlockIdAtom = atom<string>("");
const signageLayerFiltersAtom = atom<BasicObject>({});
const signageToggleFilterAtom = atom<Record<SignageLayerFilterType, string[][]>>({
  signage: [],
});

export const handleSignageMode = atom(
  (get) => get(signageModeAtom),
  (_get, set, isEnabled: boolean) => {
    set(handleIsSignageVisibleAtom, isEnabled);
    set(signageModeAtom, isEnabled);
    set(handleIsLayoutChanged, isEnabled);
  },
);

export const handleSignageActivities = atom(
  (get) => get(signageActivitiesAtom),
  (_get, set, activities: SignageActivity[]) => {
    set(signageActivitiesAtom, activities);
  },
);

export const handleSignageSelectedActivity = atom(
  (get) => get(signageSelectedActivityIdAtom),
  (get, set, activityId: string | null) => {
    set(signageSelectedActivityIdAtom, activityId);

    if (!activityId) {
      return;
    }

    const activity = get(signageActivitiesAtom).find(
      (entry) => entry.id === activityId,
    );
    if (!activity) {
      return;
    }

    const mapHandler = MapboxHandler.getInstance();
    mapHandler.focusOnPoint(
      new LngLat(activity.coordinates.lng, activity.coordinates.lat),
      15,
    );
  },
);

export const handleSignageFilter = atom(
  (get) => get(signageFilterAtom),
  (_get, set, filter: SignageFilterValue) => {
    set(signageFilterAtom, filter);
  },
);

export const handleSignageSort = atom(
  (get) => get(signageSortAtom),
  (_get, set, sort: SignageSortValue) => {
    set(signageSortAtom, sort);
  },
);

export const handleSignageFilterBlockId = atom(
  (get) => get(signageFilterBlockIdAtom),
  (_get, set, blockId: string) => {
    set(signageFilterBlockIdAtom, blockId);
  },
);

export const handleSignageLayerFilters = atom(
  (get) => get(signageLayerFiltersAtom),
  (get, set, id: string, filters: FilterObject[] = []) => {
    const previousFilters = get(signageLayerFiltersAtom)[id] ?? [];
    const isSignageFilter = filters.some((filter) => filter.field === "signage");
    set(signageLayerFiltersAtom, (currentFilters) => {
      const nextFilters = { ...currentFilters };
      if (filters.length) {
        if (isSignageFilter) {
          Object.keys(nextFilters).forEach((blockId) => {
            if (
              blockId !== id &&
              nextFilters[blockId]?.some(
                (filter: FilterObject) => filter.field === "signage",
              )
            ) {
              delete nextFilters[blockId];
            }
          });
        }
        nextFilters[id] = filters;
      } else {
        delete nextFilters[id];
      }
      return nextFilters;
    });

    const toggleFilters = { ...get(signageToggleFilterAtom) };
    const syncedFilters = filters.length ? filters : previousFilters;
    syncedFilters.forEach((filter: FilterObject) => {
      if (filter.field === "signage") {
        toggleFilters[filter.field] = filters.length
          ? (filter.values as string[]).map((value) => [value])
          : [];
      }
    });
    if (
      JSON.stringify(toggleFilters) !== JSON.stringify(get(signageToggleFilterAtom))
    ) {
      set(signageToggleFilterAtom, toggleFilters);
    }
  },
);

export const handleSignageToggleLegendFilter = atom(
  (get) => get(signageToggleFilterAtom),
  (
    get,
    set,
    filterType: SignageLayerFilterType,
    value: string | string[],
    forceActive?: boolean,
  ) => {
    const blocks = get(handleCurrentFiltersBlocks);
    const filters = get(signageLayerFiltersAtom);
    const blockIds = blocks.map((block) => block + "");
    const existingBlock = Object.keys(filters).find((blockId) =>
      blockIds.includes(blockId)
        ? filters[blockId]?.some(
            (filter: FilterObject) =>
              filter.type === "match" && filter.field === filterType,
          )
        : false,
    );
    const storedBlockId = get(signageFilterBlockIdAtom);

    let blockId =
      existingBlock ||
      (storedBlockId && blockIds.includes(storedBlockId) ? storedBlockId : "");
    if (!blockId) {
      set(handleCurrentFiltersBlocks, "add", !blocks.length ? 1 : undefined);
      blockId = get(getLastBlockId) + "";
      set(handleExternalFilterType, blockId, filterType);
      set(signageFilterBlockIdAtom, blockId);
    }

    const values = Array.isArray(value) ? value : [value];
    const currentValues = get(signageToggleFilterAtom)[filterType] ?? [];
    const currentValueSet = new Set(
      currentValues.map(([currentValue]) => currentValue),
    );
    const areAllActive = values.every((entry) => currentValueSet.has(entry));
    const shouldActivate =
      forceActive === undefined ? !areAllActive : forceActive;
    const nextValueSet = new Set(currentValueSet);

    values.forEach((entry) => {
      if (shouldActivate) {
        nextValueSet.add(entry);
      } else {
        nextValueSet.delete(entry);
      }
    });

    const nextValues = Array.from(nextValueSet).map((entry) => [entry]);

    set(signageToggleFilterAtom, {
      ...get(signageToggleFilterAtom),
      [filterType]: nextValues,
    });

    if (!get(handleFilterShown)) {
      set(handleFilterShown);
    }
  },
);

export const signageStateAtom = atom<SignageState>((get) => ({
  activities: get(signageActivitiesAtom),
  selectedActivityId: get(signageSelectedActivityIdAtom),
  filter: get(signageFilterAtom),
  sort: get(signageSortAtom),
  isModeEnabled: get(signageModeAtom),
}));

export const signageVisibleActivitiesAtom = atom((get) => {
  const filter = get(signageFilterAtom);
  const sort = get(signageSortAtom);
  const layerFilters = get(signageLayerFiltersAtom);

  const filteredActivities = get(signageActivitiesAtom).filter((activity) => {
    if (filter !== "all" && activity.implementationStatus !== filter) {
      return false;
    }

    return Object.values(layerFilters).every((filters) =>
      (filters as FilterObject[]).every((filter) => {
        if (filter.type !== "match") {
          return true;
        }

        const activityValue =
          filter.field === "signage"
            ? signageFilterValue(
                activity.activityType,
                activity.implementationStatus,
              )
            : undefined;

        return activityValue
          ? (filter.values as string[]).includes(activityValue)
          : true;
      }),
    );
  });

  const sortedActivities = [...filteredActivities].sort((first, second) => {
    switch (sort) {
      case "oldest":
        return (
          new Date(first.createdAt).getTime() -
          new Date(second.createdAt).getTime()
        );
      case "type":
        return first.activityType.localeCompare(second.activityType);
      case "status":
        return first.implementationStatus.localeCompare(
          second.implementationStatus,
        );
      case "newest":
      default:
        return (
          new Date(second.createdAt).getTime() -
          new Date(first.createdAt).getTime()
        );
    }
  });

  return sortedActivities;
});

export const signageGeoJsonAtom = atom<FeatureCollection<Point, any>>(
  (get) => ({
    type: "FeatureCollection",
    features: get(signageVisibleActivitiesAtom).map((activity) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [activity.coordinates.lng, activity.coordinates.lat],
      },
      properties: {
        id: activity.id,
        activityType: activity.activityType,
        address: activity.address,
        comment: activity.comment ?? "",
        implementationStatus: activity.implementationStatus,
        iconId: `${signageActivityToColorIcon(activity.activityType)}_${signageActivityStatusIcon(activity.implementationStatus)}`,
        iconColor: signageActivityToColor(activity.activityType),
        createdAt: activity.createdAt,
      },
    })),
  }),
);

export const handleSignageHydration = atom(
  null,
  (_get, set, state: SignageState) => {
    set(signageActivitiesAtom, state.activities);
    set(signageModeAtom, state.isModeEnabled);
    set(signageFilterAtom, state.filter);
    set(signageSortAtom, state.sort);
    set(signageSelectedActivityIdAtom, state.selectedActivityId);
  },
);
