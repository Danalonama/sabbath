import {
  darkenColor,
  getColorSchemes,
  getPatternUrl,
  isColorTooLight,
} from "@/lib/utils";
import {
  BackgroundObject,
  BasicObject,
  Group,
  Layer,
  StatisticalData,
} from "@/types";
import { atom } from "jotai";
import { atomWithReset, RESET } from "jotai/utils";
import { handleGroupAtom, handleUserAtom } from "../user-atoms";
import MapboxHandler from "@/lib/mapbox/mapboxHandler";
import {
  GenDataKeys,
  LayersWithLegendKeys,
  MAP_CARD_RESEARCH_DATA,
  MAP_CLICK_TYPES,
  MAP_DEFAULT_SELECTED_POLYGON,
  MAP_PLAKAT_BIVECTOR,
  MAPBOX_LAYER_FILL_COLOR,
  PLAKAT_PATTERN,
} from "@/constants/constants";
import { backgroundTemplate } from "@/constants/objectTemplates";
import { ExpressionSpecification, LngLat, MapLayerMouseEvent } from "mapbox-gl";
import { MapGeoJSONFeature } from "react-map-gl";
import {
  handleCurrentFiltersBlocks,
  handleCurrentLayerFilterDefinition,
  handleIsPolygonsListSelected,
  handlePolygonsListOpen,
} from "./map-filter-atoms";
import { useLogAtom } from "@/lib/log/useLog";
import { GET_MUNICIPAL_DATA_QUERY } from "@/graphql/map/useMunicipalDataQuery";
import { gqlQuery } from "@/lib/apollo/hooks/runGqlQuery";
import { GET_GEOAREA_FILTER_QUERY } from "@/graphql/map/useGeoareaFilterQuery";
import { GET_SOCIO_DATA_QUERY } from "@/graphql/map/useSocioDataQuery";
import { KalpiLayerConfig } from "@/constants/map/kalpi";

const layersAtom = atom<Layer[]>([]);

const layersResearchAtom = atom<BasicObject>({});

const currentLayerAtom = atom<Layer | null>(null);

const currentLayerLegendAtom = atom<BasicObject>({});

const currentClickAtom = atom<LngLat>();

const currentPolygonAtom = atomWithReset<StatisticalData>(
  MAP_DEFAULT_SELECTED_POLYGON,
);

const currentPolygonCityAtom = atomWithReset<StatisticalData | null>(null);

const currentPolygonColorAtom =
  atomWithReset<BackgroundObject>(backgroundTemplate());

const isKalpiOpenAtom = atomWithReset(false);

const isSignageVisibleAtom = atomWithReset(false);

const isDoorToDoorVisibleAtom = atomWithReset(false);

const isDemsPartyMembersVisibleAtom = atomWithReset(false);

const isResearchLayerLegendVisibleAtom = atomWithReset(true);

const isSignageLayerLegendVisibleAtom = atomWithReset(false);

export const hasSignageAccessAtom = atom((get) => {
  const group = get(handleGroupAtom) as Group;
  return group?.hasSignageAccess || false;
});

export const hasDoorToDoorAccessAtom = atom((get) => {
  const group = get(handleGroupAtom) as Group;
  return group?.hasDoorToDoorAccess || false;
});

export const hasImprovedDoorToDoorAccessAtom = atom((get) => {
  const group = get(handleGroupAtom) as Group;
  return group?.hasImprovedDoorToDoorAccess || false;
});

export const hasDemsPartyMembersAccessAtom = atom((get) => {
  const group = get(handleGroupAtom) as Group;
  return group?.demsPartyMembersLayerConfig?.enabled || false;
});

export const handleKalpiOpenAtom = atom(
  (get) => get(isKalpiOpenAtom),
  (get, set, update: boolean) => {
    const mapHandler = MapboxHandler.getInstance();
    const group = get(handleGroupAtom) as Group;
    const kalpiConfig = group?.kalpiLayerConfig as KalpiLayerConfig | undefined;
    mapHandler.handlePointLayers(
      kalpiConfig?.enhanced ? false : update,
      kalpiConfig?.legacyLayerId,
    );
    set(isKalpiOpenAtom, update);
  },
);

export const handleIsSignageVisibleAtom = atom(
  (get) => get(isSignageVisibleAtom),
  (get, set, update: boolean) => {
    set(isSignageVisibleAtom, update);
  },
);

export const handleIsDoorToDoorVisibleAtom = atom(
  (get) => get(isDoorToDoorVisibleAtom),
  (_get, set, update: boolean) => {
    set(isDoorToDoorVisibleAtom, update);
  },
);

export const handleIsDemsPartyMembersVisibleAtom = atom(
  (get) => get(isDemsPartyMembersVisibleAtom),
  (_get, set, update: boolean) => {
    set(isDemsPartyMembersVisibleAtom, update);
  },
);

export const handleIsResearchLayerLegendVisibleAtom = atom(
  (get) => get(isResearchLayerLegendVisibleAtom),
  (_get, set, update: boolean) => {
    set(isResearchLayerLegendVisibleAtom, update);
  },
);

