import { StatisticalData } from "@/types";
import BarChart from "../Charts/BarChart";
import {
  ageColors,
  ageGroups,
  ageGroupsDataKey,
  countryAgeDistribution,
  countryDemographicsData,
  demographicColorKeys,
} from "@/constants/constants";
import { formatData } from "@/lib/utils/componentsUtils/barChart";
import { formatPercentage } from "@/lib/utils";
import { useTranslations } from "next-intl";
import PercentageBallChart from "../Charts/PercentageBallChart";
import {
  EthnicityFormattedData,
  EthnicityGroup,
  formatEthnicityData,
} from "@/lib/utils/componentsUtils/percentageBallChart";
import InfoBubble from "../InfoBubble";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { handleCurrentPolygonCity } from "@/atoms/map/map-atoms";

function BarChartTitle({
  title,
  data,
  isMain = false,
  isCity = false,
}: {
  title: string;
  data: any;
  isMain?: boolean;
  isCity?: boolean;
}) {
  return (
    <div className="w-ful flex justify-between items-baseline text-sm">
      <h2 className={`${isMain ? "text-2xl font-bold" : "text-sm"}`}>
        {title}
      </h2>
      {data && (
        <div className="flex gap-1">
          <div className="flex gap-0.5 items-baseline">
            <span>{isMain && "ילדים למשפחה: "}</span>
            <p>
              {data[
                isCity
                  ? "DEMO_pop_AverageChildrenPerWoman_2008"
                  : "DEMO_pop_average_children_per_woman_2022"
              ]
                ? data[
                    isCity
                      ? "DEMO_pop_AverageChildrenPerWoman_2008"
                      : "DEMO_pop_average_children_per_woman_2022"
                  ]
                : 2.9}
            </p>
            <img src="/images/icons/cradle.svg" className="h-2.5 w-2.5" />
          </div>
          {!isNaN(
            data[
              isCity ? "DEMO_pop_Growth_pcnt_2022" : "DEMO_pop_growth_pcnt_2022"
            ],
          ) ? (
            <>
              <span>/</span>
              <div className="flex gap-0.5">
                <span>{isMain && "גידול שנתי: "}</span>
                <p dir="ltr">
                  {formatPercentage(
                    data[
                      isCity
                        ? "DEMO_pop_Growth_pcnt_2022"
                        : "DEMO_pop_growth_pcnt_2022"
                    ],
                    isMain || isCity ? true : false,
                  )}
                </p>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

const DottedLines = ({ quartiles }: { quartiles: number[] }) => {
  const topPadding = 44;
  return (
    <div
      className={`absolute top-0 left-0 w-full h-full pointer-events-none`}
      style={{ paddingTop: topPadding }}
    >
      {quartiles.map((quartile, index) => (
        <div
          key={index}
          className={`absolute  w-px h-full z-0  ${
            index === 1
              ? "border-l border-dotted border-neutral-3"
              : "bg-dotted-quartiles bg-repeat-y"
          }`}
          style={{
            left: `${quartile}%`,
            height: `calc(100% + 20px - ${topPadding}px - ${
              index === 1 ? "16px" : "10px"
            })`,
          }}
        />
      ))}
    </div>
  );
};

function AgeDistributionView({
  data,
  cityData,
}: {
  data: StatisticalData;
  cityData: StatisticalData | null;
}) {
  const t = useTranslations("Data.Demographics.age-distribution");
  const [oldCityData, setOldCityData] = useState(cityData);
  useEffect(() => {
    if (cityData) {
      setOldCityData(cityData);
    }
  }, [cityData]);
  return (
    <div className="text-center text-neutral-6">
      <div className="w-full flex flex-col gap-6 transition-all duration-500">
        <div className="relative">
          <DottedLines quartiles={[25, 50, 75]} />
          <div className="relative z-20 ">
            {data["DEMO_pop_0-9_pcnt_2022"] ? (
              <div className="mb-8">
                <BarChart
                  data={formatData(data, ageGroupsDataKey)}
                  domain={ageGroups}
                  colors={ageColors}
                  median={data["DEMO_pop_median_age_2022"]}
                  point={data["DEMO_marriage_median_age_2022"]}
                >
                  <BarChartTitle title={t("area-title")} data={data} isMain />
                </BarChart>
              </div>
            ) : null}
            <ul className="flex flex-col ">
              <li
                className={`opacity-0 max-h-0 ${
                  cityData !== null ? "animate-grow mb-2" : "animate-shrink"
                }`}
              >
                {oldCityData !== null && (
                  <BarChart
                    data={formatData(oldCityData, ageGroupsDataKey)}
                    domain={ageGroups}
                    colors={ageColors}
                    median={oldCityData["DEMO_pop_medianAge_2019"]}
                    size="small"
                  >
                    <BarChartTitle
                      title={`${t("municipal-title")} (${
                        oldCityData["city_name"]
                      }):`}
                      data={oldCityData}
                      isCity
                    />
                  </BarChart>
                )}
              </li>

              <li className={`${""} transition-all duration-500 h-full `}>
                <BarChart
                  data={formatData(countryAgeDistribution, ageGroupsDataKey)}
                  domain={ageGroups}
                  colors={ageColors}
                  median={30}
                  size="small"
                >
                  <BarChartTitle
                    title={t("country-title")}
                    data={countryDemographicsData}
                  />
                </BarChart>
              </li>
            </ul>
          </div>
          <span className="absolute left-0 w-full">{t("median-age")}</span>
        </div>
        <div className="flex gap-3 justify-between">
          {ageGroups.map((ageGroup: string, index: number) => {
            const style = { backgroundColor: ageColors[index] };
            return (
              <div className="flex items-center gap-1" key={index}>
                <span className="block w-1.5 h-1.5" style={style}></span>
                <p>{t(`age-groups.${ageGroup}`)}</p>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between w-full">
          <p> {t("asterisk")}</p>
          <div className="flex gap-1 align-middle w-max">
            <p className="whitespace-nowrap">
              {`${t("median-marriage-age")}: ${
                data["DEMO_marriage_median_age_2022"]
              }`}
            </p>
            <img src="/images/icons/diamond-dark.svg" className="mb-0.5"></img>
          </div>
        </div>
      </div>
    </div>
  );
}

function EthnoreligionDistributionView({
  data,
}: {
  data: EthnicityFormattedData;
}) {
  const t = useTranslations("Data.Demographics");
  const EthnicityRemainder = Object.values(data.ethnicity).reduce(
    (a, b) => a - b,
    100,
  );

  return (
    <div className="w-full pb-4 flex flex-col gap-2 text-neutral-7">
      <div>
        <PercentageBallChart
          data={Object.values(data.ethnicity)}
          colors={demographicColorKeys.ethnicityColors}
        />
        <div className="flex gap-4 items-center">
          {Object.keys(data.ethnicity).map((key, index) => (
            <div className="flex items-center gap-1" key={index}>
              <span
                className="block w-1.5 h-1.5"
                style={{
                  backgroundColor: demographicColorKeys.ethnicityColors[index],
                }}
              ></span>
              <p>{data.ethnicity[key as EthnicityGroup]}%:</p>
              <p>{t(`ethnicities.${key}`)}</p>
            </div>
          ))}
          <div className="flex items-center gap-1">
            <span
              className="block w-1.5 h-1.5"
              style={{
                backgroundColor: "var(--color-neutral-1)",
              }}
            ></span>
            <p>{EthnicityRemainder}%:</p>
            <p>{t(`ethnicities.remainder`)}</p>
          </div>
        </div>
      </div>
      <div>
        <PercentageBallChart
          data={Object.values(data.alyia)}
          colors={demographicColorKeys.alyiaColors}
        />
        <div className="flex gap-4 items-center">
          <div className="flex gap-1">
            <p>
              {data.totalAlyia}
              %:
            </p>
            <p>{t(`alyia.alyia`)}</p>
          </div>
          {Object.keys(data.alyia).map((key, index) => (
            <div className="flex items-center gap-1" key={index}>
              <span
                className="block w-1.5 h-1.5"
                style={{
                  backgroundColor: demographicColorKeys.alyiaColors[index],
                }}
              ></span>
              <p>{t(`alyia.${key}`)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoSection({ data }: { data: StatisticalData }) {
  const t = useTranslations("Data.Demographics.insights");

  return (
    <div className="w-full h-full flex flex-col gap-2">
      {data["DEMO_marriage_median_age_2022"] && (
        <InfoBubble
          insight={
            data["DEMO_marriage_median_age_2022"] > 25
              ? t("marriage-median.more")
              : t("marriage-median.less")
          }
          text={t("marriage-median.text")}
        />
      )}
    </div>
  );
}

export default function DemographicTab(data: StatisticalData) {
  const [getCurrentPolygonCity] = useAtom(handleCurrentPolygonCity);
  return (
    <div className="w-full h-full flex flex-col justify-center gap-2 py-4 px-6">
      <AgeDistributionView
        data={data}
        cityData={getCurrentPolygonCity as StatisticalData}
      />
      <EthnoreligionDistributionView data={formatEthnicityData(data)} />
      <InfoSection data={data} />
    </div>
  );
}
