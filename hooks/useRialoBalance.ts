"use client";

import { useState, useEffect, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

interface BalanceState {
  balance: number; // dalam unit token utama (bukan lamports)
  loading: boolean;
  error: string | null;
}

/**
 * Hook untuk fetch saldo native token (RIA) dari wallet yang connect.
 * Auto-refresh setiap kali wallet berubah atau setiap `refreshInterval` ms.
 */
export function useRialoBalance(refreshInterval = 15000) {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();

  const [state, setState] = useState<BalanceState>({
    balance: 0,
    loading: false,
    error: null,
  });

  const fetchBalance = useCallback(async () => {
    if (!publicKey || !connected) {
      setState({ balance: 0, loading: false, error: null });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const lamports = await connection.getBalance(publicKey);
      // NOTE: kalau Rialo pakai desimal berbeda dari Solana (9 desimal),
      // sesuaikan pembagian di bawah ini sesuai spesifikasi token Rialo.
      const balance = lamports / LAMPORTS_PER_SOL;
      setState({ balance, loading: false, error: null });
    } catch (err) {
      setState({
        balance: 0,
        loading: false,
        error: err instanceof Error ? err.message : "Gagal mengambil saldo",
      });
    }
  }, [connection, publicKey, connected]);

  useEffect(() => {
    fetchBalance();

    if (!refreshInterval) return;
    const interval = setInterval(fetchBalance, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchBalance, refreshInterval]);

  return { ...state, refetch: fetchBalance };
}
