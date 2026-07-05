"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "@/components/Header";
import PortfolioOverview from "@/components/PortfolioOverview";
import WalletSelector from "@/components/WalletSelector";
import AssetAllocation from "@/components/AssetAllocation";
import HistoryChart from "@/components/HistoryChart";
import TaxReporting from "@/components/TaxReporting";
import TransactionsTable from "@/components/TransactionsTable";
import AddTransactionModal from "@/components/AddTransactionModal";
import ViewKeyModal from "@/components/ViewKeyModal";
import ReactiveTriggers from "@/components/ReactiveTriggers";
import { Zap, Bell, CheckCircle, ShieldAlert } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

// Types
interface Transaction {
  id: string;
  date: string;
  asset: string;
  type: "buy" | "sell";
  amount: number;
  price: number;
  walletId: string;
}

interface WalletData {
  id: string;
  name: string;
  address: string;
  balance: number;
  type: "hot" | "trading" | "cold";
}

interface ViewKeyData {
  key: string;
  expiry: string;
  createdAt: number;
  permission: "read-only" | "can-see-tax" | "full-private";
  note: string;
  revoked: boolean;
}

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

interface ToastNotification {
  id: string;
  message: string;
  type: "success" | "warning" | "info";
}

// Initial Mock Datasets
const DEFAULT_WALLETS: WalletData[] = [
  { id: "main", name: "Main Wallet", address: "0xri_main_8f2a", balance: 0, type: "hot" },
  { id: "trading", name: "Trading Account", address: "0xri_trade_4b8c", balance: 0, type: "trading" },
  { id: "cold", name: "Cold Ledger", address: "0xri_cold_1d3e", balance: 0, type: "cold" },
];

const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: "tx_1", date: "2026-06-10T12:00:00Z", asset: "USDC", type: "buy", amount: 1200, price: 1.00, walletId: "main" },
  { id: "tx_2", date: "2026-06-15T10:00:00Z", asset: "SOL", type: "buy", amount: 120, price: 135.00, walletId: "main" },
  { id: "tx_3", date: "2026-06-18T14:30:00Z", asset: "ETH", type: "buy", amount: 3.5, price: 2900.00, walletId: "main" },
  { id: "tx_4", date: "2026-06-20T08:15:00Z", asset: "BTC", type: "buy", amount: 0.8, price: 61200.00, walletId: "trading" },
  { id: "tx_5", date: "2026-06-22T19:00:00Z", asset: "ETH", type: "buy", amount: 1.5, price: 3100.00, walletId: "trading" },
  { id: "tx_6", date: "2026-06-25T11:45:00Z", asset: "RIA", type: "buy", amount: 4500, price: 9.80, walletId: "cold" },
  { id: "tx_7", date: "2026-06-26T16:20:00Z", asset: "SOL", type: "buy", amount: 150, price: 140.00, walletId: "cold" },
  { id: "tx_8", date: "2026-06-29T15:00:00Z", asset: "BTC", type: "sell", amount: 0.2, price: 63500.00, walletId: "trading" },
];

const DEFAULT_TRIGGERS: TriggerData[] = [
  {
    id: "trig_1",
    asset: "SOL",
    condition: "drops_below",
    value: 145.00,
    action: "rebalance_usdc",
    actionPercent: 50,
    active: true,
    lastExecuted: null,
  },
  {
    id: "trig_2",
    asset: "ETH",
    condition: "rises_above",
    value: 3500.00,
    action: "sell_all",
    actionPercent: 100,
    active: true,
    lastExecuted: null,
  },
  {
    id: "trig_3",
    asset: "RIA",
    condition: "drops_below",
    value: 10.00,
    action: "alert_only",
    actionPercent: 0,
    active: true,
    lastExecuted: null,
  },
];

const INITIAL_PRICES = {
  SOL: 152.40,
  ETH: 3240.50,
  BTC: 64500.00,
  RIA: 12.80,
  USDC: 1.00,
};

const ASSET_METADATA = {
  SOL: { name: "Solana", color: "#a855f7" },
  ETH: { name: "Ethereum", color: "#6366f1" },
  BTC: { name: "Bitcoin", color: "#f59e0b" },
  RIA: { name: "Rialo Token", color: "#10b981" },
  USDC: { name: "USD Coin", color: "#06b6d4" },
};

