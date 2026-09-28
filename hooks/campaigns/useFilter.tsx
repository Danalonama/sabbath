import { createContext, useContext, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";

export interface FilterContextType {
  dates: [string | null, string | null];
  searchTerm: string;
  setDayjsDates: (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null]) => void;
  setSearchTerm: (term: string) => void;
}

export const FilterContext = createContext<FilterContextType>({
  dates: [null, null],
  searchTerm: "",
  setDayjsDates: () => {},
  setSearchTerm: () => {},
});

export function useFilterContext() {
  return useContext(FilterContext);
}

export function useFilter() {
  const [dates, setDates] = useState<[string | null, string | null]>([
    null,
    null,
  ]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const setDayjsDates = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null]) => {
    setDates(
      dates
        ? (dates.map((date) => (date ? date.toISOString() : null)) as [
            string | null,
            string | null,
          ])
        : [null, null],
    );
  };

  return { dates, searchTerm, setDayjsDates, setSearchTerm };
}
