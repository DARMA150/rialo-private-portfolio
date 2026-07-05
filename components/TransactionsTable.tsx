"use client";

import React, { useState, useMemo } from "react";
import { ArrowUpRight, ArrowDownLeft, Calendar, Coins, ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency, maskValue, cn } from "@/lib/utils";

interface Transaction {
  id: string;
  date: string;
  asset: string;
  type: "buy" | "sell";
  amount: number;
  price: number;
  walletId: string;
}

interface TransactionsTableProps {
  transactions: Transaction[];
  selectedWalletId: string;
  isPrivate: boolean;
  hasOverride: boolean;
  walletNames: { [id: string]: string };
}

export default function TransactionsTable({
  transactions,
  selectedWalletId,
  isPrivate,
  hasOverride,
  walletNames,
}: TransactionsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter transactions
  const filteredTxs = useMemo(() => {
    return transactions
      .filter((tx) => selectedWalletId === "all" || tx.walletId === selectedWalletId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedWalletId]);

  // Pagination
  const totalPages = Math.ceil(filteredTxs.length / itemsPerPage) || 1;
  const paginatedTxs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTxs.slice(start, start + itemsPerPage);
  }, [filteredTxs, currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="w-full p-6 rounded-3xl border border-borderDark bg-surface glass-panel flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2">
            <Coins className="w-4 h-4 text-accentViolet" />
            REX Transaction Ledger
          </h3>
          <p className="text-xs text-textSecondary mt-0.5">
            Decrypted transaction history from private sub-accounts
          </p>
        </div>
        <span className="text-[10px] bg-accentEmerald/10 text-accentEmerald border border-accentEmerald/20 px-2.5 py-0.5 rounded-full font-mono">
          {filteredTxs.length} TXS
        </span>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-borderDark text-[10px] uppercase font-bold text-textSecondary tracking-wider">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Wallet</th>
              <th className="py-3 px-4">Asset</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-right">Price</th>
              <th className="py-3 px-4 text-right">Total Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borderDark/40">
            {paginatedTxs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-xs text-textSecondary">
                  No transactions recorded. Add one above!
                </td>
              </tr>
            ) : (
              paginatedTxs.map((tx) => {
                const totalValue = tx.amount * tx.price;
                const dateObj = new Date(tx.date);
                const formattedDate = dateObj.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                const formattedTime = dateObj.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-surfaceMuted/30 transition-colors text-xs text-textPrimary"
                  >
                    {/* Date */}
                    <td className="py-3 px-4 font-mono text-[11px] text-textSecondary">
                      <span className="block">{formattedDate}</span>
                      <span className="block text-[9px] opacity-75">{formattedTime}</span>
                    </td>

                    {/* Wallet Badge */}
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded bg-background border border-borderDark text-[10px] text-textSecondary font-semibold">
                        {walletNames[tx.walletId] || tx.walletId}
                      </span>
                    </td>

                    {/* Asset Symbol */}
                    <td className="py-3 px-4 font-bold text-textPrimary">
                      {tx.asset}
                    </td>

                    {/* Type Badge */}
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                          tx.type === "buy"
                            ? "bg-gain/10 text-gain border-gain/20"
                            : "bg-loss/10 text-loss border-loss/20"
                        )}
                      >
                        {tx.type === "buy" ? (
                          <>
                            <ArrowDownLeft className="w-3 h-3" /> Buy
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-3 h-3" /> Sell
                          </>
                        )}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                      {isPrivate && !hasOverride ? (
                        "••••••"
                      ) : (
                        `${tx.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6,
                        })} ${tx.asset}`
                      )}
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 text-right font-mono text-textSecondary tabular-nums">
                      {formatCurrency(tx.price)}
                    </td>

                    {/* Total Value */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-textPrimary tabular-nums">
                      {maskValue(totalValue, isPrivate, hasOverride)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-borderDark/60 pt-4 text-xs font-semibold text-textSecondary">
          <span>
            Showing Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-1.5 border border-borderDark rounded-lg hover:border-borderMuted disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surfaceMuted transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-borderDark rounded-lg hover:border-borderMuted disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surfaceMuted transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
