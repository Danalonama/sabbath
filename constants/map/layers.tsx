const NO_VALUE_FILL_COLOR = "rgba(0, 0, 0, 0.12)";

const UNIVARIATE_COLORING_SCALES = {
  PINK: [
    "rgb(252, 213, 226)",
    "rgb(251, 186, 206)",
    "rgb(252, 151, 183)",
    "rgb(247, 89, 139)",
    "#e51f5e",
  ],
  BLUE: ["#cefaff", "#8fd4ea", "#54acda", "#2583c7", "#2358ad"],
  ORANGE: ["#fff5c6", "#fee28c", "#fdc458", "#f6870f", "#e64500"],
  GREEN: [
    "rgb(234, 244, 230)",
    "rgb(207, 239, 192)",
    "rgb(174, 227, 150)",
    "rgb(125, 210, 87)",
    "rgb(85, 187, 37)",
  ],
  BLUE_PURPLE: ["#d6ddf5", "#9eadea", "#8497e1", "#3f57cf", "#0617b2"],
  BRIGHT_TURQUOISE: ["#d1fff4", "#9ff2df", "#64dfc1", "#22bf99", "#0a8e81"],
  PURPLE: ["#ded7ef", "#c8b6f6", "#b095f3", "#8e69ec", "#5f2ae5"],
  TURQUOISE: ["#cce6e0", "#97cdc1", "#63b4a1", "#298771", "#01614b"],
  GOLD: ["#ebebc7", "#e6e0bc", "#dfcb72", "#caa812", "#967d17"],
};

const UNIVARIATE_DIVERGING_COLORING_SCALES = {
  RED_BLUE: [
    "rgb(169, 12, 57)",
    "rgb(240, 93, 80)",
    "rgb(206, 183, 225)",
    "rgb(103, 152, 193)",
    "rgb(46, 91, 135)",
  ],
};

const UNIVARIATE_THREE_COLORING_SCALES = {
  PINK: ["rgb(252, 213, 226)", "rgb(252, 151, 183)", "#e51f5e"],
  BLUE: ["#cefaff", "#54acda", "#2358ad"],
  ORANGE: ["#fff5c6", "#fdc458", "#e64500"],
  GREEN: ["rgb(234, 244, 230)", "rgb(174, 227, 150)", "rgb(85, 187, 37)"],
  BLUE_PURPLE: ["#d6ddf5", "#8497e1", "#0617b2"],
  BRIGHT_TURQUOISE: ["#d1fff4", "#64dfc1", "#0a8e81"],
  PURPLE: ["#ded7ef", "#b095f3", "#5f2ae5"],
  TURQUOISE: ["#cce6e0", "#63b4a1", "#01614b"],
  GOLD: ["#ebebc7", "#dfcb72", "#967d17"],
};

const BIVARIATE_COLORING_SCALES = {
  BLUE_GREEN_YELLOW: {
    base: "hsla(0, 90%, 98%, 0)",
    low: ["rgb(152, 231, 255)", "rgb(100, 255, 216)", "rgb(255, 212, 69)"],
    mid: ["rgb(48, 191, 255)", "rgb(36, 230, 180)", "rgb(255, 173, 20)"],
    high: ["#2892FF", "#1BC5A6", "#FF871E"],
  },
  BLUE_PURPLE_RED: {
    base: "#dfdfdd",
    low: ["rgb(216, 242, 254)", "#c4b3ea", "#edb5c1"],
    mid: ["rgb(92, 199, 245)", "rgb(145, 105, 241)", "#ec5f7e"],
    high: ["#0facf0", "#6223f6", "#fe1044"],
  },
};

const COMPASS_COLORING_SCALES = {
  BLUE_PURPLE_RED: {
    base: "#efefef",
    very_low: ["#EDEDEB", "#EDEDEB", "#EDEDEB"],
    low: ["#F2B7B8", "#E4D1DF", "#C3D2E1"],
    moderate: ["#EB8F90", "#C9A5BF", "#89A6C4"],
    high: ["#E15759", "#B07AA1", "#4E79A7"],
  },
};

const PLAKAT_COLORING_SCALES = {
  Core: "#449efd",
  Base: "#26d0ff",
  PersuationHighVote: "#e39fff",
  PersuationLowVote: "#efcafe",
  GOTV_lowturnout: "#4ed500",
  GOTV_highturnout: "#9fe89f",
  None: "#FF446C",
};

