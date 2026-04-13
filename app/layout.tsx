import type { Metadata } from "next";
import "./globals.css";
import { UnderwritingProvider } from "@/context/UnderwritingContext";

export const metadata: Metadata = {
  title: "Aura Underwriting",
  description: "AI-powered underwriting workflow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:FILL@0..1"
        />
      </head>
      <body>
        <UnderwritingProvider>{children}</UnderwritingProvider>
      </body>
    </html>
  );
}
