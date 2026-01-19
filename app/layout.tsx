import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SecretConsole } from "@/components/secret-console";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import "@uploadthing/react/styles.css";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bio.lonestill.uk"),
  title: {
    default: "Lonestill Bio",
    template: "%s | Lonestill Bio",
  },
  description: "Create your beautiful bio page",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
        <NextIntlClientProvider messages={messages}>
          <SecretConsole />
          <AnalyticsTracker enabled={true} />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}