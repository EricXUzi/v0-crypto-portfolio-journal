"use client"

import { usePortfolio } from "@/lib/hooks/use-portfolio"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Coins, ShieldCheck, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`
}

export function StatsCards() {
  const { summary, isLoading } = usePortfolio()

  const stats = [
    {
      title: "Total Portfolio",
      value: formatUsd(summary.totalValueUsd),
      change: formatPercent(summary.dailyChangePercent),
      changeValue: summary.dailyChange,
      icon: DollarSign,
    },
    {
      title: "Dry Powder (Stables)",
      value: formatUsd(summary.stablecoinValue),
      subtitle: "Ready to deploy",
      icon: ShieldCheck,
    },
    {
      title: "Risk Assets",
      value: formatUsd(summary.volatileAssetValue),
      subtitle: "Tokens + NFTs",
      icon: Coins,
    },
    {
      title: "Realized PnL",
      value: formatUsd(summary.settledPnl),
      change: summary.settledPnl >= 0 ? "Profit" : "Loss",
      changeValue: summary.settledPnl,
      icon: summary.settledPnl >= 0 ? TrendingUp : TrendingDown,
    },
    {
      title: "Unrealized PnL",
      value: formatUsd(summary.unsettledPnl),
      change: summary.unsettledPnl >= 0 ? "Floating Profit" : "Floating Loss",
      changeValue: summary.unsettledPnl,
      icon: AlertCircle,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "—" : stat.value}</div>
            {stat.change && (
              <p
                className={cn(
                  "text-xs",
                  stat.changeValue !== undefined && stat.changeValue >= 0 ? "text-success" : "text-destructive",
                )}
              >
                {stat.change}
              </p>
            )}
            {stat.subtitle && <p className="text-xs text-muted-foreground">{stat.subtitle}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
