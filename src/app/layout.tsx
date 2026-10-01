import type { Metadata, Viewport } from "next";
import { DM_Sans, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/lib/StoreProvider";

const bodyFont = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0f172a",
};

export const metadata: Metadata = {
  title: "LuxeStay | Luxury Hotels & Residences",
  description: "Exquisite stays, Michelin-inspired dining, and bespoke hospitality at LuxeStay Hotels & Residences.",
  keywords: ["hotel", "luxury resort", "suites", "hospitality", "reservations", "hotel management"],
  authors: [{ name: "LuxeStay Hospitality" }],
  applicationName: "LuxeStay",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LuxeStay",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#faf8f5] text-[#0f172a] selection:bg-[#c59b27] selection:text-white">
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
