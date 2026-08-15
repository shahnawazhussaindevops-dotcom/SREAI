import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SREAI — God Mode Infrastructure Command Center",
  description:
    "Ultra-premium AI-powered Site Reliability Engineering platform with real-time monitoring, automated root cause analysis, and a futuristic glassmorphism dashboard.",
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