const UNIVARIATE_FILL_COLOR_RULE = `["case", ["has", "VARIABLE"], ["step", ["get", "VARIABLE"], "COLOR_0", BREAKPOINT_0, "COLOR_1", BREAKPOINT_1, "COLOR_2",BREAKPOINT_2, "COLOR_3", BREAKPOINT_3, "COLOR_4"], "${NO_VALUE_FILL_COLOR}"]`;

const BIVARIATE_FILL_COLOR_RULE = `["case", ["all", ["has", "VARIABLE_0"], ["has", "VARIABLE_1"]], ["step", ["get", "VARIABLE_0"], "COLOR_base", BREAKPOINT_0_0, ["step", ["get", "VARIABLE_1"], "COLOR_low_0", BREAKPOINT_1_0, "COLOR_low_1", BREAKPOINT_1_1, "COLOR_low_2"], BREAKPOINT_0_1, ["step", ["get", "VARIABLE_1"], "COLOR_mid_0", BREAKPOINT_1_0, "COLOR_mid_1", BREAKPOINT_1_1, "COLOR_mid_2"], BREAKPOINT_0_2, ["step", ["get", "VARIABLE_1"], "COLOR_high_0", BREAKPOINT_1_0, "COLOR_high_1", BREAKPOINT_1_1, "COLOR_high_2"]], "${NO_VALUE_FILL_COLOR}"]`;

const COMPASS_FILL_COLOR_RULE = `[
  "match",
  [
    "get",
    "VARIABLE_0"
  ],
  ["very low"],
  [
    "match",
    [
      "get",
      "VARIABLE_1"
    ],
    ["conservative"],
    "COLOR_very_low_0",
    ["mixed"],
    "COLOR_very_low_1",
    ["liberal"],
    "COLOR_very_low_2",
    "COLOR_base"
  ],
  ["low"],
  [
    "match",
    [
      "get",
      "VARIABLE_1"
    ],
    ["conservative"],
    "COLOR_low_0",
    ["mixed"],
    "COLOR_low_1",
    ["liberal"],
    "COLOR_low_2",
    "COLOR_base"
  ],
  ["moderate"],
  [
    "match",
    [
      "get",
      "VARIABLE_1"
    ],
    ["conservative"],
    "COLOR_moderate_0",
    ["mixed"],
    "COLOR_moderate_1",
    ["liberal"],
    "COLOR_moderate_2",
    "COLOR_base"
  ],
  ["high"],
  [
    "match",
    [
      "get",
      "VARIABLE_1"
    ],
    ["conservative"],
    "COLOR_high_0",
    ["mixed"],
    "COLOR_high_1",
    ["liberal"],
    "COLOR_high_2",
    "COLOR_base"
  ],
  "COLOR_base"
]`;

const PLAKAT_FILL_COLOR_RULE = `["case", ["has", "VARIABLE_0"], ["step", ["get", "PLAKAT_Turnout"], ["match", ["get", "VARIABLE_0"], ["Core"], "COLOR_Core", ["Base"], "COLOR_Base", ["PersuationHighVote"], "COLOR_PersuationHighVote", ["PersuationLowVote"], "COLOR_PersuationLowVote", ["GOTV"], "COLOR_GOTV_lowturnout", "COLOR_None"], 0.55, ["match", ["get", "VARIABLE_0"], ["Core"], "COLOR_Core", ["Base"], "COLOR_Base", ["PersuationHighVote"], "COLOR_PersuationHighVote", ["PersuationLowVote"], "COLOR_PersuationLowVote", ["GOTV"], "COLOR_GOTV_highturnout", "COLOR_None"]], "${NO_VALUE_FILL_COLOR}"]`;

export {
  UNIVARIATE_COLORING_SCALES,
  UNIVARIATE_THREE_COLORING_SCALES,
  UNIVARIATE_DIVERGING_COLORING_SCALES,
  BIVARIATE_COLORING_SCALES,
  COMPASS_COLORING_SCALES,
  PLAKAT_COLORING_SCALES,
  NO_VALUE_FILL_COLOR,
  UNIVARIATE_FILL_COLOR_RULE,
  BIVARIATE_FILL_COLOR_RULE,
  COMPASS_FILL_COLOR_RULE,
  PLAKAT_FILL_COLOR_RULE,
};
