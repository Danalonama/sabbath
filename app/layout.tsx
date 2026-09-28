import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@/styles/fonts.css";
import "@/styles/colors.css";
import "./globals.css";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <AntdRegistry>{children}</AntdRegistry>
    </html>
  );
}
