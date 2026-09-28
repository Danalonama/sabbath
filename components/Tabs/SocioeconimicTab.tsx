import { BasicObject, StatisticalData } from "@/types";
import { useTranslations } from "next-intl";
import SwarmChart from "../Charts/SwarmChart";
import { useState } from "react";
import {
  countrySocioeconomicMinMax,
  socioClusterVariables,
} from "@/constants/constants";
import { calculateAverage } from "@/lib/utils/componentsUtils/swarmChart";
import DataCollapse from "../Common/DataCollapse";
import { useAtom } from "jotai";
import { socioDataAtom } from "@/atoms/map/map-atoms";

export type socioData = {
  id: number;
  GEN_city_name: string;
  DEMO_pop_total_2024: number;
  ECO_cluster_2019: number;
  x?: number;
  y?: number;
};

function SocioCollapsables({
  data,
  color,
  collapseGraphToggle,
}: {
  data: StatisticalData;
  color: string;
  collapseGraphToggle: Function;
}) {
  const t = useTranslations("Data.Socioeconomic.collapse");
  const [socioData] = useAtom(socioDataAtom);

  return (
    <DataCollapse
      data={data}
      totalData={[...socioData].filter(
        (entry) => entry["GEN_city_name"] === data["GEN_city_name"],
      )}
      minMaxData={countrySocioeconomicMinMax as BasicObject}
      color={color}
      collapseGraphToggle={collapseGraphToggle}
      textObject={t}
    />
  );
}

function SocioeconomicCluster({
  data,
  color,
  collapseGraph,
}: {
  data: StatisticalData;
  color: string;
  collapseGraph: boolean;
}) {
  const t = useTranslations("Data.Socioeconomic");
  const [socioData] = useAtom(socioDataAtom);

  const cityAverage = calculateAverage(
    socioData,
    socioClusterVariables.xAxis,
    data[socioClusterVariables.selectedGroup],
    socioClusterVariables.selectedGroup,
  );
  return (
    <div className="w-full px-4 py-2">
      <div className="w-full flex justify-between text-neutral-6">
        <h3 className="text-2xl font-bold flex items-center gap-1 sticky">
          {`${t("title")}: ${
            data[socioClusterVariables.xAxis]
              ? data[socioClusterVariables.xAxis]
              : cityAverage
          }`}
          <span
            className="rounded-full h-2 w-2"
            style={{ backgroundColor: color }}
          ></span>
        </h3>
        <p className="flex gap-2 items-center">
          {`${t("city-data")}: ${cityAverage}`}
        </p>
      </div>
      <SwarmChart
        selectedData={data}
        totalData={socioData as socioData[]}
        variables={socioClusterVariables}
        selectedColor={color}
        collapseGraph={collapseGraph}
      />
    </div>
  );
}

export default function SocioeconomicTab(data: StatisticalData, color: string) {
  const t = useTranslations("Data.Socioeconomic");
  const [collapseGraph, setCollapseGraph] = useState(false);

  const collapseGraphToggle = (collapseOpen: boolean) =>
    setCollapseGraph(collapseOpen);

  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-4 p-2">
      <SocioeconomicCluster
        data={data}
        color={color}
        collapseGraph={collapseGraph}
      />
      <SocioCollapsables
        data={data}
        color={color}
        collapseGraphToggle={collapseGraphToggle}
      />
    </div>
  );
}
