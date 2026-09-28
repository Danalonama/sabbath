import React, { ReactNode, useMemo } from "react";
import { Skeleton } from "antd";
import type { UseTranslationType } from "types/general";
import { KPICountObjectAsArrayEntry } from "@/hooks/campaigns/useKPI";
import { IconSkeleton } from "@/components/Common/AppSkeletons";

export type EntriesResult<T = any> = {
  loading: boolean;
  entries: T[];
};

export type GenerateTabsArgs<T = any> = {
  t: UseTranslationType;
  tabsData: KPICountObjectAsArrayEntry[];
  labelSuffix?: ReactNode;
};

const CountLabel = React.memo(function CountLabel<T>({
  t,
  tab,
  labelSuffix,
}: {
  t: UseTranslationType;
  tab: KPICountObjectAsArrayEntry;
  labelSuffix?: ReactNode;
}) {
  return (
    <h3 className="flex gap-x-2 items-center text-base font-medium w-full leading-none">
      {t(tab[0])}
      {tab[1] === "loading" ? (
        <IconSkeleton size="small" />
      ) : (
        <span className="bg-blue-grey-20 px-2 py-0.5 rounded-full text-xs leading-none min-w-[2ch] inline-flex flex-col items-center justify-center">
          {tab[1]}
        </span>
      )}
      {labelSuffix}
    </h3>
  );
}) as <T>(props: {
  t: UseTranslationType;
  tab: KPICountObjectAsArrayEntry;
  labelSuffix?: ReactNode;
}) => JSX.Element;

// const TabBody = React.memo(function TabBody<T>({
//   tabKey,
//   useEntriesForKey,
//   renderContent,
// }: {
//   tabKey: string;
//   useEntriesForKey: GenerateTabsArgs<T>["useEntriesForKey"];
//   renderContent: GenerateTabsArgs<T>["renderContent"];
// }) {
//   const result = useEntriesForKey(tabKey);
//   return <>{renderContent(result, tabKey)}</>;
// }) as <T>(props: {
//   tabKey: string;
//   useEntriesForKey: GenerateTabsArgs<T>["useEntriesForKey"];
//   renderContent: GenerateTabsArgs<T>["renderContent"];
// }) => JSX.Element;

export function useGenerateTabsItems<T = any>({
  t,
  tabsData,
  labelSuffix,
}: GenerateTabsArgs<T>) {
  const items = useMemo(() => {
    return tabsData.map((entry) => ({
      key: entry[0],
      label: <CountLabel<T> t={t} tab={entry} labelSuffix={labelSuffix} />,
    }));
  }, [tabsData, t, labelSuffix]);

  return items;
}
