import { BasicObject, Legend, PopupRefType, StatisticalData } from "@/types";
import { LngLat, Map } from "mapbox-gl";
import { getNewPopupHtmlString } from "../utils/componentsUtils/hoverPopup";

class PopupHandler {
  private static instance: PopupHandler | null = null;
  private popupRef: PopupRefType = null;

  private const: BasicObject = {};

  private legendText = {};

  private lastPopupData = { id: 0, html: "" };

  private constructor() {} // Private constructor ensures no direct instantiation

  // Public method to get the singleton instance
  public static getInstance(): PopupHandler {
    if (!PopupHandler.instance) {
      PopupHandler.instance = new PopupHandler();
    }
    return PopupHandler.instance;
  }

  public initializePopupRef(
    ref: PopupRefType,
    constants: BasicObject,
    legendText: any
  ) {
    if (!this.popupRef?.current) {
      this.popupRef = ref;
    }
    this.const = constants;
    this.legendText = legendText;
  }

  public addPopup = (
    map: Map,
    properties: StatisticalData,
    layerLegend: Legend,
    layerId: string,
    lngLat: LngLat
  ) => {
    const popup = this?.popupRef?.current;
    if (properties && "id" in properties) {
      let htmlString = this.lastPopupData.html;
      if (properties.id !== this.lastPopupData.id) {
        htmlString = getNewPopupHtmlString(
          layerLegend,
          properties,
          layerId,
          this.const,
          this.legendText
        );
      }
      popup?.setLngLat(lngLat).setHTML(htmlString).addTo(map);
      this.lastPopupData = { id: properties.id, html: htmlString };
    }
  };

  public addSimplePopup = (map: Map, lngLat: LngLat, html: string) => {
    this?.popupRef?.current?.setLngLat(lngLat).setHTML(html).addTo(map);
  };

  public removePopup = () => {
    this?.popupRef?.current?.remove();
    this.lastPopupData = { id: 0, html: "" };
  };
}

export default PopupHandler;
