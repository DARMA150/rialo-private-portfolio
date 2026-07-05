import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rialo Private Portfolio & Tax Tool",
  description: "REX Confidential Portfolio Aggregator & Reactive Smart Tax Reporter.",
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-background text-textPrimary">
        {children}
      </body>
    </html>
  );
}
