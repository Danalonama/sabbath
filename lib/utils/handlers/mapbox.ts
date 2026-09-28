import { isJsonString } from "@/lib/utils";
import { LngLat } from "mapbox-gl";

export const convertPointToLngLat = (point: string): any => {
  return isJsonString(point) ? JSON.parse(point) : point.split(",");
};
