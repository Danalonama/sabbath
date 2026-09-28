import { StatisticalData } from "@/types";
import { useTranslations } from "next-intl";
import WaffleChart, { DataType } from "../Charts/WaffleChart";
import DoughnutChart from "../Charts/DoughnutChart";
import PercentageBallChart from "../Charts/PercentageBallChart";
import { formatWaffleData } from "@/lib/utils/componentsUtils/waffleUtils";
import {
  IMAGES_PATTERNS_DIR,
  knesset25Coalition,
  knesset25CoalitionGroups,
  knesset25DataPrefix,
  knesset25DidNotPassThreshold,
  knesset25GroupOrder,
  NEW_STATZONE_BOOL_FIELD,
  NEW_STATZONE_POLITICAL_DISTRIBUTION,
  partyColors,
  partySectors,
} from "@/constants/constants";
import { Fragment, useEffect, useState } from "react";
import { Collapse, CollapseProps, Radio } from "antd";
import { useAtom } from "jotai";
import { handleCurrentPolygonCity } from "@/atoms/map/map-atoms";

function WaffleHeader({
  setSeparateGroupView,
  textObject,
  showGroupToggle = true,
}: {
  setSeparateGroupView: any;
  textObject: any;
  showGroupToggle?: boolean;
}) {
  return (
    <div className="w-full flex items-center justify-between">
      <h3 className="text-2xl font-bold flex items-center">
        {textObject("title")}
      </h3>
      {showGroupToggle ? (
        <Radio.Group
          defaultValue={false}
          onChange={(value) => {
            setSeparateGroupView(value.target.value);
          }}
          optionType="button"
          buttonStyle="solid"
        >
          <Radio.Button value={false} key="unitary" className="text-lg">
            {textObject("groupSplitRadioButtons.unitary")}
          </Radio.Button>
          <Radio.Button value={true} key="separated" className="text-lg">
            {textObject("groupSplitRadioButtons.split")}
          </Radio.Button>
        </Radio.Group>
      ) : null}
      <style>{`
      .waffle-chart .ant-radio-group {
        background-color: var(--color-neutral-05);
        border-radius: 28px;
        display: flex;
        align-items: center;
      }
      .waffle-chart .ant-radio-button-wrapper {
        color: var(--color-neutral-5);
        height: 24px;
        border: none;
        display: flex;
        align-items: center;
        font-size: 18px;
        padding: 0px 12px;
      }
      .waffle-chart .ant-radio-button-wrapper:hover {
        color: var(--color-neutral-6);
        font-weight: bold;
      }
      .waffle-chart .ant-radio-button-wrapper::before {
        width: 0;
      }
      .waffle-chart .ant-radio-button-wrapper-checked {
        color: var(--color-neutral-6) !important;
        margin: 2px;
        border-radius: 16px;
        box-shadow: 0 0 4px rgba(0,0,0,0.15);
        font-weight: bold;
      }
      
      `}</style>
    </div>
  );
}

type PercentageDoughnutEntry = {
  key: string;
  field: string;
  color: string;
  translationKey: string;
};

const normalizePercent = (value: unknown) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return numericValue <= 1 ? numericValue * 100 : numericValue;
};

const generatePercentageDoughnutData = (
  data: StatisticalData,
  entries: PercentageDoughnutEntry[],
) =>
  entries.map((entry) => ({
    label: entry.key,
    value: normalizePercent(data[entry.field]),
    color: entry.color,
    translationKey: entry.translationKey,
  }));

function WaffleCell({
  color,
  isCircle = false,
  isDashed = false,
}: {
  color: string;
  isCircle: boolean;
  isDashed?: boolean;
}) {
  return (
    <span
      className={`block ${"h-3 w-3"} ${
        isCircle ? "rounded-full" : "rounded-sm"
      }`}
      style={{
        backgroundColor: color,
        backgroundImage: isDashed
          ? `url(${IMAGES_PATTERNS_DIR}diagonal-soft.svg)`
          : "none",
      }}
    ></span>
  );
}

