"use client";

import React, { useState } from "react";
import { X, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (tx: {
    asset: string;
    type: "buy" | "sell";
    amount: number;
    price: number;
    date: string;
    walletId: string;
  }) => void;
  wallets: Array<{ id: string; name: string }>;
  prices: { [symbol: string]: number };
}

export default function AddTransactionModal({
  isOpen,
  onClose,
  onAddTransaction,
  wallets,
  prices,
}: AddTransactionModalProps) {
  const [asset, setAsset] = useState("SOL");
  const [type, setType] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [walletId, setWalletId] = useState("main");
  const [date, setDate] = useState(() => new Date().toISOString().substring(0, 16));

  const handleAssetChange = (symbol: string) => {
    setAsset(symbol);
    // Autofill current mock price for standard assets
    if (prices[symbol]) {
      setPrice(prices[symbol].toString());
    }
  };

  // Pre-load default price on mount
  React.useEffect(() => {
    if (prices[asset]) {
      setPrice(prices[asset].toString());
    }
  }, [asset, prices]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    const prc = parseFloat(price);

    if (isNaN(amt) || amt <= 0) return alert("Please enter a valid amount");
    if (isNaN(prc) || prc <= 0) return alert("Please enter a valid price");

    onAddTransaction({
      asset,
      type,
      amount: amt,
      price: prc,
      date: new Date(date).toISOString(),
      walletId,
    });

    // Reset Form
    setAmount("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Body */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="relative w-full max-w-md bg-surface border border-borderDark rounded-3xl p-6 shadow-2xl glass-panel overflow-hidden z-10"
      >
        {/* Glow Header */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accentViolet to-accentEmerald" />

        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-textPrimary">Log Private Transaction</h3>
            <p className="text-xs text-textSecondary mt-0.5">
              Secure ledger logging through Rialo REX
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-surfaceMuted border border-borderDark hover:border-borderMuted rounded-xl text-textSecondary hover:text-textPrimary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Buy/Sell Segmented Selector */}
          <div className="flex bg-background border border-borderDark p-1 rounded-xl w-full h-11 relative">
            <button
              type="button"
              onClick={() => setType("buy")}
              className={`w-1/2 rounded-lg text-xs font-bold transition-all duration-200 ${
                type === "buy"
                  ? "bg-gain/15 text-gain border border-gain/20 shadow-sm"
                  : "text-textSecondary hover:text-textPrimary"
              }`}
            >
              BUY ASSET
            </button>
            <button
              type="button"
              onClick={() => setType("sell")}
              className={`w-1/2 rounded-lg text-xs font-bold transition-all duration-200 ${
                type === "sell"
                  ? "bg-loss/15 text-loss border border-loss/20 shadow-sm"
                  : "text-textSecondary hover:text-textPrimary"
              }`}
            >
              SELL ASSET
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Asset Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                Asset Symbol
              </label>
              <select
                value={asset}
                onChange={(e) => handleAssetChange(e.target.value)}
                className="w-full bg-background border border-borderDark focus:border-accentViolet/50 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none text-textPrimary h-10 cursor-pointer"
              >
                {Object.keys(prices).map((symbol) => (
                  <option key={symbol} value={symbol}>
                    {symbol}
                  </option>
                ))}
              </select>
            </div>

            {/* Wallet Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                Ledger Account
              </label>
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full bg-background border border-borderDark focus:border-accentViolet/50 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none text-textPrimary h-10 cursor-pointer"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                Amount
              </label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full bg-background border border-borderDark focus:border-accentViolet/50 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none text-textPrimary h-10"
              />
            </div>

            {/* Price */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                Execution Price ($)
              </label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full bg-background border border-borderDark focus:border-accentViolet/50 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none text-textPrimary h-10"
              />
            </div>
          </div>

          {/* Date Time */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">
              Transaction Date & Time
            </label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full bg-background border border-borderDark focus:border-accentViolet/50 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none text-textPrimary h-10 cursor-pointer"
            />
          </div>

          {/* Privacy Callout */}
          <div className="bg-accentEmerald/5 border border-accentEmerald/15 px-3 py-2.5 rounded-xl flex items-start gap-2.5 text-[10px] text-textSecondary mt-2">
            <ShieldCheck className="w-4 h-4 text-accentEmerald shrink-0 mt-0.5" />
            <p>
              REX confidential execution automatically locks execution paths. Transaction details remain fully encrypted on-chain.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-accentViolet to-accentViolet/80 hover:from-accentViolet/90 hover:to-accentViolet text-xs font-bold rounded-xl text-white transition-all duration-200 mt-2 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
          >
            Encrypt & Commit Transaction
          </button>
        </form>
      </motion.div>
    </div>
  );
}
