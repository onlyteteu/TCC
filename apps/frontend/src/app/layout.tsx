import type { Metadata } from "next";
import { IBM_Plex_Sans, Inter, Manrope } from "next/font/google";
import "./globals.css";

const headingFont = Manrope({
  subsets: ["latin"],
  variable: "--font-heading",
});

const bodyFont = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const productFont = Inter({
  subsets: ["latin"],
  variable: "--font-product",
});

export const metadata: Metadata = {
  title: "Startup Quest",
  description: "Plataforma digital para apoiar a estruturacao inicial de startups.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body className={`${headingFont.variable} ${bodyFont.variable} ${productFont.variable}`}>
        {children}
      </body>
    </html>
  );
}
