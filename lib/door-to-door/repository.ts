import {
  DoorToDoorActivity,
  DoorToDoorApartment,
  DoorToDoorApiRecord,
} from "@/types";
import {
  DoorToDoorIconKey,
  DOOR_TO_DOOR_ICON_IDS,
} from "@/constants/map/door-to-door";

type DoorToDoorTranslate = (key: string, fallback: string) => string;

function parseDoorToDoorCoordinates(
  coordinates: string,
): DoorToDoorActivity["coordinates"] | null {
  try {
    const parsed = JSON.parse(coordinates);
    const lng = Number(parsed?.lng);
    const lat = Number(parsed?.lat);

    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
      return null;
    }

    return { lng, lat };
  } catch (_error) {
    return null;
  }
}

function parseDoorToDoorApartments(
  apartments: DoorToDoorApiRecord["apartments"],
): DoorToDoorApartment[] {
  if (!apartments) {
    return [];
  }

  if (Array.isArray(apartments)) {
    return apartments;
  }

  if (typeof apartments !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(apartments);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function escapePopupText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function translateValue(
  t: DoorToDoorTranslate | undefined,
  group: string,
  value?: string | null,
) {
  if (!value) {
    return "";
  }

  return t?.(`${group}.${value}`, value) ?? value;
}

function translateLabel(
  t: DoorToDoorTranslate | undefined,
  key: string,
  fallback: string,
) {
  return t?.(`labels.${key}`, fallback) ?? fallback;
}

function translatePledgeValue(
  t: DoorToDoorTranslate | undefined,
  pledgedToVote?: boolean | null,
) {
  if (pledgedToVote === true) {
    return t?.("pledges.true", "true") ?? "true";
  }

  if (pledgedToVote === false) {
    return t?.("pledges.false", "false") ?? "false";
  }

  return t?.("pledges.unknown", "unknown") ?? "unknown";
}

function getDoorToDoorStatusKey(input: {
  pledge_status?: string | null;
  pledged_to_vote?: boolean | null;
}): DoorToDoorIconKey {
  if (input.pledged_to_vote === true) {
    return "pledged";
  }

  if (input.pledged_to_vote === false) {
    return "declined";
  }

  if (
    input.pledge_status === "not_interested" ||
    input.pledge_status === "not interested" ||
    input.pledge_status === "negative"
  ) {
    return "declined";
  }

  if (
    input.pledge_status === "coming_back_again" ||
    input.pledge_status === "come_back" ||
    input.pledge_status === "follow_up"
  ) {
    return "needs_follow_up";
  }

  if (input.pledge_status && input.pledge_status in DOOR_TO_DOOR_ICON_IDS) {
    return input.pledge_status as DoorToDoorIconKey;
  }

  return "other";
}

function getDoorToDoorIconKey(
  record: DoorToDoorApiRecord,
  apartments: DoorToDoorApartment[],
): DoorToDoorIconKey {
  if (!apartments.length) {
    return getDoorToDoorStatusKey(record);
  }

  const statusKeys = new Set(
    apartments.map((record) => getDoorToDoorStatusKey(record)),
  );

  if (statusKeys.size === 1) {
    return [...statusKeys][0];
  }

  return "other";
}

function renderLabeledLine(label: string, value?: string | null) {
  if (!value) {
    return "";
  }

  return `<div><span style="font-weight:600;">${escapePopupText(
    label,
  )}:</span> ${escapePopupText(value)}</div>`;
}

function renderApartmentPopupRow(
  apartment: DoorToDoorApartment,
  t?: DoorToDoorTranslate,
) {
  const apartmentLabel =
    apartment.apartment_number ||
    apartment.address ||
    apartment.external_id ||
    "";
  const houseType = translateValue(t, "house-types", apartment.house_type);
  const status = translateValue(t, "statuses", apartment.pledge_status);
  const pledge = translatePledgeValue(t, apartment.pledged_to_vote);
  const notes = apartment.notes?.trim();
  const apartmentText = translateLabel(t, "apartment", "Apartment");

  return `<div style="padding:6px 0;border-top:1px solid #E5E7EB;">
    <div style="font-weight:700;">${escapePopupText(
      apartmentLabel ? `${apartmentText} ${apartmentLabel}` : apartmentText,
    )}</div>
    ${renderLabeledLine(translateLabel(t, "house-type", "House type"), houseType)}
    ${renderLabeledLine(translateLabel(t, "status", "Status"), status)}
    ${renderLabeledLine(translateLabel(t, "pledge", "Pledge"), pledge)}
    ${notes ? renderLabeledLine(translateLabel(t, "notes", "Notes"), notes) : ""}
  </div>`;
}

function renderDoorToDoorPopup(
  activity: {
    address: string;
    houseType?: string | null;
    apartmentNumber?: string | null;
    pledgeStatus?: string | null;
    pledgedToVote?: boolean | null;
    notes?: string | null;
    apartments: DoorToDoorApartment[];
  },
  t?: DoorToDoorTranslate,
) {
  if (activity.apartments.length) {
    return `<div style="min-width:220px;max-width:320px;font-size:13px;line-height:1.35;">
      <div style="font-weight:700;margin-bottom:4px;">${escapePopupText(
        activity.address,
      )}</div>
      <div style="color:#FFFFFF;margin-bottom:4px;">${escapePopupText(
        `${activity.apartments.length} ${translateLabel(
          t,
          "apartments",
          "Apartments",
        )}`,
      )}</div>
      ${activity.apartments.map((apartment) => renderApartmentPopupRow(apartment, t)).join("")}
    </div>`;
  }

  const houseType = translateValue(t, "house-types", activity.houseType);
  const status = translateValue(t, "statuses", activity.pledgeStatus);
  const pledge = translatePledgeValue(t, activity.pledgedToVote);
  const notes = activity.notes?.trim();
  const apartmentNumber = activity.apartmentNumber?.trim();
  const apartmentText = translateLabel(t, "apartment", "Apartment");

  return `<div style="min-width:180px;max-width:280px;font-size:13px;line-height:1.35;">
    <div style="font-weight:700;margin-bottom:4px;">${escapePopupText(
      activity.address,
    )}</div>
    ${apartmentNumber ? renderLabeledLine(apartmentText, apartmentNumber) : ""}
    ${renderLabeledLine(translateLabel(t, "house-type", "House type"), houseType)}
    ${renderLabeledLine(translateLabel(t, "status", "Status"), status)}
    ${renderLabeledLine(translateLabel(t, "pledge", "Pledge"), pledge)}
    ${notes ? renderLabeledLine(translateLabel(t, "notes", "Notes"), notes) : ""}
  </div>`;
}

export function mapApiDoorToDoorLayerToActivity(
  record: DoorToDoorApiRecord,
  t?: DoorToDoorTranslate,
): DoorToDoorActivity | null {
  const coordinates = parseDoorToDoorCoordinates(record.coordinates);
  const apartments = parseDoorToDoorApartments(record.apartments);

  if (!coordinates) {
    return null;
  }

  const activity = {
    orgId: record.org_id,
    address: record.address,
    coordinates,
    houseType: record.house_type,
    apartmentNumber: record.apartment_number,
    pledgeStatus: record.pledge_status,
    pledgedToVote: record.pledged_to_vote,
    notes: record.notes,
    apartments,
    apartmentCount: apartments.length,
    iconId: DOOR_TO_DOOR_ICON_IDS[getDoorToDoorIconKey(record, apartments)],
  };

  return {
    ...activity,
    popupHtml: renderDoorToDoorPopup(activity, t),
  };
}
