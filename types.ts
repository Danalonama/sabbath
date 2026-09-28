import { ExpressionSpecification, LngLat, Popup } from "mapbox-gl";
import { MAP_FILTER_FIELD_KEY } from "./constants/constants";
import { MutableRefObject, ReactNode, SetStateAction } from "react";
import { MapRef } from "react-map-gl";
import { PrimitiveAtom } from "jotai";
import { WritableAtom } from "jotai";

declare global {
  interface Window {
    Clerk: any;
  }
}

type User = any;

type PrivateOrgMetadata = {
  layers: string[];
};

type PARTIES = "faction" | "yeshatid";

type InitialFetchAtom = {
  atom: PrimitiveAtom<any[]>;
  query?: any;
  apiPath?: string;
  fetchFunction: WritableAtom<
    Promise<any>,
    [data: any[]] | [SetStateAction<any>],
    void
  >;
  adjustData?: (data: BasicObject[]) => BasicObject[];
  extractor?: (data: BasicObject) => any;
  customApi?: boolean;
};

type EncompassingLog = {
  ok?: SingularClientLog;
  error?: SingularClientLog;
};

type BasicLog = {
  severity: string;
  message: string;
  meta?: BasicObject;
};

type SingularClientLog = BasicLog & {
  user?: string | BasicObject | undefined | null;
  org?: BasicObject | undefined | null;
  info?: string | BasicObject | undefined | null;
  type?: string | undefined | null;
};

type Group = {
  layers: Layer[];
  hasSignageAccess?: boolean;
  hasDoorToDoorAccess?: boolean;
  hasImprovedDoorToDoorAccess?: boolean;
  kalpiLayerConfig?: import("./constants/map/kalpi").KalpiLayerConfig;
  genericMapFilters?: import("./constants/map/generic-filters").GenericMapFilterConfig[];
  demsPartyMembersLayerConfig?: import("./constants/map/dems-party-members").DemsPartyMembersLayerConfig;
  name?: string;
};

type LayerType =
  | "univariate"
  | "univariate-three"
  | "univariate-diverging"
  | "bivariate"
  | "compass"
  | "plakat";

type Layer = {
  name: string;
  type: LayerType;
  variables: any;
  breakpoints: any;
  fill_color: any[];
  fill_outline: any[];
  fill_pattern: any[];
  filter: ExpressionSpecification;
  source: string;
  source_layer: string;
  fillColor?: any;
  mainColors?: string[];
};

type MapRefType = MutableRefObject<MapRef | null> | null;

type PopupRefType = MutableRefObject<Popup | null> | null;

type BackgroundObject = {
  color: string;
  pattern: string;
  combinedColor?: string;
  cssRule?: string;
  textColor?: string;
  baseColor?: string;
};

type FilterObject = {
  type: "match" | "step" | "step-matrix" | "compass";
  field: string | string[];
  values: string[] | number[][];
  layer?: boolean;
};

type PolygonListItem = {
  key: string;
  GEN_city_name: string;
  support: number;
};

type BasicObject = {
  [key: string]: any;
};

interface StatisticalAreas {
  google_maps_polygon: any;
  Shem_Yishuv: string;
  YISHUV_STAT2022: string;
}

interface StatisticalData {
  [key: string]: any;
}

type KalpiFeature = {
  id: string;
  location: string;
  rank?: string | number;
  potentialGroup?: string;
  coordinates?: LngLat;
  properties: BasicObject;
};

type PaintProperty = "fill-color" | "fill-opacity" | "fill-pattern";

type Paint = {
  [key in PaintProperty]?: any;
};

type FillPaint = [string, string[], ...(number | string | FillPaint[])[]];

type ColorSchemes = {
  [key: string]: string[];
};

type LegendKeys = {
  [key: string]: string[];
};

type Legend = {
  [MAP_FILTER_FIELD_KEY]: string;
  [key: string]: string | LegendStep;
};

type SteppedLegend = {
  [MAP_FILTER_FIELD_KEY]: string;
  steps: LegendStep[];
};

type LegendStep = {
  value: number | string | SteppedLegend;
  color?: string;
  range?: number[];
};

type TranslationFunction = (
  key: string,
  params?: Record<string, any>,
) => string;

interface CampaignVariables {
  id?: string;
  name?: string;
  kpi?: string;
  baseLink?: string;
  channelIds?: string[];
  audiences?: CampaignInputAudience[];
  createdAt?: string;
  launch?: boolean;
}

type CampaignInputAudience = {
  name: string;
  size: number;
};

interface Channel {
  id: string;
  name: string;
  utm_source?: string;
  utm_medium?: string;
  category: string;
  icon: string;
}

export type PerformanceGroup = {
  name: string;
  clicks: number;
  percent: number;
};

