import { CampaignIcon, SmallArrowDown } from "@/components/Icons";
import { Button, Dropdown, TableProps } from "antd";
import { ReactNode, useContext, useMemo } from "react";
import { UseTranslationType } from "types/general";
import { MoreOutlined } from "@ant-design/icons";
import { Channel, KalpiFeature, SignageActivity, UrlObject } from "@/types";
import { ColumnsType } from "antd/es/table";
import { SortOrder } from "antd/es/table/interface";
import { GroupConfig } from "@/components/Common/GenericCollapible";
import {
  SimplePercentageCircle,
  SimpleProgressBar,
} from "@/components/Campaigner/SimplePrgressBar";
import {
  IconSkeleton,
  SmallTitleSkeleton,
  TitleSkeleton,
  TitleSkeletonShort,
} from "@/components/Common/AppSkeletons";
import { OrganizationContext } from "@/hooks/organization/useOrganizationData";
import { CampaignSortState } from "@/hooks/campaigns/useCampaignsList";
import {
  signageActivityStatusIcon,
  signageActivityToColorIcon,
} from "@/constants/map/signage";
import { QRDownloadButton } from "@/components/Campaigner/campaign/CampaignUrlView";
import { KalpiRankBadge } from "@/components/Map/KalpiLayer/KalpiPanel";

export type GenerateCampaignColumnsArgs<T = any> = {
  selectedKPI: string;
  KPIText: UseTranslationType;
  columnsText: UseTranslationType;
  maxClicks?: number;
  loading?: boolean;
  isAnalyticsLoading?: boolean;
  sort?: CampaignSortState;
  showOrganizationColumn?: boolean;
  organizationNamesById?: Record<string, string>;
};

const renderCampaignSortIcon = ({ sortOrder }: { sortOrder: SortOrder }) => (
  <SmallArrowDown
    rotate={sortOrder === "ascend" ? 180 : 0}
    className={`pointer-events-none ${!sortOrder ? "hidden" : ""}`}
  />
);

