import { MAP_FONT_FAMILY } from "@/constants/constants";
import { ConfigProvider } from "antd";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: MAP_FONT_FAMILY,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
