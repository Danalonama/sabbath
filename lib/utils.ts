import {
  IMAGES_PATTERNS_DIR,
  MAP_FILTER_FIELD_KEY,
  MAP_FILTER_MATCH_EXTRA_FIELD,
  MAP_LAYER_BIVECTOR_OPACITY_TYPE,
  MAP_LAYER_FEMALE_NAME,
  MAP_REVERSE_ANOMALY,
} from "@/constants/constants";
import {
  BasicObject,
  ColorSchemes,
  FillPaint,
  Legend,
  LegendKeys,
  LegendStep,
  StatisticalData,
  SteppedLegend,
} from "@/types";
import type { Map, FillLayer } from "mapbox-gl";
import { useTranslations } from "next-intl";

const {
  parsePropertyExpression,
  runtime,
} = require("@mapbox/mapbox-gl-style-spec");

function getDirection(locale: string) {
  return locale === "he" || locale === "ar" ? "rtl" : "ltr";
}

function getDefaultNav(path: string): string {
  const parts = path.split("/");
  return parts[2] ? parts[2] : "home";
}

function rgbNormalizedToStandard(color: {
  r: number;
  g: number;
  b: number;
  a: number;
}) {
  const alpha = color.a ?? 1;
  return `rgb(${Math.round((alpha * color.r + 1 - alpha) * 255)}, ${Math.round(
    (alpha * color.g + 1 - alpha) * 255,
  )}, ${Math.round((alpha * color.b + 1 - alpha) * 255)})`;
}

function rgbaToRgb(color: string, factor = 1) {
  const rgbaMatch = color
    .replace(/^(rgb|rgba)\(/, "")
    .replace(/\)$/, "")
    .replace(/\s/g, "")
    .split(",");
  if (!rgbaMatch.length) {
    return "var(--color-neutral-00)";
  }
  const r = parseInt(rgbaMatch[0]);
  const g = parseInt(rgbaMatch[1]);
  const b = parseInt(rgbaMatch[2]);
  const aRaw = parseFloat(rgbaMatch[3]);
  const a = Number.isNaN(aRaw) ? 1 : aRaw;
  const newR = Math.round(((r / 255) * a + 1 - a) * factor * 255);
  const newG = Math.round(((g / 255) * a + 1 - a) * factor * 255);
  const newB = Math.round(((b / 255) * a + 1 - a) * factor * 255);
  return `rgb(${newR}, ${newG}, ${newB})`;
}

function opacityColor(color: string, opacity = 1) {
  const separatedColor = { r: 0, g: 0, b: 0 };
  if (/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(color)) {
    separatedColor.r = parseInt(color.substring(1, 3), 16);
    separatedColor.g = parseInt(color.substring(3, 5), 16);
    separatedColor.b = parseInt(color.substring(5, 7), 16);
  } else {
    const rgbMatch = color
      .replace(/^(rgb|rgba)\(/, "")
      .replace(/\)$/, "")
      .replace(/\s/g, "")
      .split(",");
    separatedColor.r = parseInt(rgbMatch[0]);
    separatedColor.g = parseInt(rgbMatch[1]);
    separatedColor.b = parseInt(rgbMatch[2]);
  }
  const newR = Math.round(
    ((separatedColor.r / 255) * opacity + 1 - opacity) * 255,
  );
  const newG = Math.round(
    ((separatedColor.g / 255) * opacity + 1 - opacity) * 255,
  );
  const newB = Math.round(
    ((separatedColor.b / 255) * opacity + 1 - opacity) * 255,
  );

  // Ensure the RGB values stay within the valid range (0-255)
  const clamp = (value: number) => Math.min(255, Math.max(0, value));

  return `rgb(${clamp(newR)}, ${clamp(newG)}, ${clamp(newB)})`;
}

function darkenColor(color: string, factor = 0.7) {
  // Parse the RGB values from the input string
  const separatedColor = { r: 0, g: 0, b: 0 };
  if (/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(color)) {
    separatedColor.r = parseInt(color.substring(1, 3), 16);
    separatedColor.g = parseInt(color.substring(3, 5), 16);
    separatedColor.b = parseInt(color.substring(5, 7), 16);
  } else {
    const rgbMatch = color
      .replace(/^(rgb|rgba)\(/, "")
      .replace(/\)$/, "")
      .replace(/\s/g, "")
      .split(",");
    separatedColor.r = parseInt(rgbMatch[0]);
    separatedColor.g = parseInt(rgbMatch[1]);
    separatedColor.b = parseInt(rgbMatch[2]);
  }

  // Calculate the new RGB values by multiplying each component by the factor
  const newR = Math.floor(separatedColor.r * factor);
  const newG = Math.floor(separatedColor.g * factor);
  const newB = Math.floor(separatedColor.b * factor);

  // Ensure the RGB values stay within the valid range (0-255)
  const clamp = (value: number) => Math.min(255, Math.max(0, value));

  // Return the new darker color in the format "rgb(r, g, b)"
  return `rgb(${clamp(newR)}, ${clamp(newG)}, ${clamp(newB)})`;
}

