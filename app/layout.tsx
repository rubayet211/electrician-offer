import type { Metadata } from "next";
import { fontSans, fontDisplay, fontMono } from "@/lib/fonts";
import { parsedClientConfig } from "@/config/client.config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(`https://${parsedClientConfig.business.domain}`),
  title: {
    template: parsedClientConfig.seo.titleTemplate,
    default: parsedClientConfig.business.name,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable}`}>
      <body className="min-h-screen bg-paper text-ink font-sans antialiased selection:bg-amber selection:text-ink flex flex-col">
        {children}
      </body>
    </html>
  );
}
