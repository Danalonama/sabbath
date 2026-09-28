import { MAPBOX_LAYER_DEFAULT_FILTER } from "@/constants/constants";
import { BasicObject, FilterObject } from "@/types";
import { ExpressionSpecification } from "mapbox-gl";

const andIndicator = "&";
const fieldValueSeparatorIndicator = ":";
const rangeSeparatorIndicator = "-";

export const getFilterRule = (
  filters: BasicObject,
  negateFilters?: string[],
  baseFilter: ExpressionSpecification = MAPBOX_LAYER_DEFAULT_FILTER,
): any => {
  return !Object.keys(filters).length
    ? baseFilter
    : [
        "all",
        baseFilter,
        [
          "all",
          ...Object.keys(filters).map((filter) => {
            const negate = negateFilters?.includes(filter);
            return [
              negate ? "all" : "any",
              ...filters[filter].map((subFilter: FilterObject) => {
                let innerFilterRule = [];
                switch (subFilter.type) {
                  case "step":
                    innerFilterRule = multipleRangesFilterRule(
                      subFilter.field as string,
                      subFilter.values as number[][],
                    );
                    break;
                  case "step-matrix":
                    innerFilterRule = rangeMatrixFilterRule(
                      subFilter.field as any,
                      subFilter.values as any,
                    );
                    break;
                  case "compass":
                    innerFilterRule = compassFilterRule(
                      subFilter.field as any,
                      subFilter.values as any,
                    );
                    break;
                  case "match":
                    innerFilterRule = matchFilterRule(
                      subFilter.field as string,
                      subFilter.values as string[],
                    );
                    break;
                }
                return negate ? ["!", innerFilterRule] : innerFilterRule;
              }),
            ];
          }),
        ],
      ];
};

const compassFilterRule = (fields: string[], values: string[][]) => {
  return [
    "any",
    ...values.map((value) => [
      "all",
      ...value.map((innerValue, index) => [
        "match",
        ["get", fields[index]],
        [innerValue],
        true,
        false,
      ]),
    ]),
  ];
};

const rangeMatrixFilterRule = (fields: string[], ranges: number[][][]) => {
  return [
    "any",
    ...ranges.map((range) => [
      "all",
      ...range.map((innerRange, index) =>
        rangeFilterRule(fields[index], innerRange),
      ),
    ]),
  ];
};

const multipleRangesFilterRule = (field: string, ranges: number[][]) => {
  return ["any", ...ranges.map((range) => rangeFilterRule(field, range))];
};

const rangeFilterRule = (field: string, range: number[]) => {
  return [
    "all",
    [">=", ["get", field], range[0]],
    ["<", ["get", field], range[1]],
  ];
};

const matchFilterRule = (field: string, value: string[], negate = false) => {
  let mainValues = value;
  let secondaryRule = undefined;
  if (value.some((value) => value.includes(andIndicator))) {
    mainValues = value.filter((value) => !value.includes(andIndicator));
    const complexValues = value.filter((value) => value.includes(andIndicator));
    const secondaryFilterRuleList = complexValues.map((value) => {
      const separatedValues = value.split(andIndicator);
      if (separatedValues[1].startsWith("r")) {
        const secondFiledValuePair = separatedValues[1].substring(1);
        const [secondField, secondValueString] = secondFiledValuePair.split(
          fieldValueSeparatorIndicator,
        );
        const range = secondValueString
          .split(rangeSeparatorIndicator)
          .map((value: string) => parseFloat(value) / 100);
        const rangeRule = rangeFilterRule(secondField, range);
        return [
          "all",
          ["match", ["get", field], [separatedValues[0]], true, false],
          rangeRule,
        ];
      }
    });
    secondaryRule = ["any", ...secondaryFilterRuleList];
  }
  let matchRule: any[] = [
    "match",
    ["get", field],
    Array.isArray(value) ? value : [value],
    true,
    false,
  ];
  if (secondaryRule) {
    matchRule = ["any", matchRule, secondaryRule];
  }

  return matchRule;
};
