import { MAP_LEGEND_COUNT_DISPLAY_VOTERS } from "@/constants/constants";
import { BasicObject, LegendKeys, StatisticalData } from "@/types";
import { fractionToPercentageIfNeeded } from "@/lib/utils";

const getLayerAnomaly = (
  LayersWithAnomaly: BasicObject,
  layerId: string,
  properties: BasicObject,
  FieldsWithReverseAnomaly: string[],
) => {
  let anomaly: BasicObject = {};
  const anomalyData = LayersWithAnomaly[layerId];
  if (anomalyData) {
    Object.keys(anomalyData).forEach((key) => {
      const { property, breakpoints } = anomalyData[key];
      const value = properties[property];
      if (FieldsWithReverseAnomaly.includes(key)) {
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
  value: string | number,
  textObject: any,
  layerId: string,
  LayersWithFemaleName: string[],
  legendKeys?: LegendKeys | BasicObject,
  legendKeysAnomaly?: any,
  displayCount?: BasicObject,
  DisplayScore?: BasicObject,
  DisplayCompass?: BasicObject,
  DisplayPotential?: BasicObject,
  DisplayGeneric?: BasicObject,
  displayLegendBreakpoints?: BasicObject,
) => {
  const blockLength = 20;
  let cleanValue = value;
  if (layerId === "research-kulanu-prexit" && !value) {
    cleanValue = 0;
  }

  const generateLegendData = () => {
    let location = 0;
    let text = "";
    if (DisplayPotential && DisplayPotential[layerId]) {
      const volumeKey = DisplayPotential[layerId].volume;
      const leaningKey = DisplayPotential[layerId].leaning;
      const descriptionKey = DisplayPotential[layerId].description;

      const relevant = volumeKey !== undefined && properties[volumeKey] !== undefined

      if (
        relevant
        && descriptionKey !== undefined
        && properties[descriptionKey] !== undefined
      ) {
        const description = properties[descriptionKey];
        const descriptionLabel = textObject(descriptionKey);
        text = `${descriptionLabel}${description}\n`;
      }

      if (relevant) {
        const volumeText = textObject(
          `score-buckets.${properties[volumeKey]}`,
        );
        text += `${textObject("potential")} ${volumeText}`
      }

      if (
        relevant
        && leaningKey !== undefined
        && properties[leaningKey] !== undefined
      ) {
        const leaning = properties[leaningKey];
        const leaningText = textObject(`score-buckets.${leaning}`);
        const leaningPrefix = leaning === "No tendency" ? "" : `${textObject("leaning")} ל`;
        text += `, ${leaningPrefix}${leaningText}`;
      }
    } else if (DisplayCompass && DisplayCompass[layerId]) {
      const { potential, support, potential_count } = DisplayCompass[layerId];
      if (!(properties[potential] || properties[support])) {
        text = textObject("none", undefined, undefined, layerId);
      } else if (!properties[support]) {
        text = textObject("compass-potential", {
          potential: properties[potential] ?? "",
          potential_count: properties[potential_count] ?? "",
        });
      } else if (!properties[potential]) {
        text = textObject("compass-support", {
          support: properties[support] ?? "",
          potential_count: properties[potential_count] ?? "",
        });
      } else {
        text = textObject("compass", {
          potential: properties[potential] ?? "",
          support: properties[support] ?? "",
          potential_count: properties[potential_count] ?? "",
        });
      }
    } else if (DisplayGeneric && DisplayGeneric[layerId]) {
      const lines = DisplayGeneric[layerId] as any[];
      let isMissingProperty = false
      const proccessedLines = lines.map(
        (line: { label: string; values: Record<string, string>; }) => {
          return textObject(
            line.label,
            Object.fromEntries(
              Object.entries(line.values).map(
                ([key, value]) => {
                  const property = properties[value]
                  isMissingProperty =
                    property === undefined || property === null ? true : isMissingProperty
                  return [key, property]
                }
              )
            )
          )
        }
      )
      if (isMissingProperty) {
        text = textObject("none", undefined, undefined, layerId);
      } else {
        text = proccessedLines.join("\n")
      }
    } else if (typeof cleanValue === "number") {
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
        text =
          DisplayScore && DisplayScore[layerId]
            ? textObject(
                "score",
                {
                  value: textObject(
                    `score-buckets.${
                      properties[DisplayScore[layerId].bucket] ?? "Very Low"
                    }`,
                  ),
                  score:
                    fractionToPercentageIfNeeded(
                      properties[DisplayScore[layerId].score],
                    ) ?? 0,
                  subtitle:
                    fractionToPercentageIfNeeded(
                      properties[DisplayScore[layerId].subtitle],
                    ) ?? 0,
                },
                undefined,
                layerId,
              )
            : displayCount && displayCount[layerId]
              ? textObject(
                  MAP_LEGEND_COUNT_DISPLAY_VOTERS.includes(layerId)
                    ? "voters"
                    : "people",
                  { value: properties[displayCount[layerId]] ?? 0 },
                )
              : `${Math.round(cleanValue * 100)}% ${layerId === "research-plakat-democrates" ? textObject("support") : ""}`;
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
        ? textObject("none", undefined, undefined, layerId)
        : `${textObject("plakat-" + key + "-action")} ${
            key === "none"
              ? ""
              : index
                ? `${textObject(
                    LayersWithFemaleName.includes(key)
                      ? "high-female"
                      : "high-male",
                  )} ${textObject("much")}`
                : textObject(
                    LayersWithFemaleName.includes(key)
                      ? "high-female"
                      : "high-male",
                  )
          } 
        `;
    } else {
      text = textObject("none", undefined, undefined, layerId);
    }
    return {
      valueLocation: location,
      valueText: text,
    };
  };
  const { valueText } = generateLegendData();

  const headerString = `<div class="flex gap-2 text-lg p-1"><span class="font-bold">#${properties.id}</span><p>${properties.GEN_city_name}</p></div>`;

  const legendTextString = `<p class="text-lg w-max" style="white-space: pre-line;">${valueText}</p>`;
  const legendString = `<div class="flex items-center justify-start gap-2 w-full flex-wrap px-2">${legendTextString}</div>`;

  const popupHtmlString = `<div class="flex flex-col items-center">${headerString}${legendString}</div>`;
  return popupHtmlString;
};

const getNewPopupHtmlString = (
  legend: { [key: string]: string[] | any },
  properties: StatisticalData,
  layerId: string,
  constants: BasicObject,
  textObject: any,
) => {
  const {
    LayersColoringDataKeys,
    LayersWithLegendKeys,
    LayersWithAnomaly,
    LayersWithFemaleName,
    FieldsWithReverseAnomaly,
    MapFilterFieldKey,
    DisplayCount,
    DisplayScore,
    DisplayCompass,
    DisplayPotential,
    DisplayGeneric,
    DisplayLegendBreakpoints,
  } = constants;

  const layerMainProperty = properties[LayersColoringDataKeys[layerId]];
  return generatePopupHtml(
    properties,
    layerMainProperty,
    textObject,
    layerId,
    LayersWithFemaleName,
    LayersWithLegendKeys[layerId],
    getLayerAnomaly(
      LayersWithAnomaly,
      layerId,
      properties,
      FieldsWithReverseAnomaly,
    ),
    DisplayCount,
    DisplayScore,
    DisplayCompass,
    DisplayPotential,
    DisplayGeneric,
    DisplayLegendBreakpoints,
  );
};

export { getNewPopupHtmlString };
