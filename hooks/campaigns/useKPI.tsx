import { useCampaignsCountQuery } from "@/graphql/campaigns/useCampaignsCountQuery";
import { createContext, useContext, useMemo, useState } from "react";

export interface KPIContextType {
  kpiList: KPICountObjectAsArrayEntry[];
  setSelectedKPI: (kpi: string) => void;
  selectedKPI: string;
}

export type KPICountObjectAsArrayEntry = [string, number | "loading"];

export const KPIContext = createContext<KPIContextType>({
  kpiList: [],
  setSelectedKPI: () => {},
  selectedKPI: "All",
});

export function useKPIContext() {
  return useContext(KPIContext);
}

export function useKPI(initialKPIList: string[]) {
  const [selectedKPI, setSelectedKPI] = useState("All");

  const { loading: loadingCampaignsCount, campaignsCount } =
    useCampaignsCountQuery();

  const kpiList = useMemo(() => {
    if (!initialKPIList) {
      return [["All", "loading"], ...new Array(5).fill(["loading", "loading"])];
    }
    if (loadingCampaignsCount || !campaignsCount) {
      return ["All", ...initialKPIList].map((key) => [key, "loading"]);
    } else {
      return ["All", ...initialKPIList].map((kpi: string) => [
        kpi,
        campaignsCount[kpi] ?? 0,
      ]);
    }
  }, [initialKPIList, loadingCampaignsCount, campaignsCount]);

  return { kpiList, selectedKPI, setSelectedKPI };
}