function isColorTooLight(color: string) {
  const separatedColor = { r: 0, g: 0, b: 0 };
  if (/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(color)) {
    separatedColor.r = parseInt(color.substring(1, 3), 16);
    separatedColor.g = parseInt(color.substring(3, 5), 16);
    separatedColor.b = parseInt(color.substring(5, 7), 16);
  } else {
    const rgbMatch = color
      .replace(/^(rgb|rgba)\(/, "")
      .replace(/\)$/, "")
      .replace(/\s/g, "")
      .split(",");
    separatedColor.r = parseInt(rgbMatch[0]);
    separatedColor.g = parseInt(rgbMatch[1]);
    separatedColor.b = parseInt(rgbMatch[2]);
  }

  const { r, g, b } = separatedColor;

  const yiq = (r * 350 + g * 500 + b * 200) / 1000;
  return yiq >= 128; // Adjust this threshold as needed
}

function getPatternUrl(pattern: string, fileFormat = "svg") {
  return `url('${IMAGES_PATTERNS_DIR}${pattern}.${fileFormat}')`;
}

const getFillLayersFromSource = (
  map: Map,
  sourceId: string,
  type = "fill",
): FillLayer[] => {
  const fillLayers = <FillLayer[]>[];

  const layers = map.getStyle()?.layers;

  layers?.forEach((layer: any) => {
    if (layer.type === type && layer["source-layer"] === sourceId) {
      fillLayers.push(layer);
    }
  });

  return fillLayers;
};

const getColorSchemes = async (
  fillLayer: any,
  layerId: string,
  LegendKeys: any,
  layerPattern: string,
  customBivector: string[][],
  fullLayer?: BasicObject,
): Promise<any> => {
  let layer = [...fillLayer] as any;
  let colorSchemes: any = {};

  if (fullLayer?.type === "compass") {
    const compassSteps = [];
    const secondVariable = fullLayer.variables[1];
    for (const [i, entry] of fillLayer.entries()) {
      if (Array.isArray(entry) && entry.length === 1) {
        const formattedEntryStep = [];
        const step = fillLayer[i + 1];
        for (const [j, stepEntry] of step.entries()) {
          if (Array.isArray(stepEntry) && stepEntry.length === 1) {
            formattedEntryStep.push({
              value: stepEntry[0],
              color: fillLayer[i + 1][j + 1],
            });
          }
        }
        compassSteps.push({
          value: entry[0],
          steps: formattedEntryStep,
          field: secondVariable,
        });
      }
    }
    return {
      legend: { field: fullLayer.variables[0], steps: compassSteps },
      name: layerId,
      type: "compass",
    };
  }

  switch (layer[0]) {
    case "step":
      getStepScheme(
        colorSchemes,
        layer,
        layerId,
        LegendKeys,
        layerPattern,
        customBivector,
      );
      break;
    case "match":
      getMatchScheme(colorSchemes, layer, LegendKeys, layerPattern);
      break;
    case "case":
      //@ts-ignore
      layer[2][0] === "step" &&
        getStepScheme(
          colorSchemes,
          //@ts-ignore
          [...layer[2]],
          layerId,
          LegendKeys,
          layerPattern,
          customBivector,
        );
      break;
    default:
      break;
  }
  return Object.keys(colorSchemes).includes("first")
    ? colorSchemes.first
    : colorSchemes;
};

const getStepIteration = (layer: any, reverse = false) => {
  const legendObject: SteppedLegend = {
    [MAP_FILTER_FIELD_KEY]: layer[1][1],
    steps: [],
  };
  const relevantValues = [0, ...[...layer].splice(2), 1000000];
  relevantValues.forEach(
    (innerElement: string | number, innerIndex: number) => {
      typeof innerElement === "number" &&
        innerIndex !== relevantValues.length - 1 &&
        legendObject.steps.push({
          value: innerElement,
          color: relevantValues[innerIndex + 1],
          range: [innerElement, relevantValues[innerIndex + 2]],
        });
      if (reverse) {
        legendObject.steps.reverse();
      }
    },
  );
  return legendObject;
};

