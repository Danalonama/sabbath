import {
  BasicObject,
  KalpiFeature,
  Layer,
  Legend,
  MapRefType,
  Paint,
  StatisticalData,
} from "@/types";
import { FillLayer, MapGeoJSONFeature } from "react-map-gl";
import {
  getFillLayersFromSource,
  getPatternUrl,
  rgbNormalizedToStandard,
} from "../utils";
import {
  Expression,
  ExpressionSpecification,
  LngLat,
  Map,
  MapMouseEventType,
  Point,
} from "mapbox-gl";
import { backgroundTemplate } from "@/constants/objectTemplates";
import { KalpiLayerConfig } from "@/constants/map/kalpi";
import PopupHandler from "./popupHandler";
import { convertPointToLngLat } from "../utils/handlers/mapbox";

class MapboxHandler {
  private static instance: MapboxHandler | null = null;
  private mapRef: MapRefType = null;
  private popup: PopupHandler = PopupHandler.getInstance();
  private map: Map | null = null;
  private currentBaseFilter: ExpressionSpecification | null = null;

  private const: BasicObject = {};

  private constructor() {} // Private constructor ensures no direct instantiation

  // Public method to get the singleton instance
  public static getInstance(): MapboxHandler {
    if (!MapboxHandler.instance) {
      MapboxHandler.instance = new MapboxHandler();
    }
    return MapboxHandler.instance;
  }

  public checkIfInitialized(): boolean {
    return this.mapRef?.current ? true : false;
  }

  // Method to initialize mapRef
  public initializeMapRef(ref: MapRefType, constants: BasicObject) {
    this.mapRef = ref;

    if (!this.mapRef?.current) {
      return;
    }
    this.map = this.mapRef?.current.getMap();
    this.const = constants;
    const {
      source,
      sourceLayer,
      baseLayers,
      layerDefaultFilter,
      lastLayerInFront,
    } = constants;

    this.currentBaseFilter = layerDefaultFilter;

    /* get all layers */
    const fillLayers = getFillLayersFromSource(this.map, sourceLayer);

    /* remove any visible layers from the original map */
    fillLayers.forEach((layer: FillLayer) => {
      if (!layer.layout || layer.layout["visibility"] !== "none") {
        this.map?.setLayoutProperty(layer.id, "visibility", "none");
      }
    });
    Object.keys(baseLayers).forEach((layer: string) => {
      this.map?.addLayer(
        {
          id: layer,
          source: source,
          "source-layer": sourceLayer,
          type: "fill",
          filter: layerDefaultFilter,
          paint: baseLayers[layer],
        },
        lastLayerInFront,
      );
    });
  }

  public setDefaultLayer(defaultLayer: Layer) {
    const { layerFillColor, layerFillPattern } = this.const;

    const checkLayers = () => {
      const fillColorLayer = this.map?.getLayer(layerFillColor);
      const fillPatternLayer = this.map?.getLayer(layerFillPattern);
      if (fillColorLayer && fillPatternLayer) {
        this.setLayerPaint(defaultLayer);
        this.setCurrentBaseFilter(defaultLayer.filter);
        this.setLayerFilter();
        return true;
      }
      return false;
    };
    if (!checkLayers()) {
      const intervalId = setInterval(() => {
        if (checkLayers()) {
          clearInterval(intervalId);
        }
      }, 500);
      return () => clearInterval(intervalId);
    }
  }

  public setFilter(layer: string, filter: Expression) {
    this.map?.setFilter(layer, filter);
  }

  public setCurrentBaseFilter(filter: ExpressionSpecification) {
    this.currentBaseFilter = filter;
  }

  public setLayerFilter(filter = this.currentBaseFilter) {
    const { layerFillColor, layerFillPattern, layerOutline } = this.const;

    if (filter) {
      this.setFilter(layerFillColor, filter);
      this.setFilter(layerFillPattern, filter);
      this.setFilter(layerOutline, filter);
    }
  }

