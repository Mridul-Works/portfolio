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
  title: "Mridul — Creative Frontend Developer",
  description:
    "Creative frontend developer building interfaces people remember — React, Next.js, TypeScript and immersive Three.js/WebGL experiences at 60fps. Open to work.",
  openGraph: {
    title: "Mridul — Creative Frontend Developer",
    description:
      "Interfaces people remember — React, Next.js, TypeScript and immersive Three.js/WebGL experiences at 60fps. Open to work.",
    type: "website",
    siteName: "Mridul — Creative Frontend Developer",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Mridul — Creative Frontend Developer",
    description:
      "Interfaces people remember — React, Next.js, TypeScript and immersive Three.js/WebGL experiences at 60fps. Open to work.",
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
