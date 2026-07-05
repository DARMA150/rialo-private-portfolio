"use client";

import React from "react";
import { DollarSign, TrendingUp, TrendingDown, ShieldAlert, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { maskValue, formatCurrency, formatPercent, cn } from "@/lib/utils";

interface PortfolioOverviewProps {
  totalPortfolioValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  realizedPnL: number;
  isPrivate: boolean;
  hasOverride: boolean;
  viewKeysCount: number;
  activeTriggersCount: number;
}

export default function PortfolioOverview({
  totalPortfolioValue,
  unrealizedPnL,
  unrealizedPnLPercent,
  realizedPnL,
  isPrivate,
  hasOverride,
  viewKeysCount,
  activeTriggersCount,
}: PortfolioOverviewProps) {
  const isUnrealizedPositive = unrealizedPnL >= 0;
  const isRealizedPositive = realizedPnL >= 0;

  const cardVariants = {
    hover: {
      y: -4,
      borderColor: "rgba(139, 92, 246, 0.3)",
      boxShadow: "0 10px 30px -10px rgba(139, 92, 246, 0.1)",
      transition: { duration: 0.2, ease: "easeOut" },
    },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* Total Value */}
      <motion.div
        variants={cardVariants}
        whileHover="hover"
        className="p-5 rounded-2xl border border-borderDark bg-surface glass-panel flex flex-col justify-between h-36 relative overflow-hidden group"
      >
        <div className="flex items-center justify-between text-textSecondary">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Portfolio Value</span>
          <div className="p-2 rounded-xl bg-accentViolet/10 text-accentViolet border border-accentViolet/20">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-3xl font-extrabold font-mono tracking-tight text-textPrimary tabular-nums">
            {maskValue(totalPortfolioValue, isPrivate, hasOverride)}
          </p>
          <p className="text-[10px] text-textSecondary mt-1 flex items-center gap-1.5 font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-accentViolet animate-ping" />
            AGGREGATED REX LEDGER
          </p>
        </div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-accentViolet/5 rounded-full blur-2xl group-hover:bg-accentViolet/10 transition-colors duration-300" />
      </motion.div>

      {/* Unrealized PnL */}
      <motion.div
        variants={cardVariants}
        whileHover="hover"
        className="p-5 rounded-2xl border border-borderDark bg-surface glass-panel flex flex-col justify-between h-36 relative overflow-hidden group"
      >
        <div className="flex items-center justify-between text-textSecondary">
          <span className="text-xs font-semibold uppercase tracking-wider">Unrealized PnL</span>
          <div
            className={cn(
              "p-2 rounded-xl border",
              isUnrealizedPositive
                ? "bg-gain/10 text-gain border-gain/20"
                : "bg-loss/10 text-loss border-loss/20"
            )}
          >
            {isUnrealizedPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
          </div>
        </div>
        <div className="mt-2">
          <p
            className={cn(
              "text-2xl font-bold font-mono tracking-tight tabular-nums",
              isPrivate && !hasOverride
                ? "text-textPrimary"
                : isUnrealizedPositive
                ? "text-gain"
                : "text-loss"
            )}
          >
            {isPrivate && !hasOverride ? (
              "••••••"
            ) : (
              <>
                {formatCurrency(unrealizedPnL)}{" "}
                <span className="text-xs font-semibold ml-1">
                  ({formatPercent(unrealizedPnLPercent)})
                </span>
              </>
            )}
          </p>
          <p className="text-[10px] text-textSecondary mt-1 font-sans">
            CURRENT ESTIMATED POSITION GAIN
          </p>
        </div>
      </motion.div>

      {/* Realized PnL */}
      <motion.div
        variants={cardVariants}
        whileHover="hover"
        className="p-5 rounded-2xl border border-borderDark bg-surface glass-panel flex flex-col justify-between h-36 relative overflow-hidden group"
      >
        <div className="flex items-center justify-between text-textSecondary">
          <span className="text-xs font-semibold uppercase tracking-wider">Realized PnL</span>
          <div
            className={cn(
              "p-2 rounded-xl border",
              isRealizedPositive
                ? "bg-gain/10 text-gain border-gain/20"
                : "bg-loss/10 text-loss border-loss/20"
            )}
          >
            {isRealizedPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
          </div>
        </div>
        <div className="mt-2">
          <p
            className={cn(
              "text-2xl font-bold font-mono tracking-tight tabular-nums",
              isPrivate && !hasOverride
                ? "text-textPrimary"
                : isRealizedPositive
                ? "text-gain"
                : "text-loss"
            )}
          >
            {maskValue(realizedPnL, isPrivate, hasOverride)}
          </p>
          <p className="text-[10px] text-textSecondary mt-1 font-sans">
            CLOSED TAXABLE CAPITAL GAINS
          </p>
        </div>
      </motion.div>

      {/* Privacy Status Card */}
      <motion.div
        variants={cardVariants}
        whileHover="hover"
        className="p-5 rounded-2xl border border-borderDark bg-surface glass-panel flex flex-col justify-between h-36 relative overflow-hidden group"
      >
        <div className="flex items-center justify-between text-textSecondary">
          <span className="text-xs font-semibold uppercase tracking-wider">Privacy Status</span>
          <div
            className={cn(
              "p-2 rounded-xl border",
              isPrivate
                ? "bg-accentEmerald/10 text-accentEmerald border-accentEmerald/20"
                : "bg-amber-500/10 text-amber-500 border-amber-500/20"
            )}
          >
            {isPrivate ? (
              <ShieldCheck className="w-4 h-4" />
            ) : (
              <ShieldAlert className="w-4 h-4" />
            )}
          </div>
        </div>
        <div className="mt-2">
          <p className="text-lg font-bold font-sans tracking-tight text-textPrimary">
            {isPrivate ? "REX Confidential" : "Public Disclosure"}
          </p>
          <p className="text-[10px] text-textSecondary mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5 font-mono">
            <span>Keys: {viewKeysCount} active</span>
            <span className="text-borderMuted">|</span>
            <span>Triggers: {activeTriggersCount} rules</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