export const handleIsSignageLayerLegendVisibleAtom = atom(
  (get) => get(isSignageLayerLegendVisibleAtom),
  (_get, set, update: boolean) => {
    set(isSignageLayerLegendVisibleAtom, update);
  },
);

export const cardTabsAtom = atomWithReset<string[]>([]);

export const layerPatternAtom = atom<string>("");

export const socioDataAtom = atom<any[]>([]);

export const filterDataAtom = atom<any[]>([]);

const initialFetch = [
  {
    atom: filterDataAtom,
    dataPath: "geoareaFilterData",
    query: GET_GEOAREA_FILTER_QUERY,
  },
  {
    atom: socioDataAtom,
    dataPath: "socioData",
    query: GET_SOCIO_DATA_QUERY,
    adjustData: (data: BasicObject[]) =>
      data.map((d: BasicObject) => ({
        ...d,
        DEMO_pop_total_2024:
          d.DEMO_pop_total_2024 > 100 ? d.DEMO_pop_total_2024 : 100,
      })),
  },
];

export const handleLayers = atom(
  (get) => get(layersAtom),
  (get, set, update: Group) => {
    const mapHandler = MapboxHandler.getInstance();
    const { layers } = update;

    if (!layers.length) {
      console.error("Error in fetching layers");
      return;
    }
    const defaultLayer = layers[0];
    set(layersAtom, layers);
    set(currentLayerAtom, defaultLayer);
    set(layerPatternAtom, getPatternUrl(PLAKAT_PATTERN));
    set(handleCurrentLayerLegend);
    set(layersResearchAtom, MAP_CARD_RESEARCH_DATA());
    mapHandler.setDefaultLayer(defaultLayer);
  },
);

export const handleCurrentLayer = atom(
  (get) => get(currentLayerAtom),
  (get, set, layerName: string) => {
    const mapHandler = MapboxHandler.getInstance();
    const layers = get(layersAtom);
    const newSelectedLayer = layers.find((layer) => layer.name === layerName);
    set(currentLayerAtom, newSelectedLayer as Layer);
    if (newSelectedLayer)
      mapHandler.setCurrentBaseFilter(
        newSelectedLayer.filter as ExpressionSpecification
      );
    mapHandler.setLayerFilter();
    mapHandler.setLayerPaint(newSelectedLayer as Layer);

    set(handleCurrentLayerLegend);
    set(handleCurrentFiltersBlocks, RESET);
    set(useLogAtom, {
      type: "EVENT",
      message: "Layer changed",
      info: {
        event: "layer-change",
        layer: layerName,
      },
    });
    /* change card color if need be */
    const currentPolygon = get(currentPolygonAtom);
    if (currentPolygon.id) {
      const lastClick = get(handleCurrentClick);
      mapHandler.simulateClick(lastClick as LngLat, "layerChange");
    }
  },
);

export const handleCurrentLayerLegend = atom(
  (get) => get(currentLayerLegendAtom),
  async (get, set) => {
    const currentLayer = get(handleCurrentLayer);
    const copiedCurrentLayer = { ...currentLayer };
    if (Object.keys(copiedCurrentLayer).length && copiedCurrentLayer?.name) {
      const legendObject = await getColorSchemes(
        copiedCurrentLayer.fillColor as any,
        copiedCurrentLayer?.name + "",
        LayersWithLegendKeys[copiedCurrentLayer?.name],
        get(layerPatternAtom),
        MAP_PLAKAT_BIVECTOR,
        copiedCurrentLayer,
      );
      set(handleCurrentLayerFilterDefinition, legendObject);
      set(currentLayerLegendAtom, legendObject);
    }
  },
);

export const handleCurrentLayerResearch = atom(
  (get) => get(layersResearchAtom)[get(handleCurrentLayer)?.name || ""],
);

export const handleCurrentClick = atom(
  (get) => get(currentClickAtom),
  async (get, set, event: MapLayerMouseEvent) => {
    const mapHandler = MapboxHandler.getInstance();
    const { lngLat, originalEvent } = event;
    let features = event.features;
    set(currentClickAtom, lngLat);
    if (MAP_CLICK_TYPES.includes(originalEvent.type)) {
      await mapHandler.waitForMapStopMoving();
      features = mapHandler.queryFeatures(
        mapHandler.projectCoordinatesOnPoints(lngLat),
      );
      if (originalEvent.type === "polygonsListSelect") {
        set(handleIsPolygonsListSelected, true);
      }
    }

    if (!features || !features.length) {
      set(handleCurrentPolygon, RESET);
      set(handlePolygonsListOpen, false);
      set(handleIsPolygonsListSelected, false);

      return;
    }
    get(handlePolygonsListOpen) && set(handleIsPolygonsListSelected, true);

    set(handleCurrentPolygon, features);
  },
);

