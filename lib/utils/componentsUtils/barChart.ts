interface DataItem {
  group: string;
  start: number;
  end: number;
  value: number;
}

const formatData = (
  data: any,
  dataKeys: string[],
  fieldStart: string = "DEMO_pop_",
  gap: number = 0.003,
  firstWordGroupLabels: boolean = true,
) => {
  const total = dataKeys.reduce((sum, key) => sum + data[key], 0);

  const formattedData = dataKeys.map((key, index) => {
    const start =
      dataKeys.slice(0, index).reduce((sum, k) => sum + data[k] / total, 0) +
      gap;

    const end = start + data[key] / total - gap;

    return {
      group: firstWordGroupLabels ? key.replace(fieldStart, "").split("_")[0] : key,
      start,
      end,
      value: data[key] / total,
    };
  });
  return formattedData;
};

const calculatePointLocation = (
  data: DataItem[],
  point: number,
  scaleX: any,
  iconSize: number
): number => {
  const medianAgeBar = data.find(
    (d) =>
      point >= Number(d.group.split("-")[0]) &&
      point <= Number(d.group.split("-")[1])
  );

  if (medianAgeBar) {
    const ageGroupWidth = scaleX(medianAgeBar.end) - scaleX(medianAgeBar.start);
    const medianAgePosition =
      (point - Number(medianAgeBar.group.split("-")[0])) /
      (Number(medianAgeBar.group.split("-")[1]) -
        Number(medianAgeBar.group.split("-")[0]));
    return (
      scaleX(medianAgeBar.start) +
      ageGroupWidth * medianAgePosition -
      iconSize / 2
    );
  }

  return 0;
};

function findAgeGroup(ageGroups: string[], number: number): string {
  for (const group of ageGroups) {
    const [start, end] = group.split("-");
    if (end === undefined) {
      if (group.startsWith("over")) {
        const overAge = parseInt(group.replace("over", ""), 10);
        if (number > overAge) {
          return group;
        }
      }
    } else {
      const startNum = parseInt(start, 10);
      const endNum = parseInt(end, 10);
      if (number >= startNum && number <= endNum) {
        return group;
      }
    }
  }
  return "Not found"; // Optional: if the number does not fit any group
}

export { formatData, calculatePointLocation, findAgeGroup };
