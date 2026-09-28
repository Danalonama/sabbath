import { BasicObject } from "@/types";

type Groups = { [key: string]: string[] };
type Data = { [key: string]: number };
type Cell = { x: number; y: number; element: string; group: string };

const formatWaffleData = (
  data: any,
  dataPrefix = "",
  groups: BasicObject,
  groupsOrder: string[],
  squaredGroups: string[]
) => {
  let remainderGroup = 100;
  let lastEntryOfGroupA = "";
  let groupACellCount = 0;
  const reduceTotal = (cellsCount: number) => {
    remainderGroup -= cellsCount;
  };
  const updateGroupAInfo = (entry: string, cellCount: number) => {
    lastEntryOfGroupA = entry;
    groupACellCount += cellCount;
  };
  const wafflizedData: BasicObject = {
    percentage: Math.round(data[dataPrefix + "turnout"] * 100),
    results: [],
  };
  const totalSample = Math.round(
    data[dataPrefix + "rtv"] * data[dataPrefix + "turnout"]
  );
  const sampleSize = Math.ceil(totalSample / 100);
  wafflizedData.totalSample = totalSample;
  wafflizedData.sampleSize = sampleSize;

  const [cells, groupsCellsCount, groupsSquaredCellsCount, groupsDistance] =
    indexGroupsData(groups, data, dataPrefix, groupsOrder, squaredGroups);
  wafflizedData.results = cells;
  wafflizedData.groupsCellsCount = groupsCellsCount;
  wafflizedData.groupsSquaredCellsCount = groupsSquaredCellsCount;
  wafflizedData.groupsDistance = groupsDistance;
  wafflizedData.eligible = data[dataPrefix + "rtv"];
  return wafflizedData;
};

const indexGroupsData = (
  groups: Groups,
  data: Data,
  dataPrefix = "",
  groupsOrder: string[],
  squaredGroups: string[]
): [Cell[], BasicObject, BasicObject, { [key: string]: number }] => {
  let y = 0;
  let x = 0;
  let totalCellCount = 100;

  const addCell = (element: string, group: string): Cell => {
    const cell: Cell = { x, y, element, group };
    y++;
    if (y === 10) {
      x++;
      y = 0;
    }
    return cell;
  };

  const getDistances = (presentGroups: string[]): { [key: string]: number } => {
    const distances: { [key: string]: number } = {};

    const presentSquaredGroups = squaredGroups.filter((group) =>
      presentGroups.includes(group)
    );

    if (presentSquaredGroups.length > 0) {
      presentSquaredGroups.forEach((group, index) => {
        distances[group] = presentSquaredGroups.length - index;
      });
    }

    let negativeIndex = -1;
    presentGroups.forEach((group) => {
      if (!squaredGroups.includes(group)) {
        distances[group] = negativeIndex--;
      }
    });

    return distances;
  };

  const groupsWithCells = new Set<string>();
  const groupsCellsCount: BasicObject = {};
  const groupsSquaredCellsCount: BasicObject = {
    squaredCellsCount: 0,
    circleCellsCount: 0,
  };

  const cells = Object.entries(groups).flatMap(([group, elements]) => {
    if (!groupsCellsCount[group]) {
      groupsCellsCount[group] = {};
    }
    return elements.flatMap((element) => {
      let cellCount = Math.round(data[dataPrefix + element] * 100);
      if (totalCellCount - cellCount < 0) {
        cellCount = totalCellCount;
      }
      groupsCellsCount[group][element] = cellCount;
      groupsSquaredCellsCount[
        squaredGroups.includes(group) ? "squaredCellsCount" : "circleCellsCount"
      ] += cellCount;
      cellCount > 0 && groupsWithCells.add(group);
      totalCellCount -= cellCount;
      return Array.from({ length: cellCount }, () => addCell(element, group));
    });
  });

  const limitedCells = cells.length > 100 ? cells.slice(0, 100) : cells;

  const remainderCellsCount = 100 - limitedCells.length;
  const remainderCells = Array.from({ length: remainderCellsCount }, () =>
    addCell("else", "else")
  );
  groupsCellsCount["else"] = {};
  groupsCellsCount["else"]["else"] = remainderCellsCount;
  if (remainderCellsCount > 0) {
    groupsWithCells.add("else");
  }
  groupsSquaredCellsCount["circleCellsCount"] += remainderCellsCount;

  const finalCells = limitedCells.concat(remainderCells);

  const presentGroups = groupsOrder.filter((group) =>
    groupsWithCells.has(group)
  );
  const groupsDistance = getDistances(presentGroups);
  return [
    finalCells,
    groupsCellsCount,
    groupsSquaredCellsCount,
    groupsDistance,
  ];
};

export { formatWaffleData };
