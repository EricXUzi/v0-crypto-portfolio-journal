"use client"

import { useMemo } from "react"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Target, Percent, Award, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value)
}

function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`
}

export function PerformanceStats() {
  const tradePairs = useAppStore((state) => state.tradePairs)

  const stats = useMemo(() => {
    if (tradePairs.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        avgPnl: 0,
        avgRoi: 0,
        bestTrade: 0,
        worstTrade: 0,
        avgHoldingDays: 0,
        profitFactor: 0,
      }
    }

    const wins = tradePairs.filter((p) => p.pnl > 0)
    const losses = tradePairs.filter((p) => p.pnl < 0)

    const totalProfit = wins.reduce((sum, p) => sum + p.pnl, 0)
    const totalLoss = Math.abs(losses.reduce((sum, p) => sum + p.pnl, 0))

    return {
      totalTrades: tradePairs.length,
      winRate: (wins.length / tradePairs.length) * 100,
      avgPnl: tradePairs.reduce((sum, p) => sum + p.pnl, 0) / tradePairs.length,
      avgRoi: tradePairs.reduce((sum, p) => sum + p.roi, 0) / tradePairs.length,
      bestTrade: Math.max(...tradePairs.map((p) => p.pnl)),
      worstTrade: Math.min(...tradePairs.map((p) => p.pnl)),
      avgHoldingDays: tradePairs.reduce((sum, p) => sum + p.holdingDays, 0) / tradePairs.length,
      profitFactor: totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Number.POSITIVE_INFINITY : 0,
    }
  }, [tradePairs])

  const statCards = [
    {
      title: "Total Trades",
      value: stats.totalTrades.toString(),
      icon: Target,
    },
    {
      title: "Win Rate",
      value: `${stats.winRate.toFixed(1)}%`,
      icon: Percent,
      highlight: stats.winRate >= 50,
    },
    {
      title: "Avg PnL",
      value: formatUsd(stats.avgPnl),
      icon: stats.avgPnl >= 0 ? TrendingUp : TrendingDown,
      highlight: stats.avgPnl >= 0,
    },
    {
      title: "Avg ROI",
      value: formatPercent(stats.avgRoi),
      icon: stats.avgRoi >= 0 ? TrendingUp : TrendingDown,
      highlight: stats.avgRoi >= 0,
    },
    {
      title: "Best Trade",
      value: formatUsd(stats.bestTrade),
      icon: Award,
      highlight: true,
    },
    {
      title: "Worst Trade",
      value: formatUsd(stats.worstTrade),
      icon: AlertTriangle,
      highlight: false,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statCards.map((stat) => (
        <Card key={stat.title} className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon
              className={cn(
                "h-4 w-4",
                stat.highlight !== undefined
                  ? stat.highlight
                    ? "text-success"
                    : "text-destructive"
                  : "text-muted-foreground",
              )}
            />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold",
                stat.highlight !== undefined ? (stat.highlight ? "text-success" : "text-destructive") : "",
              )}
            >
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
