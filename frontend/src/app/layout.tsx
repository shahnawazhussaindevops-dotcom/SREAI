import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI SRE Control Tower — Intelligent Site Reliability Platform",
  description: "AI-powered DevOps and Site Reliability Engineering platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="particle-bg" />
        {children}
      </body>
    </html>
  );
}
