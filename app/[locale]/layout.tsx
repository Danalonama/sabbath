// app/layout.jsx
import { ConfigProvider } from "antd";

import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Provider as JotaiProvider } from "jotai";
import { notFound } from "next/navigation";
import { getDirection } from "@/lib/utils";
import { FONT_FAMILY } from "@/constants/constants";
import dynamic from "next/dynamic";
const colors = require("@/styles/colors");
import { Suspense } from "react";
import { NavigationEvents } from "../../components/General/NavigationEvents";
import { MessageProvider } from "@/components/Providers/MessageProvider";

import { ClerkProvider } from "@clerk/nextjs";

const ClientLayout = dynamic(() => import("@/components/General/ClientLayout"));

const clerkAppearance = {
  elements: {
    /* ---------- trigger button ---------- */
    organizationSwitcherTrigger: [
      "h-14 w-full rounded-xl",
      "pl-4 pr-3 gap-3",
      "border border-neutral-1",
      "bg-white hover:bg-neutral-05",
      "flex items-center justify-start",
      "shadow-sm transition",
    ].join(" "),

    /* ---------- sub‑elements inside the button ---------- */
    organizationPreviewAvatarBox: "h-10 w-10 bg-white",
    organizationPreview: "text-base font-semibold",
    organizationSwitcherTriggerIcon: "ml-auto w-5 h-5 text-neutral-5",
  },
};

/*Root Layout*/
export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
  const messages = await getMessages();
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <html lang={locale}>
      <title>Agam Insight</title>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: colors.white,
            borderRadius: 2,
            colorBgContainer: colors["antd-bg"],
            fontFamily: FONT_FAMILY,
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
        direction={getDirection(locale)}
      >
        <body className="m-0">
          <ClerkProvider appearance={clerkAppearance} publishableKey={clerkKey}>
            <NextIntlClientProvider locale={locale} messages={messages}>
              <JotaiProvider>
                <MessageProvider>
                  <ClientLayout>{children}</ClientLayout>
                </MessageProvider>
                <Suspense fallback={null}>
                  <NavigationEvents />
                </Suspense>
              </JotaiProvider>
            </NextIntlClientProvider>
          </ClerkProvider>
        </body>
      </ConfigProvider>
    </html>
  );
}