interface CampaignWizardData {
  id?: string; // If editing, we have an existing id
  kpi?: string; // Stage 1
  name?: string; // Stage 1
  baseLink?: string; // Stage 1
  channels?: Channel[];
  audiences?: Audience[];
  urls?: UrlObject[];
  createdAt?: string;
  launched?: boolean;
  launchedAt?: string;
  topChannels?: PerformanceGroup;
  topAudiences?: PerformanceGroup;
}

/* IMPORTANT SYNC WITH CampaignWizardData */
type KeysOfCampaignWizardData =
  | "id"
  | "kpi"
  | "name"
  | "baseLink"
  | "channels"
  | "audiences"
  | "createdAt"
  | "launched"
  | "launchedAt";

interface WizardStepDefinition {
  key: string;
  title: string;
  component: ReactNode;
  /** Optionally, custom validation logic if needed. */
  validateStep?: () => boolean | Promise<boolean>;
  /** Overwrite the next button label (e.g., 'Finish' at last step). */
  nextButtonLabel?: string;
}

type AudienceKey = "csv" | "geo";

type AudienceComponentProps = {
  onChange: (data: any) => void;
  disabled?: boolean;
};

type AudienceComponentDef = {
  component: React.ComponentType<AudienceComponentProps>;
  disabled?: boolean;
};

type Audience = {
  id: string;
  type: AudienceKey;
  name: string;
  size: number;
};

type UrlObject = {
  url: string | null;
  qrCodeSvg?: string | null;
  channel: Channel;
  audience?: Audience; // null for organic or non-audience channels
  clicks?: number;
  converted?: number;
  id?: string;
  campaignId?: any;
};

type UrlViewerMode = "channel" | "audience";

type MapClickState = "statzone" | "signage";

type SignageImplementationStatus = "suggestion" | "implemented";

type SignageCoordinates = {
  lat: number;
  lng: number;
};

type SignageActivity = {
  id: string;
  orgId: string;
  activityType: string;
  address: string;
  statzoneId?: string;
  comment?: string;
  implementationStatus: SignageImplementationStatus;
  coordinates: SignageCoordinates;
  createdAt: string;
  updatedAt: string;
};

type SignageActivityInput = {
  activityType: string;
  address: string;
  comment?: string;
  implementationStatus: SignageImplementationStatus;
  coordinates: SignageCoordinates;
};

type SignageFilterValue = "all" | SignageImplementationStatus;

type SignageLayerFilterType = "signage";

type SignageSortValue = "newest" | "oldest" | "type" | "status";

type SignageState = {
  activities: SignageActivity[];
  selectedActivityId: string | null;
  filter: SignageFilterValue;
  sort: SignageSortValue;
  isModeEnabled: boolean;
};

type DoorToDoorCoordinates = {
  lat: number;
  lng: number;
};

type DoorToDoorApartment = {
  source_id?: string;
  external_id?: string;
  address?: string;
  house_type?: string | null;
  apartment_number?: string | null;
  pledge_status?: string | null;
  pledged_to_vote?: boolean | null;
  notes?: string | null;
};

type DoorToDoorApiRecord = {
  org_id: string;
  address: string;
  coordinates: string;
  house_type?: string | null;
  apartment_number?: string | null;
  pledge_status?: string | null;
  pledged_to_vote?: boolean | null;
  notes?: string | null;
  apartments?: DoorToDoorApartment[] | string | null;
};

type DoorToDoorActivity = {
  orgId: string;
  address: string;
  coordinates: DoorToDoorCoordinates;
  houseType?: string | null;
  apartmentNumber?: string | null;
  pledgeStatus?: string | null;
  pledgedToVote?: boolean | null;
  notes?: string | null;
  apartments: DoorToDoorApartment[];
  popupHtml: string;
  iconId: string;
  apartmentCount: number;
};

export type {
  User,
  PrivateOrgMetadata,
  PARTIES,
  InitialFetchAtom,
  EncompassingLog,
  BasicLog,
  SingularClientLog,
  MapRefType,
  PopupRefType,
  Group,
  LayerType,
  Layer,
  BackgroundObject,
  FilterObject,
  PolygonListItem,
  StatisticalData,
  StatisticalAreas,
  Paint,
  FillPaint,
  ColorSchemes,
  LegendKeys,
  BasicObject,
  Legend,
  SteppedLegend,
  LegendStep,
  TranslationFunction,
  Channel,
  CampaignWizardData,
  KeysOfCampaignWizardData,
  WizardStepDefinition,
  AudienceKey,
  AudienceComponentDef,
  Audience,
  UrlObject,
  UrlViewerMode,
  CampaignVariables,
  MapClickState,
  SignageCoordinates,
  SignageActivity,
  SignageActivityInput,
  SignageImplementationStatus,
  SignageFilterValue,
  SignageLayerFilterType,
  SignageSortValue,
  SignageState,
  DoorToDoorCoordinates,
  DoorToDoorApartment,
  DoorToDoorApiRecord,
  DoorToDoorActivity,
  KalpiFeature,
};
