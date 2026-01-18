import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SecretConsole } from "@/components/secret-console";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
        <SecretConsole />
        {children}
      </body>
    </html>
  );
}