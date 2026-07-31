import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AppLayout } from "@/components/layout/app-layout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HouseFind - India's Premium Property Marketplace",
  description: "Discover India's most premium properties. Buy, sell, or rent apartments, villas, and commercial spaces across 100+ cities.",
  keywords: "real estate, property, buy home, rent apartment, India, Mumbai, Bangalore",
  openGraph: {
    title: "HouseFind - India's Premium Property Marketplace",
    description: "Find your dream home across India's top cities.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}
