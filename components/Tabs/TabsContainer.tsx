import { BackgroundObject, StatisticalData } from "@/types";
import { Tabs } from "antd";
import PoliticalTab from "./PoliticalTab";
import { darkenColor } from "@/lib/utils";
import DemographicTab from "./DemographicTab";
import { useTranslations } from "next-intl";
import SocioeconomicTab from "./SocioeconimicTab";
import { useAtomValue } from "jotai";
import { cardTabsAtom } from "@/atoms/map/map-atoms";
import VoterFileTab from "./VoterFileTab";

const generateTabs = (
  available: string[],
  data: StatisticalData,
  cardColor: string,
  t: any,
) => {
  return [
    {
      key: "politic",
      label: t("political"),
      children: PoliticalTab(data),
    },
    {
      key: "demographic",
      label: t("demographic"),
      children: DemographicTab(data),
    },
    {
      key: "socioeconomic",
      label: t("socioeconomic"),
      children: SocioeconomicTab(data, cardColor),
    },
    {
      key: "voter-file",
      label: t("voter-file"),
      children: VoterFileTab(data),
    },
  ].filter((tab) => available.includes(tab.key));
};

export default function TabsContainer({
  data,
  currentBackground,
}: {
  data: StatisticalData;
  currentBackground: BackgroundObject;
}) {
  const t = useTranslations("Data.Tabs");
  const cardColor = currentBackground.pattern
    ? darkenColor(currentBackground.color)
    : currentBackground.color;

  const cardTabs = useAtomValue(cardTabsAtom);

  return (
    <>
      {cardTabs.length ? (
        <>
          <Tabs
            defaultActiveKey="politic"
            items={generateTabs(cardTabs, data, cardColor, t)}
            className="card-tabs flex flex-col flex-grow max-h-full"
          />
          <style>{`
         .ant-tabs-nav {
          margin-bottom: 0 !important;
          background: var(--color-blue-grey-5);
        }

        .card-tabs .ant-tabs-nav::before {
          border-bottom: 1px solid var(--color-neutral-1) !important;
        }

        .card-tabs .ant-tabs-nav-wrap {
          padding: 0 1rem;
        }
   
        .card-tabs .ant-tabs-nav-list {
          width: 100%;
          display: grid !important;
          grid-template-columns: repeat(${cardTabs.length},1fr);
          column-gap: 0.25rem;
        }
        .card-tabs .ant-tabs-tab {
          border-radius: 0.5rem 0.5rem 0 0;
          display: flex;
          justify-content: start;
          align-items: center;
          padding: 8px 12px 6px !important;
          margin: 0 !important;
          background: var(--color-antd-tab-bg) ;
          box-shadow: inset 0 -4px 8px -4px rgba(0,0,0,0.15);
          border: 0 ;
        }
        .card-tabs .ant-tabs-tab:hover {
          background: var(--color-antd-tab-hover-bg) ;
        }
        .card-tabs .ant-tabs-tab-btn {
          text-align: center;
        }
        .card-tabs .ant-tabs-tab .ant-tabs-tab-btn{
          color: var(--color-neutral-6) !important;
          font-size: 18px;
        }
        .card-tabs .ant-tabs-tab-active {
          background: white !important;
          border: 1px solid var(--color-neutral-1) !important;
          border-bottom: none !important;
          box-shadow: none;
        }
        .card-tabs .ant-tabs-ink-bar{
          display: none;
        }
        .card-tabs .ant-tabs-content-holder {
          overflow-y: auto;
          flex-grow: 1;
          height: 100%;
          padding-bottom: 8px;
          direction: ltr;
          scrollbar-color: var(--color-neutral-2) transparent;
        }
        .card-tabs .ant-tabs-content-holder * {
          direction: rtl;
        }
        `}</style>
        </>
      ) : (
        <div className="w-full pt-4 text-3xl flex justify-center">
          {t("no-data")}
        </div>
      )}
    </>
  );
}
