// ============================================================
// KONFIGURASI JARINGAN RIALO
// ============================================================
// PENTING: Isi RPC_ENDPOINT di bawah dengan URL resmi dari
// docs.rialo.io atau playground.rialo.io sebelum deploy.
//
// Cara cek:
// 1. Buka https://docs.rialo.io
// 2. Cari bagian "Network" / "RPC Endpoint" / "Testnet"
// 3. Copy URL RPC-nya ke bawah ini
//
// Kalau Rialo devnet/testnet-nya memang identik dengan format
// Solana RPC (karena kompatibel SVM), formatnya biasanya:
// https://rpc-testnet.rialo.io  (CONTOH, BUKAN URL ASLI)
// ============================================================

export const RIALO_NETWORK = {
  // GANTI dengan RPC endpoint resmi Rialo (testnet/devnet)
  RPC_ENDPOINT: process.env.NEXT_PUBLIC_RIALO_RPC_ENDPOINT || "https://api.devnet.solana.com",

  // GANTI kalau Rialo punya WebSocket endpoint terpisah untuk subscription real-time
  WS_ENDPOINT: process.env.NEXT_PUBLIC_RIALO_WS_ENDPOINT || undefined,

  // Nama jaringan untuk ditampilkan di UI
  NETWORK_NAME: "Rialo Testnet",

  // Native token symbol Rialo (ganti kalau bukan "RIA")
  NATIVE_TOKEN_SYMBOL: "RIA",

  // Explorer URL untuk link "lihat di explorer" (ganti sesuai block explorer Rialo)
  EXPLORER_URL: process.env.NEXT_PUBLIC_RIALO_EXPLORER_URL || "https://explorer.rialo.io",
};

// Helper untuk generate link explorer transaksi
export function getExplorerTxUrl(signature: string): string {
  return `${RIALO_NETWORK.EXPLORER_URL}/tx/${signature}`;
}

// Helper untuk generate link explorer address
export function getExplorerAddressUrl(address: string): string {
  return `${RIALO_NETWORK.EXPLORER_URL}/address/${address}`;
}
