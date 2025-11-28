"use client"

import { useMemo } from "react"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"
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

export function AssetPerformance() {
  const tradePairs = useAppStore((state) => state.tradePairs)
  const transactions = useAppStore((state) => state.transactions)

  const assetStats = useMemo(() => {
    const stats: Record<
      string,
      {
        symbol: string
        trades: number
        wins: number
        totalPnl: number
        avgRoi: number
      }
    > = {}

    tradePairs.forEach((pair) => {
      const buyTx = transactions.find((t) => t.id === pair.buyTransactionId)
      if (!buyTx) return

      const symbol = buyTx.assetSymbol

      if (!stats[symbol]) {
        stats[symbol] = {
          symbol,
          trades: 0,
          wins: 0,
          totalPnl: 0,
          avgRoi: 0,
        }
      }

      stats[symbol].trades++
      stats[symbol].totalPnl += pair.pnl
      stats[symbol].avgRoi += pair.roi
      if (pair.pnl > 0) stats[symbol].wins++
    })

    // Calculate averages
    Object.values(stats).forEach((stat) => {
      stat.avgRoi = stat.avgRoi / stat.trades
    })

    return Object.values(stats).sort((a, b) => b.totalPnl - a.totalPnl)
  }, [tradePairs, transactions])

  if (assetStats.length === 0) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Performance by Asset</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Complete some trades to see performance statistics by asset.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Performance by Asset</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead className="text-right">Trades</TableHead>
              <TableHead className="text-right">Win Rate</TableHead>
              <TableHead className="text-right">Total PnL</TableHead>
              <TableHead className="text-right">Avg ROI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assetStats.map((stat) => {
              const winRate = (stat.wins / stat.trades) * 100
              const isProfitable = stat.totalPnl >= 0

              return (
                <TableRow key={stat.symbol}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {isProfitable ? (
                        <TrendingUp className="h-4 w-4 text-success" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-destructive" />
                      )}
                      <span className="font-medium">{stat.symbol}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{stat.trades}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={winRate >= 50 ? "default" : "secondary"}>{winRate.toFixed(0)}%</Badge>
                  </TableCell>
                  <TableCell className={cn("text-right font-mono", isProfitable ? "text-success" : "text-destructive")}>
                    {formatUsd(stat.totalPnl)}
                  </TableCell>
                  <TableCell
                    className={cn("text-right font-mono", stat.avgRoi >= 0 ? "text-success" : "text-destructive")}
                  >
                    {formatPercent(stat.avgRoi)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
