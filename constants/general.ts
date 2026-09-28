import {
  AgamIcon,
  CampaignerIcon,
  MapIcon,
  SettingsIcon,
} from "../components/Icons";
import he from "antd/es/date-picker/locale/he_IL";
import type { TimeRangePickerProps } from "antd";
import dayjs from "dayjs";

export const NavMenuItems = [
  { key: "home", icon: AgamIcon, auth: "all" },
  { key: "map", icon: MapIcon, auth: ["member", "admin", "field_manager"] },
  {
    key: "campaigns",
    icon: CampaignerIcon,
    auth: ["member", "admin", "marketing_manager"],
  },
  { key: "settings", icon: SettingsIcon, auth: "all" },
];

export const IsraelLocale: typeof he = {
  ...he,
  lang: {
    ...he.lang,
    placeholder: "בחר תאריך",
    rangePlaceholder: ["תאריך התחלה", "תאריך סיום"],
    today: "היום",
    now: "עכשיו",
    backToToday: "חזור להיום",
    ok: "אישור",
    clear: "נקה",
    month: "חודש",
    year: "שנה",
    timeSelect: "בחר זמן",
    dateSelect: "בחר תאריך",
    monthSelect: "בחר חודש",
    yearSelect: "בחר שנה",
    decadeSelect: "בחר עשור",
    yearFormat: "YYYY",
    fieldDateFormat: "D/M/YYYY",
    cellDateFormat: "D",
    fieldDateTimeFormat: "D/M/YYYY HH:mm:ss",
    monthFormat: "MMMM",
    fieldWeekFormat: "YYYY-wo",
    monthBeforeYear: true,
    previousMonth: "חודש קודם (PageUp)",
    nextMonth: "חודש הבא (PageDown)",
    previousYear: "שנה קודמת (Control + left)",
    nextYear: "שנה הבאה (Control + right)",
    previousDecade: "עשור קודם",
    nextDecade: "עשור הבא",
    previousCentury: "המאה הקודמת",
    nextCentury: "המאה הבאה",
    shortWeekDays: ["א", "ב", "ג", "ד", "ה", "ו", "ש"],
    shortMonths: [
      "ינו",
      "פבר",
      "מרץ",
      "אפר",
      "מאי",
      "יונ",
      "יול",
      "אוג",
      "ספט",
      "אוק",
      "נוב",
      "דצמ",
    ],
  },
};

export const RangePresets: TimeRangePickerProps["presets"] = [
  { label: "היום", value: [dayjs(), dayjs()] },
  { label: "אתמול", value: [dayjs().add(-1, "d"), dayjs().add(-1, "d")] },
  { label: "7 הימים האחרונים", value: [dayjs().add(-7, "d"), dayjs()] },
  { label: "14 הימים האחרונים", value: [dayjs().add(-14, "d"), dayjs()] },
  { label: "30 הימים האחרונים", value: [dayjs().add(-30, "d"), dayjs()] },
  { label: "90 הימים האחרונים", value: [dayjs().add(-90, "d"), dayjs()] },
  { label: "מקסימום", value: [dayjs().add(-2, "year"), dayjs().endOf("day")] },
];
