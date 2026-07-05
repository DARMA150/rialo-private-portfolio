"use client";

import React from "react";
import { Wallet, Shield, Combine } from "lucide-react";
import { cn } from "@/lib/utils";

interface WalletData {
  id: string;
  name: string;
  address: string;
  balance: number;
  type: "hot" | "trading" | "cold";
}

interface WalletSelectorProps {
  selectedWalletId: string;
  onSelectWallet: (id: string) => void;
  isPrivate: boolean;
  wallets: WalletData[];
  formatValue: (val: number) => string;
}

export default function WalletSelector({
  selectedWalletId,
  onSelectWallet,
  isPrivate,
  wallets,
  formatValue,
}: WalletSelectorProps) {
  // Aggregate balance
  const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-textSecondary uppercase tracking-wider flex items-center gap-2">
          <Wallet className="w-4 h-4 text-accentViolet" />
          Rialo Wallets
        </h3>
        <span className="text-xs bg-accentEmerald/10 text-accentEmerald border border-accentEmerald/20 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
          <Shield className="w-3 h-3" />
          REX SECURED
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* All Wallets Aggregated */}
        <button
          onClick={() => onSelectWallet("all")}
          className={cn(
            "relative overflow-hidden text-left p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-28 glass-panel group",
            selectedWalletId === "all"
              ? "border-accentViolet/50 bg-accentViolet/5 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
              : "border-borderDark hover:border-borderMuted hover:bg-surfaceMuted/50"
          )}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-semibold text-textSecondary uppercase group-hover:text-textPrimary transition-colors">
              Aggregated View
            </span>
            <Combine className="w-4 h-4 text-accentViolet" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold font-mono tracking-tight text-textPrimary">
              {formatValue(totalBalance)}
            </p>
            <p className="text-xs text-textSecondary font-mono mt-1">
              3 private sub-accounts
            </p>
          </div>
          {selectedWalletId === "all" && (
            <div className="absolute top-0 right-0 w-16 h-16 bg-accentViolet/10 rounded-full blur-xl" />
          )}
        </button>

        {/* Individual Wallets */}
        {wallets.map((wallet) => {
          const isActive = selectedWalletId === wallet.id;
          return (
            <button
              key={wallet.id}
              onClick={() => onSelectWallet(wallet.id)}
              className={cn(
                "relative overflow-hidden text-left p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-28 glass-panel group",
                isActive
                  ? "border-accentViolet/50 bg-accentViolet/5 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                  : "border-borderDark hover:border-borderMuted hover:bg-surfaceMuted/50"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold text-textSecondary uppercase group-hover:text-textPrimary transition-colors truncate max-w-[120px]">
                  {wallet.name}
                </span>
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    wallet.type === "cold"
                      ? "bg-blue-400"
                      : wallet.type === "trading"
                      ? "bg-amber-400"
                      : "bg-emerald-400"
                  )}
                />
              </div>
              <div className="mt-2">
                <p className="text-xl font-bold font-mono tracking-tight text-textPrimary">
                  {formatValue(wallet.balance)}
                </p>
                <p className="text-xs text-textSecondary font-mono mt-1 truncate">
                  {wallet.address}
                </p>
              </div>
              {isActive && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-accentViolet/10 rounded-full blur-xl" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