const getStepScheme = (
  colorSchemes: any,
  layer: any,
  layerId: string,
  matchKeys: any,
  layerPattern: string,
  customBivector: string[][],
) => {
  if (typeof layer[2] === "string") {
    if (MAP_LAYER_BIVECTOR_OPACITY_TYPE.includes(layerId)) {
      const legendObject: SteppedLegend = {
        [MAP_FILTER_FIELD_KEY]: layer[1][1],
        steps: [],
      };
      const relevantValues = [...[...layer].splice(3), 100];
      relevantValues.forEach((element: string | number, index: number) => {
        if (
          typeof element === "number" &&
          index !== relevantValues.length - 1
        ) {
          legendObject.steps.push({
            value: getStepIteration(relevantValues[index + 1]),
            range: [element, relevantValues[index + 2]],
          });
        }
      });
      colorSchemes.first = {
        type: "bivector",
        name: layerId,
        legend: legendObject,
      };
    } else {
      colorSchemes.first = {
        type: "step",
        name: layerId,
        legend: getStepIteration(layer),
      };
    }
  } else {
    const legendObject: {
      [MAP_FILTER_FIELD_KEY]: string;
      [key: string]: LegendStep[] | string;
    } = {
      field: layer[2][1][1],
    };
    const extraField = layer[1][1];
    const extraFieldStep = layer.find(
      (element: any) => typeof element === "number",
    );
    const matchArrays = layer.filter(
      (item: string | number | []) => Array.isArray(item) && item.length > 2,
    );
    matchArrays.forEach((matchArray: any) =>
      getMatchScheme(legendObject, [...matchArray], matchKeys, layerPattern, {
        [MAP_FILTER_FIELD_KEY]: extraField,
        step: extraFieldStep,
      }),
    );
    colorSchemes.first = {
      type: "bivector-custom",
      name: layerId,
      legend: legendObject,
      customLayout: customBivector,
      customKeysData: transformPlakatSentimentObject(legendObject),
    };
  }
};

const getMatchScheme = (
  colorSchemes: any,
  layer: any,
  matchKeys: LegendKeys,
  layerPattern: string,
  extraField?: any,
) => {
  let currentMatch = "";
  const layerLength = layer.length;
  for (const item of [...layer]) {
    if (Array.isArray(item)) {
      currentMatch = item[0];
    } else if (currentMatch) {
      const type = Object.keys(matchKeys).find((value: string) =>
        matchKeys[value].includes(currentMatch),
      );
      if (type) {
        if (!(type in colorSchemes)) {
          colorSchemes[type] = [];
        }
        const doesValueExists = colorSchemes[type].find(
          (cell: { value: string }) =>
            cell?.value === currentMatch ||
            cell?.value.split("&r")[0] === currentMatch,
        )
          ? true
          : false;
        const doesColorExists = colorSchemes[type].find(
          (cell: { color: string }) => cell?.color === item,
        )
          ? true
          : false;
        if (!doesValueExists) {
          const matchString = MAP_FILTER_MATCH_EXTRA_FIELD.includes(
            currentMatch,
          )
            ? `${currentMatch}&r${extraField.field}:0-${Math.round(
                extraField?.step * 100,
              )}`
            : currentMatch;
          colorSchemes[type].push({
            value: matchString,
            color: item,
          });
        }
        if (doesValueExists && !doesColorExists) {
          colorSchemes[type].push({
            value: `${currentMatch}&r${extraField.field}:${Math.round(
              extraField.step * 100,
            )}-100`,
            color: item,
          });
        }
      }
      currentMatch = "";
    }
  }
  if (
    typeof layer[layerLength - 1] === "string" &&
    typeof layer[layerLength - 2] === "string"
  )
    colorSchemes.none = [
      {
        value: "None",
        color: layer[layerLength - 1],
      },
    ];
};

const getFillLayerFromProperties = (
  fillLayer: any,
  selectedData: StatisticalData,
) => {
  let layer = [...fillLayer];
  let background: string | boolean = "";
  switch (layer[0]) {
    case "step":
      background = getStepValue(layer, selectedData);
      break;
    case "match":
      background = getMatchValue(layer, selectedData);
      break;
    case "case":
      background = getCaseValue(layer, selectedData);
      break;
    default:
      break;
  }
  return typeof background === "boolean"
    ? background.toString()
    : background.startsWith("rgba")
      ? rgbaToRgb(background)
      : background;
};

