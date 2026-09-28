import { StatisticalData } from "@/types";

type EthnicityGroup = "jews" | "arabs";
type AlyiaGroup = "1960-1989" | "1989-2001" | "2000+";

interface EthnicityFormattedData {
  ethnicity: {
    [key in EthnicityGroup]: number;
  };
  alyia: {
    [key in AlyiaGroup]: number;
  };
  totalAlyia: number;
}

const formatEthnicityData = (data: StatisticalData): EthnicityFormattedData => {
  const jews = Math.round(data["DEMO_nation_jews_pcnt_2022"] * 100) | 0;
  const arabs = Math.round(data["DEMO_nation_arab_pcnt_2022"] * 100) | 0;

  const Alyia_1960_1989 =
    Math.round(data["DEMO_origin_alyia_1961-1989_pcnt_2022"] * 100) | 0;
  const Alyia_1989_2001 =
    Math.round(data["DEMO_origin_alyia_1990-2001_pcnt_2022"] * 100) | 0;
  const Alyia_2002plus =
    Math.round(data["DEMO_origin_alyia_2002-2009_pcnt_2022"] * 100) | 0;
  return {
    ethnicity: {
      jews: jews,
      arabs: arabs,
    },
    alyia: {
      "1960-1989": Alyia_1960_1989,
      "1989-2001": Alyia_1989_2001,
      "2000+": Alyia_2002plus,
    },
    totalAlyia: Math.round(data["DEMO_origin_alyia_pcnt_2022"] * 100) | 0,
  };
};

export type { EthnicityFormattedData, EthnicityGroup, AlyiaGroup };
export { formatEthnicityData };
