"use client";

import React, { useState } from "react";
import { X, Key, Copy, Check, Clock, ShieldCheck, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateId } from "@/lib/utils";

interface ViewKeyData {
  key: string;
  expiry: string;
  createdAt: number;
  permission: "read-only" | "can-see-tax" | "full-private";
  note: string;
  revoked: boolean;
}

interface ViewKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateKey: (keyData: {
    key: string;
    expiry: string;
    permission: "read-only" | "can-see-tax" | "full-private";
    note: string;
  }) => void;
  viewKeys: ViewKeyData[];
  onRevokeKey: (keyStr: string) => void;
}

export default function ViewKeyModal({
  isOpen,
  onClose,
  onGenerateKey,
  viewKeys,
  onRevokeKey,
}: ViewKeyModalProps) {
  const [expiry, setExpiry] = useState("24h");
  const [permission, setPermission] = useState<"read-only" | "can-see-tax" | "full-private">("read-only");
  const [note, setNote] = useState("");

  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const activeKeys = viewKeys.filter((k) => !k.revoked);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const newKeyStr = `rk_rialo_${Math.random().toString(36).substring(2, 8)}${Math.random().toString(36).substring(2, 8)}`;
    
    // Construct local showcase sharing link
    let origin = "http://localhost:3000";
    if (typeof window !== "undefined") {
      origin = window.location.origin;
    }
    const newUrl = `${origin}?viewKey=${newKeyStr}`;

    onGenerateKey({
      key: newKeyStr,
      expiry,
      permission,
      note,
    });

    setGeneratedKey(newKeyStr);
    setGeneratedUrl(newUrl);
    setNote("");
  };

  const handleCopyKey = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleCopyUrl = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handleResetModal = () => {
    setGeneratedKey(null);
    setGeneratedUrl(null);
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

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="relative w-full max-w-lg bg-surface border border-borderDark rounded-3xl p-6 shadow-2xl glass-panel overflow-hidden z-10"
      >
        {/* Color stripe */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accentViolet via-violet-600 to-accentEmerald" />

        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-textPrimary">Generate REX View Key</h3>
            <p className="text-xs text-textSecondary mt-0.5">
              Selective disclosure for third parties & regulators
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-surfaceMuted border border-borderDark hover:border-borderMuted rounded-xl text-textSecondary hover:text-textPrimary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!generatedKey ? (
            /* Creation Form */
            <motion.form
              key="creation-form"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleGenerate}
              className="flex flex-col gap-4"
            >
              {/* Scope/Permission Segmented Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                  Permission Scope
                </label>
                <div className="grid grid-cols-3 bg-background border border-borderDark p-1 rounded-xl w-full h-11 relative">
                  <button
                    type="button"
                    onClick={() => setPermission("read-only")}
                    className={`rounded-lg text-[10px] font-bold transition-all duration-200 ${
                      permission === "read-only"
                        ? "bg-accentViolet/20 text-accentViolet border border-accentViolet/20"
                        : "text-textSecondary hover:text-textPrimary"
                    }`}
                  >
                    Read-only
                  </button>
                  <button
                    type="button"
                    onClick={() => setPermission("can-see-tax")}
                    className={`rounded-lg text-[10px] font-bold transition-all duration-200 ${
                      permission === "can-see-tax"
                        ? "bg-accentViolet/20 text-accentViolet border border-accentViolet/20"
                        : "text-textSecondary hover:text-textPrimary"
                    }`}
                  >
                    Read + Tax
                  </button>
                  <button
                    type="button"
                    onClick={() => setPermission("full-private")}
                    className={`rounded-lg text-[10px] font-bold transition-all duration-200 ${
                      permission === "full-private"
                        ? "bg-accentViolet/20 text-accentViolet border border-accentViolet/20"
                        : "text-textSecondary hover:text-textPrimary"
                    }`}
                  >
                    Full Decrypt
                  </button>
                </div>
                <p className="text-[10px] text-textSecondary/80 leading-relaxed mt-0.5">
                  {permission === "read-only" && "Grants access to balance aggregates and asset holdings. Hides Tax Reporter."}
                  {permission === "can-see-tax" && "Grants access to asset values, performance, and FIFO/LIFO realized capital gains reports."}
                  {permission === "full-private" && "Grants full visibility to private transactions and holdings, equivalent to owner view."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Expiry Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-textSecondary flex items-center gap-1">
                    <Clock className="w-3 h-3 text-accentViolet" /> Expiration
                  </label>
                  <select
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full bg-background border border-borderDark focus:border-accentViolet/50 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none text-textPrimary h-10 cursor-pointer"
                  >
                    <option value="1h">1 Hour</option>
                    <option value="24h">24 Hours</option>
                    <option value="7d">7 Days</option>
                    <option value="never">Never (Persistent)</option>
                  </select>
                </div>

                {/* Optional Note */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                    Memo / Note
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. IRS audit 2026"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-background border border-borderDark focus:border-accentViolet/50 rounded-xl px-3 py-2 text-xs focus:outline-none text-textPrimary h-10"
                  />
                </div>
              </div>

              {/* REX selective disclosure explanation */}
              <div className="bg-accentViolet/5 border border-accentViolet/15 p-3 rounded-xl flex items-start gap-2.5 text-[10.5px] text-textSecondary/90 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-accentViolet shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-textPrimary block">Decentralized Authorization</span>
                  This view key acts as an ephemeral cryptographic delegation token, giving selective decryption rights for the designated sub-nodes.
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-accentViolet to-accentViolet/80 hover:from-accentViolet/90 hover:to-accentViolet text-xs font-bold rounded-xl text-white transition-all duration-200 mt-2 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
              >
                Generate Secure Key
              </button>
            </motion.form>
          ) : (
            /* Success / Key Display View */
            <motion.div
              key="key-display"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col gap-4 py-2"
            >
              <div className="text-center py-2 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-accentEmerald/10 border border-accentEmerald/20 flex items-center justify-center text-accentEmerald mb-3">
                  <Key className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="text-sm font-bold text-textPrimary">View Key Generated Successfully!</h4>
                <p className="text-xs text-textSecondary max-w-sm mt-1">
                  Copy the credentials or shareable link. Access is scoped to:{" "}
                  <span className="text-accentEmerald font-bold font-mono">{permission}</span>
                </p>
              </div>

              {/* Key Output */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                  REX Decryption Key
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedKey || ""}
                    className="w-full bg-background border border-borderDark rounded-xl px-3 py-2 text-xs font-mono text-accentViolet focus:outline-none h-10"
                  />
                  <button
                    onClick={handleCopyKey}
                    className="px-3 bg-surface hover:bg-surfaceMuted border border-borderDark hover:border-borderMuted rounded-xl text-textSecondary hover:text-textPrimary transition-all duration-200 flex items-center justify-center"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-accentEmerald" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Shareable Link Output */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                  REX Shared View Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedUrl || ""}
                    className="w-full bg-background border border-borderDark rounded-xl px-3 py-2 text-xs font-mono text-textPrimary focus:outline-none h-10 truncate"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="px-3 bg-surface hover:bg-surfaceMuted border border-borderDark hover:border-borderMuted rounded-xl text-textSecondary hover:text-textPrimary transition-all duration-200 flex items-center justify-center"
                  >
                    {copiedUrl ? <Check className="w-4 h-4 text-accentEmerald" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleResetModal}
                  className="w-1/2 py-2.5 bg-surface hover:bg-surfaceMuted border border-borderDark hover:border-borderMuted rounded-xl text-xs font-bold text-textPrimary transition-all duration-200 flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Generate Another
                </button>
                <button
                  onClick={onClose}
                  className="w-1/2 py-2.5 bg-gradient-to-r from-accentViolet to-accentViolet/80 hover:from-accentViolet/90 hover:to-accentViolet rounded-xl text-xs font-bold text-white transition-all duration-200 shadow-md"
                >
                  Done
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Existing Keys Table / Section */}
        {activeKeys.length > 0 && (
          <div className="mt-6 border-t border-borderDark pt-4">
            <h4 className="text-[11px] font-bold text-textPrimary uppercase tracking-wider mb-3">
              Active Authorized Delegations ({activeKeys.length})
            </h4>
            <div className="max-h-36 overflow-y-auto flex flex-col gap-2 pr-1">
              {activeKeys.map((k) => (
                <div
                  key={k.key}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-borderDark text-[11px]"
                >
                  <div className="flex flex-col gap-0.5 truncate max-w-[280px]">
                    <span className="font-mono text-accentViolet text-[10px] truncate font-bold">
                      {k.key}
                    </span>
                    <span className="text-[10px] text-textSecondary">
                      Scope: <span className="font-bold text-textPrimary">{k.permission}</span> | Expires: {k.expiry} {k.note ? `| Note: ${k.note}` : ""}
                    </span>
                  </div>
                  <button
                    onClick={() => onRevokeKey(k.key)}
                    className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/30 rounded-lg transition-colors font-bold text-[9px]"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
