"use client";

import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Wallet, LogOut, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";

function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export default function RealWalletConnectButton() {
  const { publicKey, disconnect, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!publicKey) return;
    navigator.clipboard.writeText(publicKey.toBase58());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!connected || !publicKey) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accentViolet text-white text-xs font-bold hover:opacity-90 transition-opacity"
      >
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surfaceMuted border border-borderDark text-xs font-mono text-textPrimary hover:border-borderMuted transition-colors"
        title="Klik untuk copy address"
      >
        {copied ? (
          <CheckCircle className="w-3.5 h-3.5 text-accentEmerald" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
        {shortenAddress(publicKey.toBase58())}
      </button>
      <button
        onClick={() => disconnect()}
        className="p-2 rounded-xl bg-surfaceMuted border border-borderDark hover:border-red-500/50 hover:text-red-400 transition-colors"
        title="Disconnect wallet"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
