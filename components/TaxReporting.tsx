"use client";

import React, { useState, useMemo } from "react";
import { Calculator, ShieldAlert, Download, HelpCircle, Lock, Percent } from "lucide-react";
import { formatCurrency, maskValue } from "@/lib/utils";
import { motion } from "framer-motion";

interface Transaction {
  id: string;
  date: string;
  asset: string;
  type: "buy" | "sell";
  amount: number;
  price: number;
  walletId: string;
}

interface TaxReportingProps {
  transactions: Transaction[];
  selectedWalletId: string;
  isPrivate: boolean;
  hasOverride: boolean;
  canSeeTax: boolean; // Derived from View Key permission
}

export default function TaxReporting({
  transactions,
  selectedWalletId,
  isPrivate,
  hasOverride,
  canSeeTax,
}: TaxReportingProps) {
  const [taxRate, setTaxRate] = useState<number>(15);
  const [taxMethod, setTaxMethod] = useState<"FIFO" | "LIFO">("FIFO");
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Filter transactions by selected wallet
  const filteredTxs = useMemo(() => {
    return transactions.filter(
      (tx) => selectedWalletId === "all" || tx.walletId === selectedWalletId
    );
  }, [transactions, selectedWalletId]);

  // Calculate Realized PnL using FIFO or LIFO
  const realizedPnL = useMemo(() => {
    // Sort transactions chronologically
    const sortedTxs = [...filteredTxs].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let totalPnL = 0;

    // Track buys per asset: { price: number, amount: number, remaining: number }
    const buyBook: { [asset: string]: Array<{ price: number; amount: number; remaining: number }> } = {};

    for (const tx of sortedTxs) {
      const asset = tx.asset;
      if (!buyBook[asset]) {
        buyBook[asset] = [];
      }

      if (tx.type === "buy") {
        buyBook[asset].push({
          price: tx.price,
          amount: tx.amount,
          remaining: tx.amount,
        });
      } else if (tx.type === "sell") {
        let soldAmount = tx.amount;
        const queue = buyBook[asset];

        if (taxMethod === "FIFO") {
          // Take from the front of the queue
          while (soldAmount > 0 && queue.length > 0) {
            const firstBuy = queue[0];
            if (firstBuy.remaining <= soldAmount) {
              const matchedAmount = firstBuy.remaining;
              const gain = (tx.price - firstBuy.price) * matchedAmount;
              totalPnL += gain;
              soldAmount -= matchedAmount;
              queue.shift(); // Remove fully matched buy
            } else {
              const gain = (tx.price - firstBuy.price) * soldAmount;
              totalPnL += gain;
              firstBuy.remaining -= soldAmount;
              soldAmount = 0; // Fully matched the sell
            }
          }
        } else {
          // LIFO: Take from the end of the queue (stack)
          while (soldAmount > 0 && queue.length > 0) {
            const lastBuy = queue[queue.length - 1];
            if (lastBuy.remaining <= soldAmount) {
              const matchedAmount = lastBuy.remaining;
              const gain = (tx.price - lastBuy.price) * matchedAmount;
              totalPnL += gain;
              soldAmount -= matchedAmount;
              queue.pop(); // Remove fully matched buy
            } else {
              const gain = (tx.price - lastBuy.price) * soldAmount;
              totalPnL += gain;
              lastBuy.remaining -= soldAmount;
              soldAmount = 0; // Fully matched the sell
            }
          }
        }
      }
    }

    return totalPnL;
  }, [filteredTxs, taxMethod]);

  // Tax calculations
  const estimatedTax = useMemo(() => {
    if (realizedPnL <= 0) return 0;
    return realizedPnL * (taxRate / 100);
  }, [realizedPnL, taxRate]);

  const netAfterTax = useMemo(() => {
    return realizedPnL - estimatedTax;
  }, [realizedPnL, estimatedTax]);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="w-full p-6 rounded-3xl border border-borderDark bg-surface glass-panel relative overflow-hidden h-full min-h-[380px] flex flex-col justify-between">
      {/* Privacy Lock Screen if not authorized to see tax */}
      {!canSeeTax && (
        <div className="absolute inset-0 z-10 bg-background/80 backdrop-filter backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-textPrimary">Tax Access Restricted</h4>
          <p className="text-xs text-textSecondary max-w-sm mt-2">
            Viewing via restricted View Key. The tax reporting engine is scoped out of your current view permissions.
          </p>
          <p className="text-[10px] text-accentViolet font-mono mt-3 uppercase tracking-wider">
            REX Privacy Scope Lock
          </p>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2">
              <Calculator className="w-4 h-4 text-accentViolet" />
              Confidential Tax Reporter
            </h3>
            <p className="text-xs text-textSecondary mt-0.5">
              Automated REX-based capital gains matching
            </p>
          </div>
          <span className="text-[10px] bg-accentViolet/10 text-accentViolet border border-accentViolet/20 px-2 py-0.5 rounded-full font-mono font-bold">
            ZERO-KNOWLEDGE TAX
          </span>
        </div>

        {/* FIFO/LIFO Method Selector */}
        <div className="flex items-center justify-between mt-6 bg-background/50 border border-borderDark p-1 rounded-xl">
          <span className="text-xs font-semibold text-textSecondary pl-2">Matching Algorithm</span>
          <div className="flex gap-1">
            {(["FIFO", "LIFO"] as const).map((method) => (
              <button
                key={method}
                onClick={() => setTaxMethod(method)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all duration-200 ${
                  taxMethod === method
                    ? "bg-accentViolet/20 text-accentViolet border border-accentViolet/30"
                    : "text-textSecondary hover:text-textPrimary border border-transparent"
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* Realized Capital Gains Display */}
        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="bg-background/40 p-3.5 rounded-2xl border border-borderDark">
            <span className="text-[10px] text-textSecondary uppercase font-semibold">Realized Capital Gain</span>
            <p className={`text-lg font-bold font-mono tracking-tight mt-1 ${realizedPnL >= 0 ? "text-gain" : "text-loss"}`}>
              {isPrivate && !hasOverride ? "••••••" : formatCurrency(realizedPnL)}
            </p>
          </div>
          <div className="bg-background/40 p-3.5 rounded-2xl border border-borderDark">
            <span className="text-[10px] text-textSecondary uppercase font-semibold">Tax Liability</span>
            <p className="text-lg font-bold font-mono tracking-tight text-loss mt-1">
              {isPrivate && !hasOverride ? "••••••" : formatCurrency(estimatedTax)}
            </p>
          </div>
        </div>

        {/* Tax Rate Slider */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-textSecondary flex items-center gap-1">
              Estimated Tax Rate
              <span title="Mock local and capital gains rate slider">
                <HelpCircle className="w-3 h-3 text-textSecondary/60 cursor-help" />
              </span>
            </span>
            <span className="text-textPrimary font-mono font-bold flex items-center">
              <Percent className="w-3.5 h-3.5 text-accentViolet mr-0.5" />
              {taxRate}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            step="1"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
            className="w-full accent-accentViolet"
          />
          <div className="flex justify-between text-[9px] text-textSecondary/70 font-mono mt-1">
            <span>0% (Tax Haven)</span>
            <span>15% (Short-term standard)</span>
            <span>30% (Max overlay)</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {/* Net Capital Gain summary */}
        <div className="flex items-center justify-between border-t border-borderDark pt-4 text-sm font-semibold">
          <span className="text-textSecondary">Net Gain After Tax</span>
          <span className={`font-mono font-bold ${netAfterTax >= 0 ? "text-gain" : "text-loss"}`}>
            {isPrivate && !hasOverride ? "••••••" : formatCurrency(netAfterTax)}
          </span>
        </div>

        {/* Export Action */}
        <button
          onClick={handleExport}
          disabled={isExporting || exportSuccess}
          className="w-full py-2.5 bg-surfaceMuted hover:bg-surface border border-borderDark hover:border-borderMuted rounded-xl font-bold text-xs flex items-center justify-center gap-2 text-textPrimary transition-all duration-200"
        >
          {isExporting ? (
            <>
              <div className="w-3.5 h-3.5 border border-accentViolet border-t-transparent rounded-full animate-spin" />
              <span>Generating Secure PDF...</span>
            </>
          ) : exportSuccess ? (
            <span className="text-accentEmerald">Report Exported Successfully!</span>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 text-accentViolet" />
              <span>Export Tax Report (Demo)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
