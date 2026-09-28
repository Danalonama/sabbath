import {
  SimplePercentageCircle,
  SimpleProgressBar,
} from "@/components/Campaigner/SimplePrgressBar";
import {
  GroupConfig,
  PeopleCount,
} from "@/components/Common/GenericCollapible";
import { BasicObject, UrlObject } from "@/types";
import { PerformanceType } from "types/campaigns/campaigns";
import { UseTranslationType } from "types/general";

const parsePeople = (txt = "") =>
  Number(txt.match(/\d+/)?.[0] ?? "") as PeopleCount;

const ImageWithFallBack = ({ icon }: { icon: string }) => (
  <img
    src={`/images/icons/channels-full/${icon}.svg`}
    alt={icon}
    onError={(e) =>
      (e.currentTarget.src = `/images/icons/channels/${icon}.svg`)
    }
    className="h-5 w-5"
  />
);

const receiveAudienceCount = (items: BasicObject[]): number => {
  const length = items.length;
  return length > 1 ? length : items[0].audience ? 1 : 0;
};

export const buildConfigs = (
  t: UseTranslationType,
  channelsText: UseTranslationType,
  statText: UseTranslationType
) => {
  const colTxt = (c: string) => t(`columns.${c}`);

  const catTxt = (c: string) => channelsText(`categories.${c}`);
  const chTxt = (n: string) => channelsText(`channels.${n}`);

  const channelColumns = ["channel", "audiences"];
  const audienceColumns = ["audience", "channels"];
  const commonColumns = ["audience-size", "clicks", "percent-clicks"];
  const convertedColumns = ["converted", "percent-converted"];
  const allColumns = [
    "channel",
    "audience",
    "audience-size",
    "url-copy",
    "clicks",
    "percent-clicks",
  ];

  const channelConfig: GroupConfig<UrlObject> = {
    groupBy: (u) => u.channel.id,
    headerColumns: (showConversion = false) => [
      ...channelColumns.map((col) => colTxt(col)),
      ...commonColumns.map((col) => colTxt(col)),
      ...(showConversion ? convertedColumns.map((col) => colTxt(col)) : []),
    ],
    header: (_, items) => {
      const ch = items[0].channel;
      return {
        title: (
          <h3 className="flex items-center gap-x-2">
            <ImageWithFallBack icon={ch.icon} />
            <span>
              {chTxt(ch.name)} – {catTxt(ch.category)}
            </span>
          </h3>
        ),
        secondary: `${receiveAudienceCount(items)} ${t("audience")}`,
      };
    },
    childLabel: (u) =>
      u.audience?.name ? (
        <p className="flex gap-3">
          <img src="/images/icons/people.svg" alt="people" />
          <span>{u.audience?.name}</span>
        </p>
      ) : (
        t("no-audience")
      ),
    getAmount: (u) => u.audience?.size || 0,
    getCopyValue: (u) => u.url || undefined,
    getPerformance: (u) => ({
      clicks: u.clicks || 0,
      converted: u.converted || 0,
    }),
    displayPerformance: (
      data: number,
      maxBound: number,
      type: PerformanceType
    ) => {
      return (
        <SimpleProgressBar value={data} whole={maxBound * 1.1} type={type} />
      );
    },
    displayPercentage: (data: number, whole: number) => {
      return <SimplePercentageCircle percent={(data * 100) / whole} />;
    },
  };

  const audienceConfig: GroupConfig<UrlObject> = {
    groupBy: (u) => u.audience?.id ?? "__no_aud__",
    headerColumns: (showConversion = false) => [
      ...audienceColumns.map((col) => colTxt(col)),
      ...commonColumns.map((col) => colTxt(col)),
      ...(showConversion ? convertedColumns.map((col) => colTxt(col)) : []),
    ],
    header: (_, items) => {
      const aud = items[0].audience;
      return {
        title: aud ? (
          <h3 className="flex items-center gap-x-2">
            <img src="/images/icons/people.svg" alt="people" />
            <span>{aud.name}</span>
          </h3>
        ) : (
          t("no-audience")
        ),
        secondary: `${items.length} ${t("channel")}`,
      };
    },
    childLabel: (u) => (
      <p className="flex items-center gap-x-2">
        <ImageWithFallBack icon={u.channel.icon} />
        <span>
          {chTxt(u.channel.name)} – {catTxt(u.channel.category)}
        </span>
      </p>
    ),
    getAmount: (u) => u.audience?.size || 0,
    getCopyValue: (u) => u.url || undefined,
    getPerformance: (u) => ({
      clicks: u.clicks || 0,
      converted: u.converted || 0,
    }),
    displayPerformance: (
      data: number,
      maxBound: number,
      type: PerformanceType
    ) => {
      return (
        <SimpleProgressBar value={data} whole={maxBound * 1.1} type={type} />
      );
    },
    displayPercentage: (data: number, whole: number) => {
      return <SimplePercentageCircle percent={(data * 100) / whole} />;
    },
  };

  const allConfig: GroupConfig<UrlObject> = {
    groupBy: (u) => u.audience?.id ?? "__no_aud__",
    headerColumns: (showConversion) => [
      ...allColumns.map((col) => colTxt(col)),
      ...(showConversion ? convertedColumns.map((col) => colTxt(col)) : []),
    ],
    header: (_, items) => {
      const aud = items[0].audience;
      const ch = items[0].channel;
      return {
        title: (
          <h3 className="flex items-center gap-x-2">
            <ImageWithFallBack icon={ch.icon} />
            <span>
              {chTxt(ch.name)} – {catTxt(ch.category)}
            </span>
          </h3>
        ),
        secondary: aud ? (
          <h3 className="flex items-center gap-x-2">
            <img src="/images/icons/people.svg" alt="people" />
            <span>{aud.name}</span>
          </h3>
        ) : (
          t("no-audience")
        ),
      };
    },
    childLabel: (u) => null,
    getAmount: (u) => u.audience?.size || 0,
    getCopyValue: (u) => u.url || undefined,
    getPerformance: (u) => ({
      clicks: u.clicks || 0,
      converted: u.converted || 0,
    }),
    displayPerformance: (
      data: number,
      maxBound: number,
      type: PerformanceType
    ) => {
      return (
        <SimpleProgressBar value={data} whole={maxBound * 1.1} type={type} />
      );
    },
    displayPercentage: (data: number, whole: number) => {
      return <SimplePercentageCircle percent={(data * 100) / whole} />;
    },
  };

  return { channelConfig, audienceConfig, allConfig };
};
