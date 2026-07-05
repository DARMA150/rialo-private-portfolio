"use client";

import React, { useState } from "react";
import { Zap, Play, Trash2, CheckCircle, ShieldAlert, Plus, ToggleLeft, ToggleRight, X } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface TriggerData {
  id: string;
  asset: string;
  condition: "drops_below" | "rises_above";
  value: number;
  action: "rebalance_usdc" | "sell_all" | "alert_only";
  actionPercent: number;
  active: boolean;
  lastExecuted: string | null;
}

interface ReactiveTriggersProps {
  triggers: TriggerData[];
  onAddTrigger: (trigger: {
    asset: string;
    condition: "drops_below" | "rises_above";
    value: number;
    action: "rebalance_usdc" | "sell_all" | "alert_only";
    actionPercent: number;
  }) => void;
  onToggleTrigger: (id: string) => void;
  onDeleteTrigger: (id: string) => void;
  prices: { [symbol: string]: number };
}

export default function ReactiveTriggers({
  triggers,
  onAddTrigger,
  onToggleTrigger,
  onDeleteTrigger,
  prices,
}: ReactiveTriggersProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [asset, setAsset] = useState("SOL");
  const [condition, setCondition] = useState<"drops_below" | "rises_above">("drops_below");
  const [value, setValue] = useState("");
  const [action, setAction] = useState<"rebalance_usdc" | "sell_all" | "alert_only">("rebalance_usdc");
  const [actionPercent, setActionPercent] = useState<number>(50);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const threshold = parseFloat(value);
    if (isNaN(threshold) || threshold <= 0) return alert("Please enter a valid threshold price");

    onAddTrigger({
      asset,
      condition,
      value: threshold,
      action,
      actionPercent: action === "alert_only" ? 0 : actionPercent,
    });

    setValue("");
    setShowAddForm(false);
  };

  const activeCount = triggers.filter((t) => t.active).length;

  return (
    <div className="w-full p-6 rounded-3xl border border-borderDark bg-surface glass-panel flex flex-col gap-5 h-full relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-accentEmerald animate-pulse" />
            Reactive Execution Triggers
          </h3>
          <p className="text-xs text-textSecondary mt-0.5">
            Native smart rules executing directly on-chain without keepers
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1 px-3 py-1.5 bg-accentEmerald/10 hover:bg-accentEmerald/20 border border-accentEmerald/20 hover:border-accentEmerald/30 rounded-xl text-xs font-bold text-accentEmerald transition-all duration-200"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Trigger</span>
        </button>
      </div>

      {/* Info Callout */}
      <div className="bg-accentEmerald/5 border border-accentEmerald/15 p-3 rounded-2xl text-[10.5px] text-textSecondary/90 leading-relaxed">
        <ShieldAlert className="w-4 h-4 text-accentEmerald shrink-0 inline mr-2 align-middle" />
        <span className="font-semibold text-textPrimary">Rialo Reactive Smart Contracts</span>: Unlike conventional chains requiring external keepers (Chainlink/Keepers) or off-chain scripts, Rialo allows portfolios to listen for market events and execute self-custodial trades natively within the protocol.
      </div>

      {/* Triggers List */}
      <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[300px] pr-1">
        {triggers.length === 0 ? (
          <div className="text-center py-8 text-xs text-textSecondary">
            No reactive triggers active. Add one using the top right button!
          </div>
        ) : (
          triggers.map((t) => {
            const currentPrice = prices[t.asset] || 0;
            const percentageToThreshold = ((t.value - currentPrice) / currentPrice) * 100;

            return (
              <div
                key={t.id}
                className={cn(
                  "p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background/50",
                  t.active
                    ? "border-borderDark hover:border-accentEmerald/30"
                    : "border-borderDark/40 opacity-60"
                )}
              >
                {/* Rule Info */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-textPrimary flex items-center gap-1.5">
                      {t.asset}
                      <span className="font-mono text-[10px] text-textSecondary font-semibold">
                        (Current: {formatCurrency(currentPrice)})
                      </span>
                    </span>
                    <span
                      className={cn(
                        "text-[9px] px-2 py-0.5 rounded-full font-bold",
                        t.condition === "drops_below"
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-green-500/10 text-green-400 border border-green-500/20"
                      )}
                    >
                      {t.condition === "drops_below" ? "Drops Below" : "Rises Above"}{" "}
                      {formatCurrency(t.value)}
                    </span>
                  </div>

                  {/* Actions */}
                  <p className="text-xs text-textSecondary leading-normal">
                    Action:{" "}
                    <span className="font-semibold text-textPrimary">
                      {t.action === "rebalance_usdc"
                        ? `Rebalance ${t.actionPercent}% holdings to USDC`
                        : t.action === "sell_all"
                        ? "Liquidate 100% holdings to USDC"
                        : "Send Private Alert Notification"}
                    </span>
                  </p>

                  {/* Last Trigger Run */}
                  {t.lastExecuted ? (
                    <span className="text-[10px] text-accentEmerald font-mono font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Executed: {new Date(t.lastExecuted).toLocaleTimeString()}
                    </span>
                  ) : (
                    <span className="text-[10px] text-textSecondary font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      Awaiting trigger conditions
                    </span>
                  )}
                </div>

                {/* Operations */}
                <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-0 border-borderDark pt-3 sm:pt-0">
                  {/* Status Toggle */}
                  <button
                    onClick={() => onToggleTrigger(t.id)}
                    className="p-1 hover:bg-surfaceMuted rounded-lg transition-colors"
                    title={t.active ? "Pause Trigger" : "Activate Trigger"}
                  >
                    {t.active ? (
                      <ToggleRight className="w-7 h-7 text-accentEmerald" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-textSecondary" />
                    )}
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => onDeleteTrigger(t.id)}
                    className="p-2 bg-surface hover:bg-red-500/10 text-textSecondary hover:text-red-400 border border-borderDark hover:border-red-500/20 rounded-xl transition-all duration-200"
                    title="Delete Rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Trigger Modal Overlay */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-md"
              onClick={() => setShowAddForm(false)}
            />

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-surface border border-borderDark rounded-3xl p-6 shadow-2xl glass-panel z-10"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-textPrimary">Create Reactive Rule</h3>
                  <p className="text-xs text-textSecondary mt-0.5">
                    Define self-executing conditions on-chain
                  </p>
                </div>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-1.5 hover:bg-surfaceMuted border border-borderDark rounded-xl text-textSecondary hover:text-textPrimary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Asset Select */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                      Asset
                    </label>
                    <select
                      value={asset}
                      onChange={(e) => setAsset(e.target.value)}
                      className="w-full bg-background border border-borderDark rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none text-textPrimary h-10 cursor-pointer"
                    >
                      {Object.keys(prices).map((symbol) => (
                        <option key={symbol} value={symbol}>
                          {symbol}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Condition Select */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                      Condition
                    </label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value as any)}
                      className="w-full bg-background border border-borderDark rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none text-textPrimary h-10 cursor-pointer"
                    >
                      <option value="drops_below">Drops Below</option>
                      <option value="rises_above">Rises Above</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Value */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                      Price Threshold ($)
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder={`Current: ${prices[asset] || ""}`}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      required
                      className="w-full bg-background border border-borderDark rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none text-textPrimary h-10"
                    />
                  </div>

                  {/* Action Select */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                      Action Execute
                    </label>
                    <select
                      value={action}
                      onChange={(e) => setAction(e.target.value as any)}
                      className="w-full bg-background border border-borderDark rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none text-textPrimary h-10 cursor-pointer"
                    >
                      <option value="rebalance_usdc">Rebalance to USDC</option>
                      <option value="sell_all">Liquidate to USDC</option>
                      <option value="alert_only">Alert Only</option>
                    </select>
                  </div>
                </div>

                {/* Percentage slider if rebalance */}
                {action === "rebalance_usdc" && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                        Rebalance Portfolio Share
                      </label>
                      <span className="font-mono font-bold text-accentEmerald">{actionPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={actionPercent}
                      onChange={(e) => setActionPercent(Number(e.target.value))}
                      className="w-full accent-accentEmerald"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-accentEmerald to-emerald-600 text-xs font-bold rounded-xl text-white transition-all duration-200 mt-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  Deploy Smart Trigger
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
