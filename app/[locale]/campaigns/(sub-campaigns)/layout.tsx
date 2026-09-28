import { CAMPAIGNS_ROUTE } from "@/constants/campaigner/wizard";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { ReactNode } from "react";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { ConfigProvider } from "antd";
import CampaignProvider from "@/components/Campaigner/CampaignerProvider";
import useDirection from "@/lib/hooks/useDirection";

const colors = require("@/styles/colors");

export default function Layout({ children }: { children: ReactNode }) {
  const t = useTranslations("Campaigner.Campaigns");
  const dir = useDirection();

  return (
    <CampaignProvider>
      <ConfigProvider
        theme={{
          token: {
            borderRadius: 8,
            fontSize: 18,
            colorText: colors["neutral-7"],
          },
          components: {
            Progress: {
              defaultColor: "var(--color-blue-grey-80)",
              remainingColor: "var(--color-blue-grey-10)",
            },
          },
        }}
      >
        <div className="grid grid-rows-subCampaignLayout max-w-full mx-auto px-10 py-5 h-screen">
          <Link
            href={CAMPAIGNS_ROUTE}
            className="text-neutral-6 hover:text-neutral-4 text-lg flex items-center gap-x-2 py-2"
          >
            {dir === "ltr" ? <ArrowLeftOutlined /> : <ArrowRightOutlined />}
            {t("back")}
          </Link>
          <div className="grid grid-rows-campaignLayout w-full h-full">
            {children}
          </div>
        </div>
      </ConfigProvider>
    </CampaignProvider>
  );
}
