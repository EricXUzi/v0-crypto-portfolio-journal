"use client"

import { useMemo } from "react"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts"
import { format, startOfMonth, eachMonthOfInterval, subMonths } from "date-fns"

export function MonthlyPnlChart() {
  const tradePairs = useAppStore((state) => state.tradePairs)
  const transactions = useAppStore((state) => state.transactions)

  const monthlyData = useMemo(() => {
    // Get last 12 months
    const now = new Date()
    const months = eachMonthOfInterval({
      start: subMonths(now, 11),
      end: now,
    })

    return months.map((month) => {
      const monthStart = startOfMonth(month)
      const monthKey = format(month, "yyyy-MM")

      // Sum PnL from trade pairs settled in this month
      const monthPnl = tradePairs
        .filter((pair) => {
          const sellTx = transactions.find((t) => t.id === pair.sellTransactionId)
          if (!sellTx) return false
          return format(new Date(sellTx.transactionDate), "yyyy-MM") === monthKey
        })
        .reduce((sum, pair) => sum + pair.pnl, 0)

      return {
        month: format(month, "MMM"),
        pnl: monthPnl,
      }
    })
  }, [tradePairs, transactions])

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Monthly Realized PnL</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)" }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
                formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, "PnL"]}
              />
              <ReferenceLine y={0} stroke="var(--border)" />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {monthlyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.pnl >= 0 ? "var(--success)" : "var(--destructive)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
