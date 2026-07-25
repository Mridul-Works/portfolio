import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif, Syne } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

// flowing serif for the chrome-script moments (Y2K liquid-metal vibe)
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mridul — Websites for Brands With Taste",
  description:
    "I design and build unforgettable websites for creative brands, studios and founders — immersive Three.js/WebGL experiences, sub-second loads, fixed quotes. Now booking limited client slots.",
  openGraph: {
    title: "Mridul — Websites for Brands With Taste",
    description:
      "Unforgettable websites for creative brands — immersive Three.js/WebGL experiences, sub-second loads, fixed quotes. Now booking limited client slots.",
    type: "website",
    siteName: "Mridul — Creative Web Developer",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Mridul — Websites for Brands With Taste",
    description:
      "Unforgettable websites for creative brands — immersive Three.js/WebGL experiences, sub-second loads, fixed quotes. Now booking limited client slots.",
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
      className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