const getStepValue = (
  layer: any,
  selectedData: StatisticalData,
): string | boolean => {
  const stepData = selectedData[layer[1][1]];
  let currentValue: string | [] = "";
  let res: string | boolean = "";
  for (const step of layer.slice(2)) {
    if (typeof step === "number") {
      if (stepData < step) {
        res = stepValueTernaryExpression(currentValue, selectedData);
        break;
      }
    } else {
      currentValue = step;
    }
  }
  if (!res) res = stepValueTernaryExpression(currentValue, selectedData);
  return res;
};

const stepValueTernaryExpression = (
  currentValue: string | [],
  selectedData: StatisticalData,
): string | boolean => {
  return typeof currentValue === "string"
    ? currentValue
    : getMatchValue([...currentValue], selectedData);
};

const getMatchValue = (
  layer: any,
  selectedData: StatisticalData,
): string | boolean => {
  const matchData = selectedData[layer[1][1]];
  let currentValue: string[] = [""];
  let res = "";
  for (const step of layer.slice(2)) {
    if (Array.isArray(step)) {
      currentValue = step;
    } else {
      if (currentValue.includes(matchData)) {
        res = step;
        break;
      }
    }
  }
  if (res === "") res = layer[layer.length - 1];
  return res;
};

const getCaseValue = (layer: any, selectedData: StatisticalData) => {
  const type = layer[1][0];
  let bool = false;
  let res = "";
  switch (type) {
    case "match":
      bool = getMatchValue(layer[1], selectedData) as boolean;
      res = layer[bool ? 2 : 3];
      break;

    case "has":
      let has = getHasValue(layer[1][1], selectedData);
      res = has
        ? layer[2][0] === "step"
          ? getStepValue([...layer[2]], selectedData)
          : "var(--color-neutral-9)"
        : layer[3];
      break;
  }
  return res;
};

const getHasValue = (key: string, selectedData: StatisticalData) => {
  return selectedData[key] ? true : false;
};

const getPolygonSpecificColorScheme = (
  colorScheme: { [key: string]: string[] | any },
  propertyValue: string,
  legendKeys?: LegendKeys | BasicObject,
) => {
  const keys = Object.keys(colorScheme);
  if (!keys.length) {
    return [];
  }

  if (legendKeys) {
    const key =
      keys.find(
        (key) =>
          key !== MAP_FILTER_FIELD_KEY &&
          legendKeys[key] &&
          legendKeys[key].includes(propertyValue),
      ) || "";
    if (key)
      return [...colorScheme[key]].map((object: any) => object.color).reverse();
    else return colorScheme["none"].map((object: any) => object.color);
  }
  if (colorScheme?.steps[0]?.color) {
    const newColorscheme = Object.keys(colorScheme).includes(
      MAP_FILTER_FIELD_KEY,
    )
      ? colorScheme.steps.map((object: any) => object.color)
      : colorScheme.steps;
    return newColorscheme;
  } else {
    const step = colorScheme.steps?.find(
      (step: BasicObject) =>
        propertyValue >= step.range[0] && propertyValue < step.range[1],
    );
    return step?.value?.steps?.map((object: any) => object.color) || ["#000"];
  }
  return [];
};

const getLayerAnomaly = (
  LayersWithAnomaly: BasicObject,
  layerId: string,
  properties: BasicObject,
) => {
  let anomaly: BasicObject = {};
  const anomalyData = LayersWithAnomaly[layerId];
  if (anomalyData) {
    Object.keys(anomalyData).forEach((key) => {
      const { property, breakpoints } = anomalyData[key];
      const value = properties[property];
      if (MAP_REVERSE_ANOMALY.includes(key)) {
        const index = breakpoints.findIndex(
          (breakpoint: number) => value >= breakpoint,
        );
        anomaly[key] = index === -1 ? 1 : 0;
      } else {
        const index = breakpoints.findIndex(
          (breakpoint: number) => value < breakpoint,
        );
        anomaly[key] = index === -1 ? breakpoints.length : index;
      }
    });
  }
  return Object.keys(anomaly).length && anomaly;
};

