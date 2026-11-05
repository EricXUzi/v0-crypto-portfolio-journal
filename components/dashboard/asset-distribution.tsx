"use client"

import { usePortfolio } from "@/lib/hooks/use-portfolio"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

export function AssetDistribution() {
  const { summary } = usePortfolio()

  const data = [
    { name: "Risk assets", value: summary.volatileAssetValue },
    { name: "Stablecoins", value: summary.stablecoinValue },
    { name: "NFTs", value: summary.nftValue },
  ].filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asset allocation</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
          Add a holding and a price to see your allocation.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Asset allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                isAnimationActive={false}
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
                formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, ""]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