function WaffleLegend({
  data,
  colorKey,
  squareGroups,
  dashedGroups,
  textObject,
}: {
  data: any;
  colorKey: { [key: string]: string };
  squareGroups: string[];
  dashedGroups: string[];
  textObject: any;
}) {
  const groups = Object.keys(data);
  const lastGroup = groups[groups.length - 1];
  const secondToLastGroup = groups[groups.length - 2];
  return (
    <div className="w-full grid grid-cols-4 justify-around">
      {groups.map((group: any, index: number) => {
        return (
          <ul
            className={`${
              group !== secondToLastGroup && group !== lastGroup
                ? "row-span-2"
                : ""
            } ${group === lastGroup ? "self-end" : ""}`}
            key={group}
          >
            {Object.keys(data[group]).map((entry) => {
              return (
                <li
                  className="flex items-center gap-1 "
                  key={`${group}-${entry}`}
                >
                  <WaffleCell
                    color={colorKey[entry]}
                    isCircle={!squareGroups.includes(entry)}
                    isDashed={dashedGroups.includes(entry)}
                  />
                  <p className="font-medium">
                    {textObject(`elements.${entry}`)}
                  </p>
                  <p className="text-xs">{data[group][entry]}%</p>
                </li>
              );
            })}
          </ul>
        );
      })}
    </div>
  );
}

function PercentageDoughnutDistribution({
  data,
  entries,
  t,
}: {
  data: StatisticalData;
  entries: PercentageDoughnutEntry[];
  t: any;
}) {
  const pieData = generatePercentageDoughnutData(data, entries);

  return (
    <div className="flex py-3 px-4 h-full w-full gap-x-12 justify-center">
      <ul className="flex flex-col justify-center gap-y-3 text-lg">
        {pieData.map((entry) => (
          <li className="flex gap-x-2 items-center" key={entry.label}>
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></span>
            <span className="border-l border-l-blue-grey-20 pl-2">
              {t(entry.translationKey)} {Math.round(entry.value)}%
            </span>
          </li>
        ))}
      </ul>
      <DoughnutChart width={200} data={pieData} />
    </div>
  );
}

