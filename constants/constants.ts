import { capitalize, darkenColor } from "@/lib/utils";
import { CompassItems } from "@/types/layerResearch";
import { BasicObject, LegendKeys } from "@/types";
import { ExpressionSpecification } from "mapbox-gl";

export const FONT_FAMILY = "OpenSans";
export const MAP_FONT_FAMILY = "OpenSans";
export const TEXT_SHADOW_OUTLINE =
  "-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff";

/*Map Constants*/
export const MAPBOX_LAYER_SOURCE = "composite";
export const MAPBOX_LAYER_SOURCE_LAYER =
  process.env.NEXT_PUBLIC_ENV === "Production"
    ? "statistical_areas_2022"
    : "statistical_areas_2022_staging";

export const MAPBOX_LAYER_FILL_COLOR = "statistical-areas-color";
export const MAPBOX_LAYER_FILL_PATTERN = "statistical-areas-patterns";

export const PLAKAT_PATTERN = "diagonal-soft";

/*
  ADD NEW LAYER NAME HERE
*/
export const MAPBOX_SELECTABLE_LAYERS = [
  "plakat-liberal-support",
  "plakat-turnout",
  "research-right-persuasion",
  "research-right-suppression",
  "research-right-suppressed",
  "plakat-liberal",
  "research-yeshatid-battleground",
  "research-new-russians",
  "research-yeshatid-defense-iron",
  "research-yeshatid-defense-anti-ganz",
  "research-yeshatid-defense-crispy",
  "research-yeshatid-defense-urgency",
  "plakat-voters",
  "research-religious",
  "research-anglo-saxons",
  "research-russian-centers",
  "research-tactical-liberals",
  "research-tikva-kulanu-prexit",
  "research-kulanu-prexit",
  "research-tikva-prexit",
  "research-geo-datlash",
  "research-moderate-religious",
  "research-geo-datlash-traditional",
  "research-convincible-sausages",
  "research-sausages-not-voting", // this is an old name that is left for compatibility with the clerk settings
  "research-eisenkot-potential",
  "research-geo-datlash-religious",
  "research-trend-in-liberal-support",
  "research-gotv-potential",
  "research-gotv-potential-three",
  "compass-inter-bloc-range",
  "compass-inter-bloc-range-shita",
  "compass-yashar",
  "compass-yashar-municipal",
  "compass-bennet",
  "research-plakat-democrates",
  "research-arab-democrats",
  "research-arabs-gotv-potential",
  "hebrew-speaking-potential-democrats",
  "research-democrats-lost-votes",
  "research-winter-potential",
  "hebrew-speaking-battleground-democrats",
  "hebrew-speaking-battleground-democrats_south",
  "hebrew-speaking-battleground-democrats_rural-area",
  "hebrew-speaking-battleground-democrats_north_sharon",
  "hebrew-speaking-battleground-democrats_south_sharon",
  "hebrew-speaking-battleground-democrats_haifa",
  "hebrew-speaking-battleground-democrats_youngsters",
  "hebrew-speaking-battleground-democrats_jerusalem",
  "hebrew-speaking-battleground-democrats_tel-aviv",
  "hebrew-speaking-battleground-democrats_shephelah",
  "hebrew-speaking-battleground-democrats_dan",
  "hebrew-speaking-battleground-democrats_north",
  "merkazim-beer-sheva-liberal-potential-priority",
  "research-linear-example",
  "research-bivector-example",
  "plakat-example",
  "voter-file-1",
];

const prefixArray = (prefix: string): Array<string> => {
  return MAPBOX_SELECTABLE_LAYERS.filter((item) => item.startsWith(prefix));
};

const prefixMap = <T>(prefix: string, value: T): Record<string, T> => {
  return Object.fromEntries(prefixArray(prefix).map((item) => [item, value]));
};

export const MAPBOX_LAYER_DEFAULT_FILTER: ExpressionSpecification = [
  ">",
  ["get", "DEMO_pop_total_2024"],
  0,
];

export const MAPBOX_LAST_LAYER_IN_FRONT = "building";
export const MAPBOX_STAT_LAYER_OUTLINE = "polygons-outline";
export const MAPBOX_STAT_LAYER_OUTLINE_ACTIVE = "polygons-active";
export const MAPBOX_STAT_LAYER_OUTLINE_HOVER = "polygons-hover";
export const MAPBOX_MUNICIPAL_LAYER_OUTLINE = "municipal-outline";

export const MAPBOX_KALPI_LAYER = "kalpi-locations";

export const MAP_DEFAULT_SELECTED_POLYGON = { id: "" };

export const MAP_FILTER_FIELD_KEY = "field";

export const MAPBOX_CONSTANTS = {
  source: MAPBOX_LAYER_SOURCE,
  sourceLayer: MAPBOX_LAYER_SOURCE_LAYER,
  layerFillColor: MAPBOX_LAYER_FILL_COLOR,
  layerFillPattern: MAPBOX_LAYER_FILL_PATTERN,
  layerDefaultFilter: MAPBOX_LAYER_DEFAULT_FILTER,
  layerOutline: MAPBOX_STAT_LAYER_OUTLINE,
  layerOutlineHover: MAPBOX_STAT_LAYER_OUTLINE_HOVER,
  layerOutlineActive: MAPBOX_STAT_LAYER_OUTLINE_ACTIVE,
  layerOutlineMunicipal: MAPBOX_MUNICIPAL_LAYER_OUTLINE,
  layerKalpi: MAPBOX_KALPI_LAYER,
  lastLayerInFront: MAPBOX_LAST_LAYER_IN_FRONT,
  baseLayers: {
    [MAPBOX_LAYER_FILL_COLOR]: {
      "fill-color": "#fff",
      "fill-outline-color": "#000",
    },
    [MAPBOX_LAYER_FILL_PATTERN]: {
      "fill-outline-color": "#000",
      "fill-pattern": "",
    },
  },
  baseFilters: {
    [MAPBOX_STAT_LAYER_OUTLINE_ACTIVE]: (id = 0) => ["==", "id", id],
    [MAPBOX_MUNICIPAL_LAYER_OUTLINE]: (cityCode = 0) => [
      "==",
      "CR_LAMAS",
      cityCode + "",
    ],
    [MAPBOX_STAT_LAYER_OUTLINE_HOVER]: (id = 0) => ["==", "id", id],
  },
};

export const MAP_CLICK_TYPES = ["search", "layerChange", "polygonsListSelect"];

export const MAP_PLAKAT_BIVECTOR = [
  ["Core", "Base", "GOTV&rPLAKAT_Turnout:55-100", "GOTV&rPLAKAT_Turnout:0-55"],
  ["Base", "Base", "GOTV&rPLAKAT_Turnout:55-100", "GOTV&rPLAKAT_Turnout:0-55"],
  [
    "PersuationHighVote",
    "PersuationHighVote",
    "PersuationLowVote",
    "PersuationLowVote",
  ],
  ["None", "None", "None", "None"],
];

export const MAP_INSIGHT_LEGEND_KEYS: LegendKeys = {
  support: ["Core", "Base"],
  encouragement: ["GOTV"],
  persuasion: ["PersuationHighVote", "PersuationLowVote"],
  none: ["None"],
};

export const MAP_FILTER_MATCH_EXTRA_FIELD = ["GOTV"];

/*
  EXAMPLE FOR PLAKAT ANOMALY
*/
export const MAP_INSIGHT_ANOMALY: BasicObject = {
  encouragement: { property: "PLAKAT_Turnout", breakpoints: [0.55] },
};

export const MAP_YESHATID_ANOMALY: BasicObject = {
  "research-yeshatid-battleground": {
    property: "RESEARCH_YESHATID_BATTLEGROUND_yeshatid_vs_kahollavan",
    breakpoints: [0.3, 0.4],
  },
};

/*
  EXAMPLE FOR BIVECTOR ANOMALY
  In 'property' add the X axis of the matrix (the second field in the coloring json) with the breakpoints from this field
*/
export const MAP_RUSSIANS_ANOMALY: BasicObject = {
  "research-russian-centers": {
    property: "RESEARCH_NEW_RUSSIANS_battleground",
    breakpoints: [0.33, 0.66],
  },
};
export const MAP_EXAMPLE_ANOMALY: BasicObject = {
  "research-bivector-example": {
    property: "RESEARCH_NEW_RUSSIANS_battleground",
    breakpoints: [0.33, 0.66],
  },
};
export const MAP_HEBREW_SPEAKERS_DEMOCRATS_ANOMALY: BasicObject = {
  "hebrew-speaking-battleground-democrats": {
    property: "RESEARCH_DEMOCRATS_hebrew_base_convincibles_battleground_norm",
    volume: "RESEARCH_DEMOCRATS_hebrew_base_convincibles_norm",
    breakpoints: [0.45, 0.55],
  },
};

