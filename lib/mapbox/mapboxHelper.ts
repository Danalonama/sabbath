import {
  BIVARIATE_COLORING_SCALES,
  BIVARIATE_FILL_COLOR_RULE,
  COMPASS_COLORING_SCALES,
  COMPASS_FILL_COLOR_RULE,
  NO_VALUE_FILL_COLOR,
  PLAKAT_COLORING_SCALES,
  PLAKAT_FILL_COLOR_RULE,
  UNIVARIATE_COLORING_SCALES,
  UNIVARIATE_DIVERGING_COLORING_SCALES,
  UNIVARIATE_THREE_COLORING_SCALES,
} from "@/constants/map/layers";
import { BasicObject, LayerType } from "@/types";

type ColoringScaleKey =
  | keyof typeof UNIVARIATE_COLORING_SCALES
  | keyof typeof UNIVARIATE_THREE_COLORING_SCALES
  | keyof typeof UNIVARIATE_DIVERGING_COLORING_SCALES
  | keyof typeof BIVARIATE_COLORING_SCALES
  | keyof typeof COMPASS_COLORING_SCALES
  | keyof typeof PLAKAT_COLORING_SCALES;

interface FillColorRuleParams {
  layerType: LayerType;
  variable: string | string[];
  breakpoints: number[] | number[][];
  coloringScale: string[] | string | BasicObject;
}

function getUnivariateFillColorRule({
  variable,
  breakpoints,
  coloringScale,
}: Omit<FillColorRuleParams, "layerType">) {
  const field = Array.isArray(variable) ? variable[0] : variable;
  const colors = Array.isArray(coloringScale) ? coloringScale : [];
  const numericBreakpoints = breakpoints.filter(
    (breakpoint): breakpoint is number => typeof breakpoint === "number",
  );
  const stepExpression: any[] = ["step", ["get", field], colors[0]];

  numericBreakpoints.forEach((breakpoint, index) => {
    const color = colors[index + 1];
    if (color) {
      stepExpression.push(breakpoint, color);
    }
  });

  return ["case", ["has", field], stepExpression, NO_VALUE_FILL_COLOR];
}

function getFillColorRule({
  layerType,
  variable,
  breakpoints,
  coloringScale,
}: FillColorRuleParams): any {
  let ruleTemplate: string;
  let colors: any;
  switch (layerType) {
    case "univariate":
    case "univariate-three":
    case "univariate-diverging":
      return getUnivariateFillColorRule({
        variable,
        breakpoints,
        coloringScale,
      });
    case "bivariate":
      ruleTemplate = BIVARIATE_FILL_COLOR_RULE;
      colors = coloringScale;
      if (Array.isArray(variable)) {
        ruleTemplate = ruleTemplate.replace(/VARIABLE_0/g, variable[0]);
        ruleTemplate = ruleTemplate.replace(/VARIABLE_1/g, variable[1]);
      }
      if (Array.isArray(breakpoints[0])) {
        breakpoints.forEach((row: any, i) => {
          row.forEach((bp: number, j: number) => {
            ruleTemplate = ruleTemplate.replace(
              new RegExp(`BREAKPOINT_${i}_${j}`, "g"),
              bp.toString(),
            );
          });
        });
      }
      ruleTemplate = ruleTemplate.replace(/COLOR_base/g, colors.base);
      ["low", "mid", "high"].forEach((level) => {
        colors[level].forEach((c: string, i: number) => {
          ruleTemplate = ruleTemplate.replace(
            new RegExp(`COLOR_${level}_${i}`, "g"),
            c,
          );
        });
      });
      break;
    case "compass":
      ruleTemplate = COMPASS_FILL_COLOR_RULE;
      colors = coloringScale;
      if (Array.isArray(variable)) {
        ruleTemplate = ruleTemplate.replace(/VARIABLE_0/g, variable[0]);
        ruleTemplate = ruleTemplate.replace(/VARIABLE_1/g, variable[1]);
      }
      ruleTemplate = ruleTemplate.replace(/COLOR_base/g, colors.base);
      ["very_low", "low", "moderate", "high"].forEach((level) => {
        colors[level].forEach((c: string, i: number) => {
          ruleTemplate = ruleTemplate.replace(
            new RegExp(`COLOR_${level}_${i}`, "g"),
            c,
          );
        });
      });
      break;
    case "plakat":
      ruleTemplate = PLAKAT_FILL_COLOR_RULE;
      colors = PLAKAT_COLORING_SCALES;
      ruleTemplate = ruleTemplate.replace(
        /VARIABLE_0/g,
        Array.isArray(variable) ? variable[0] : (variable as string),
      );
      Object.keys(colors).forEach((key) => {
        ruleTemplate = ruleTemplate.replace(
          new RegExp(`COLOR_${key}`, "g"),
          colors[key],
        );
      });
      break;
    default:
      throw new Error("Unknown layer type");
  }
  return JSON.parse(ruleTemplate);
}

