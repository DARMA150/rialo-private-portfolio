"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  Line,
  LineChart,
} from "recharts";
import { TrendingUp, BarChart2, Check, HelpCircle, EyeOff, RotateCcw } from "lucide-react";
import { maskValue, formatCurrency, formatPercent } from "@/lib/utils";

interface HistoryChartProps {
  isPrivate: boolean;
  hasOverride: boolean;
  totalPortfolioValue: number;
}

type TimeRange = "24H" | "7D" | "30D" | "ALL";

interface ChartPoint {
  time: string;
  portfolio: number;
  btc: number;
  eth: number;
  ria: number;
}

export default function HistoryChart({
  isPrivate,
  hasOverride,
  totalPortfolioValue,
}: HistoryChartProps) {
  const [mounted, setMounted] = useState(false);
  const [range, setRange] = useState<TimeRange>("7D");
  const [compareBtc, setCompareBtc] = useState(false);
  const [compareEth, setCompareEth] = useState(false);
  const [compareRia, setCompareRia] = useState(false);

  // Drag selection states
  const [refAreaLeft, setRefAreaLeft] = useState<string | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<string | null>(null);
  const [selectionRange, setSelectionRange] = useState<{
    startIdx: number;
    endIdx: number;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate historical data procedurally so it syncs up with totalPortfolioValue at the end
  const chartData = useMemo(() => {
    const pointsCount = range === "24H" ? 24 : range === "7D" ? 7 : range === "30D" ? 30 : 60;
    const data: ChartPoint[] = [];
    const now = new Date();

    // Base values relative to totalPortfolioValue
    const portfolioBase = totalPortfolioValue;
    const btcBase = 65000;
    const ethBase = 3200;
    const riaBase = 12;

    for (let i = pointsCount - 1; i >= 0; i--) {
      let timeStr = "";
      const date = new Date(now);

      if (range === "24H") {
        date.setHours(now.getHours() - i);
        timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      } else {
        date.setDate(now.getDate() - i);
        timeStr = date.toLocaleDateString([], { month: "short", day: "numeric" });
      }

      // Generate realistic walks
      const progress = (pointsCount - 1 - i) / (pointsCount - 1 || 1);
      // We want the last point of portfolio to match exactly totalPortfolioValue
      const portWalk = i === 0 ? portfolioBase : portfolioBase * (0.85 + 0.15 * progress + Math.sin(i * 0.4) * 0.04);
      const btcWalk = btcBase * (0.9 + 0.1 * progress + Math.cos(i * 0.3) * 0.05);
      const ethWalk = ethBase * (0.88 + 0.12 * progress + Math.sin(i * 0.5) * 0.03);
      const riaWalk = riaBase * (0.7 + 0.3 * progress + Math.cos(i * 0.2) * 0.08);

      data.push({
        time: timeStr,
        portfolio: Math.round(portWalk * 100) / 100,
        btc: Math.round(btcWalk * 100) / 100,
        eth: Math.round(ethWalk * 100) / 100,
        ria: Math.round(riaWalk * 100) / 100,
      });
    }
    return data;
  }, [range, totalPortfolioValue]);

  // Handle Drag Selection Range Stats
  const rangeStats = useMemo(() => {
    if (!selectionRange) return null;
    const { startIdx, endIdx } = selectionRange;
    const selectedPoints = chartData.slice(
      Math.min(startIdx, endIdx),
      Math.max(startIdx, endIdx) + 1
    );

    if (selectedPoints.length < 2) return null;

    const startVal = selectedPoints[0].portfolio;
    const endVal = selectedPoints[selectedPoints.length - 1].portfolio;
    const change = endVal - startVal;
    const changePercent = (change / (startVal || 1)) * 100;

    const values = selectedPoints.map((p) => p.portfolio);
    const high = Math.max(...values);
    const low = Math.min(...values);

    return {
      change,
      changePercent,
      high,
      low,
      pointsCount: selectedPoints.length,
      startDate: selectedPoints[0].time,
      endDate: selectedPoints[selectedPoints.length - 1].time,
    };
  }, [selectionRange, chartData]);

  // Drag handlers
  const handleMouseDown = (e: any) => {
    if (e && e.activeLabel) {
      setRefAreaLeft(e.activeLabel);
    }
  };

  const handleMouseMove = (e: any) => {
    if (refAreaLeft && e && e.activeLabel) {
      setRefAreaRight(e.activeLabel);
    }
  };

  const handleMouseUp = () => {
    if (refAreaLeft && refAreaRight) {
      if (refAreaLeft === refAreaRight) {
        // Reset if just clicked
        setRefAreaLeft(null);
        setRefAreaRight(null);
        return;
      }

      const idxLeft = chartData.findIndex((d) => d.time === refAreaLeft);
      const idxRight = chartData.findIndex((d) => d.time === refAreaRight);

      if (idxLeft !== -1 && idxRight !== -1) {
        setSelectionRange({ startIdx: idxLeft, endIdx: idxRight });
      }
    }
    setRefAreaLeft(null);
    setRefAreaRight(null);
  };

  const clearSelection = () => {
    setSelectionRange(null);
  };

  if (!mounted) {
    return (
      <div className="w-full h-[400px] bg-surface border border-borderDark rounded-3xl flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accentViolet border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // To make secondary comparison lines display properly, scale them relative to start index
  // or show normalized percentages. For this showcase, we show normalized index value
  // scaled to the portfolio starting value so they overlay beautifully on the same axis!
  const normalizeFactorBtc = chartData[0].portfolio / chartData[0].btc;
  const normalizeFactorEth = chartData[0].portfolio / chartData[0].eth;
  const normalizeFactorRia = chartData[0].portfolio / chartData[0].ria;

  const finalChartData = chartData.map((d) => ({
    ...d,
    btcScaled: d.btc * normalizeFactorBtc,
    ethScaled: d.eth * normalizeFactorEth,
    riaScaled: d.ria * normalizeFactorRia,
  }));

  return (
    <div className="w-full p-6 rounded-3xl border border-borderDark bg-surface glass-panel flex flex-col gap-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-accentViolet" />
            Confidential Performance Ledger
          </h3>
          <p className="text-xs text-textSecondary mt-0.5">
            Real-time portfolio metrics (REX Private)
          </p>
        </div>

        {/* Time filters */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-background/50 border border-borderDark p-1 rounded-xl">
          {(["24H", "7D", "30D", "ALL"] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setRange(t);
                clearSelection();
              }}
              className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all duration-200 ${
                range === t
                  ? "bg-accentViolet/20 text-accentViolet border border-accentViolet/30"
                  : "text-textSecondary hover:text-textPrimary"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Overlays */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold text-textSecondary">Compare overlays:</span>
        <button
          onClick={() => setCompareBtc(!compareBtc)}
          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-bold border transition-all duration-200 ${
            compareBtc
              ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
              : "border-borderDark text-textSecondary hover:text-textPrimary"
          }`}
        >
          {compareBtc && <Check className="w-3 h-3 text-amber-400" />}
          BTC Core
        </button>

        <button
          onClick={() => setCompareEth(!compareEth)}
          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-bold border transition-all duration-200 ${
            compareEth
              ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
              : "border-borderDark text-textSecondary hover:text-textPrimary"
          }`}
        >
          {compareEth && <Check className="w-3 h-3 text-indigo-400" />}
          ETH Ether
        </button>

        <button
          onClick={() => setCompareRia(!compareRia)}
          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-bold border transition-all duration-200 ${
            compareRia
              ? "bg-accentEmerald/10 border-accentEmerald/30 text-accentEmerald"
              : "border-borderDark text-textSecondary hover:text-textPrimary"
          }`}
        >
          {compareRia && <Check className="w-3 h-3 text-accentEmerald" />}
          RIA Rialo
        </button>
      </div>

      {/* Main Chart area */}
      <div className="h-[280px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={finalChartData}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="time"
              stroke="#888888"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#888888"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={["auto", "auto"]}
              tickFormatter={(value) => {
                if (isPrivate && !hasOverride) return "••••";
                return `$${(value / 1000).toFixed(0)}k`;
              }}
            />

            {!isPrivate || hasOverride ? (
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-surfaceMuted border border-borderDark px-4 py-3 rounded-2xl text-xs font-mono flex flex-col gap-1.5 shadow-xl glass-panel">
                        <p className="font-bold text-textPrimary mb-1 border-b border-borderDark pb-1">
                          {payload[0].payload.time}
                        </p>
                        <p className="flex items-center justify-between gap-6 text-accentViolet font-semibold">
                          <span>Portfolio:</span>
                          <span>{formatCurrency(payload[0].payload.portfolio)}</span>
                        </p>
                        {compareBtc && (
                          <p className="flex items-center justify-between gap-6 text-amber-400">
                            <span>BTC (Core):</span>
                            <span>{formatCurrency(payload[0].payload.btc)}</span>
                          </p>
                        )}
                        {compareEth && (
                          <p className="flex items-center justify-between gap-6 text-indigo-400">
                            <span>ETH (Ether):</span>
                            <span>{formatCurrency(payload[0].payload.eth)}</span>
                          </p>
                        )}
                        {compareRia && (
                          <p className="flex items-center justify-between gap-6 text-accentEmerald">
                            <span>RIA (Rialo):</span>
                            <span>{formatCurrency(payload[0].payload.ria)}</span>
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
            ) : null}

            {/* Base Portfolio Area */}
            <Area
              type="monotone"
              dataKey="portfolio"
              stroke="#8b5cf6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPortfolio)"
              animationDuration={800}
            />

            {/* Compare BTC Line */}
            {compareBtc && (
              <Line
                type="monotone"
                dataKey="btcScaled"
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                animationDuration={600}
              />
            )}

            {/* Compare ETH Line */}
            {compareEth && (
              <Line
                type="monotone"
                dataKey="ethScaled"
                stroke="#6366f1"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                animationDuration={600}
              />
            )}

            {/* Compare RIA Line */}
            {compareRia && (
              <Line
                type="monotone"
                dataKey="riaScaled"
                stroke="#10b981"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                animationDuration={600}
              />
            )}

            {/* Drag to select reference area */}
            {refAreaLeft && refAreaRight && (
              <ReferenceArea
                x1={refAreaLeft}
                x2={refAreaRight}
                strokeOpacity={0.3}
                fill="#8b5cf6"
                fillOpacity={0.15}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>

        {isPrivate && !hasOverride && (
          <div className="absolute inset-0 bg-background/50 backdrop-filter backdrop-blur-md flex flex-col items-center justify-center p-6 text-center rounded-3xl pointer-events-none">
            <EyeOff className="w-8 h-8 text-textSecondary mb-2" />
            <p className="text-sm font-bold text-textPrimary">REX Performance Hidden</p>
            <p className="text-xs text-textSecondary max-w-xs mt-1">
              Historical metrics are masked. Toggle Public View or present a private View Key to unlock.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-textSecondary gap-2 border-t border-borderDark pt-4">
        <span className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-textSecondary/60" />
          Drag horizontally over the chart area to analyze scoped range metrics.
        </span>

        {/* Selection Stats */}
        {selectionRange && rangeStats && (
          <div className="flex items-center gap-4 bg-background/50 border border-borderDark p-2 rounded-2xl w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-textSecondary uppercase font-bold">Selected PnL</span>
              <p className={`font-mono font-bold ${rangeStats.change >= 0 ? "text-gain" : "text-loss"}`}>
                {isPrivate && !hasOverride ? (
                  `•••••• (${formatPercent(rangeStats.changePercent)})`
                ) : (
                  <>
                    {formatCurrency(rangeStats.change)}{" "}
                    <span className="text-[10px] font-semibold">({formatPercent(rangeStats.changePercent)})</span>
                  </>
                )}
              </p>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-textSecondary uppercase font-bold">Min / Max</span>
              <p className="font-mono text-textPrimary">
                {isPrivate && !hasOverride ? "••••" : formatCurrency(rangeStats.low)} /{" "}
                {isPrivate && !hasOverride ? "••••" : formatCurrency(rangeStats.high)}
              </p>
            </div>
            <button
              onClick={clearSelection}
              className="p-1.5 bg-surface hover:bg-surfaceMuted border border-borderDark hover:border-borderMuted rounded-lg"
              title="Clear selection"
            >
              <RotateCcw className="w-3 h-3 text-textSecondary" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