const generatePopupHtml = (
  properties: any,
  colorScheme: string[],
  value: string | number,
  textObject: any,
  layerId: string,
  legendKeys?: LegendKeys | BasicObject,
  legendKeysAnomaly?: any,
) => {
  const blockLength = 20;

  const generateLegendData = () => {
    let location = 0;
    let text = "";
    if (typeof value === "number") {
      if (legendKeysAnomaly) {
        const index = legendKeysAnomaly[Object.keys(legendKeysAnomaly)[0]];
        location = blockLength / 3 + blockLength * index;
        text = `${
          index === 1
            ? textObject("not-leaning")
            : `${textObject("leaning")} ל${textObject(
                `${layerId}-leaning-${index ? "true" : "false"}`,
              )}`
        }`;
      } else {
        location = Math.round(colorScheme.length * blockLength * value);
        text = Math.round(value * 100) + "%";
      }
    } else if (legendKeys) {
      const key =
        Object.keys(legendKeys).find((key) =>
          legendKeys[key].includes(value + ""),
        ) || "";
      const index = Object.keys(legendKeysAnomaly).includes(key)
        ? legendKeysAnomaly[key]
        : key
          ? [...legendKeys[key]].reverse().indexOf(value + "")
          : 0;
      location = blockLength / 3 + blockLength * index;
      text = !key
        ? textObject("none")
        : `${textObject("plakat-" + key + "-action")} ${
            index
              ? `${textObject(
                  MAP_LAYER_FEMALE_NAME.includes(key)
                    ? "high-female"
                    : "high-male",
                )} ${textObject("much")}`
              : textObject(
                  MAP_LAYER_FEMALE_NAME.includes(key)
                    ? "high-female"
                    : "high-male",
                )
          } 
      `;
    } else {
      text = textObject("none");
    }
    if (colorScheme[0] === "#000") {
      location = blockLength / 3;
      text = textObject("none");
    }
    return {
      valueLocation: location,
      valueText: text,
    };
  };
  const { valueLocation, valueText } = generateLegendData();

  const headerString = `<div class="flex gap-2 text-xl p-1"><span class="font-bold">#${properties.id}</span><p>${properties.GEN_city_name}</p></div>`;
  const legendSchemeString = colorScheme
    .map(
      (color) =>
        `<div class="block h-2 " style="width:${blockLength}px;background:${color}" ></div>`,
    )
    .join("");
  const legendPointIndicatorString = `<div style="top:0;right:${valueLocation}px" class="absolute h-2.5 w-2.5" ><span class="h-2.5 w-2.5 border-2 border-white rounded-full bg-none flex justify-center items-center"><span style="width:2px;height:2px" class="block h-0.5 w-0.5 bg-white rounded-full"></span></span></div>`;
  const legendTextString = `<p class="text-sm w-max">${valueText}</p>`;
  const legendString = `<div class="flex items-center gap-2 w-min"><div class="flex h-max w-max p-px bg-black gap-x-px relative">${legendSchemeString}${legendPointIndicatorString}</div>${legendTextString}</div>`;

  const popupHtmlString = `<div class="flex flex-col items-center">${headerString}${legendString}</div>`;
  return popupHtmlString;
};