  public setLayerPaint(selectedLayer: Layer) {
    const { layerFillColor, layerFillPattern } = this.const;

    const layerPaint = selectedLayer?.fillColor;
    if (!layerPaint) {
      return;
    }
    const patternPaint = selectedLayer?.fill_pattern;
    /* change layer color scheme */
    this.map?.setPaintProperty(layerFillColor, "fill-color", layerPaint as any);

    /* change layer pattern scheme */
    if (patternPaint) {
      this.map?.setLayoutProperty(layerFillPattern, "visibility", "visible");
      this.map?.setPaintProperty(
        layerFillPattern,
        "fill-pattern",
        patternPaint as any,
      );
    } else {
      /* waiting for fill-color change  */
      setTimeout(
        () =>
          this.map?.setLayoutProperty(layerFillPattern, "visibility", "none"),
        100,
      );
    }
  }

  public setRemotePolygonSelect(location: LngLat, eventType: string) {
    this.flyTo(location, "long");
    this.simulateClick(location, eventType);
  }

  public setSearchSelected(selected: {
    kind: string;
    point: string;
    size: number;
    extra: any;
  }) {
    const { layerOutlineActive, layerOutlineMunicipal, baseFilters } =
      this.const;
    const location = convertPointToLngLat(selected.point);
    if (selected.kind === "municipal" || selected.size) {
      this?.flyTo(location, "long");
      this?.map?.setFilter(
        layerOutlineActive,
        baseFilters[layerOutlineActive](),
      );
      this?.map?.setFilter(
        layerOutlineMunicipal,
        baseFilters[layerOutlineMunicipal](selected.extra),
      );
    }
    if (selected.kind !== "municipal" || !selected.size) {
      this.setRemotePolygonSelect(location, "search");
    }
  }

  public getPolygonColor(features: MapGeoJSONFeature[]) {
    const { layerFillColor, layerFillPattern } = this.const;
    let color = "";
    let pattern = "";
    /* get pattern paint */
    if (
      this?.map?.getLayoutProperty(layerFillPattern, "visibility") !== "none"
    ) {
      const patternFeature = features.find(
        (feature) => feature?.layer?.id === layerFillPattern,
      );

      const patternPaint = patternFeature?.layer?.paint as Paint;
      if (patternPaint) {
        pattern = patternPaint["fill-pattern"]
          ? getPatternUrl(patternPaint["fill-pattern"]?.namePrimary)
          : "";
      }
    }
    /* get color paint */
    const colorFeature = features.find(
      (feature) => feature?.layer?.id === layerFillColor,
    );
    const colorPaint = colorFeature?.layer?.paint as Paint;
    const colorFill = colorPaint["fill-color"];
    color = rgbNormalizedToStandard(colorFill);
    /* setting all data */
    return backgroundTemplate(color, pattern);
  }

  public handleOutlineFilters(polygonId?: number) {
    const { layerOutlineActive, layerOutlineMunicipal, baseFilters } =
      this.const;
    this?.setFilter(
      layerOutlineMunicipal,
      baseFilters[layerOutlineMunicipal](),
    );
    this?.setFilter(
      layerOutlineActive,
      baseFilters[layerOutlineActive](polygonId && polygonId),
    );
  }

  public handleHoverFilter(polygonId?: number) {
    const { layerOutlineHover, baseFilters } = this.const;
    this?.setFilter(
      layerOutlineHover,
      baseFilters[layerOutlineHover](polygonId),
    );
  }

  public handlePointLayers(show: boolean, id?: string) {
    const { layerKalpi } = this.const;
    this.map?.setLayoutProperty(
      id ? id : layerKalpi,
      "visibility",
      show ? "visible" : "none",
    );
  }