export const useGenerateCampaignsTableColumns = ({
  selectedKPI,
  KPIText,
  columnsText,
  maxClicks,
  loading,
  isAnalyticsLoading,
  sort,
  showOrganizationColumn,
  organizationNamesById,
}: GenerateCampaignColumnsArgs): TableProps["columns"] => {
  const showConversion = useContext(OrganizationContext).getShowConversion();
  const columns: TableProps["columns"] = useMemo(() => {
    const baseDef: ColumnsType<any> = [
      {
        dataIndex: "name",
        key: "name",
        render: (value, record) => (
          <h2 className="flex gap-x-2">
            <CampaignIcon />
            {record?.__isSkeleton || !value ? <SmallTitleSkeleton /> : value}
          </h2>
        ),
        sorter: true,
        sortOrder:
          sort?.orderBy === "NAME"
            ? sort.orderDirection === "ASC"
              ? "ascend"
              : "descend"
            : null,
      },
      ...(showOrganizationColumn
        ? [
            {
              dataIndex: "orgId",
              key: "org",
              width: 176,
              render: (value: string, record: any) => {
                if (record?.__isSkeleton || !value) {
                  return <TitleSkeletonShort />;
                }

                return (
                  <span className="block max-w-40 truncate text-sm text-neutral-6">
                    {organizationNamesById?.[value] ?? value}
                  </span>
                );
              },
            },
          ]
        : []),
      {
        dataIndex: "kpi",
        key: "kpi",
        hidden: selectedKPI !== "All",
        width: 134,
        render: (_, record) => {
          return (
            <div>
              {record?.__isSkeleton || !record?.kpi ? (
                <TitleSkeletonShort />
              ) : (
                KPIText(record?.kpi)
              )}
            </div>
          );
        },
      },
      {
        dataIndex: "channels",
        key: "channels",
        ellipsis: true,
        onCell: () => ({
          style: { overflow: "auto" },
        }),
        render: (_, record) => {
          return (
            <div className="flex gap-x-2 overflow-x-auto whitespace-nowrap">
              {record?.__isSkeleton
                ? Array(Math.floor(Math.random() * (5 - 2 + 1)) + 2)
                    .fill(null)
                    .map((_, i) => <IconSkeleton size="extra-small" key={i} />)
                : [
                    ...new Set(
                      record?.channels?.map(
                        (channel: Channel) => channel?.icon,
                      ),
                    ),
                  ].map((icon, index) => (
                    <img
                      key={index}
                      src={`/images/icons/channels-full/${icon}.svg`}
                      className="h-4 inline-block"
                    ></img>
                  ))}
            </div>
          );
        },
      },
      {
        dataIndex: "createdAt",
        key: "start-date",
        render: (_, record) => {
          return (
            <div>
              {record?.__isSkeleton || !record?.createdAt ? (
                <TitleSkeletonShort />
              ) : (
                new Date(record?.createdAt)
                  .toLocaleDateString("en-GB")
                  .replace(/\//g, "-")
              )}
            </div>
          );
        },
        sorter: true,
        sortOrder:
          sort?.orderBy === "CREATED_AT"
            ? sort.orderDirection === "ASC"
              ? "ascend"
              : "descend"
            : null,
        width: 136,
      },
      {
        dataIndex: "totalClicks",
        key: "clicks",
        sorter: true,
        sortOrder:
          sort?.orderBy === "TOTAL_CLICKS"
            ? sort.orderDirection === "ASC"
              ? "ascend"
              : "descend"
            : null,
        render: (_, record) => {
          const clicks = record?.__isSkeleton ? 0 : (record?.totalClicks ?? 0);
          return record.launched &&
            typeof record.totalClicks !== "undefined" ? (
            <SimpleProgressBar
              value={clicks}
              whole={maxClicks ?? 100}
              type="clicks"
            />
          ) : record.__isSkeleton ||
            (typeof record.totalClicks === "undefined" && record?.launched) ? (
            <TitleSkeleton block={true} />
          ) : (
            <div>{columnsText("not-launched")}</div>
          );
        },
        onCell: (record: any) =>
          !record.launched ||
          record?.__isSkeleton ||
          typeof record.totalClicks === "undefined"
            ? {
                colSpan: showConversion ? 4 : 2,
                style: { width: showConversion ? 400 : 200 },
              }
            : {},
      },
      {
        dataIndex: "percentClicks",
        key: "percent-clicks",
        render: (_, record) => {
          const percent = record?.__isSkeleton
            ? 0
            : (record?.percentClicks ?? 0);
          return record.launched ? (
            <SimplePercentageCircle percent={percent} />
          ) : (
            <></>
          );
        },
        sorter: true,
        sortOrder:
          sort?.orderBy === "PERCENT_CLICKS"
            ? sort.orderDirection === "ASC"
              ? "ascend"
              : "descend"
            : null,
        onCell: (record: any) =>
          !record.launched ||
          record?.__isSkeleton ||
          typeof record.percentClicks === "undefined"
            ? { colSpan: 0 }
            : {},
        width: 100,
      },
    ];
    const conversionColumns: ColumnsType<any> = [
      {
        dataIndex: "totalConverted",
        key: "converted",
        sorter: true,
        sortOrder:
          sort?.orderBy === "TOTAL_CONVERTED"
            ? sort.orderDirection === "ASC"
              ? "ascend"
              : "descend"
            : null,
        render: (_, record) => {
          const converted = record?.__isSkeleton
            ? 0
            : (record?.totalConverted ?? 0);
          return record.launched ? (
            <SimpleProgressBar
              value={converted}
              whole={maxClicks ?? 100}
              type="converted"
            />
          ) : (
            <></>
          );
        },
        onCell: (record: any) =>
          !record.launched ||
          record?.__isSkeleton ||
          typeof record.totalConverted === "undefined"
            ? { colSpan: 0 }
            : {},
      },
      {
        dataIndex: "percentConverted",
        key: "percent-converted",
        render: (_, record) => {
          const clicks = record?.__isSkeleton ? 1 : record?.totalClicks || 1;
          const percent = record?.__isSkeleton
            ? 0
            : ((record?.totalConverted || 0) * 100) / clicks;
          return record.launched ? (
            <SimplePercentageCircle percent={percent} />
          ) : (
            <></>
          );
        },
        sorter: true,
        sortOrder:
          sort?.orderBy === "PERCENT_CONVERTED"
            ? sort.orderDirection === "ASC"
              ? "ascend"
              : "descend"
            : null,
        onCell: (record: any) =>
          !record.launched ||
          record?.__isSkeleton ||
          typeof record.percentConverted === "undefined"
            ? { colSpan: 0 }
            : {},
        width: 100,
      },
    ];
    const moreColumn: ColumnsType<any> = [
      {
        key: "more",
        render: (_, record) => (
          <Dropdown menu={{ items: [] }} trigger={["hover", "click"]}>
            <MoreOutlined className="text-xl cursor-pointer" />
          </Dropdown>
        ),
        width: 36,
      },
    ];
    return [
      ...baseDef,
      ...(showConversion ? conversionColumns : []),
      ...moreColumn,
    ]?.map((col) => {
      const isSortable = Boolean(col.sorter);
      const sortOrder = "sortOrder" in col ? col.sortOrder : null;

      return {
        ...col,
        title: (
          <span className="flex items-center gap-x-1">
            {columnsText(col.key as string)}
            {isSortable
              ? renderCampaignSortIcon({ sortOrder: sortOrder as SortOrder })
              : null}
          </span>
        ),
        ...(isSortable ? { sortIcon: () => null } : {}),
        showSorterTooltip: false,
      };
    });
  }, [
    isAnalyticsLoading,
    selectedKPI,
    maxClicks,
    showConversion,
    sort,
    loading,
    showOrganizationColumn,
    organizationNamesById,
  ]);
  return columns;
};

export const useGenerateCampaignUrlTableColumns = ({
  config,
  handleCopy,
  handleQrDownload,
  qrDownloadingUrlId,
  loading,
}: {
  config: GroupConfig<any>;
  handleCopy: any;
  handleQrDownload: (record: any) => void;
  qrDownloadingUrlId?: string | null;
  loading: boolean;
}): TableProps["columns"] => {
  const showConversion = useContext(OrganizationContext).getShowConversion();

  const columns: TableProps["columns"] = useMemo(() => {
    const baseDef: TableProps["columns"] = [
      {
        key: "channel",
        dataIndex: "channel",
        sorter: (a, b) => a.channel.name.localeCompare(b.channel.name),
        render: (_, record) => {
          return (
            <div className="m-0 text-base font-medium flex items-center">
              {loading ? (
                <SmallTitleSkeleton />
              ) : (
                (config.header("", [record])?.title ?? "")
              )}
            </div>
          );
        },
        sortIcon: ({ sortOrder }) => {
          return (
            <SmallArrowDown
              rotate={sortOrder === "ascend" ? 180 : 0}
              className={!sortOrder ? "hidden" : ""}
            />
          );
        },
        width: "20%",
      },
      {
        key: "audience",
        dataIndex: "audience",
        sorter: (a, b) =>
          (a.audience?.name || "").localeCompare(b.audience?.name || ""),
        render: (_, record) => {
          return (
            <div>
              {loading ? (
                <SmallTitleSkeleton />
              ) : (
                (config.header("", [record])?.secondary ?? "")
              )}
            </div>
          );
        },
        sortIcon: ({ sortOrder }) => {
          return (
            <SmallArrowDown
              rotate={sortOrder === "ascend" ? 180 : 0}
              className={!sortOrder ? "hidden" : ""}
            />
          );
        },
        width: 176,
      },
      {
        key: "audienceSize",
        dataIndex: "audienceSize",
        sorter: (a, b) => (a.audience?.size || 0) - (b.audience?.size || 0),
        render: (_, record) => {
          return (
            <div>
              {loading ? (
                <SmallTitleSkeleton />
              ) : (
                (() => {
                  const amount = config.getAmount?.(record);
                  return amount ? `${amount.toLocaleString()}` : "N/A";
                })()
              )}
            </div>
          );
        },
        sortIcon: ({ sortOrder }) => {
          return (
            <SmallArrowDown
              rotate={sortOrder === "ascend" ? 180 : 0}
              className={!sortOrder ? "hidden" : ""}
            />
          );
        },
        width: 148,
      },
      {
        key: "urlCopy",
        dataIndex: "urlCopy",
        render: (_, record) => {
          const copyVal = config.getCopyValue?.(record);
          return (
            <div className="flex items-center gap-x-2">
              {copyVal && record.id && (
                <QRDownloadButton
                  record={record as UrlObject}
                  handleQrDownload={handleQrDownload}
                  qrDownloadingUrlId={qrDownloadingUrlId}
                />
              )}
              {copyVal && (
                <Button
                  aria-label="Copy URL"
                  size="small"
                  icon={<img src="/images/icons/copy.svg" alt="copy" />}
                  onClick={() => handleCopy(copyVal)}
                  className="!text-[15px] !bg-secondary border !border-[#CAE5FF]"
                />
              )}
            </div>
          );
        },
        width: 124,
      },
      {
        key: "clicks",
        dataIndex: "clicks",
        sorter: (a, b) => (a.clicks || 0) - (b.clicks || 0),
        render: (_, record) => {
          const performance = loading
            ? { clicks: 0, converted: 0 }
            : config.getPerformance?.(record);
          const amount = config.getAmount?.(record);
          const whole = amount ? amount : 100;
          return config.displayPerformance(performance.clicks, whole, "clicks");
        },
        sortIcon: ({ sortOrder }) => {
          return (
            <SmallArrowDown
              rotate={sortOrder === "ascend" ? 180 : 0}
              className={!sortOrder ? "hidden" : ""}
            />
          );
        },
      },
      {
        key: "clicks-percent",
        dataIndex: "clicks-percent",
        sorter: (a, b) =>
          (a.clicks / (a.amount || 100) || 0) -
          (b.clicks / (b.amount || 100) || 0),
        render: (_, record) => {
          const performance = loading
            ? { clicks: 0, converted: 0 }
            : config.getPerformance?.(record);
          const amount = config.getAmount?.(record);
          const whole = amount ? amount : 100;
          return amount ? (
            config.displayPercentage(performance.clicks, whole)
          ) : (
            <div>N/A</div>
          );
        },
        sortIcon: ({ sortOrder }) => {
          return (
            <SmallArrowDown
              rotate={sortOrder === "ascend" ? 180 : 0}
              className={!sortOrder ? "hidden" : ""}
            />
          );
        },
        width: 136,
      },
    ];
    const conversionColumns: TableProps["columns"] = [
      {
        key: "converted",
        dataIndex: "converted",
        sorter: (a, b) => (a.converted || 0) - (b.converted || 0),
        render: (_, record) => {
          const performance = loading
            ? { clicks: 0, converted: 0 }
            : config.getPerformance?.(record);
          const amount = config.getAmount?.(record);
          const whole = amount ? amount : 100;
          return config.displayPerformance(
            performance.converted,
            whole,
            "converted",
          );
        },
        sortIcon: ({ sortOrder }) => {
          return (
            <SmallArrowDown
              rotate={sortOrder === "ascend" ? 180 : 0}
              className={!sortOrder ? "hidden" : ""}
            />
          );
        },
      },
      {
        key: "converted-percent",
        dataIndex: "converted-percent",
        sorter: (a, b) =>
          (a.converted / (a.clicks || 1) || 0) -
          (b.converted / (b.clicks || 1) || 0),
        render: (_, record) => {
          const performance = loading
            ? { clicks: 0, converted: 0 }
            : config.getPerformance?.(record);
          return config.displayPercentage(
            performance.converted,
            performance.clicks || 100,
          );
        },
        sortIcon: ({ sortOrder }) => {
          return (
            <SmallArrowDown
              rotate={sortOrder === "ascend" ? 180 : 0}
              className={!sortOrder ? "hidden" : ""}
            />
          );
        },
        width: 124,
      },
    ];
    return [...baseDef, ...(showConversion ? conversionColumns : [])]?.map(
      (col, index) => ({
        ...col,
        title: (
          <span className="block">
            {config.headerColumns(showConversion)[index]}
          </span>
        ),
        showSorterTooltip: false,
      }),
    );
  }, [
    config,
    handleCopy,
    handleQrDownload,
    loading,
    qrDownloadingUrlId,
    showConversion,
  ]);
  return columns;
};

export const useGenerateSignageActivityTableColumns = ({
  columnsText,
  setEdit,
}: {
  columnsText: UseTranslationType;
  setEdit: (record: SignageActivity) => void;
}): TableProps["columns"] => {
  return [
    {
      key: "type",
      dataIndex: "activityType",
      title: <p>{columnsText("type")}</p>,
      render: (_, record) => {
        const url = `/images/icons/signage/${signageActivityToColorIcon(record.activityType)}_${signageActivityStatusIcon(record.implementationStatus)}.svg`;
        return (
          <div className="flex justify-center w-full">
            <img src={url} alt={record.activityType} className="w-[20px]" />
          </div>
        );
      },
      width: 44,
    },
    {
      key: "statzone",
      dataIndex: "statzoneId",
      title: <p>{columnsText("stat-zone")}</p>,
      sorter: (a, b) => a.statzoneId.localeCompare(b.statzoneId),
      render: (value) => (
        <p className="text-ellipsis whitespace-nowrap">{value}</p>
      ),
      width: 90,
    },
    {
      key: "address",
      dataIndex: "address",
      title: <p>{columnsText("address")}</p>,
      sorter: (a, b) => a.address.localeCompare(b.address),
      width: 164,
      render: (value) => (
        <p className="text-ellipsis whitespace-nowrap">{value}</p>
      ),
    },
    {
      key: "comment",
      dataIndex: "comment",
      title: <p>{columnsText("comment")}</p>,
      render: (value) => (
        <p className="text-ellipsis whitespace-nowrap">{value}</p>
      ),
    },
    {
      key: "edit",
      dataIndex: "status",
      title: "",
      render: (_, record) => (
        <button
          className="border border-neutral-4 px-1 py-2 rounded-md"
          onClick={(event) => {
            event.stopPropagation();
            setEdit(record as SignageActivity);
          }}
        >
          <img src="/images/icons/pencil.svg" alt="edit" />
        </button>
      ),
      width: 44,
    },
  ];
};

export const useGenerateKalpiTableColumns = ({
  columnsText,
  config,
  getKalpiValue,
  formatValue,
}: {
  columnsText: UseTranslationType;
  config: {
    orgPrefix: string;
    iconColorField?: string;
    colors: Record<string, string>;
    gradients?: Record<string, string[]>;
  };
  getKalpiValue: (
    kalpi: KalpiFeature,
    field: string,
    orgPrefix?: string,
  ) => unknown;
  formatValue: (value: unknown) => string;
}): TableProps<KalpiFeature>["columns"] => {
  return [
    {
      title: columnsText("rank"),
      key: "rank",
      width: 86,
      sorter: (a: any, b: any) =>
        Number(getKalpiValue(a, "national_rank", config.orgPrefix) || 0) -
        Number(getKalpiValue(b, "national_rank", config.orgPrefix) || 0),
      render: (_, record: any) => {
        return (
          <KalpiRankBadge
            kalpi={record}
            orgPrefix={config.orgPrefix}
            iconColorField={config.iconColorField}
            colors={config.colors}
            gradients={config.gradients}
          />
        );
      },
    },
    {
      title: columnsText("statistical-zone"),
      key: "statistical_zone",
      width: 100,
      render: (_, record: any) =>
        formatValue(getKalpiValue(record, "statistical_zone") + ""),
      sorter: (a: any, b: any) =>
        Number(getKalpiValue(a, "statistical_zone") || 0) -
        Number(getKalpiValue(b, "statistical_zone") || 0),
    },
    {
      title: columnsText("place"),
      key: "place",
      width: 220,
      ellipsis: true,
      render: (_, record: any) =>
        formatValue(
          `${getKalpiValue(record, "location", config.orgPrefix)}, ${getKalpiValue(record, "settlement")}`,
        ),
      sorter: (a: any, b: any) =>
        formatValue(
          getKalpiValue(a, "location", config.orgPrefix),
        ).localeCompare(
          formatValue(getKalpiValue(b, "location", config.orgPrefix)),
        ),
    },
    {
      title: columnsText("fixed_rtv"),
      key: "fixed_rtv",
      width: 90,
      align: "right",
      render: (_, record: any) =>
        formatValue(getKalpiValue(record, "fixed_rtv")),
      sorter: (a: any, b: any) =>
        Number(getKalpiValue(a, "fixed_rtv") || 0) -
        Number(getKalpiValue(b, "fixed_rtv") || 0),
    },
    {
      title: columnsText("potential"),
      key: "potential",
      width: 90,
      align: "right",
      render: (_, record: any) =>
        formatValue(getKalpiValue(record, "potential", config.orgPrefix) || 0),
      sorter: (a: any, b: any) =>
        Number(getKalpiValue(a, "potential", config.orgPrefix) || 0) -
        Number(getKalpiValue(b, "potential", config.orgPrefix) || 0),
    },
  ];
};