export const MAP_REVERSE_ANOMALY = ["encouragement"];

/*
  ADD BIVECTOR AND PLAKAT LAYER HERE WITH RESPECTIVE ANOMALY
*/
export const LayersWithAnomaly: BasicObject = {
  "plakat-liberal": MAP_INSIGHT_ANOMALY,
  "plakat-example": MAP_INSIGHT_ANOMALY,
  "research-yeshatid-battleground": MAP_YESHATID_ANOMALY,
  "research-russian-centers": MAP_RUSSIANS_ANOMALY,
  "hebrew-speaking-battleground-democrats":
    MAP_HEBREW_SPEAKERS_DEMOCRATS_ANOMALY,
  "research-bivector-example": MAP_EXAMPLE_ANOMALY,
};

/*
  ADD NEW PLAKAT HERE WITH THE SAME 'MAP_INSIGHT_LEGEND_KEYS'
*/
export const LayersWithLegendKeys: BasicObject = {
  "plakat-liberal": MAP_INSIGHT_LEGEND_KEYS,
  "plakat-example": MAP_INSIGHT_LEGEND_KEYS,
  //"plakat-new": MAP_INSIGHT_LEGEND_KEYS,
};

/*
  ADD LAYER'S PRIMARY COLOR FILED
  # notes:
    for Bivector: Add the Y axis of the matrix (the first field in the coloring json)
    for Plakat: Add the "sentiment" field (e.g: PLAKAT_Liberal_sentiment)
*/
export const LayersColoringDataKeys: { [key: string]: string } = {
  "plakat-liberal-support": "PLAKAT_Liberal_support",
  "plakat-turnout": "PLAKAT_Turnout",
  "plakat-liberal": "PLAKAT_Liberal_sentiment",
  "plakat-example": "PLAKAT_Liberal_sentiment",
  "research-right-persuasion": "RESEARCH_SWINGING_RIGHT_potential_persuasion",
  "research-right-suppression": "RESEARCH_SWINGING_RIGHT_potential_suppression",
  "research-right-suppressed": "RESEARCH_SWINGING_RIGHT_currently_suppressed",
  "research-new-russians": "RESEARCH_NEW_RUSSIANS_adults",
  "research-yeshatid-battleground":
    "RESEARCH_YESHATID_BATTLEGROUND_support_yeshatid_kahollavan",
  "research-yeshatid-defense-iron": "RESEARCH_YESHATID_DEFENSE_iron_voters",
  "research-yeshatid-defense-anti-ganz":
    "RESEARCH_YESHATID_DEFENSE_anti_gantz_voters",
  "research-yeshatid-defense-crispy": "RESEARCH_YESHATID_DEFENSE_crispy_voters",
  "research-yeshatid-defense-urgency":
    "RESEARCH_YESHATID_DEFENSE_total_weighted",
  "plakat-voters": "KNESSET_25_rtv",
  "research-religious": "RESEARCH_ANGLO_RELIGIOUS_religious_adults_norm",
  "research-anglo-saxons": "RESEARCH_ANGLO_RELIGIOUS_anglo_saxon_adults_norm",
  "research-russian-centers": "RESEARCH_NEW_RUSSIANS_total_norm",
  "research-tactical-liberals": "RESEARCH_YESHATID_DEFENSE_crispy_voters",
  "research-tikva-kulanu-prexit": "RESEARCH_TIKVA_PREXIT_kulanu_gradience",
  "research-kulanu-prexit": "RESEARCH_KULANU_PREXIT_votes_norm",
  "research-tikva-prexit": "RESEARCH_TIKVA_PREXIT_votes_norm",
  "research-geo-datlash": "RESEARCH_GEOGRAPHIC_DATLASH_count",
  "research-geo-datlash-religious":
    "RESEARCH_GEOGRAPHIC_DATLASH_RELIGIOUS_norm",
  "research-geo-datlash-traditional":
    "RESEARCH_GEOGRAPHIC_DATLASH_TRADITIONAL_norm",
  "research-trend-in-liberal-support": "RESEARCH_liberal_support_trend_norm",
  "research-gotv-potential": "RESEARCH_GOTV_POTENTIAL_norm",
  "research-gotv-potential-three": "RESEARCH_GOTV_POTENTIAL_norm",
  "research-moderate-religious":
    "RESEARCH_MODERATE_RELIGIOUS_moderate_religious_communities_score",
  "research-convincible-sausages": "RESEARCH_CONVINCIBLE_SAUSAGES_norm",
  "research-sausages-not-voting": "RESEARCH_FSU_NOT_VOTING_norm",
  "research-eisenkot-potential": "RESEARCH_EISENKOT_potential_voters_norm",
  "research-linear-example": "RESEARCH_EISENKOT_potential_voters_norm",
  "research-bivector-example": "RESEARCH_NEW_RUSSIANS_total_norm",
  "compass-inter-bloc-range": "RESEARCH_INTER_RANGE_inter_range",
  "compass-inter-bloc-range-shita": "RESEARCH_INTER_RANGE_inter_range",
  "compass-yashar": "YASHAR_COMPASS_V2_support_gadi",
  "compass-yashar-municipal": "MUNICIPAL_YASHAR_COMPASS_V2_support_gadi",
  "compass-bennet": "BENNET_COMPASS_support_bennet_new",
  "research-plakat-democrates": "RESEARCH_democrats_support_total_norm",
  "research-democrats-lost-votes": "RESEARCH_DEMOCRATS_lost_votes_norm",
  "research-winter-potential": "WINTER_COMPASS_potential_norm",
  "research-arab-democrats": "ARABS_DEMOCRATS_weighted_voter_potential_norm",
  "research-arabs-gotv-potential": "ARABS_GOTV_gotv_potential_bin_en",
  "hebrew-speaking-potential-democrats":
    "RESEARCH_DEMOCRATS_hebrew_new_supporters_norm",
  ...prefixMap(
    "hebrew-speaking-battleground-democrats",
    "RESEARCH_DEMOCRATS_hebrew_base_convincibles_norm",
  ),
  "merkazim-beer-sheva-liberal-potential-priority":
    "RESEARCH_MERKAZIM_index_norm",
  "voter-file-1": "VOTER_FILE_coverage_pcnt",
};

/*
  ADD LAYER'S MAIN PERCENTAGE FILED (for count maps with percentage view)
*/
export const LayersDataKeysPercentage: { [key: string]: string } = {
  "research-new-russians": "RESEARCH_NEW_RUSSIANS_adults_pcnt",
  "research-religious": "RESEARCH_ANGLO_RELIGIOUS_religious_adults_pcnt",
  "research-anglo-saxons": "RESEARCH_ANGLO_RELIGIOUS_anglo_saxon_adults_pcnt",
  "research-kulanu-prexit": "RESEARCH_KULANU_PREXIT_vote_share_of_turnout_pcnt",
  "research-geo-datlash": "RESEARCH_GEOGRAPHIC_DATLASH_pcnt",
  "research-geo-datlash-religious":
    "RESEARCH_GEOGRAPHIC_DATLASH_RELIGIOUS_pcnt",
  "research-geo-datlash-traditional":
    "RESEARCH_GEOGRAPHIC_DATLASH_TRADITIONAL_pcnt",
  "research-trend-in-liberal-support":
    "RESEARCH_trend_in_liberal_support_KNESSET_25_turnout_pcnt",
  "research-moderate-religious":
    "RESEARCH_MODERATE_RELIGIOUS_neemanei_communities_norm",
  "research-eisenkot-potential": "RESEARCH_EISENKOT_potential_voters_pcnt",
  "merkazim-beer-sheva-liberal-potential-priority":
    "ECO_work_working_pcnt_2022",
  "research-linear-example": "RESEARCH_EISENKOT_potential_voters_pcnt",
  "voter-file-1": "VOTER_FILE_coverage_pcnt",
};

