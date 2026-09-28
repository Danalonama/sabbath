import { BasicObject } from "@/types";

function calculateAverage(
  data: BasicObject[],
  key: string,
  group?: string,
  groupKey?: string
) {
  if ((group && !groupKey) || (groupKey && !group)) {
    return 0;
  }
  const validData = data.filter(
    (item) =>
      item[key] !== undefined &&
      typeof item[key] === "number" &&
      (groupKey && group ? item[groupKey] === group : true)
  );

  // Calculate the sum of the values
  const sum = validData.reduce((acc, obj) => acc + obj[key], 0);

  // Calculate the average
  const average = validData.length > 0 ? sum / validData.length : 0;

  return average.toFixed(2).replace(/\.00$/, "");
}

export { calculateAverage };
