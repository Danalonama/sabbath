import CampaignProvider from "@/components/Campaigner/CampaignerProvider";
import { ConfigProvider } from "antd";
import { ReactNode } from "react";
const colors = require("@/styles/colors.ts");

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <CampaignProvider>
        <ConfigProvider
          theme={{
            token: {
              colorBgContainer: "transparent",
              colorPrimary: colors["campaigner-accent"],
              borderRadius: 0,
            },
            components: {
              Tabs: {
                cardBg: colors["blue-grey-5"],
                itemSelectedColor: colors["neutral-7"],
                itemActiveColor: colors["neutral-7"],
                cardGutter: 0,
              },
              Progress: {
                defaultColor: "var(--color-blue-grey-80)",
                remainingColor: "var(--color-blue-grey-10)",
              },
            },
          }}
        >
          <main className="bg-white w-full h-full">{children}</main>
        </ConfigProvider>
      </CampaignProvider>

      <style>{`
      .ant-tabs-card > .ant-tabs-nav::before {
        border-bottom: 0 !important;
        }

      /* Stretched Tabs style */
      .stretch-tabs .ant-tabs-nav {
        width: 100%;
      }

      .stretch-tabs .ant-tabs-nav-list {
        display: flex;
        width: 100%;
      }

      .stretch-tabs .ant-tabs-tab {
        flex: 1;           
        text-align: center; 
        display: flex;
        justify-content: center;
      }
      `}</style>
    </>
  );
}
