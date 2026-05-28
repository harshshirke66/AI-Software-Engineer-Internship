import type { Metadata } from "next";
import { Cormorant_Garamond, Crimson_Pro, Cinzel } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const crimson = Crimson_Pro({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "CampusCompass | Discover & Compare Colleges",
  description: "A premium, production-grade College Discovery and Decision-Making Platform for students and academics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${cormorant.variable} ${crimson.variable} ${cinzel.variable} antialiased bg-background text-foreground min-h-screen font-body`}
      >
        <div className="paper-texture" />
        <div className="vignette-overlay" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

