import type { Metadata } from "next";
import "./globals.css";
import dynamic from 'next/dynamic';

const SolanaWalletProvider = dynamic(
  () => import('@/components/SolanaWalletProvider').then((mod) => mod.SolanaWalletProvider),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "Rialo Private Portfolio",
  description: "Privacy-first portfolio & tax tool built for Rialo",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0f] text-white antialiased">
        <SolanaWalletProvider>
          {children}
        </SolanaWalletProvider>
        <footer className="border-t border-[#1f1f28] py-6 text-center text-sm text-white/50">
          Built for Rialo • Demo on Vercel style
        </footer>
      </body>
    </html>
  );
}
