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
  title: "Mridul — Creative Web Developer",
  description:
    "Portfolio of Mridul, a creative web developer crafting immersive, interactive experiences with Three.js, WebGL and modern web tech.",
  openGraph: {
    title: "Mridul — Creative Web Developer",
    description:
      "Immersive, interactive web experiences built with Three.js, WebGL and modern web tech.",
    type: "website",
    siteName: "Mridul — Portfolio",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Mridul — Creative Web Developer",
    description:
      "Immersive, interactive web experiences built with Three.js, WebGL and modern web tech.",
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
