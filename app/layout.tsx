import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cash Runway Tracker - Junior Miner Investment Tool",
  description: "Track cash runway for junior mining companies to avoid dilution risk",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
