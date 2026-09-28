import { StatisticalData } from "@/types";
import { useTranslations } from "next-intl";
import DoughnutChart from "../Charts/DoughnutChart";
import { handleCurrentPolygonCity } from "@/atoms/map/map-atoms";
import { useAtom } from "jotai";

const VOTER_FILE_PIE_DEF: {
  [key: string]: { field: string; color: string; pcnt: string };
} = {
  liberal: {
    field: "VOTER_FILE_liberals_count",
    color: "#05ADC4",
    pcnt: "VOTER_FILE_liberals_pcnt",
  },
  inconclusive: {
    field: "VOTER_FILE_inconclusive_count",
    color: "#605AB2",
    pcnt: "VOTER_FILE_inconclusive_pcnt",
  },
  conservative: {
    field: "VOTER_FILE_conservatives_count",
    color: "#FF754B",
    pcnt: "VOTER_FILE_conservatives_pcnt",
  },
  unknown: {
    field: "VOTER_FILE_unknown_count",
    color: "#CFD8EA",
    pcnt: "VOTER_FILE_unknown_pcnt",
  },
};

const generatePieVoterFileData = (data: StatisticalData) => {
  return Object.keys(VOTER_FILE_PIE_DEF).map((key) => {
    return {
      label: key,
      value: data[VOTER_FILE_PIE_DEF[key].field],
      color: VOTER_FILE_PIE_DEF[key].color,
    };
  });
};

export default function VoterFileTab(data: StatisticalData) {
  const t = useTranslations("Data.VoterFile");
  const distributionText = (str: string) => t(`distribution.${str}`);
  const locationText = (str: string) => t(`location.${str}`);

  const [currentPolygonCityData] = useAtom(handleCurrentPolygonCity);

  const dataParse = (entry?: string) => {
    if (entry) {
      return entry;
    } else return "";
  };

  return (
    <div className="w-full h-full flex flex-col justify-center items-start gap-2 py-4 px-6">
      <h3 className="text-2xl font-bold">{t("title")}</h3>
      <div className="flex w-full p-2 rounded-md bg-blue-grey-5 gap-x-3 items-start">
        <img src="/images/icons/ballot.svg" alt="ballot" />
        <div className="grid grid-cols-2 w-full">
          {[data, currentPolygonCityData].map((data, index) => {
            if (!data) return null;
            return (
              <div
                className="flex flex-col px-3 border-r border-r-neutral-1 text-base"
                key={index}
              >
                <span className="font-bold">{`${Math.floor(
                  data["VOTER_FILE_coverage_pcnt"] * 100
                )}% ${locationText("data")} ${locationText(
                  index ? "city" : "statarea"
                )}`}</span>
                <p className="">{`${dataParse(
                  data["VOTER_FILE_phones_count"]
                ).toLocaleString()} ${t("VOTER_FILE_phones_count")}`}</p>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex py-3 px-4 h-full w-full gap-x-12 justify-between">
        <div className="flex flex-col justify-between py-2">
          <h4 className="text-lg font-bold mb-2">
            {distributionText("title")}
          </h4>
          <ul className="flex flex-col gap-y-2">
            {Object.keys(VOTER_FILE_PIE_DEF).map((entry) => (
              <div className="flex gap-x-2 items-center" key={entry}>
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: VOTER_FILE_PIE_DEF[entry].color }}
                ></span>
                <span className="border-l border-l-blue-grey-20 pl-2">{`${distributionText(
                  entry
                )} ${Math.floor(
                  data[VOTER_FILE_PIE_DEF[entry].pcnt] * 100
                )}%`}</span>
                <p>{`${dataParse(
                  data[VOTER_FILE_PIE_DEF[entry].field]
                ).toLocaleString()} ${distributionText("voters")}`}</p>
              </div>
            ))}
          </ul>
        </div>
        <DoughnutChart width={200} data={generatePieVoterFileData(data)} />
      </div>
    </div>
  );
}
