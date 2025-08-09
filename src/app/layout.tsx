import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "@/components/ThemeRegistry";
import { tokens } from '@/theme/designSystem';
import { butler } from '@/fonts/butler';

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-playfair-display',
});

export const metadata: Metadata = {
  title: "Esquenta Startup SUmmit - Gerenciamento de Convidados",
  description: "Sistema interno para gerenciamento de convidados do evento Esquenta Startup Summit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfairDisplay.variable} ${butler.variable} antialiased`}
        style={{ background: tokens.backgroundApp, color: tokens.textPrimary }}
      >
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}