function PercentageIndicator({
  isSquared,
  groupsSquaredCellsCount,
  separateGroupView,
  t,
}: {
  isSquared: boolean;
  groupsSquaredCellsCount: any;
  separateGroupView: any;
  t: any;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!separateGroupView) {
      const timer = setTimeout(() => setShow(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [separateGroupView]);
  return (
    <div
      className={`flex flex-col items-center transition-opacity  ${
        show ? "duration-500 delay-150 opacity-100" : "opacity-0"
      }`}
    >
      <span className="text-lg font-semibold">
        {
          groupsSquaredCellsCount[
            isSquared ? "squaredCellsCount" : "circleCellsCount"
          ]
        }
        %
      </span>
      <p>{t(isSquared ? "sectionA" : "sectionB")}</p>
    </div>
  );
}

function FullPoliticalDistribution({
  data,
  separateGroupView,
  t,
}: {
  data: DataType;
  separateGroupView: boolean;
  t: any;
}) {
  return (
    <>
      <div className="h-full w-full justify-center flex items-end gap-6 pb-2 relative">
        <PercentageIndicator
          isSquared
          groupsSquaredCellsCount={data.groupsSquaredCellsCount}
          separateGroupView={separateGroupView}
          t={t}
        />
        <WaffleChart
          data={data}
          colorKey={partyColors}
          squareGroups={knesset25Coalition}
          dashedGroups={knesset25DidNotPassThreshold}
          separate={separateGroupView}
        />
        <PercentageIndicator
          isSquared={false}
          groupsSquaredCellsCount={data.groupsSquaredCellsCount}
          separateGroupView={separateGroupView}
          t={t}
        />
        <div className="absolute left-4 top-2 grid grid-flow-row justify-items-center">
          <div className="h-6 w-6 rounded-full border-2 border-gray-500"></div>
          <p>{data.sampleSize}</p>
          <p className="-mt-2">{t("sampleType")}</p>
        </div>
      </div>
      <div className="overflow-hidden max-w-full flex flex-col text-neutral-6">
        <PercentageBallChart
          colors={["--color-neutral-6"]}
          data={[data.percentage]}
        />
        <div className="w-full flex justify-between">
          <span className="font-semibold">
            {data.percentage}% {t("percentageText")}
          </span>
          <p>{`(${Math.floor(
            data.eligible * 0.01 * (100 - data.percentage),
          ).toLocaleString()} ${t("didn'tVote")})`}</p>
        </div>
      </div>
      <WaffleLegend
        data={data.groupsCellsCount}
        colorKey={partyColors}
        squareGroups={knesset25Coalition}
        dashedGroups={knesset25DidNotPassThreshold}
        textObject={t}
      />
    </>
  );
}

function PoliticalCollapse({
  data,
  currentPolygonCityData,
  t,
  separateGroupView,
}: {
  data: StatisticalData;
  currentPolygonCityData: StatisticalData | null;
  t: any;
  separateGroupView: boolean;
}) {
  const [formattedData, setFormattedData] = useState(
    formatWaffleData(
      data,
      knesset25DataPrefix,
      partySectors,
      knesset25GroupOrder,
      knesset25CoalitionGroups,
    ),
  );
  useEffect(() => {
    setFormattedData(
      formatWaffleData(
        data,
        knesset25DataPrefix,
        partySectors,
        knesset25GroupOrder,
        knesset25CoalitionGroups,
      ),
    );
  }, [data]);

  return (
    <>
      <Collapse
        className="w-full"
        defaultActiveKey={["statarea"]}
        ghost
        destroyInactivePanel
        items={generateItems(
          formattedData as DataType,
          currentPolygonCityData?.[knesset25DataPrefix + "turnout"]
            ? (formatWaffleData(
                currentPolygonCityData,
                knesset25DataPrefix,
                partySectors,
                knesset25GroupOrder,
                knesset25CoalitionGroups,
              ) as DataType)
            : null,
          currentPolygonCityData,
          data,
          t,
          separateGroupView,
        )}
      />
      <style>{`
      .ant-collapse-content-box{ 
        padding: 0px !important;
      }`}</style>
    </>
  );
}

const generateItems = (
  data: DataType,
  cityData: DataType | null,
  basicCityData: StatisticalData | null,
  basicStatzoneData: StatisticalData,
  t: any,
  separateGroupView: boolean,
): CollapseProps["items"] => {
  const isNewStatzone = basicStatzoneData[NEW_STATZONE_BOOL_FIELD] === true;
  const items = [
    {
      key: "statarea",
      label: (
        <h3 className="text-xl">
          {t("location.data")} {t("location.statarea")}
        </h3>
      ),
      children: (
        <>
          {isNewStatzone ? (
            <PercentageDoughnutDistribution
              data={basicStatzoneData}
              entries={NEW_STATZONE_POLITICAL_DISTRIBUTION}
              t={t}
            />
          ) : (
            <FullPoliticalDistribution
              data={data}
              separateGroupView={separateGroupView}
              t={t}
            />
          )}
        </>
      ),
    },
  ];
  if (cityData && basicCityData) {
    items.push({
      key: "city",
      label: (
        <h3 className="text-xl">
          {t("location.data")} {t("location.city")}
        </h3>
      ),
      children: (
        <FullPoliticalDistribution
          data={cityData}
          separateGroupView={separateGroupView}
          t={t}
        />
      ),
    });
  }
  return items;
};

export default function PoliticalTab(data: StatisticalData) {
  const t = useTranslations("Data.Elections");
  const [currentPolygonCityData] = useAtom(handleCurrentPolygonCity);

  const [separateGroupView, setSeparateGroupView] = useState(false);
  const hasNewStatzoneData = data[NEW_STATZONE_BOOL_FIELD] === true;
  const hasCityPoliticalData = Boolean(
    currentPolygonCityData?.[knesset25DataPrefix + "turnout"],
  );
  const hasPoliticalData =
    Boolean(data[knesset25DataPrefix + "turnout"]) || hasNewStatzoneData;
  const showGroupToggle = !hasNewStatzoneData || hasCityPoliticalData;

  return (
    <div className="w-full h-full flex justify-center pt-4 px-6">
      {hasPoliticalData ? (
        <div className="waffle-chart w-full h-full grid grid-flow-row justify-items-center gap-y-2">
          <WaffleHeader
            setSeparateGroupView={setSeparateGroupView}
            textObject={t}
            showGroupToggle={showGroupToggle}
          />
          <PoliticalCollapse
            data={data}
            currentPolygonCityData={currentPolygonCityData}
            t={t}
            separateGroupView={separateGroupView}
          />
        </div>
      ) : (
        <h3 className="text-2xl">{t("no-data")}</h3>
      )}
    </div>
  );
}
