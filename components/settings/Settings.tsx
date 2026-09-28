import { OrganizationSwitcher } from "@clerk/nextjs";
import OrganizationPage from "./OrganizationPage";
import { useTranslations } from "next-intl";
import ProfilePage from "./ProfilePage";
import { ApartmentOutlined, UserOutlined } from "@ant-design/icons";
import { ConfigProvider, Tabs, TabsProps } from "antd";
import { resetApolloClientStore } from "@/lib/apollo/apolloClient";
const colors = require("@/styles/colors");

const items: TabsProps["items"] = [
  {
    key: "account",
    label: "Account",
    children: <ProfilePage />,
    icon: <UserOutlined />,
  },
  {
    key: "organization",
    label: "Organization",
    children: <OrganizationPage />,
    icon: <ApartmentOutlined />,
  },
];

const SettingsPage = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: colors["info-accent"],
          borderRadius: 2,
          colorBgContainer: colors.white,
        },
        components: {
          Button: {
            //defaultColor: color.text,
            defaultBg: colors.white,
          },
          Radio: {
            buttonBg: "none",
            buttonCheckedBg: "white",
          },
        },
      }}
    >
      <div className="px-20 pt-10 flex flex-col gap-y-3">
        <LargeOrganizationSwitcher />
        <Tabs defaultActiveKey="account" items={items} />
      </div>
    </ConfigProvider>
  );
};

const LargeOrganizationSwitcher = () => {
  const t = useTranslations("Settings");

  return (
    <div className="flex flex-col gap-y-1">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <OrganizationSwitcher
        hidePersonal
        afterSelectOrganizationUrl={(organization) => {
          resetApolloClientStore();
          return "settings";
        }}
        appearance={{
          elements: {
            rootBox: "w-64",
          },
        }}
      />
    </div>
  );
};

export default SettingsPage;
