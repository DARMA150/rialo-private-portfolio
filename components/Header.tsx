"use client";

import React, { useState } from "react";
import {
  Shield,
  ShieldAlert,
  Key,
  Plus,
  RefreshCw,
  RotateCcw,
  Eye,
  EyeOff,
  ChevronDown,
  Trash2,
  Lock,
  Unlock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import RealWalletConnectButton from "@/components/RealWalletConnectButton";

interface ViewKeyData {
  key: string;
  expiry: string;
  createdAt: number;
  permission: "read-only" | "can-see-tax" | "full-private";
  note: string;
  revoked: boolean;
}

interface HeaderProps {
  isPrivate: boolean;
  setIsPrivate: (val: boolean) => void;
  onOpenViewKey: () => void;
  onOpenAddTransaction: () => void;
  onSimulateUpdate: () => void;
  onResetDemo: () => void;
  viewKeys: ViewKeyData[];
  onRevokeKey: (keyStr: string) => void;
  activeTriggersCount: number;
  viewingKey: string | null;
  viewingPermission: string | null;
  onExitSharedView: () => void;
}

export default function Header({
  isPrivate,
  setIsPrivate,
  onOpenViewKey,
  onOpenAddTransaction,
  onSimulateUpdate,
  onResetDemo,
  viewKeys,
  onRevokeKey,
  activeTriggersCount,
  viewingKey,
  viewingPermission,
  onExitSharedView,
}: HeaderProps) {
  const [showKeysDropdown, setShowKeysDropdown] = useState(false);
  const activeKeys = viewKeys.filter((k) => !k.revoked);

  return (
    <header className="w-full flex flex-col gap-4 relative z-40">
      {/* Shared View Scoped Access Banner */}
      {viewingKey && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-accentViolet/20 border border-accentViolet/40 text-textPrimary px-4 py-3 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-sm glass-panel shadow-[0_0_20px_rgba(139,92,246,0.1)]"
        >
          <div className="flex items-center gap-3">
            <span className="p-2 bg-accentViolet/20 text-accentViolet rounded-xl border border-accentViolet/30">
              <Key className="w-4 h-4" />
            </span>
            <div>
              <p className="font-semibold text-textPrimary flex items-center gap-2">
                Viewing via REX View Key
                <span className="text-xs bg-accentViolet/30 text-accentViolet px-2 py-0.5 rounded-md font-mono">
                  {viewingKey.substring(0, 12)}...
                </span>
              </p>
              <p className="text-xs text-textSecondary mt-0.5">
                Selective disclosure mode active. Scope:{" "}
                <span className="font-semibold text-accentEmerald capitalize">
                  {viewingPermission === "full-private"
                    ? "Full Private Access"
                    : viewingPermission === "can-see-tax"
                    ? "Read-only + Tax Insights"
                    : "Read-only Portfolio"}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onExitSharedView}
            className="px-4 py-1.5 bg-background border border-borderDark hover:border-borderMuted text-xs font-semibold rounded-xl text-textPrimary transition-all duration-200"
          >
            Exit Shared View
          </button>
        </motion.div>
      )}

      {/* Main Row */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Brand Logo & Info */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-textPrimary flex items-center gap-2">
              <span className="bg-gradient-to-r from-accentViolet to-accentEmerald bg-clip-text text-transparent">
                Rialo
              </span>
              <span className="text-textSecondary font-light">|</span>
              <span className="text-sm font-semibold tracking-normal text-textPrimary bg-surfaceMuted px-2.5 py-1 rounded-xl border border-borderDark">
                Private Portfolio & Tax
              </span>
            </h1>
            <span className="text-[10px] tracking-wider font-extrabold text-accentViolet bg-accentViolet/10 border border-accentViolet/20 px-2 py-0.5 rounded-md uppercase">
              SHOWCASE
            </span>
          </div>
          <p className="text-xs text-textSecondary">
            Confidential DeFi tracker Powered by Rialo Extended Execution (REX)
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Simulate Update */}
          <button
            onClick={onSimulateUpdate}
            disabled={!!viewingKey && viewingPermission === "read-only"}
            className="flex items-center gap-1.5 px-3 py-2 bg-surface hover:bg-surfaceMuted border border-borderDark text-xs font-medium rounded-xl text-textPrimary hover:text-accentEmerald transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
            title="Simulate Event Triggers or Price Updates"
          >
            <RefreshCw className="w-3.5 h-3.5 text-accentEmerald group-hover:rotate-180 transition-transform duration-500" />
            <span className="hidden sm:inline">Simulate Update</span>
          </button>

          {/* Reset Demo */}
          <button
            onClick={onResetDemo}
            disabled={!!viewingKey && viewingPermission === "read-only"}
            className="flex items-center gap-1.5 px-3 py-2 bg-surface hover:bg-surfaceMuted border border-borderDark text-xs font-medium rounded-xl text-textPrimary hover:text-red-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Reset storage to default mockup data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* View Keys dropdown selector */}
          {!viewingKey && (
            <div className="relative">
              <button
                onClick={() => setShowKeysDropdown(!showKeysDropdown)}
                className="flex items-center gap-1.5 px-3 py-2 bg-surface hover:bg-surfaceMuted border border-borderDark text-xs font-medium rounded-xl text-textPrimary transition-all duration-200"
              >
                <Key className="w-3.5 h-3.5 text-accentViolet" />
                <span>View Keys</span>
                {activeKeys.length > 0 && (
                  <span className="w-4 h-4 flex items-center justify-center bg-accentViolet/20 text-accentViolet text-[10px] rounded-full font-bold">
                    {activeKeys.length}
                  </span>
                )}
                <ChevronDown className="w-3 h-3 text-textSecondary" />
              </button>

              <AnimatePresence>
                {showKeysDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowKeysDropdown(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-80 bg-surface border border-borderDark rounded-2xl shadow-xl z-50 p-4 flex flex-col gap-3 glass-panel"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-textPrimary">
                          Active REX View Keys
                        </span>
                        <button
                          onClick={() => {
                            setShowKeysDropdown(false);
                            onOpenViewKey();
                          }}
                          className="text-[10px] text-accentViolet hover:underline font-semibold"
                        >
                          + New Key
                        </button>
                      </div>

                      <div className="max-h-48 overflow-y-auto flex flex-col gap-2 pr-1">
                        {activeKeys.length === 0 ? (
                          <div className="text-center py-6 text-xs text-textSecondary">
                            No active viewer access keys.
                          </div>
                        ) : (
                          activeKeys.map((k) => (
                            <div
                              key={k.key}
                              className="flex items-center justify-between p-2 rounded-xl bg-background border border-borderDark text-xs"
                            >
                              <div className="flex flex-col gap-0.5 truncate max-w-[180px]">
                                <span className="font-mono text-[10px] text-accentViolet truncate">
                                  {k.key}
                                </span>
                                <span className="text-[10px] text-textSecondary truncate">
                                  Scope: {k.permission} {k.note ? `(${k.note})` : ""}
                                </span>
                              </div>
                              <button
                                onClick={() => onRevokeKey(k.key)}
                                className="p-1 hover:bg-red-500/10 text-textSecondary hover:text-red-400 rounded-md transition-colors"
                                title="Revoke Key"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
          {/* Add Transaction Button */}
          <button
            onClick={onOpenAddTransaction}
            disabled={!!viewingKey && viewingPermission === "read-only"}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-accentViolet to-accentViolet/80 hover:from-accentViolet/90 hover:to-accentViolet border border-accentViolet/20 text-xs font-semibold rounded-xl text-white transition-all duration-200 shadow-[0_0_15px_rgba(139,92,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Tx</span>
          </button>
        </div>
      </div>

      {/* Hero Header Section: Privacy Slider Control */}
      <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between p-5 rounded-3xl border border-borderDark bg-surfaceMuted/40 glass-panel gap-4">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "p-3 rounded-2xl border transition-colors",
              isPrivate
                ? "bg-accentEmerald/10 border-accentEmerald/30 text-accentEmerald"
                : "bg-amber-500/10 border-amber-500/30 text-amber-500"
            )}
          >
            {isPrivate ? (
              <Shield className="w-6 h-6 animate-pulse" />
            ) : (
              <ShieldAlert className="w-6 h-6" />
            )}
          </div>
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              REX Privacy Engine
              <span
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-bold",
                  isPrivate
                    ? "bg-accentEmerald/20 text-accentEmerald"
                    : "bg-amber-500/20 text-amber-500"
                )}
              >
                {isPrivate ? "PRIVATE BY DEFAULT (CONFIDENTIAL)" : "PUBLICLY DISCLOSED"}
              </span>
            </h2>
            <p className="text-xs text-textSecondary mt-0.5 max-w-xl">
              {isPrivate
                ? "Rialo Extended Execution protects all assets, transaction values, and PnL. Only authorized addresses or View Keys can decrypt details."
                : "Simulation displays standard cleartext view. Anyone on-chain can trace holdings, trades, and tax details."}
            </p>
          </div>
        </div>

        {/* Hero Interactive Toggle Switch */}
        <div className="flex items-center gap-2 self-center md:self-auto bg-background/50 border border-borderDark p-1 rounded-2xl relative w-64 h-12">
          {/* Segmented Control slider background */}
          <div className="absolute inset-1 flex w-[calc(100%-8px)]">
            <motion.div
              layoutId="privacy-bg"
              className={cn(
                "h-full w-1/2 rounded-xl shadow-lg border",
                isPrivate
                  ? "bg-accentEmerald/10 border-accentEmerald/30"
                  : "bg-amber-500/10 border-amber-500/30"
              )}
              animate={{
                x: isPrivate ? "100%" : "0%",
              }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
            />
          </div>

          <button
            onClick={() => setIsPrivate(false)}
            className={cn(
              "w-1/2 z-10 text-xs font-bold transition-colors duration-200 flex items-center justify-center gap-1.5 h-full",
              !isPrivate ? "text-amber-400" : "text-textSecondary hover:text-textPrimary"
            )}
          >
            <Unlock className="w-3.5 h-3.5" />
            Public View
          </button>

          <button
            onClick={() => setIsPrivate(true)}
            className={cn(
              "w-1/2 z-10 text-xs font-bold transition-colors duration-200 flex items-center justify-center gap-1.5 h-full",
              isPrivate ? "text-accentEmerald" : "text-textSecondary hover:text-textPrimary"
            )}
          >
            <Lock className="w-3.5 h-3.5" />
            REX Private
          </button>
        </div>
      </div>
    </header>
  );
}
