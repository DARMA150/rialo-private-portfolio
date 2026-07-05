"use client";

import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Circle, EyeOff } from "lucide-react";
import { maskValue, formatCurrency } from "@/lib/utils";

interface AssetHolding {
  symbol: string;
  name: string;
  amount: number;
  value: number;
  percent: number;
  color: string;
}

interface AssetAllocationProps {
  assets: AssetHolding[];
  isPrivate: boolean;
  hasOverride: boolean;
}

export default function AssetAllocation({
  assets,
  isPrivate,
  hasOverride,
}: AssetAllocationProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-80 bg-surface border border-borderDark rounded-3xl flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accentViolet border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Filter out zero holdings for the chart
  const chartData = assets.filter((a) => a.value > 0);

  return (
    <div className="w-full p-6 rounded-3xl border border-borderDark bg-surface glass-panel flex flex-col gap-6 h-full min-h-[380px]">
      <div>
        <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider">
          Asset Allocation
        </h3>
        <p className="text-xs text-textSecondary mt-0.5">
          REX-shielded asset share distribution
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-6 xl:gap-8 flex-1">
        {/* Pie Chart */}
        <div className="w-44 h-44 shrink-0 relative flex items-center justify-center">
          {chartData.length === 0 ? (
            <div className="text-center text-xs text-textSecondary p-4">
              No holdings available.
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                    animationDuration={600}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="#121218"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  {!isPrivate || hasOverride ? (
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as AssetHolding;
                          return (
                            <div className="bg-surfaceMuted border border-borderDark px-3 py-2 rounded-xl text-xs font-mono">
                              <p className="font-bold text-textPrimary">{data.name}</p>
                              <p className="text-textSecondary mt-1">
                                Value: <span className="text-textPrimary">{formatCurrency(data.value)}</span>
                              </p>
                              <p className="text-textSecondary">
                                Share: <span className="text-textPrimary">{data.percent.toFixed(2)}%</span>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  ) : null}
                </PieChart>
              </ResponsiveContainer>

              {/* Private Center Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                {isPrivate && !hasOverride ? (
                  <>
                    <EyeOff className="w-4 h-4 text-textSecondary" />
                    <span className="text-[10px] text-textSecondary font-semibold uppercase mt-1 tracking-wider">
                      REX Protected
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] text-textSecondary font-bold uppercase tracking-wider">
                      Diversification
                    </span>
                    <span className="text-xs font-mono font-bold text-textPrimary mt-0.5">
                      {chartData.length} Assets
                    </span>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Legend Table */}
        <div className="flex-1 w-full flex flex-col gap-2.5">
          {assets.map((asset) => {
            return (
              <div
                key={asset.symbol}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-surfaceMuted/40 transition-colors border border-transparent hover:border-borderDark/40"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: asset.color }}
                  />
                  <div className="truncate">
                    <p className="text-xs font-bold text-textPrimary flex items-center gap-1.5">
                      {asset.symbol}
                      <span className="text-[10px] font-normal text-textSecondary truncate hidden xl:inline">
                        {asset.name}
                      </span>
                    </p>
                    <p className="text-[10px] text-textSecondary font-mono mt-0.5">
                      {isPrivate && !hasOverride ? (
                        "••••••"
                      ) : (
                        `${asset.amount.toLocaleString(undefined, {
                          maximumFractionDigits: 4,
                        })} ${asset.symbol}`
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono flex-shrink-0">
                  <p className="text-xs font-bold text-textPrimary">
                    {maskValue(asset.value, isPrivate, hasOverride)}
                  </p>
                  <p className="text-[10px] text-accentViolet font-semibold mt-0.5">
                    {asset.percent.toFixed(2)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
