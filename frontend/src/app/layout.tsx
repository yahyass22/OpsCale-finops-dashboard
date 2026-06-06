import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TCO Repatriation Dashboard",
  description: "Compare public cloud TCO against local infrastructure costs",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