function getColoringScaleKey(layerType: LayerType, layerIndex: number): string {
  if (layerType === "univariate") {
    const keys = Object.keys(UNIVARIATE_COLORING_SCALES);
    return keys[layerIndex % keys.length];
  }
  if (layerType === "univariate-three") {
    const keys = Object.keys(UNIVARIATE_THREE_COLORING_SCALES);
    return keys[layerIndex % keys.length];
  }
  if (layerType === "univariate-diverging") {
    const keys = Object.keys(UNIVARIATE_DIVERGING_COLORING_SCALES);
    return keys[layerIndex % keys.length];
  }
  if (layerType === "bivariate") {
    const keys = Object.keys(BIVARIATE_COLORING_SCALES);
    return keys[layerIndex % keys.length];
  }
  if (layerType === "compass") {
    const keys = Object.keys(COMPASS_COLORING_SCALES);
    return keys[layerIndex % keys.length];
  }
  if (layerType === "plakat") {
    return "PLAKAT";
  }
  throw new Error("Unknown layer type");
}

function assignFillColorToLayer(layers: any) {
  let univariateIdx = 0;
  let univariateThreeIdx = 0;
  let divergingIdx = 0;
  let bivariateIdx = 0;
  let compassIdx = 0;

  return layers?.map((layer: any) => {
    const type = layer.type as LayerType;
    const forcedColor = (layer?.color_scheme as ColoringScaleKey) || undefined;
    let coloringScaleKey;
    let fillColor;
    let mainColors;
    let variables = layer.variables;

    if (typeof variables === "string" && variables.startsWith("[")) {
      try {
        variables = JSON.parse(variables);
      } catch (parseError) {
        console.error(
          "Failed to parse variables for layer",
          layer.name,
          parseError,
        );
      }
    }

    if (type === "univariate") {
      if (
        forcedColor &&
        UNIVARIATE_COLORING_SCALES[
          forcedColor as keyof typeof UNIVARIATE_COLORING_SCALES
        ]
      ) {
        coloringScaleKey = forcedColor;
      } else {
        coloringScaleKey = getColoringScaleKey("univariate", univariateIdx);
        univariateIdx++;
      }
      fillColor = getFillColorRule({
        layerType: "univariate",
        variable: variables,
        breakpoints: layer.breakpoints,
        coloringScale:
          UNIVARIATE_COLORING_SCALES[
            coloringScaleKey as keyof typeof UNIVARIATE_COLORING_SCALES
          ],
      });
      mainColors = UNIVARIATE_COLORING_SCALES[
        coloringScaleKey as keyof typeof UNIVARIATE_COLORING_SCALES
      ].slice(2, 5);
    } else if (type === "univariate-three") {
      if (
        forcedColor &&
        UNIVARIATE_THREE_COLORING_SCALES[
          forcedColor as keyof typeof UNIVARIATE_THREE_COLORING_SCALES
        ]
      ) {
        coloringScaleKey = forcedColor;
      } else {
        coloringScaleKey = getColoringScaleKey(
          "univariate-three",
          univariateThreeIdx,
        );
        univariateThreeIdx++;
      }
      fillColor = getFillColorRule({
        layerType: "univariate-three",
        variable: variables,
        breakpoints: layer.breakpoints,
        coloringScale:
          UNIVARIATE_THREE_COLORING_SCALES[
            coloringScaleKey as keyof typeof UNIVARIATE_THREE_COLORING_SCALES
          ],
      });
      mainColors =
        UNIVARIATE_THREE_COLORING_SCALES[
          coloringScaleKey as keyof typeof UNIVARIATE_THREE_COLORING_SCALES
        ];
    } else if (type === "univariate-diverging") {
      if (
        forcedColor &&
        UNIVARIATE_DIVERGING_COLORING_SCALES[
          forcedColor as keyof typeof UNIVARIATE_DIVERGING_COLORING_SCALES
        ]
      ) {
        coloringScaleKey = forcedColor;
      } else {
        coloringScaleKey = getColoringScaleKey(
          "univariate-diverging",
          divergingIdx,
        );
        divergingIdx++;
      }
      fillColor = getFillColorRule({
        layerType: "univariate-diverging",
        variable: variables,
        breakpoints: layer.breakpoints,
        coloringScale:
          UNIVARIATE_DIVERGING_COLORING_SCALES[
            coloringScaleKey as keyof typeof UNIVARIATE_DIVERGING_COLORING_SCALES
          ],
      });
      mainColors = UNIVARIATE_DIVERGING_COLORING_SCALES[
        coloringScaleKey as keyof typeof UNIVARIATE_DIVERGING_COLORING_SCALES
      ].slice(1, 4);
    } else if (type === "bivariate") {
      if (
        forcedColor &&
        BIVARIATE_COLORING_SCALES[
          forcedColor as keyof typeof BIVARIATE_COLORING_SCALES
        ]
      ) {
        coloringScaleKey = forcedColor;
      } else {
        coloringScaleKey = getColoringScaleKey("bivariate", bivariateIdx);
        bivariateIdx++;
      }
      fillColor = getFillColorRule({
        layerType: "bivariate",
        variable: variables,
        breakpoints: layer.breakpoints,
        coloringScale:
          BIVARIATE_COLORING_SCALES[
            coloringScaleKey as keyof typeof BIVARIATE_COLORING_SCALES
          ],
      });
      mainColors =
        BIVARIATE_COLORING_SCALES[
          coloringScaleKey as keyof typeof BIVARIATE_COLORING_SCALES
        ].high;
    } else if (type === "compass") {
      if (
        forcedColor &&
        COMPASS_COLORING_SCALES[
          forcedColor as keyof typeof COMPASS_COLORING_SCALES
        ]
      ) {
        coloringScaleKey = forcedColor;
      } else {
        coloringScaleKey = getColoringScaleKey("compass", compassIdx);
        compassIdx++;
      }
      fillColor = getFillColorRule({
        layerType: "compass",
        variable: variables,
        breakpoints: layer.breakpoints,
        coloringScale:
          COMPASS_COLORING_SCALES[
            coloringScaleKey as keyof typeof COMPASS_COLORING_SCALES
          ],
      });
      mainColors =
        COMPASS_COLORING_SCALES[
          coloringScaleKey as keyof typeof COMPASS_COLORING_SCALES
        ].high;
    } else if (type === "plakat") {
      coloringScaleKey = getColoringScaleKey("plakat", 0);
      fillColor = getFillColorRule({
        layerType: "plakat",
        variable: variables,
        breakpoints: layer.breakpoints,
        coloringScale: coloringScaleKey,
      });
      mainColors = [
        PLAKAT_COLORING_SCALES.Core,
        PLAKAT_COLORING_SCALES.PersuationHighVote,
        PLAKAT_COLORING_SCALES.GOTV_lowturnout,
      ];
    }
    return {
      ...layer,
      fillColor,
      coloringScaleKey,
      mainColors,
    };
  });
}

export { getFillColorRule, getColoringScaleKey, assignFillColorToLayer };