export const handleCurrentPolygon = atom(
  (get) => get(currentPolygonAtom),
  async (get, set, features: MapGeoJSONFeature[] | typeof RESET) => {
    const mapHandler = MapboxHandler.getInstance();
    if (features === RESET) {
      if (mapHandler.checkIfInitialized()) {
        mapHandler.handleOutlineFilters();
      }
      !get(handlePolygonsListOpen) && set(handleIsLayoutChanged, false);
      set(currentPolygonAtom, features);
      return;
    }

    const mainFeature = features.find(
      (feature) => feature?.layer?.id === MAPBOX_LAYER_FILL_COLOR,
    );
    const properties = mainFeature?.properties;
    if (!properties) return;

    set(useLogAtom, {
      type: "EVENT",
      message: "Statistical Area clicked",
      info: {
        event: "statistical-area-click",
        areaId: properties.id,
      },
    });

    mapHandler.handleOutlineFilters(properties.id);
    set(handleCurrentPolygonCity, properties);
    set(handleIsLayoutChanged, true);
    set(currentPolygonAtom, properties);
    set(handleCurrentPolygonColor, features);
    mapHandler.flyTo(get(handleCurrentClick) as LngLat);
  },
);

export const handleIsLayoutChanged = atom(
  (get) => {
    const currentPolygon = get(currentPolygonAtom);
    return currentPolygon.id ? true : false;
  },
  (get, set, isClicked?: boolean) => {
    const mapHandler = MapboxHandler.getInstance();
    mapHandler?.setPadding(
      isClicked ? { right: 616, left: 0, top: 0, bottom: 0 } : undefined,
    );
  },
);

export const handleCurrentPolygonCity = atom(
  (get) => get(currentPolygonCityAtom),
  async (get, set, properties: StatisticalData) => {
    const user = get(handleUserAtom);
    const currentPolygon = get(currentPolygonAtom);
    const isCity =
      properties[GenDataKeys.cityMunicipality] ===
        GenDataKeys.cityMunicipalityCityType ||
      properties[GenDataKeys.cityMunicipality] ===
        GenDataKeys.cityMunicipalityLocalCouncilType;
    if (
      isCity &&
      properties[GenDataKeys.cityCode] !== currentPolygon[GenDataKeys.cityCode]
    ) {
      const cityId = properties[GenDataKeys.cityCode];
      const municipalData = await gqlQuery(GET_MUNICIPAL_DATA_QUERY, {
        id: cityId + "",
      });
      set(currentPolygonCityAtom, municipalData?.municipalData);
      set(useLogAtom, {
        type: "FETCH",
        message: "Municipal data fetched",
        info: {
          event: "municipal-data-fetch",
          cityId: cityId,
        },
      });
    } else if (
      properties[GenDataKeys.cityCode] !== currentPolygon[GenDataKeys.cityCode]
    ) {
      set(currentPolygonCityAtom, null);
    }
  },
);

export const handleCurrentPolygonColor = atom(
  (get) => get(currentPolygonColorAtom),
  (get, set, features: MapGeoJSONFeature[]) => {
    const mapHandler = MapboxHandler.getInstance();
    let polygonColor = mapHandler.getPolygonColor(features) as BackgroundObject;
    const cardColor = polygonColor.pattern
      ? darkenColor(polygonColor.color, 1.3)
      : polygonColor.color;
    polygonColor.combinedColor = cardColor;
    polygonColor.cssRule = polygonColor.pattern
      ? polygonColor.pattern +
        ", linear-gradient(" +
        polygonColor.color +
        ", " +
        polygonColor.color +
        ")"
      : polygonColor.color;
    polygonColor.textColor = isColorTooLight(cardColor) ? "black" : "white";
    set(currentPolygonColorAtom, polygonColor);
  },
);

export const initialFetchMapAtoms = initialFetch.map((fetchAtom) => {
  return {
    ...fetchAtom,
    fetchFunction: atom(
      async (get) => {
        const user = get(handleUserAtom); // Watch for changes in userAtom
        if (!user?.email) {
          throw new Error("No user email available");
        }
        const data = await gqlQuery(fetchAtom.query);
        const fetchedData = data[fetchAtom.dataPath as string];
        const formattedData = fetchAtom.adjustData
          ? fetchAtom.adjustData(fetchedData)
          : fetchedData;
        return formattedData;
      },
      (get, set, data: any[]) => {
        // Store the fetched data in filterDataAtom
        set(fetchAtom.atom, data);
      },
    ),
  };
});

export const handleSearchSelectAtom = atom(null, (get, set, selected: any) => {
  const mapHandler = MapboxHandler.getInstance();
  if (selected.kind === "municipal") {
    set(handleCurrentPolygon, RESET);
  }
  mapHandler.setSearchSelected(selected);
});

export function resetAllMapAtoms(set: any) {
  const resetMapAtoms = [
    currentPolygonAtom,
    currentPolygonCityAtom,
    currentPolygonColorAtom,
    isKalpiOpenAtom,
    isSignageVisibleAtom,
    isDoorToDoorVisibleAtom,
    isDemsPartyMembersVisibleAtom,
  ];
  resetMapAtoms.forEach((mapAtom) => set(mapAtom, RESET));
}