/*
  ADD LAYER'S MAIN COUNT FILED
*/
export const LayersDisplayDataKeys: { [key: string]: string } = {
  "plakat-liberal-support": "PLAKAT_Liberal_support",
  "plakat-turnout": "PLAKAT_Turnout",
  "plakat-liberal": "PLAKAT_Liberal_sentiment",
  "plakat-example": "PLAKAT_Liberal_sentiment",
  "research-new-russians": "RESEARCH_NEW_RUSSIANS_adults_count",
  "research-right-persuasion":
    "RESEARCH_SWINGING_RIGHT_potential_persuasion_count",
  "research-right-suppression":
    "RESEARCH_SWINGING_RIGHT_potential_suppression_count",
  "research-right-suppressed":
    "RESEARCH_SWINGING_RIGHT_currently_suppressed_count",
  "plakat-voters": "KNESSET_25_rtv",
  "research-religious": "RESEARCH_ANGLO_RELIGIOUS_religious_adults",
  "research-anglo-saxons": "RESEARCH_ANGLO_RELIGIOUS_anglo_saxon_adults",
  "research-tactical-liberals": "RESEARCH_YESHATID_DEFENSE_crispy_voters_count",
  "research-tikva-kulanu-prexit": "RESEARCH_TIKVA_PREXIT_kulanu_votes_count",
  "research-kulanu-prexit": "RESEARCH_KULANU_PREXIT_votes_count",
  "research-tikva-prexit": "RESEARCH_TIKVA_PREXIT_votes_count",
  "research-geo-datlash": "RESEARCH_GEOGRAPHIC_DATLASH_count",
  "research-geo-datlash-religious":
    "RESEARCH_GEOGRAPHIC_DATLASH_RELIGIOUS_count",
  "research-geo-datlash-traditional":
    "RESEARCH_GEOGRAPHIC_DATLASH_TRADITIONAL_count",
  "research-trend-in-liberal-support":
    "RESEARCH_trend_in_liberal_support_KNESSET_25_rtv_count",
  "research-gotv-potential": "RESEARCH_GOTV_POTENTIAL_count",
  "research-gotv-potential-three": "RESEARCH_GOTV_POTENTIAL_count",
  "research-moderate-religious":
    "RESEARCH_MODERATE_RELIGIOUS_neemanei_communities_count",
  "research-convincible-sausages": "RESEARCH_CONVINCIBLE_SAUSAGES_count",
  "research-sausages-not-voting": "RESEARCH_FSU_NOT_VOTING_count",
  "research-eisenkot-potential": "RESEARCH_EISENKOT_potential_voters_count",
  "research-linear-example": "RESEARCH_EISENKOT_potential_voters_count",
  "research-plakat-democrates": "RESEARCH_democrats_support_total",
  "research-democrats-lost-votes": "RESEARCH_DEMOCRATS_lost_votes",
  "research-winter-potential": "WINTER_COMPASS_potential",
  "hebrew-speaking-potential-democrats":
    "RESEARCH_DEMOCRATS_hebrew_new_supporters",
  "voter-file-1": "VOTER_FILE_phones_count",
};

/*
  ADD LAYER HERE IF LEGEND IS USING 'FEMALE' WORDS
*/
export const MAP_LAYER_FEMALE_NAME = [
  "plakat-liberal-support",
  "research-right-persuasion",
  "research-right-suppression",
  "research-right-suppressed",
  "research-yeshatid-battleground",
  "research-yeshatid-defense-crispy",
  "research-yeshatid-defense-anti-ganz",
  "research-yeshatid-defense-iron",
  "research-new-russians",
  "research-religious",
  "research-anglo-saxons",
  "research-tactical-liberals",
  "research-tikva-kulanu-prexit",
  "research-kulanu-prexit",
  "research-tikva-prexit",
  "research-geo-datlash",
  "research-convincible-sausages",
  "research-sausages-not-voting",
  "research-eisenkot-potential",
  "research-geo-datlash-religious",
  "research-geo-datlash-traditional",
  "research-trend-in-liberal-support",
  "research-gotv-potential",
  "research-gotv-potential-three",
  "research-plakat-democrates",
  "research-democrats-lost-votes",
  "research-linear-example",
];

/*
  ADD LAYER HERE IF LEGEND'S TEXT IS TOO LARGE
*/
export const BIVECTOR_MAP_LEGEND_WITH_SMALLER_TEXT = [
  "research-russian-centers",
  ...prefixArray("hebrew-speaking-battleground-democrats"),
];

export const MAP_CARD_GENERAL_INFO = {
  id: "id",
  title: "GEN_neighborhoods_2022",
  subtitles: [
    "GEN_city_name",
    "GEN_city_county_adjusted",
    "GEN_city_natural_region_adjusted",
  ],
  data: [
    "DEMO_pop_total_2024",
    "KNESSET_26_rtv_corrected",
    "RESEARCH_first_time_voters",
  ],
};

/* Municipal political info */
export const MAP_MUNICIPAL_POLITICAL_INFO = [
  "KNESSET_25_rtv",
  "KNESSET_25_voters_total",
  "KNESSET_26_rtv_estimate",
  "KNESSET_26_new_rtv_estimate",
];

export const BLOC_COLORS = {
  liberal: "#417AAB",
  inter_bloc: "#B978A3",
  conservative: "#F44A55",
  orthodox: "#000000",
  arab: "#04B98A",
};

