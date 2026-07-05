"use client";

import { useState, useEffect, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { ConfirmedSignatureInfo, ParsedTransactionWithMeta } from "@solana/web3.js";

export interface OnChainTransaction {
  signature: string;
  slot: number;
  blockTime: number | null;
  raw: ParsedTransactionWithMeta | null;
}

interface TxState {
  transactions: OnChainTransaction[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook untuk fetch riwayat transaksi asli wallet yang terhubung.
 *
 * CATATAN PENTING:
 * RPC node biasa hanya bisa efisien ambil signature transaksi + detailnya
 * satu per satu, TIDAK bisa query kompleks seperti "semua transaksi buy/sell
 * token X". Untuk fitur seperti tax reporting / asset allocation yang butuh
 * riwayat lengkap & terstruktur, biasanya perlu INDEXER terpisah
 * (block explorer API Rialo, atau custom indexer / The Graph subgraph
 * kalau Rialo menyediakannya). Cek docs.rialo.io bagian "Indexer" atau
 * "Explorer API" untuk endpoint yang lebih sesuai kalau tersedia.
 */
export function useRialoTransactions(limit = 20) {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();

  const [state, setState] = useState<TxState>({
    transactions: [],
    loading: false,
    error: null,
  });

  const fetchTransactions = useCallback(async () => {
    if (!publicKey || !connected) {
      setState({ transactions: [], loading: false, error: null });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const signatures: ConfirmedSignatureInfo[] =
        await connection.getSignaturesForAddress(publicKey, { limit });

      const detailed = await Promise.all(
        signatures.map(async (sigInfo) => {
          const raw = await connection.getParsedTransaction(sigInfo.signature, {
            maxSupportedTransactionVersion: 0,
          });
          return {
            signature: sigInfo.signature,
            slot: sigInfo.slot,
            blockTime: sigInfo.blockTime ?? null,
            raw,
          };
        })
      );

      setState({ transactions: detailed, loading: false, error: null });
    } catch (err) {
      setState({
        transactions: [],
        loading: false,
        error: err instanceof Error ? err.message : "Gagal mengambil riwayat transaksi",
      });
    }
  }, [connection, publicKey, connected, limit]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { ...state, refetch: fetchTransactions };
}