function isJsonString(str: string) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function getNeighborhood(neighborhoods: string, term: string) {
  return neighborhoods
    .split(", ")
    .find((neighborhood: string) =>
      neighborhood
        .replace(/(^[ '\^\$\*#&]+)|([ '\^\$\*#&]+$)/g, "")
        .startsWith(term),
    );
}

function displayNeighborhood(
  display: string,
  neighborhoods: string,
  term: string,
  code: string,
) {
  const neighborhood = getNeighborhood(neighborhoods, term);
  return `${neighborhood}, ${display}, ${code}`;
}

const waitForMapStopMoving = (map: any) => {
  return new Promise((resolve) => {
    const checkMapMoving = () => {
      if (!map.isMoving()) {
        clearInterval(interval); // Stop polling
        resolve(null); // Resolve the promise when map movement stops
      }
    };
    const interval = setInterval(checkMapMoving, 100); // Poll every 100 milliseconds
  });
};

const formatPercentage = (
  number: number,
  isPercentage = false,
  integer = false,
) => {
  let percentage = isPercentage ? number : Math.round(number * 100);
  if (isNaN(percentage)) percentage = 0;
  return `${
    percentage < 0 ? "−" : percentage === 0 || integer ? "" : "+"
  }${Math.abs(percentage).toFixed(integer ? 0 : 2)}%`;
};

const transformPlakatSentimentObject = (data: any) => {
  const newObject: BasicObject = {};
  for (const key in data) {
    if (key === "field") continue;
    data[key].forEach((item: BasicObject) => {
      newObject[item.value] = item; // Use 'value' as the key and store the entire item
    });
  }
  return newObject;
};

function capitalize(s: string) {
  return String(s[0]).toUpperCase() + String(s).slice(1);
}

function arrayMapObject(
  arr: BasicObject[],
  keyField: string,
  fn: (entry: BasicObject) => any,
) {
  let obj: BasicObject = {};
  arr.forEach((entry) => {
    obj[entry[keyField]] = fn(entry);
  });

  return obj;
}

function categorizeArrayOfObjects(
  data: BasicObject[],
  categoryField: string,
  reorderEntriesPriorityLegend?: { [key: string]: number },
) {
  if (!data) {
    return;
  }
  const formattedData: { [key: string]: BasicObject[] } = {};
  data.forEach((entry) => {
    if (!(entry[categoryField] in formattedData)) {
      formattedData[entry[categoryField]] = [];
    }
    formattedData[entry[categoryField]].push(entry);
  });

  if (reorderEntriesPriorityLegend) {
    for (const category of Object.keys(formattedData)) {
      const items = formattedData[category];

      // Separate into priority group and others
      const sorted = items.sort((a, b) => {
        const aRank = reorderEntriesPriorityLegend[a.icon] || 999;
        const bRank = reorderEntriesPriorityLegend[b.icon] || 999;
        // Preserve relative order of non-priority items
        if (aRank === bRank) return 0;
        return aRank - bRank;
      });

      formattedData[category] = sorted;
    }
  }

  return formattedData;
}

function graphqlEnumExtraction(data?: BasicObject, field?: string) {
  return !data
    ? []
    : data[field || ""]?.enumValues?.map(
        (enumValue: { name: string }) => enumValue.name,
      ) || [];
}

type Translator = ReturnType<typeof useTranslations>;
type TranslatorWithPrefix = Translator & {
  <TargetKey extends any>(
    key: TargetKey,
    values?: Parameters<Translator>[1],
    formats?: Parameters<Translator>[2],
    prefix?: string,
  ): string;
};

/**
 * returns a function which is equivalent to the result of
 * `useTranslations(namespace)` except that it accepts a `prefix`
 * argument. if a `prefix` is provided, the function will first
 * check whether a key of the form `${prefix}_${key}` exists and return
 * it's value if it does. otherwise it will return the value associated
 * with the original key.
 */
function useTranslationsWithFallback(namespace: string): TranslatorWithPrefix {
  const t = useTranslations(namespace);

  const getAvailableKey = (key: any, prefix?: string) =>
    prefix && t.has(`${prefix}_${key}`) ? `${prefix}_${key}` : key;

  return new Proxy(t, {
    apply(target, _this, args) {
      const [key, values, formats, prefix] = args;
      return target(getAvailableKey(key, prefix), values, formats);
    },

    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);

      if (typeof value !== "function") return value;

      return (...args: any[]) => {
        const [key, values, formats, prefix] = args;
        return value(getAvailableKey(key, prefix), values, formats);
      };
    },
  });
}

/**
 * returns a string representation of the input number in percentage form,
 * only if the number's absolute value is less than 1 and not equal to 0.
 * NOTE: not to be confused with `formatPercentage`
 */
function fractionToPercentageIfNeeded(
  num: number,
  positiveSign: boolean = true,
  roundTo: number = 2
) {
  if (Math.abs(num) >= 1 || num === 0) {
    return num;
  }

  const negative = num < 0;
  return `${(Math.abs(num * 100)).toFixed(roundTo).toString()}%${
    negative ? "-" : positiveSign ? "+" : ""
  }`;
}

export {
  getDirection,
  getDefaultNav,
  rgbNormalizedToStandard,
  opacityColor,
  darkenColor,
  getPatternUrl,
  getFillLayersFromSource,
  getColorSchemes,
  getFillLayerFromProperties,
  getPolygonSpecificColorScheme,
  generatePopupHtml,
  getLayerAnomaly,
  isJsonString,
  getNeighborhood,
  displayNeighborhood,
  waitForMapStopMoving,
  formatPercentage,
  isColorTooLight,
  rgbaToRgb,
  capitalize,
  arrayMapObject,
  categorizeArrayOfObjects,
  graphqlEnumExtraction,
  useTranslationsWithFallback,
  fractionToPercentageIfNeeded,
};