export const MAP_CARD_RESEARCH_DATA = () => {
  let layersResearch: BasicObject = {};
  MAPBOX_SELECTABLE_LAYERS.forEach((layer: string) => {
    let research: BasicObject = {
      layer: layer,
      mainField: LayersColoringDataKeys[layer],
    };
    if (layer.startsWith("plakat")) {
      research.type = "numbers";
      research.title = "plakat";
      if (layer === "plakat-voters") {
        research.type = "none";
      } else if (layer === "plakat-turnout" || layer.endsWith("support")) {
        research.data = [
          {
            percent: LayersColoringDataKeys[layer],
            count: `${LayersColoringDataKeys[layer]}*KNESSET_25_rtv`,
          },
        ];
      } else {
        /* 
        PLAKAT MAP GENERATOR
        note: the value of the layer's name and of the field must contain the faction/party
      */
        const faction = layer.split("-")[1];
        research.data = [
          {
            percent: `PLAKAT_${capitalize(faction)}_support`,
            count: `PLAKAT_${capitalize(faction)}_support*KNESSET_25_rtv`,
          },
          {
            percent: "PLAKAT_Turnout",
            count: "PLAKAT_Turnout*KNESSET_25_rtv",
          },
        ];
      }
    } else if (layer === "research-plakat-democrates") {
      research.type = "count";
      research.title = "plakat";
      research.data = [
        {
          percent: "RESEARCH_democrats_support",
          count: "RESEARCH_democrats_support_total",
        },
      ];
    } else if (layer === "research-democrats-lost-votes") {
      research.title = "lost-democrats-votes-2022";
      research.type = "count";
      research.data = [
        {
          percent: "RESEARCH_DEMOCRATS_lost_votes_pcnt",
          count: "RESEARCH_DEMOCRATS_lost_votes",
        },
      ];
    } else if (layer === "research-winter-potential") {
      research.title = "winter-potential";
      research.type = "count";
      research.data = [
        {
          percent: "WINTER_COMPASS_potential_pcnt",
          count: "WINTER_COMPASS_potential",
        },
      ];
    } else if (layer === "hebrew-speaking-potential-democrats") {
      research.type = "count";
      research.title = "support-model-results";
      research.data = [
        {
          percent: "RESEARCH_DEMOCRATS_hebrew_new_supporters_pcnt",
          count: "RESEARCH_DEMOCRATS_hebrew_new_supporters",
        },
      ];
    } else if (layer === "hebrew-speaking-potential-democrats") {
      research.type = "count";
      research.title = "support-model-results";
      research.data = [
        {
          percent: "RESEARCH_DEMOCRATS_hebrew_new_supporters_pcnt",
          count: "RESEARCH_DEMOCRATS_hebrew_new_supporters",
        },
      ];
    } else if (layer === "research-arab-democrats") {
      research.title = {
        potential: "ARABS_DEMOCRATS_potential_bin",
      };
      research.potential = [
        {
          title: "democrats_support_potential",
          count: "ARABS_DEMOCRATS_weighted_voter_potential",
        },
      ];
      research.data = [
        {
          type: "attribute",
          color: "#3A624B",
          count: "ARABS_DEMOCRATS_arab_rtv_count",
          label: "arabic-speaking-rtv",
        },
        {
          type: "bar",
          title: "zone_party_affiliation",
          domain: arabDemocratsPartyValueKeys,
          colors: arabDemocratsPartyColorKeys,
          size: "normal",
          noTotal: true,
          labels: true,
          gap: 0,
          firstWordGroupLabels: false,
        },
        {
          type: "boldText",
          label: "city-type",
          field: "ARABS_DEMOCRATS_city_type",
        },
      ];
    } else if (layer.startsWith("hebrew-speaking-battleground-democrats")) {
      research.type = "targets";
      research.title = {
        volume: "RESEARCH_DEMOCRATS_hebrew_bucket_volume",
        tendency: "RESEARCH_DEMOCRATS_hebrew_bucket_leaning",
      };
      research.subtitle = "hebrew-speaking-battleground-democrats";
      research.data = [
        {
          count: "RESEARCH_DEMOCRATS_hebrew_base_count",
          percent: "RESEARCH_DEMOCRATS_hebrew_base_pcnt",
        },
        {
          count: "RESEARCH_DEMOCRATS_hebrew_convincibles_count",
          percent: "RESEARCH_DEMOCRATS_hebrew_convincibles_pcnt",
        },
        "RESEARCH_DEMOCRATS_hebrew_base_kpi",
        "RESEARCH_DEMOCRATS_hebrew_convincibles_kpi",
      ];
      research.dataTitle = "statzone-character";
      research.dataRows = [
        {
          title: "political-leaning",
          data: [
            {
              color: BLOC_COLORS.liberal,
              count: "RESEARCH_DEMOCRATS_hebrew_liberal_bloc",
              percent: "RESEARCH_DEMOCRATS_hebrew_liberal_bloc_pcnt",
              label: "liberals",
            },
            {
              color: BLOC_COLORS.inter_bloc,
              count: "RESEARCH_DEMOCRATS_hebrew_inter_range_bloc",
              percent: "RESEARCH_DEMOCRATS_hebrew_inter_range_bloc_pcnt",
              label: "inter-bloc",
            },
            {
              color: BLOC_COLORS.conservative,
              count: "RESEARCH_DEMOCRATS_hebrew_conservative_bloc",
              percent: "RESEARCH_DEMOCRATS_hebrew_conservative_bloc_pcnt",
              label: "conservatives",
            },
            {
              color: BLOC_COLORS.orthodox,
              count: "RESEARCH_DEMOCRATS_hebrew_orthodox_bloc",
              percent: "RESEARCH_DEMOCRATS_hebrew_orthodox_bloc_pcnt",
              label: "orthodox-parties",
            },
            {
              color: BLOC_COLORS.arab,
              count: "RESEARCH_DEMOCRATS_hebrew_arab_bloc",
              percent: "RESEARCH_DEMOCRATS_hebrew_arab_bloc_pcnt",
              label: "arab-parties",
            },
          ],
        },
      ];
      research.info = {
        title: "hebrew-speaking-battleground-democrats-info",
        data: [
          {
            count: "RESEARCH_DEMOCRATS_hebrew_knesset_25_official_rtv",
            percent: "RESEARCH_DEMOCRATS_hebrew_knesset_25_official_turnout",
          },
          {
            count: "RESEARCH_DEMOCRATS_hebrew_knesset_25_rtv",
            percent: "RESEARCH_DEMOCRATS_hebrew_knesset_25_turnout",
          },
        ],
      };
    } else if (layer.startsWith("compass")) {
      research.type = "compass";
      switch (layer) {
        case "compass-inter-bloc-range":
        case "compass-inter-bloc-range-shita":
          research.collapseItems = {
            "statzone-data-inter-bloc-range": {
              dataTitle: "bloc-breakdown",
              statZoneColor: true,
              dataRows: [
                {
                  title: "whole-statzone",
                  data: [
                    {
                      color: BLOC_COLORS.liberal,
                      count: "RESEARCH_INTER_RANGE_liberal_bloc",
                      label: "liberals",
                    },
                    {
                      color: BLOC_COLORS.inter_bloc,
                      count: "RESEARCH_INTER_RANGE_inter_range_bloc",
                      label: "inter-bloc",
                    },
                    {
                      color: BLOC_COLORS.conservative,
                      count: "RESEARCH_INTER_RANGE_conservative_bloc",
                      label: "conservatives",
                    },
                  ],
                },
              ],
            },
            "municipality-data": {
              dataTitle: "bloc-breakdown",
              statZoneColor: false,
              dataRows: [
                {
                  title: "whole-municipality",
                  data: [
                    {
                      color: BLOC_COLORS.liberal,
                      count: "RESEARCH_INTER_RANGE_liberal_bloc_municipality",
                      label: "liberals",
                    },
                    {
                      color: BLOC_COLORS.inter_bloc,
                      count:
                        "RESEARCH_INTER_RANGE_inter_range_bloc_municipality",
                      label: "inter-bloc",
                    },
                    {
                      color: BLOC_COLORS.conservative,
                      count:
                        "RESEARCH_INTER_RANGE_conservative_bloc_municipality",
                      label: "conservatives",
                    },
                  ],
                },
              ],
            },
          } as CompassItems;
          break;
        case "compass-yashar":
          research.collapseItems = {
            "statzone-data": {
              value: "YASHAR_COMPASS_V2_support_gadi_heb",
              leaning: "YASHAR_COMPASS_V2_support_liberal_heb",
              potential: [
                {
                  title: "potential-mapping-target",
                  count: "YASHAR_COMPASS_V2_potential",
                  percent: "YASHAR_COMPASS_V2_potential_pcnt",
                },
              ],
              dataTitle: "bloc-breakdown",
              statZoneColor: true,
              dataRows: [
                {
                  title: "whole-statzone",
                  data: [
                    {
                      color: BLOC_COLORS.liberal,
                      count: "YASHAR_COMPASS_V2_liberal_block",
                      label: "liberals",
                    },
                    {
                      color: BLOC_COLORS.inter_bloc,
                      count: "YASHAR_COMPASS_V2_inter_block_range_block",
                      label: "inter-bloc",
                    },
                    {
                      color: BLOC_COLORS.conservative,
                      count: "YASHAR_COMPASS_V2_conservative_block",
                      label: "conservatives",
                    },
                  ],
                },
                {
                  title: "yashar-potential",
                  data: [
                    {
                      color: BLOC_COLORS.liberal,
                      count: "YASHAR_COMPASS_V2_liberal_potential",
                      label: "liberals",
                    },
                    {
                      color: BLOC_COLORS.inter_bloc,
                      count: "YASHAR_COMPASS_V2_inter_block_range_potential",
                      label: "inter-bloc",
                    },
                    {
                      color: BLOC_COLORS.conservative,
                      count: "YASHAR_COMPASS_V2_conservative_potential",
                      label: "conservatives",
                    },
                  ],
                },
              ],
              attributes: [
                {
                  color: "#3A624B",
                  percent: "YASHAR_COMPASS_V2_army_alias_pcnt",
                  label: "serving-alliance-community",
                },
              ],
            },
            "municipality-data": {
              potential: [
                {
                  title: "potential-in-municipality",
                  count: "YASHAR_COMPASS_V2_potential_municipality",
                  percent: "YASHAR_COMPASS_V2_potential_pcnt_municipality",
                },
              ],
              dataTitle: "bloc-breakdown",
              statZoneColor: false,
              dataRows: [
                {
                  title: "whole-municipality",
                  data: [
                    {
                      color: BLOC_COLORS.liberal,
                      count: "YASHAR_COMPASS_V2_liberal_block_municipality",
                      label: "liberals",
                    },
                    {
                      color: BLOC_COLORS.inter_bloc,
                      count:
                        "YASHAR_COMPASS_V2_inter_block_range_block_municipality",
                      label: "inter-bloc",
                    },
                    {
                      color: BLOC_COLORS.conservative,
                      count:
                        "YASHAR_COMPASS_V2_conservative_block_municipality",
                      label: "conservatives",
                    },
                  ],
                },
                {
                  title: "yashar-potential",
                  data: [
                    {
                      color: BLOC_COLORS.liberal,
                      count: "YASHAR_COMPASS_V2_liberal_potential_municipality",
                      label: "liberals",
                    },
                    {
                      color: BLOC_COLORS.inter_bloc,
                      count:
                        "YASHAR_COMPASS_V2_inter_block_range_potential_municipality",
                      label: "inter-bloc",
                    },
                    {
                      color: BLOC_COLORS.conservative,
                      count:
                        "YASHAR_COMPASS_V2_conservative_potential_municipality",
                      label: "conservatives",
                    },
                  ],
                },
              ],
              attributes: [
                {
                  color: "#3A624B",
                  percent: "YASHAR_COMPASS_V2_army_alias_pcnt_municipality",
                  label: "serving-alliance-community",
                },
              ],
            },
          } as CompassItems;
          break;
        case "compass-yashar-municipal":
          research.collapseItems = {
            "statzone-data": {
              value: "MUNICIPAL_YASHAR_COMPASS_V2_support_gadi_heb",
              leaning: "MUNICIPAL_YASHAR_COMPASS_V2_support_liberal_heb",
              potential: [
                {
                  title: "potential-mapping-target",
                  count: "MUNICIPAL_YASHAR_COMPASS_V2_potential",
                  percent: "MUNICIPAL_YASHAR_COMPASS_V2_potential_pcnt",
                },
              ],
              dataTitle: "bloc-breakdown",
              statZoneColor: true,
              dataRows: [
                {
                  title: "whole-statzone",
                  data: [
                    {
                      color: BLOC_COLORS.liberal,
                      count: "MUNICIPAL_YASHAR_COMPASS_V2_liberal_block",
                      label: "liberals",
                    },
                    {
                      color: BLOC_COLORS.inter_bloc,
                      count:
                        "MUNICIPAL_YASHAR_COMPASS_V2_inter_block_range_block",
                      label: "inter-bloc",
                    },
                    {
                      color: BLOC_COLORS.conservative,
                      count: "MUNICIPAL_YASHAR_COMPASS_V2_conservative_block",
                      label: "conservatives",
                    },
                  ],
                },
                {
                  title: "yashar-potential",
                  data: [
                    {
                      color: BLOC_COLORS.liberal,
                      count: "MUNICIPAL_YASHAR_COMPASS_V2_liberal_potential",
                      label: "liberals",
                    },
                    {
                      color: BLOC_COLORS.inter_bloc,
                      count:
                        "MUNICIPAL_YASHAR_COMPASS_V2_inter_block_range_potential",
                      label: "inter-bloc",
                    },
                    {
                      color: BLOC_COLORS.conservative,
                      count:
                        "MUNICIPAL_YASHAR_COMPASS_V2_conservative_potential",
                      label: "conservatives",
                    },
                  ],
                },
              ],
              attributes: [
                {
                  color: "#3A624B",
                  percent: "MUNICIPAL_YASHAR_COMPASS_V2_army_alias_pcnt",
                  label: "serving-alliance-community",
                },
              ],
            },
            "municipality-data": {
              potential: [
                {
                  title: "potential-in-municipality",
                  count: "MUNICIPAL_YASHAR_COMPASS_V2_potential_municipality",
                  percent:
                    "MUNICIPAL_YASHAR_COMPASS_V2_potential_pcnt_municipality",
                },
              ],
              dataTitle: "bloc-breakdown",
              statZoneColor: false,
              dataRows: [
                {
                  title: "whole-municipality",
                  data: [
                    {
                      color: BLOC_COLORS.liberal,
                      count:
                        "MUNICIPAL_YASHAR_COMPASS_V2_liberal_block_municipality",
                      label: "liberals",
                    },
                    {
                      color: BLOC_COLORS.inter_bloc,
                      count:
                        "MUNICIPAL_YASHAR_COMPASS_V2_inter_block_range_block_municipality",
                      label: "inter-bloc",
                    },
                    {
                      color: BLOC_COLORS.conservative,
                      count:
                        "MUNICIPAL_YASHAR_COMPASS_V2_conservative_block_municipality",
                      label: "conservatives",
                    },
                  ],
                },
                {
                  title: "yashar-potential",
                  data: [
                    {
                      color: BLOC_COLORS.liberal,
                      count:
                        "MUNICIPAL_YASHAR_COMPASS_V2_liberal_potential_municipality",
                      label: "liberals",
                    },
                    {
                      color: BLOC_COLORS.inter_bloc,
                      count:
                        "MUNICIPAL_YASHAR_COMPASS_V2_inter_block_range_potential_municipality",
                      label: "inter-bloc",
                    },
                    {
                      color: BLOC_COLORS.conservative,
                      count:
                        "MUNICIPAL_YASHAR_COMPASS_V2_conservative_potential_municipality",
                      label: "conservatives",
                    },
                  ],
                },
              ],
              attributes: [
                {
                  color: "#3A624B",
                  percent:
                    "MUNICIPAL_YASHAR_COMPASS_V2_army_alias_pcnt_municipality",
                  label: "serving-alliance-community",
                },
              ],
            },
          } as CompassItems;
          break;
        case "compass-bennet":
          research.title = {
            potential: "BENNET_COMPASS_support_bennet_heb",
            support: "BENNET_COMPASS_support_liberal_heb",
          };
          research.potential = [
            {
              count: "BENNET_COMPASS_potential",
              percent: "BENNET_COMPASS_potential_pcnt",
            },
          ];
          research.data = [
            "BENNET_COMPASS_bennett_supporter_potential",
            "BENNET_COMPASS_religious_zionist_potential",
            "BENNET_COMPASS_yesh_atid_base_potential",
            "BENNET_COMPASS_reservist_potential",
            "BENNET_COMPASS_tactical_liberal_potential",
            "BENNET_COMPASS_soldier_family_potential",
            "BENNET_COMPASS_inter_block_range_potential",
            "BENNET_COMPASS_soldier_mother_potential",
          ];
          break;
      }
    } else if (layer === "research-arabs-gotv-potential") {
      research.data = [
        {
          type: "collapsible",
          sections: [
            {
              title: {
                label: "arabs-gotv-statzone-data",
                values: {
                  potential: "ARABS_GOTV_gotv_potential_bin",
                },
              },
              openByDefault: true,
              data: [
                {
                  type: "potential",
                  title: "ARABS_GOTV_gotv_potential",
                  count: "ARABS_GOTV_gotv_potential",
                },
                {
                  type: "statTable",
                  dataTitle: "vote-likelihood-split",
                  dataRows: [
                    {
                      title: "whole-statzone",
                      data: [
                        {
                          color: BLOC_COLORS.liberal,
                          count: "ARABS_GOTV_will_always_vote_count",
                          label: "always-voting",
                        },
                        {
                          color: BLOC_COLORS.inter_bloc,
                          count: "ARABS_GOTV_gotv_count",
                          label: "vote-encouragement",
                        },
                        {
                          color: BLOC_COLORS.conservative,
                          count: "ARABS_GOTV_will_not_vote_count",
                          label: "not-voting",
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "attribute",
                  color: "#3A624B",
                  prefix: "total",
                  count: "ARABS_GOTV_arab_rtv_count",
                  label: "arabic-speaking-rtv",
                },
              ],
            },
            {
              title: "top-10-families-in-settlement",
              data: [
                {
                  type: "numericTable",
                  entries: Array.from({ length: 10 }, (_, i) => i + 1).map(
                    (i) => {
                      return {
                        layerLabel: `ARABS_GOTV_family_${i}_name`,
                        count: `ARABS_GOTV_family_${i}_count`,
                      };
                    },
                  ),
                },
                {
                  type: "boldText",
                  label: "city-type",
                  field: "ARABS_GOTV_city_type",
                },
              ],
            },
          ],
        },
      ];
    } else if (layer === "research-moderate-religious") {
      /* 
      Example of a "metric" layer with scores
    */
      research.type = "metric";
      research.title = {
        title: layer,
        bucket: "RESEARCH_MODERATE_RELIGIOUS_buckets",
        score:
          "RESEARCH_MODERATE_RELIGIOUS_moderate_religious_communities_score_show",
      };
      research.data = [
        "RESEARCH_MODERATE_RELIGIOUS_religious_adults_count",
        "RESEARCH_MODERATE_RELIGIOUS_shaked_supporters_bool",
        "RESEARCH_MODERATE_RELIGIOUS_liberal_religious_bool",
        "RESEARCH_MODERATE_RELIGIOUS_not_smotrich_religious_count",
        "RESEARCH_MODERATE_RELIGIOUS_neemanei_contacts_count",
        "RESEARCH_MODERATE_RELIGIOUS_neemanei_communities_count",
        "RESEARCH_MODERATE_RELIGIOUS_anglo_saxon_count",
        "EDU_academic_degree_M_pcnt_2022",
        "DEMO_origin_alyia_pcnt_2022",
      ];
    } else if (layer === "research-trend-in-liberal-support") {
      research.type = "metric";
      research.title = {
        title: layer,
        bucket: "RESEARCH_trend_in_liberal_support_bucket",
        score: "RESEARCH_liberal_support_trend_pcnt",
        subtitle: "RESEARCH_liberal_support_change_pcnt",
      };
      research.data = [
        "RESEARCH_trend_in_liberal_support_KNESSET_22_liberal_pcnt",
        "RESEARCH_trend_in_liberal_support_KNESSET_23_liberal_pcnt",
        "RESEARCH_trend_in_liberal_support_KNESSET_24_liberal_pcnt",
        "RESEARCH_trend_in_liberal_support_KNESSET_25_liberal_pcnt",
        "RESEARCH_trend_in_liberal_support_KNESSET_25_rtv_count",
        "RESEARCH_trend_in_liberal_support_KNESSET_25_turnout_pcnt",
      ];
    } else if (
      layer === "research-gotv-potential" ||
      layer === "research-gotv-potential-three"
    ) {
      research.type = "count";
      research.title = layer;
      research.data = [{ count: "RESEARCH_GOTV_POTENTIAL_count" }];
      research.people = true;
    } else if (
      /* 
      Basic "count" layer
      add || condition if necessay
    */
      layer.startsWith("research-new-russians") ||
      layer === "research-anglo-saxons" ||
      layer === "research-religious" ||
      layer === "research-geo-datlash" ||
      layer === "research-geo-datlash-religious" ||
      layer === "research-geo-datlash-traditional" ||
      layer === "research-eisenkot-potential" ||
      layer === "research-linear-example" ||
      layer === "voter-file-1"
    ) {
      research.type = "count";
      research.title = layer;
      research.data = [
        {
          percent: LayersDataKeysPercentage[layer],
          count: LayersDisplayDataKeys[layer],
        },
      ];
    } else if (
      /*
      "count" layer without percentage and with "people" for display
      add || condition if necessay
    */
      layer.startsWith("research-right") ||
      layer === "research-convincible-sausages" ||
      layer === "research-sausages-not-voting"
    ) {
      research.type = "count";
      research.title = layer;
      research.data = [
        {
          count: LayersDisplayDataKeys[layer],
        },
      ];
      research.people = true;
    } else if (layer === "research-tactical-liberals") {
      /* 
      "count" layer without percentage and without "people" for display, it will show "voters" instead  
      add || condition if necessay
    */
      research.type = "count";
      research.title = layer;
      research.data = [
        {
          count: LayersDisplayDataKeys[layer],
        },
      ];
    } else if (layer === "research-tikva-kulanu-prexit") {
      /* 
      "count" with multiple sets of data for display
      add || condition if necessay
    */
      research.type = "count";
      research.title = layer;
      research.data = [
        { count: "RESEARCH_TIKVA_PREXIT_tikva_from_kulanu_votes_count" },
        { count: "RESEARCH_TIKVA_PREXIT_votes_count" },
        { count: "RESEARCH_TIKVA_PREXIT_kulanu_votes_count" },
      ];
    } else if (layer === "research-kulanu-prexit") {
      research.type = "count";
      research.title = layer;
      research.data = [
        {
          percent: "KNESSET_21_turnout",
          count: "KNESSET_21_turnout_count",
        },
        {
          percent: "RESEARCH_KULANU_PREXIT_vote_share_of_turnout_pcnt",
          count: "RESEARCH_KULANU_PREXIT_votes_count",
        },
      ];
    } else if (layer === "research-tikva-prexit") {
      research.type = "count";
      research.title = layer;
      research.data = [{ count: "RESEARCH_TIKVA_PREXIT_votes_count" }];
    } else if (layer === "merkazim-beer-sheva-liberal-potential-priority") {
      research.type = "numbers";
      research.title = "RESEARCH_MERKAZIM_bucket";
      research.title = {
        title: layer,
        bucket: "RESEARCH_MERKAZIM_bucket",
      };
      research.data = [{ percent: "ECO_work_working_pcnt_2022" }];
    } else if (layer.startsWith("research-yeshatid")) {
      research.type = "charts";
      if (layer === "research-yeshatid-battleground") {
        /*
         *Not used battleground chart*
         */
        research.data = [
          {
            type: "segments",
            title: `${layer}-color`,
            field: "RESEARCH_YESHATID_BATTLEGROUND_yeshatid_vs_kahollavan",
            color: ["#2FBFFF", "#00D8A0", "#FEBE22"],
            margins: [0, 0.46],
            breakpoints: [0.3, 0.4],
          },
          {
            type: "segments",
            title: `${layer}-opacity`,
            field: "RESEARCH_YESHATID_BATTLEGROUND_support_yeshatid_kahollavan",
            opacity: [0, 0.5, 0.75, 1],
            breakpoints: [12, 15, 17],
            margins: [0, 22],
            mainColor: {
              field: "RESEARCH_YESHATID_BATTLEGROUND_yeshatid_vs_kahollavan",
              color: ["#2FBFFF", "#00D8A0", "#FEBE22"],
              breakpoints: [0.3, 0.4],
            },
          },
        ];
      } else if (layer.startsWith("research-yeshatid-defense")) {
        research.title = "research-yeshatid-defense";
        research.data = [
          {
            type: "bar",
            title: "research-yeshatid-defense-stat",
            domain: yeshatdidDefenseValueKeys,
            colors: yeshatdidDefenseColorKeys,
            fieldStart: "RESEARCH_YESHATID_DEFENSE_",
          },
          {
            type: "bar",
            title: "research-yeshatid-defense-city",
            domain: yeshatdidDefenseCityValueKeys,
            colors: yeshatdidDefenseColorKeys,
            fieldStart: "RESEARCH_YESHATID_DEFENSE_city_",
          },
        ];
      }
    } else if (layer === "research-russian-centers") {
      /* 
      Example of a Bivector map that uses "count" with 2 sets of data for display  
      add || condition if necessay
    */
      research.type = "count";
      research.title = layer;
      research.data = [
        {
          percent: `RESEARCH_NEW_RUSSIANS_new_adults_pcnt`,
          count: `RESEARCH_NEW_RUSSIANS_new_adults_count`,
        },
        {
          percent: `RESEARCH_NEW_RUSSIANS_old_adults_pcnt`,
          count: `RESEARCH_NEW_RUSSIANS_old_adults_count`,
        },
      ];
    } else if (layer === "research-bivector-example") {
      research.type = "count";
      research.title = layer;
      research.data = [
        {
          percent: `RESEARCH_NEW_RUSSIANS_new_adults_pcnt`,
          count: `RESEARCH_NEW_RUSSIANS_new_adults_count`,
        },
        {
          percent: `RESEARCH_NEW_RUSSIANS_old_adults_pcnt`,
          count: `RESEARCH_NEW_RUSSIANS_old_adults_count`,
        },
      ];
    }
    layersResearch[layer] = research;
  });
  return layersResearch;
};

export const MAP_FILTER_MAIN_FILTERS: BasicObject = {
  layer: {},
  "geographical-area": {
    fields: ["GEN_city_district", "GEN_city_county", "GEN_city_name"],
  },
  "municipal-type": {
    fields: ["GEN_city_group_2022"],
    options: [
      "Big15",
      "Cities",
      "SmallTowns",
      "Arab",
      "Kibutz",
      "Moshav",
      "Other",
    ],
  },
};

export const MAP_FILTER_FEMALE_BOOLEAN = ["geographical-area", "layer"];

export const MAP_FILTER_BOOLEAN = ["true", "false"];

/*
  ADD LAYER HERE IF TOOLTIP SHOWS VOTERS INSTEAD OF PEOPLE
*/
export const MAP_LEGEND_COUNT_DISPLAY_VOTERS = [
  "research-yeshatid-defense-crispy",
  "research-yeshatid-defense-anti-ganz",
  "research-yeshatid-defense-iron",
  "plakat-voters",
  "research-religious",
  "research-anglo-saxons",
  "research-tactical-liberals",
  "research-eisenkot-potential",
  "research-tikva-prexit",
  "research-tikva-kulanu-prexit",
];

/*
  TOOLTIP CONFIG
*/
export const POPUP_CONSTANTS = {
  LayersColoringDataKeys,
  LayersWithLegendKeys,
  LayersWithAnomaly,
  LayersWithFemaleName: MAP_LAYER_FEMALE_NAME,
  FieldsWithReverseAnomaly: MAP_REVERSE_ANOMALY,
  MapFilterFieldKey: MAP_FILTER_FIELD_KEY,
  DisplayScore: {
    "research-moderate-religious": {
      score:
        "RESEARCH_MODERATE_RELIGIOUS_moderate_religious_communities_score_show",
      bucket: "RESEARCH_MODERATE_RELIGIOUS_buckets",
    },
    "research-trend-in-liberal-support": {
      score: "RESEARCH_liberal_support_trend_pcnt",
      bucket: "RESEARCH_trend_in_liberal_support_bucket",
      subtitle: "RESEARCH_liberal_support_change_pcnt",
    },
  },
  DisplayCount: {
    /*
  add count field for display
  */
    "research-right-persuasion":
      "RESEARCH_SWINGING_RIGHT_potential_persuasion_count",
    "research-right-suppression":
      "RESEARCH_SWINGING_RIGHT_potential_suppression_count",
    "research-right-suppressed":
      "RESEARCH_SWINGING_RIGHT_currently_suppressed_count",
    "research-yeshatid-defense-iron":
      "RESEARCH_YESHATID_DEFENSE_iron_voters_count",
    "research-yeshatid-defense-anti-ganz":
      "RESEARCH_YESHATID_DEFENSE_anti_gantz_voters_count",
    "research-yeshatid-defense-crispy":
      "RESEARCH_YESHATID_DEFENSE_crispy_voters_count",
    "research-new-russians": "RESEARCH_NEW_RUSSIANS_adults_count",
    "plakat-voters": "KNESSET_25_rtv",
    "research-religious": "RESEARCH_ANGLO_RELIGIOUS_religious_adults",
    "research-anglo-saxons": "RESEARCH_ANGLO_RELIGIOUS_anglo_saxon_adults",
    "research-tactical-liberals":
      "RESEARCH_YESHATID_DEFENSE_crispy_voters_count",
    "research-tikva-kulanu-prexit":
      "RESEARCH_TIKVA_PREXIT_tikva_from_kulanu_votes_count",
    "research-kulanu-prexit": "RESEARCH_KULANU_PREXIT_votes_count",
    "research-tikva-prexit": "RESEARCH_TIKVA_PREXIT_votes_count",
    "research-geo-datlash": "RESEARCH_GEOGRAPHIC_DATLASH_count",
    "research-geo-datlash-traditional":
      "RESEARCH_GEOGRAPHIC_DATLASH_TRADITIONAL_count",
    "voter-file-1": "VOTER_FILE_phones_count",
    "research-moderate-religious":
      "RESEARCH_MODERATE_RELIGIOUS_moderate_religious_communities_score_show",
    "research-convincible-sausages": "RESEARCH_CONVINCIBLE_SAUSAGES_count",
    "research-sausages-not-voting": "RESEARCH_FSU_NOT_VOTING_count",
    "research-eisenkot-potential": "RESEARCH_EISENKOT_potential_voters_count",
    "research-geo-datlash-religious":
      "RESEARCH_GEOGRAPHIC_DATLASH_RELIGIOUS_count",
    "research-gotv-potential": "RESEARCH_GOTV_POTENTIAL_count",
    "research-gotv-potential-three": "RESEARCH_GOTV_POTENTIAL_count",
    "research-linear-example": "RESEARCH_EISENKOT_potential_voters_count",
    "research-plakat-democrates": "RESEARCH_democrats_support_total",
    "research-democrats-lost-votes": "RESEARCH_DEMOCRATS_lost_votes",
    "research-winter-potential": "WINTER_COMPASS_potential",
    "hebrew-speaking-potential-democrats":
      "RESEARCH_DEMOCRATS_hebrew_new_supporters",
  },
  DisplayCompass: {
    "compass-inter-bloc-range": {
      potential: "RESEARCH_INTER_RANGE_inter_range_heb",
      potential_count: "RESEARCH_INTER_RANGE_inter_range_bloc",
      support: "RESEARCH_INTER_RANGE_support_liberal_heb",
    },
    "compass-inter-bloc-range-shita": {
      potential: "RESEARCH_INTER_RANGE_inter_range_heb",
      potential_count: "RESEARCH_INTER_RANGE_inter_range_bloc",
      support: "RESEARCH_INTER_RANGE_support_liberal_heb",
    },
    "compass-yashar": {
      potential: "YASHAR_COMPASS_V2_support_gadi_heb",
      potential_count: "YASHAR_COMPASS_V2_potential",
      support: "YASHAR_COMPASS_V2_support_liberal_heb",
    },
    "compass-yashar-municipal": {
      potential: "MUNICIPAL_YASHAR_COMPASS_V2_support_gadi_heb",
      potential_count: "MUNICIPAL_YASHAR_COMPASS_V2_potential",
      support: "MUNICIPAL_YASHAR_COMPASS_V2_support_liberal_heb",
    },
    "compass-bennet": {
      potential: "BENNET_COMPASS_support_bennet_heb",
      potential_count: "BENNET_COMPASS_potential",
      support: "BENNET_COMPASS_support_liberal_heb",
    },
    "research-arab-democrats": {
      potential: "ARABS_DEMOCRATS_potential_bin",
      potential_count: "ARABS_DEMOCRATS_weighted_voter_potential",
    },
  },
  DisplayPotential: {
    ...prefixMap("hebrew-speaking-battleground-democrats", {
      volume: "RESEARCH_DEMOCRATS_hebrew_bucket_volume",
      leaning: "RESEARCH_DEMOCRATS_hebrew_bucket_leaning",
    }),
    "merkazim-beer-sheva-liberal-potential-priority": {
      volume: "RESEARCH_MERKAZIM_bucket",
      description: "GEN_neighborhoods_2022",
    },
  },
  DisplayGeneric: {
    "research-arabs-gotv-potential": [
      {
        label: "compass-potential",
        values: {
          potential: "ARABS_GOTV_gotv_potential_bin",
          potential_count: "ARABS_GOTV_gotv_count",
        },
      },
      {
        label: "zone-characterization",
        values: { value: "ARABS_GOTV_voting_likelihood" },
      },
    ],
  },
  DisplayLegendBreakpoints: {
    /*
  add breakpoints for tooltip chart
  */
    "research-right-persuasion": [0.025, 0.07, 0.12, 0.3, 1.0001],
    "research-new-russians": [0.1, 0.2, 0.3, 0.4, 1],
    "research-yeshatid-defense-iron": [0.4, 0.5, 0.7, 0.9, 1.01],
    "research-yeshatid-defense-anti-ganz": [0.4, 0.5, 0.7, 0.9, 1.01],
    "research-yeshatid-defense-crispy": [0.4, 0.5, 0.7, 0.9, 1.01],
    "research-tactical-liberals": [0.4, 0.5, 0.7, 0.9, 1.01],
    "plakat-voters": [1000, 2000, 3000, 4000, 18646],
    "research-tikva-kulanu-prexit": [2.856, 3.5, 4.2, 4.6, 5.6],
    "research-kulanu-prexit": [0.2, 0.4, 0.6, 0.8, 1.0001],
    "research-tikva-prexit": [0.0482, 0.13, 0.21, 0.425, 1.01],
    "research-geo-datlash": [31, 61, 87, 112, 162],
    "voter-file-1": [0.2, 0.4, 0.6, 0.8, 1.0001],
    "research-moderate-religious": [0.15, 0.2, 0.3, 0.6, 1.0001],
    "research-convincible-sausages": [0.06, 0.15, 0.3, 0.5, 1.0001],
    "research-sausages-not-voting": [0.08, 0.15, 0.3, 0.45, 1.0001],
    "research-eisenkot-potential": [0.66, 0.8, 0.85, 0.89, 1.0001],
    "research-geo-datlash-religious": [0.48, 0.61, 0.74, 0.86, 1.0001],
    "research-geo-datlash-traditional": [0.48, 0.61, 0.74, 0.86, 1.0001],
    "research-trend-in-liberal-support": [0.397, 0.482, 0.567, 0.651, 1.0001],
    "research-gotv-potential": [0.007, 0.04, 0.1, 0.25, 1.0001],
    "research-gotv-potential-three": [0.063, 0.219, 1.0001],
    "merkazim-beer-sheva-liberal-potential-priority": [
      0.5, 0.6, 0.75, 0.82, 1.0001,
    ],
    "research-linear-example": [0.66, 0.8, 0.85, 0.89, 1.0001],
  },
};

/*
  ADD BIVECTOR LAYER HERE
*/
export const MAP_LAYER_BIVECTOR_OPACITY_TYPE = [
  "research-yeshatid-battleground",
  "research-russian-centers",
  ...prefixArray("hebrew-speaking-battleground-democrats"),
  "research-bivector-example",
];

export const MAP_LAYER_FIELD_FILTER: BasicObject = {
  "research-yeshatid-battleground": "yeshatid",
  "research-russian-centers": "russian",
  "compass-yashar": "compass",
  "compass-yashar-municipal": "compass",
  "compass-bennet": "compass",
  ...prefixMap("hebrew-speaking-battleground-democrats", "democrats"),
  "research-bivector-example": "example",
};

export const IMAGES_PATTERNS_DIR = "/images/patterns/";

export const partySectors = {
  conservative: ["מחל", "ט", "ב"],
  orthodox: ["שס", "ג"],
  liberal: ["פה", "כן", "ל", "אמת", "מרצ"],
  arab: ["עם", "ום", "ד"],
};

export const partyColors: BasicObject = {
  מחל: "#1F5AA5",
  ט: "#083D7B",
  ב: "#8dc63f",
  אמת: "#EE161F",
  מרצ: "#44B851",
  פה: "#EDA748",
  כן: "#00bbe0",
  ל: "#99C3E1",
  שס: "#000",
  ג: "#553485",
  ום: "#C9242C",
  עם: "#297C32",
  ד: "#F3651D",
  else: "#A3A3A3",
  none: "transparent",
};

export const knesset25DataPrefix = "KNESSET_25_";

export const knesset25Coalition = ["מחל", "ט", "שס", "ג", "ב"];

export const knesset25DidNotPassThreshold = ["ד", "מרצ", "ב"];

export const knesset25GroupOrder = [
  "conservative",
  "orthodox",
  "liberal",
  "arab",
  "else",
];

export const knesset25CoalitionGroups = ["conservative", "orthodox"];

export const NEW_STATZONE_BOOL_FIELD = "NEW_STATZONE_bool";

export const NEW_STATZONE_POLITICAL_DISTRIBUTION = [
  {
    key: "coalition",
    field: "NEW_STATZONES_KNESSET_25_coalition_pcnt",
    color: "#F44A55",
    translationKey: "sectionA",
  },
  {
    key: "opposition",
    field: "NEW_STATZONES_KNESSET_25_opposition_pcnt",
    color: "#417AAB",
    translationKey: "sectionB",
  },
];

export const ageGroups = [
  "0-9",
  "10-19",
  "20-29",
  "30-39",
  "40-49",
  "50-59",
  "60-69",
  "70-79",
  "over80",
];

export const ageColors = [
  "#01D501",
  "#00A400",
  "#E56B00",
  "#BE000B",
  "#7E0303",
  "#8648BE",
  "#CD47CF",
  "#E377C2",
  "#7F7F7F",
];

export const GenDataKeys = {
  cityCode: "GEN_city_code",
  cityMunicipality: "GEN_city_municipality_2022",
  cityMunicipalityCityType: "עירייה",
  cityMunicipalityLocalCouncilType: "מועצה מקומית",
};

export const ageGroupsDataKey = [
  "DEMO_pop_0-9_pcnt_2022",
  "DEMO_pop_10-19_pcnt_2022",
  "DEMO_pop_20-29_pcnt_2022",
  "DEMO_pop_30-39_pcnt_2022",
  "DEMO_pop_40-49_pcnt_2022",
  "DEMO_pop_50-59_pcnt_2022",
  "DEMO_pop_60-69_pcnt_2022",
  "DEMO_pop_70-79_pcnt_2022",
  "DEMO_pop_over80_pcnt_2022",
];

/*

@@@ HERE!

*/

export const ageGroupsDataKeyMunicipal = [
  "DEMO_pop_city_0-9_pcnt_2022",
  "DEMO_pop_city_10-19_pcnt_2022",
  "DEMO_pop_city_20-29_pcnt_2022",
  "DEMO_pop_city_30-39_pcnt_2022",
  "DEMO_pop_city_40-49_pcnt_2022",
  "DEMO_pop_city_50-59_pcnt_2022",
  "DEMO_pop_city_60-69_pcnt_2022",
  "DEMO_pop_city_70-79_pcnt_2022",
  "DEMO_pop_city_over80_pcnt_2022",
];

export const countryAgeDistribution = {
  "DEMO_pop_0-9_pcnt_2022": 0.188508966153371,
  "DEMO_pop_10-19_pcnt_2022": 0.166373533726635,
  "DEMO_pop_20-29_pcnt_2022": 0.139362174999113,
  "DEMO_pop_30-39_pcnt_2022": 0.127801022974138,
  "DEMO_pop_40-49_pcnt_2022": 0.118079325362955,
  "DEMO_pop_50-59_pcnt_2022": 0.094050284750757,
  "DEMO_pop_60-69_pcnt_2022": 0.0785318380353554,
  "DEMO_pop_70-79_pcnt_2022": 0.0580340615746122,
  DEMO_pop_over80_pcnt_2022: 0.029258792423063,
};

export const countryDemographicsData = {
  DEMO_pop_growth_pcnt_2022: 0.101,
  DEMO_pop_average_children_per_woman_2022: 3,
};

export const countrySocioeconomicMinMax = {
  ECO_income_avg_income_PP_2019: [1118.12586137711, 17024.1602426956],
  ECO_income_income_twice_avg_pcnt_2019: [
    0.0053047742355682, 0.425636571827356,
  ],
  ECO_income_bellow_minimum_wage_pcnt_2019: [
    0.206965729948574, 0.774034835230126,
  ],
  ECO_QOL_average_num_days_abroad_2019: [0.91813700427776, 34.5310865951716],
  EDU_schoolyrs_average_2019: [7.24418232447561, 16.0623765180441],
  EDU_academic_degree_pcnt_2022: [0.0, 0.99],
  EDU_yeshiva_M_pcnt_2022: [0.0, 0.983],
  EDU_highschool_diploma_pcnt_2022: [0.0, 0.727],
  ECO_housing_rentals_pcnt_2022: [0.0, 0.956],
  ECO_housing_available_houses_2021: [6.0, 9693.0],
  ECO_housing_available_houses_PP_2022: [0.006361429647610279, 1.96],
  CRIME_average_num_cases_PP_2022: [7.375991148810622e-6, 10.27567567567568],
};

export const demographicColorKeys = {
  ageColors: [
    "#01D501",
    "#00A400",
    "#E56B00",
    "#BE000B",
    "#7E0303",
    "#8648BE",
    "#CD47CF",
    "#E377C2",
    "#7F7F7F",
  ],
  ethnicityColors: ["#2892FF", "#E56B00"],
  alyiaColors: ["#E377C2", "#7E0303", "#00A400"],
};

export const socioClusterVariables = {
  xAxis: "ECO_cluster_2019",
  yAxis: "DEMO_pop_total_2024",
  selectedGroup: "GEN_city_name",
  selectedDistinguisher: "YISHUV_STAT_2022",
};

export const socioCollapseElements = {
  // employment: [
  //   "ECO_income_avg_income_PP_2019",
  //   "ECO_income_income_twice_avg_pcnt_2019",
  //   "ECO_income_bellow_minimum_wage_pcnt_2019",
  //   "ECO_QOL_average_num_days_abroad_2019",
  // ],
  education: [
    "EDU_academic_degree_pcnt_2022",
    //"EDU_schoolyrs_average_2019",
    //"EDU_yeshiva_M_pcnt_2022",
    //"EDU_highschool_diploma_pcnt_2022",
  ],
  housing: [
    "ECO_housing_rentals_pcnt_2022",
    "ECO_housing_available_houses_2021",
    "ECO_housing_available_houses_PP_2022",
  ],
  crime: ["CRIME_average_num_cases_PP_2022"],
};

export const socioElementsDisplay = {
  ils: ["ECO_income_avg_income_PP_2019"],
  percentage: [
    "ECO_income_income_twice_avg_pcnt_2019",
    "ECO_income_bellow_minimum_wage_pcnt_2019",
    "EDU_academic_degree_pcnt_2022",
    "EDU_yeshiva_M_pcnt_2022",
    "EDU_highschool_diploma_pcnt_2022",
    "ECO_housing_rentals_pcnt_2022",
  ],
  perYear: ["ECO_QOL_average_num_days_abroad_2019"],
  crime: ["CRIME_average_num_cases_PP_2022"],
  years: ["EDU_schoolyrs_average_2019"],
};

export const socioElementExtraText = {
  noData: "noData",
  perYear: "perYear",
  years: "years",
};

export const filterListConstants = {
  headers: ["א״ס", "עיר", "אוכלוסייה", "תמיכה", "מיקום"],
  fileName: "רשימת-אסים",
};

export const LayerFilterList: BasicObject = {
  gen: {
    researchValue: "faction.PLAKAT_Liberal_support",
    displayValue: "gen.KNESSET_25_rtv",
    displayFormat: "fraction",
    columnTitle: "support",
  },
  "research-yeshatid-defense-iron": {
    researchValue: "RESEARCH_YESHATID_DEFENSE_iron_voters",
    displayValue: "RESEARCH_YESHATID_DEFENSE_iron_voters_count",
    columnTitle: "research",
  },
  "research-yeshatid-defense-anti-ganz": {
    researchValue: "RESEARCH_YESHATID_DEFENSE_anti_gantz_voters",
    displayValue: "RESEARCH_YESHATID_DEFENSE_anti_gantz_voters_count",
    columnTitle: "research",
  },
  "research-yeshatid-defense-crispy": {
    researchValue: "RESEARCH_YESHATID_DEFENSE_crispy_voters",
    displayValue: "RESEARCH_YESHATID_DEFENSE_crispy_voters_count",
    columnTitle: "research",
  },
  "research-tactical-liberals": {
    researchValue: "RESEARCH_YESHATID_DEFENSE_crispy_voters",
    displayValue: "RESEARCH_YESHATID_DEFENSE_crispy_voters_count",
    columnTitle: "research",
  },
};

export const campaignPlannerDataKeys = ["KNESSET_25_rtv", "PLAKAT_Turnout"];

const yeshatdidDefenseValueKeys = [
  "RESEARCH_YESHATID_DEFENSE_iron_voters_count",
  "RESEARCH_YESHATID_DEFENSE_anti_gantz_voters_count",
  "RESEARCH_YESHATID_DEFENSE_crispy_voters_count",
];
const yeshatdidDefenseCityValueKeys = [
  "RESEARCH_YESHATID_DEFENSE_city_iron_voters_count",
  "RESEARCH_YESHATID_DEFENSE_city_anti_gantz_voters_count",
  "RESEARCH_YESHATID_DEFENSE_city_crispy_voters_count",
];
const yeshatdidDefenseColorKeys = [
  "#8ac026",
  "rgb(254, 165, 0)",
  "rgb(252, 34, 103)",
];

const arabDemocratsPartyValueKeys = [
  "ARABS_DEMOCRATS_balad_support_pcnt",
  "ARABS_DEMOCRATS_raam_support_pcnt",
  "ARABS_DEMOCRATS_hadash_support_pcnt",
  "ARABS_DEMOCRATS_liberal_zionists_support_pcnt",
  "ARABS_DEMOCRATS_non_voters_pcnt",
];
const arabDemocratsPartyColorKeys = [
  "#F90",
  "#007A29",
  "#E93B0F",
  "#2892FF",
  "#A6A4A4",
];