  public getKalpiFeatures(config: KalpiLayerConfig): KalpiFeature[] {
    const map = this.mapRef?.current?.getMap?.() || this.map;
    if (!map?.isStyleLoaded()) {
      return [];
    }

    let sourceFeatures: MapGeoJSONFeature[] = [];
    let renderedFeatures: MapGeoJSONFeature[] = [];

    try {
      sourceFeatures = map.querySourceFeatures(config.source, {
        sourceLayer: config.sourceLayer,
      });
      renderedFeatures = map.queryRenderedFeatures({
        layers: [
          config.legacyLayerId,
          "kalpi-locations-enhanced",
          "kalpi-locations-enhanced-label",
        ].filter((layerId) => Boolean(map.getLayer(layerId))),
      });
    } catch (_error) {
      return [];
    }

    const features = [...sourceFeatures, ...renderedFeatures];
    const byId = new globalThis.Map<string, KalpiFeature>();

    features.forEach((feature) => {
      const properties = (feature.properties || {}) as BasicObject;
      const id = String(
        properties[config.idField] ||
          properties[config.locationField] ||
          properties[config.legacyLocationField] ||
          "",
      );

      if (!id || byId.has(id)) {
        return;
      }

      const geometry = feature.geometry as any;
      const pointCoordinates =
        geometry?.type === "Point" ? geometry.coordinates : undefined;

      byId.set(id, {
        id,
        location: String(
          properties[config.locationField] ||
            properties[config.legacyLocationField] ||
            id,
        ),
        rank: properties[config.rankField],
        potentialGroup: properties[config.potentialGroupField]
          ? String(properties[config.potentialGroupField])
          : undefined,
        coordinates: pointCoordinates
          ? new LngLat(pointCoordinates[0], pointCoordinates[1])
          : undefined,
        properties,
      });
    });

    return Array.from(byId.values()).sort((a, b) => {
      const rankA = Number(a.rank);
      const rankB = Number(b.rank);
      if (!Number.isNaN(rankA) && !Number.isNaN(rankB)) {
        return rankA - rankB;
      }
      return a.location.localeCompare(b.location);
    });
  }

  public waitForMapStopMoving = () => {
    return new Promise((resolve) => {
      const checkMapMoving = () => {
        if (this.map && !this?.map.isMoving()) {
          clearInterval(interval); // Stop polling
          resolve(null); // Resolve the promise when map movement stops
        }
      };
      const interval = setInterval(checkMapMoving, 100); // Poll every 100 milliseconds
    });
  };

  public queryFeatures = (point: Point) => {
    const { layerFillColor, layerFillPattern } = this.const;
    return this?.map?.queryRenderedFeatures(point, {
      layers: [layerFillColor, layerFillPattern],
    });
  };

  public projectCoordinatesOnPoints = (lngLat: LngLat): Point => {
    return this?.map?.project(lngLat) as Point;
  };

  public flyTo = (lngLat: LngLat, duration = "short") => {
    let options: any = { center: lngLat, essential: true };
    options = duration === "long" ? options : { ...options, duration: 500 };
    this?.map?.flyTo(options);
  };

  public focusOnPoint = (lngLat: LngLat, zoom = 15) => {
    this?.map?.flyTo({
      center: lngLat,
      zoom,
      essential: true,
      duration: 600,
    });
  };

  public simulateClick = (lngLat: LngLat, type: string) => {
    this?.map?.fire("click", {
      lngLat: lngLat,
      point: this?.map.project(lngLat),
      //@ts-ignore
      originalEvent: { type: type },
      _defaultPrevented: false,
    });
  };

  public handleMouseOver = (
    features?: MapGeoJSONFeature[],
    layerLegend?: Legend,
    layerId?: string,
    lngLat?: LngLat,
  ) => {
    if (!features?.length) {
      this.handleHoverFilter();
      this.popup.removePopup();
      return;
    }
    const layerFeature = features[0];
    if (layerFeature) {
      const properties = layerFeature.properties;
      this.handleHoverFilter(properties?.id);
      this.popup?.addPopup(
        this.map as Map,
        properties as StatisticalData,
        layerLegend as Legend,
        layerId as string,
        lngLat as LngLat,
      );
    } else {
      this.handleHoverFilter();
      this.popup.removePopup();
    }
  };

  public setPadding = (
    mapPadding = { right: 0, left: 0, top: 0, bottom: 0 },
  ) => {
    this?.map?.setPadding(mapPadding);
  };
}

export default MapboxHandler;
