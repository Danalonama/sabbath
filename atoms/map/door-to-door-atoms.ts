import { atom } from "jotai";
import { FeatureCollection, Point } from "geojson";
import { DoorToDoorActivity } from "@/types";

const doorToDoorActivitiesAtom = atom<DoorToDoorActivity[]>([]);

export const handleDoorToDoorActivities = atom(
  (get) => get(doorToDoorActivitiesAtom),
  (_get, set, activities: DoorToDoorActivity[]) => {
    set(doorToDoorActivitiesAtom, activities);
  },
);

export const doorToDoorGeoJsonAtom = atom<FeatureCollection<Point, any>>(
  (get) => ({
    type: "FeatureCollection",
    features: get(doorToDoorActivitiesAtom).map((activity, index) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [activity.coordinates.lng, activity.coordinates.lat],
      },
      properties: {
        id: `${activity.orgId}-${index}`,
        orgId: activity.orgId,
        address: activity.address,
        houseType: activity.houseType,
        apartmentNumber: activity.apartmentNumber,
        pledgeStatus: activity.pledgeStatus,
        pledgedToVote: activity.pledgedToVote,
        notes: activity.notes,
        apartmentCount: activity.apartmentCount,
        popupHtml: activity.popupHtml,
        iconId: activity.iconId,
      },
    })),
  }),
);
