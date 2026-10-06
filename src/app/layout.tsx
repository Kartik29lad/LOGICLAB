import type { Metadata } from "next";

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "LogicLab — Explore. Visualize. Understand.",
  description:
    "Interactive algorithm and data-structure learning laboratory. Explore, visualize, and understand computer science fundamentals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