export default function Page() {
  const [mounted, setMounted] = useState(false);

  // States
  const [isPrivate, setIsPrivate] = useState<boolean>(true);
  const [selectedWalletId, setSelectedWalletId] = useState<string>("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [triggers, setTriggers] = useState<TriggerData[]>([]);
  const [viewKeys, setViewKeys] = useState<ViewKeyData[]>([]);
  const [prices, setPrices] = useState<{ [symbol: string]: number }>(INITIAL_PRICES);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Shared View Access parameters
  const [viewingKey, setViewingKey] = useState<string | null>(null);
  const [viewingPermission, setViewingPermission] = useState<
    "read-only" | "can-see-tax" | "full-private" | null
  >(null);

  // Modals
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isViewKeyOpen, setIsViewKeyOpen] = useState(false);

  // Load Initial Data from localStorage or Fallback Defaults
  useEffect(() => {
    setMounted(true);

    const storedTxs = localStorage.getItem("rialo_transactions");
    const storedTriggers = localStorage.getItem("rialo_triggers");
    const storedKeys = localStorage.getItem("rialo_viewkeys");
    const storedPrivate = localStorage.getItem("rialo_private");
    const storedPrices = localStorage.getItem("rialo_prices");

    if (storedTxs) setTransactions(JSON.parse(storedTxs));
    else setTransactions(DEFAULT_TRANSACTIONS);

    if (storedTriggers) setTriggers(JSON.parse(storedTriggers));
    else setTriggers(DEFAULT_TRIGGERS);

    if (storedKeys) setViewKeys(JSON.parse(storedKeys));
    else setViewKeys([]);

    if (storedPrivate) setIsPrivate(JSON.parse(storedPrivate));

    if (storedPrices) setPrices(JSON.parse(storedPrices));
    else setPrices(INITIAL_PRICES);

    // Read URL for shared view key parameters
    const params = new URLSearchParams(window.location.search);
    const keyParam = params.get("viewKey");
    if (keyParam) {
      const keysList: ViewKeyData[] = storedKeys ? JSON.parse(storedKeys) : [];
      const match = keysList.find((k) => k.key === keyParam && !k.revoked);
      if (match) {
        setViewingKey(match.key);
        setViewingPermission(match.permission);
        showToast(`Logged in via View Key: Scoped permissions active`, "success");
      } else {
        // Fallback for demo: if URL has viewKey but no localStorage matches, generate one temporarily
        setViewingKey(keyParam);
        setViewingPermission("can-see-tax"); // default demo scope
        showToast("Shared view mode active (Demo view key loaded)", "info");
      }
    }
  }, []);

  // Sync state modifications to localStorage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("rialo_transactions", JSON.stringify(transactions));
  }, [transactions, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("rialo_triggers", JSON.stringify(triggers));
  }, [triggers, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("rialo_viewkeys", JSON.stringify(viewKeys));
  }, [viewKeys, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("rialo_private", JSON.stringify(isPrivate));
  }, [isPrivate, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("rialo_prices", JSON.stringify(prices));
  }, [prices, mounted]);

  // Toast helper
  const showToast = (message: string, type: "success" | "warning" | "info" = "info") => {
    const id = `toast_${Math.random().toString(36).substring(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  // Reset Demo Action
  const handleResetDemo = () => {
    setTransactions(DEFAULT_TRANSACTIONS);
    setTriggers(DEFAULT_TRIGGERS);
    setViewKeys([]);
    setPrices(INITIAL_PRICES);
    setIsPrivate(true);
    setViewingKey(null);
    setViewingPermission(null);
    // Clear URL query
    if (typeof window !== "undefined") {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    showToast("Application states successfully restored to defaults.", "success");
  };

  // Exit Shared View Mode
  const handleExitSharedView = () => {
    setViewingKey(null);
    setViewingPermission(null);
    if (typeof window !== "undefined") {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    showToast("Exited shared view mode. Returned to owner interface.", "info");
  };

  // Dynamic calculation of holdings
  const holdings = useMemo(() => {
    const map: { [symbol: string]: { amount: number; totalCost: number; avgBuyPrice: number } } = {};

    // Initialize map
    Object.keys(prices).forEach((symbol) => {
      map[symbol] = { amount: 0, totalCost: 0, avgBuyPrice: 0 };
    });

    // Chronologically process transactions for selected wallet
    const sortedTxs = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sortedTxs.forEach((tx) => {
      // Filter by active wallet if specified
      if (selectedWalletId !== "all" && tx.walletId !== selectedWalletId) return;

      const item = map[tx.asset];
      if (!item) return;

      if (tx.type === "buy") {
        const newAmount = item.amount + tx.amount;
        const newCost = item.totalCost + tx.amount * tx.price;
        item.avgBuyPrice = newAmount > 0 ? newCost / newAmount : 0;
        item.amount = newAmount;
        item.totalCost = newCost;
      } else if (tx.type === "sell") {
        // Decrease amount, cost basis decreases proportionally
        const newAmount = Math.max(0, item.amount - tx.amount);
        item.totalCost = newAmount * item.avgBuyPrice;
        item.amount = newAmount;
      }
    });

    return map;
  }, [transactions, prices, selectedWalletId]);

  // Asset allocation array
  const assetAllocation = useMemo(() => {
    let totalVal = 0;
    const items = Object.entries(holdings).map(([symbol, data]) => {
      const currentPrice = prices[symbol] || 0;
      const value = data.amount * currentPrice;
      totalVal += value;

      const meta = ASSET_METADATA[symbol as keyof typeof ASSET_METADATA] || {
        name: symbol,
        color: "#ccc",
      };

      return {
        symbol,
        name: meta.name,
        amount: data.amount,
        value,
        percent: 0, // will compute below
        color: meta.color,
      };
    });

    return items
      .map((item) => ({
        ...item,
        percent: totalVal > 0 ? (item.value / totalVal) * 100 : 0,
      }))
      .filter((i) => i.amount > 0)
      .sort((a, b) => b.value - a.value);
  }, [holdings, prices]);

  // Derived Header KPI stats
  const totalPortfolioValue = useMemo(() => {
    return assetAllocation.reduce((acc, a) => acc + a.value, 0);
  }, [assetAllocation]);

  const totalCostBasis = useMemo(() => {
    return Object.entries(holdings).reduce((acc, [symbol, data]) => {
      // Only add assets which currently have balances
      if (data.amount > 0) {
        return acc + data.amount * data.avgBuyPrice;
      }
      return acc;
    }, 0);
  }, [holdings]);

  const unrealizedPnL = useMemo(() => {
    return totalPortfolioValue - totalCostBasis;
  }, [totalPortfolioValue, totalCostBasis]);

  const unrealizedPnLPercent = useMemo(() => {
    return totalCostBasis > 0 ? (unrealizedPnL / totalCostBasis) * 100 : 0;
  }, [unrealizedPnL, totalCostBasis]);

  // Realized PnL matching logic for KPI
  const realizedPnL = useMemo(() => {
    const sortedTxs = [...transactions]
      .filter((tx) => selectedWalletId === "all" || tx.walletId === selectedWalletId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let totalPnL = 0;
    const buyBook: { [asset: string]: Array<{ price: number; amount: number; remaining: number }> } = {};

    sortedTxs.forEach((tx) => {
      const asset = tx.asset;
      if (!buyBook[asset]) buyBook[asset] = [];

      if (tx.type === "buy") {
        buyBook[asset].push({ price: tx.price, amount: tx.amount, remaining: tx.amount });
      } else if (tx.type === "sell") {
        let sold = tx.amount;
        const queue = buyBook[asset];

        // Standard FIFO realized calculation for the Hero KPI
        while (sold > 0 && queue.length > 0) {
          const firstBuy = queue[0];
          if (firstBuy.remaining <= sold) {
            totalPnL += (tx.price - firstBuy.price) * firstBuy.remaining;
            sold -= firstBuy.remaining;
            queue.shift();
          } else {
            totalPnL += (tx.price - firstBuy.price) * sold;
            firstBuy.remaining -= sold;
            sold = 0;
          }
        }
      }
    });

    return totalPnL;
  }, [transactions, selectedWalletId]);

  // Wallet list for sub-wallets selector (calculating dynamic aggregations)
  const walletsListWithBalances = useMemo(() => {
    return DEFAULT_WALLETS.map((w) => {
      // Calculate dynamic value of holdings in this specific wallet
      let walletValue = 0;

      // Filter transactions related only to this wallet
      const walletTxs = transactions.filter((t) => t.walletId === w.id);
      const walletHoldings: { [symbol: string]: number } = {};

      walletTxs.forEach((tx) => {
        if (!walletHoldings[tx.asset]) walletHoldings[tx.asset] = 0;
        if (tx.type === "buy") walletHoldings[tx.asset] += tx.amount;
        else walletHoldings[tx.asset] = Math.max(0, walletHoldings[tx.asset] - tx.amount);
      });

      Object.entries(walletHoldings).forEach(([symbol, amount]) => {
        walletValue += amount * (prices[symbol] || 0);
      });

      return {
        ...w,
        balance: walletValue,
      };
    });
  }, [transactions, prices]);

  // Simulate price changes and trigger REX execution checks
  const handleSimulateUpdate = () => {
    // Generate new prices
    const newPrices = { ...prices };
    const logs: string[] = [];

    // Induce some volatile movements to satisfy triggers
    // SOL falls by ~8% (from 152 to ~140, triggering the drops below 145 trigger)
    newPrices.SOL = Math.round(prices.SOL * (0.91 + Math.random() * 0.02) * 100) / 100;
    // ETH rises by ~9% (from 3240 to ~3530, triggering rises above 3500 trigger)
    newPrices.ETH = Math.round(prices.ETH * (1.08 + Math.random() * 0.02) * 100) / 100;
    // RIA drops by ~23% (from 12.8 to ~9.8, triggering drops below 10 trigger)
    newPrices.RIA = Math.round(prices.RIA * (0.76 + Math.random() * 0.02) * 100) / 100;
    // BTC fluctuates slightly
    newPrices.BTC = Math.round(prices.BTC * (0.99 + Math.random() * 0.02) * 100) / 100;

    setPrices(newPrices);
    logs.push("Global on-chain ticker feed updated.");

    // Evaluate active triggers using the newly updated prices
    const updatedTriggers = [...triggers];
    const newTransactions = [...transactions];

    let triggersRunCount = 0;

    updatedTriggers.forEach((trig) => {
      if (!trig.active || trig.lastExecuted) return;

      const currentPrice = newPrices[trig.asset];
      if (!currentPrice) return;

      let isTriggered = false;
      if (trig.condition === "drops_below" && currentPrice <= trig.value) {
        isTriggered = true;
      } else if (trig.condition === "rises_above" && currentPrice >= trig.value) {
        isTriggered = true;
      }

      if (isTriggered) {
        trig.lastExecuted = new Date().toISOString();
        triggersRunCount++;

        // Calculate trade sizing
        const currentHolding = holdings[trig.asset]?.amount || 0;

        if (trig.action === "alert_only") {
          showToast(
            `REX PRIVATE ALERT: ${trig.asset} reached threshold ${formatCurrency(trig.value)}. Event triggered.`,
            "warning"
          );
        } else if (currentHolding > 0) {
          const percent = trig.action === "sell_all" ? 100 : trig.actionPercent;
          const sellAmount = (currentHolding * percent) / 100;

          if (sellAmount > 0) {
            // Append liquidation transaction
            const tradeTx: Transaction = {
              id: `tx_${Math.random().toString(36).substring(2, 9)}`,
              date: new Date().toISOString(),
              asset: trig.asset,
              type: "sell",
              amount: sellAmount,
              price: currentPrice,
              walletId: "main", // executes inside main wallet for mock simplicity
            };

            newTransactions.push(tradeTx);

            // Also credit USDC
            const usdcTx: Transaction = {
              id: `tx_${Math.random().toString(36).substring(2, 9)}`,
              date: new Date().toISOString(),
              asset: "USDC",
              type: "buy",
              amount: sellAmount * currentPrice,
              price: 1.00,
              walletId: "main",
            };
            newTransactions.push(usdcTx);

            showToast(
              `REX REACTIVE ORDER: ${trig.asset} conditions met. Sold ${sellAmount.toFixed(
                2
              )} ${trig.asset} to USDC.`,
              "success"
            );
          }
        }
      }
    });

    if (triggersRunCount > 0) {
      setTriggers(updatedTriggers);
      setTransactions(newTransactions);
    } else {
      showToast("Prices fluctuated. No active trigger thresholds crossed.", "info");
    }
  };

  // Add Transaction Handler
  const handleAddTransaction = (tx: Omit<Transaction, "id">) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx_${Math.random().toString(36).substring(2, 9)}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Transaction logged: ${tx.type === "buy" ? "Bought" : "Sold"} ${tx.amount} ${tx.asset}`, "success");
  };

  // View Key Creation
  const handleGenerateViewKey = (keyData: Omit<ViewKeyData, "createdAt" | "revoked">) => {
    const newKey: ViewKeyData = {
      ...keyData,
      createdAt: Date.now(),
      revoked: false,
    };
    setViewKeys((prev) => [...prev, newKey]);
    showToast(`REX View Key registered: permissions scope locked.`, "success");
  };

  // View Key Revoke
  const handleRevokeKey = (keyStr: string) => {
    setViewKeys((prev) =>
      prev.map((k) => (k.key === keyStr ? { ...k, revoked: true } : k))
    );
    showToast("Decryption delegation key revoked immediately.", "warning");
    if (viewingKey === keyStr) {
      handleExitSharedView();
    }
  };

  // Add Trigger handler
  const handleAddTrigger = (trigData: Omit<TriggerData, "id" | "active" | "lastExecuted">) => {
    const newTrig: TriggerData = {
      ...trigData,
      id: `trig_${Math.random().toString(36).substring(2, 9)}`,
      active: true,
      lastExecuted: null,
    };
    setTriggers((prev) => [...prev, newTrig]);
    showToast(`Smart Trigger configured for ${trigData.asset}.`, "success");
  };

  // Toggle Trigger Active
  const handleToggleTrigger = (id: string) => {
    setTriggers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t))
    );
  };

  // Delete Trigger
  const handleDeleteTrigger = (id: string) => {
    setTriggers((prev) => prev.filter((t) => t.id !== id));
    showToast("Smart trigger removed from chain state.", "info");
  };

  // Scope permissions checks
  const hasOverride = useMemo(() => {
    if (!viewingKey) return false;
    return viewingPermission === "full-private" || viewingPermission === "can-see-tax";
  }, [viewingKey, viewingPermission]);

  const canSeeTax = useMemo(() => {
    // Owner can always see tax
    if (!viewingKey) return true;
    // Shared viewers need can-see-tax or full-private scope
    return viewingPermission === "can-see-tax" || viewingPermission === "full-private";
  }, [viewingKey, viewingPermission]);

  const formatValue = (val: number) => {
    return isPrivate && !hasOverride ? "••••••" : formatCurrency(val);
  };

  const walletNames = {
    all: "All Wallets",
    main: "Main Wallet",
    trading: "Trading Account",
    cold: "Cold Ledger",
  };

  if (!mounted) {
    return (
      <div className="w-full min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accentViolet border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider font-mono">
            Rialo Private Ledger Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen relative overflow-hidden flex flex-col justify-between pb-12">
      {/* Decorative Glow Dots */}
      <div className="glow-bg bg-accentViolet/10 w-96 h-96 top-[-100px] left-[-100px]" />
      <div className="glow-bg bg-accentEmerald/5 w-80 h-80 bottom-[-50px] right-[-50px]" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full flex flex-col gap-6 pt-6 z-10">
        {/* Header section */}
        <Header
          isPrivate={isPrivate}
          setIsPrivate={setIsPrivate}
          onOpenViewKey={() => setIsViewKeyOpen(true)}
          onOpenAddTransaction={() => setIsAddTxOpen(true)}
          onSimulateUpdate={handleSimulateUpdate}
          onResetDemo={handleResetDemo}
          viewKeys={viewKeys}
          onRevokeKey={handleRevokeKey}
          activeTriggersCount={triggers.filter((t) => t.active).length}
          viewingKey={viewingKey}
          viewingPermission={viewingPermission}
          onExitSharedView={handleExitSharedView}
        />

        {/* Multi-Wallet Aggregate Tab Selector */}
        <WalletSelector
          selectedWalletId={selectedWalletId}
          onSelectWallet={setSelectedWalletId}
          isPrivate={isPrivate}
          wallets={walletsListWithBalances}
          formatValue={formatValue}
        />

        {/* Hero KPIs Summary Grid */}
        <PortfolioOverview
          totalPortfolioValue={totalPortfolioValue}
          unrealizedPnL={unrealizedPnL}
          unrealizedPnLPercent={unrealizedPnLPercent}
          realizedPnL={realizedPnL}
          isPrivate={isPrivate}
          hasOverride={hasOverride}
          viewKeysCount={viewKeys.filter((k) => !k.revoked).length}
          activeTriggersCount={triggers.filter((t) => t.active).length}
        />

        {/* Charts & Allocations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* History Chart (Advanced Range Select) - spans 2 cols */}
          <div className="lg:col-span-2">
            <HistoryChart
              isPrivate={isPrivate}
              hasOverride={hasOverride}
              totalPortfolioValue={totalPortfolioValue}
            />
          </div>

          {/* Allocation Breakdown */}
          <div className="lg:col-span-1">
            <AssetAllocation
              assets={assetAllocation}
              isPrivate={isPrivate}
              hasOverride={hasOverride}
            />
          </div>
        </div>

        {/* Reactive Execution & Taxes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reactive smart execution */}
          <ReactiveTriggers
            triggers={triggers}
            onAddTrigger={handleAddTrigger}
            onToggleTrigger={handleToggleTrigger}
            onDeleteTrigger={handleDeleteTrigger}
            prices={prices}
          />

          {/* Tax matching reporter */}
          <TaxReporting
            transactions={transactions}
            selectedWalletId={selectedWalletId}
            isPrivate={isPrivate}
            hasOverride={hasOverride}
            canSeeTax={canSeeTax}
          />
        </div>

        {/* Transactions list ledger */}
        <TransactionsTable
          transactions={transactions}
          selectedWalletId={selectedWalletId}
          isPrivate={isPrivate}
          hasOverride={hasOverride}
          walletNames={walletNames}
        />
      </div>

      {/* Built for Rialo footer */}
      <footer className="w-full text-center text-xs text-textSecondary border-t border-borderDark/40 mt-12 pt-6">
        <p className="flex items-center justify-center gap-1.5 font-medium">
          <span>Built for Rialo Hackathon Showcase</span>
          <span className="text-textSecondary/40">•</span>
          <span className="text-accentViolet font-semibold">REX Private Execution Engine</span>
          <span className="text-textSecondary/40">•</span>
          <span>Zero-Knowledge Decentralized Finance</span>
        </p>
        <p className="text-[10px] text-textSecondary/60 mt-1 font-mono uppercase tracking-wider">
          Secure, reactive state transitions natively triggered on-chain
        </p>
      </footer>

      {/* Modals Container */}
      <AnimatePresence>
        {isAddTxOpen && (
          <AddTransactionModal
            isOpen={isAddTxOpen}
            onClose={() => setIsAddTxOpen(false)}
            onAddTransaction={handleAddTransaction}
            wallets={DEFAULT_WALLETS}
            prices={prices}
          />
        )}

        {isViewKeyOpen && (
          <ViewKeyModal
            isOpen={isViewKeyOpen}
            onClose={() => setIsViewKeyOpen(false)}
            onGenerateKey={handleGenerateViewKey}
            viewKeys={viewKeys}
            onRevokeKey={handleRevokeKey}
          />
        )}
      </AnimatePresence>

      {/* Active toast notification stack */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "p-4 rounded-2xl border shadow-xl flex items-start gap-3 backdrop-blur-md pointer-events-auto",
                toast.type === "success"
                  ? "bg-accentEmerald/10 border-accentEmerald/20 text-accentEmerald"
                  : toast.type === "warning"
                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                  : "bg-surfaceMuted/90 border-borderDark text-textPrimary"
              )}
            >
              {toast.type === "success" && <CheckCircle className="w-5 h-5 shrink-0" />}
              {toast.type === "warning" && <ShieldAlert className="w-5 h-5 shrink-0" />}
              {toast.type === "info" && <Bell className="w-5 h-5 shrink-0 text-accentViolet" />}
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold font-sans">
                  {toast.type === "success" && "Success Operation"}
                  {toast.type === "warning" && "Security Warning"}
                  {toast.type === "info" && "REX Ledger Update"}
                </span>
                <p className="text-[11px] font-medium leading-relaxed opacity-90">{toast.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
