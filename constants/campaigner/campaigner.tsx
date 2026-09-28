import { CampaignIcon } from "@/components/Icons";
import { Dropdown } from "antd";
import { ReactNode } from "react";
import { MoreOutlined } from "@ant-design/icons";
import { BasicObject, Channel } from "@/types";

type CampaignerTableColumn = {
  key: string;
  dataIndex?: string;
  isAllOnly?: boolean;
  render?: (value: any, record: any, index: number) => ReactNode; // Define custom render
  extra?: BasicObject;
};

export const CampaignerTableTemplate: CampaignerTableColumn[] = [
  {
    dataIndex: "name",
    key: "name",
    render: (value) => (
      <h2 className="flex gap-x-2">
        <CampaignIcon />
        {value}
      </h2>
    ),
  },
  {
    dataIndex: "kpi",
    key: "kpi",
    isAllOnly: true,
  },
  {
    dataIndex: "channels",
    key: "channels",
    render: (_, record) => {
      return (
        <div className="flex gap-x-2">
          {[
            ...new Set(
              record.channels?.map((channel: Channel) => channel?.icon)
            ),
          ].map((icon, index) => (
            <img
              key={index}
              src={`/images/icons/channels/${icon}.svg`}
              className="h-4"
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
      const date = new Date(record.createdAt);
      return <p>{date.toLocaleDateString("en-GB").replace(/\//g, "-")}</p>;
    },
  },
  {
    key: "more",
    render: (_, record) => (
      <Dropdown menu={{ items: [] }} trigger={["hover", "click"]}>
        <MoreOutlined className="text-xl cursor-pointer" />
      </Dropdown>
    ),
    extra: { width: 45 },
  },
];

export const CampaignerTableComponentDef = (narrow?: boolean) => ({
  header: {
    wrapper: ({ children, ...restProps }: { children: React.ReactNode }) => (
      <thead {...restProps} className="bg-white">
        {children}
      </thead>
    ),
    cell: ({ children, ...restProps }: { children: React.ReactNode }) => (
      <th
        {...restProps}
        className="!py-2 !px-0 text-start border-b border-blue-grey-10 *:px-4 *:!border-l *:last:!border-l-0"
      >
        {children}
      </th>
    ),
  },
  body: {
    row: ({ children, ...restProps }: { children: React.ReactNode }) => (
      <tr {...restProps} className="hover:bg-blue-grey-10">
        {children}
      </tr>
    ),
    cell: ({ children, ...restProps }: { children: React.ReactNode }) => (
      <td
        {...restProps}
        className={`${
          narrow ? "!py-2" : "!py-4"
        } !px-0 border-b !border-blue-grey-10 *:px-4 *:!border-l *:last:!border-l-0`}
      >
        {children}
      </td>
    ),
  },
});

export const CAMPAIGN_STAT_VIEW: {
  name: "channels" | "audiences" | "campaigns";
  icon: ReactNode;
  dataKey: string;
}[] = [
  {
    name: "campaigns",
    icon: <CampaignIcon />,
    dataKey: "topCampaigns",
  },
  {
    name: "channels",
    icon: <img src="/images/icons/lightning.svg" alt="activity" />,
    dataKey: "topChannels",
  },
  {
    name: "audiences",
    icon: <img src="/images/icons/people.svg" alt="people" />,
    dataKey: "topAudiences",
  },
];
