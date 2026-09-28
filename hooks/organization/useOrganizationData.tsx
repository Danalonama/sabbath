import { BasicObject } from "@/types";
import { createContext, useContext, useState } from "react";

export interface OrganizationContextType {
  setOrganizationData: (data: BasicObject) => void;
  getKPI: () => string[];
  getShowConversion: () => boolean;
}

export const OrganizationContext = createContext<OrganizationContextType>({
  setOrganizationData: () => {},
  getKPI: () => [],
  getShowConversion: () => false,
});

export function useOrganizationDataContext() {
  return useContext(OrganizationContext);
}

export default function useOrganizationData() {
  const [data, setData] = useState({});
  const [KPI, setKPI] = useState([]);
  const [showConversion, setShowConversion] = useState(false);

  function setOrganizationData(data: BasicObject) {
    setKPI(data.KPI);
    setShowConversion(data.showConversion || false);
  }

  function getKPI() {
    return KPI;
  }

  function getShowConversion() {
    return showConversion;
  }

  return { setOrganizationData, getKPI, getShowConversion };
}
