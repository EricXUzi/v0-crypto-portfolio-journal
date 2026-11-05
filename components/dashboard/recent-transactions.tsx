"use client"

import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight, Gift, Fuel } from "lucide-react"
import type { TransactionType } from "@/lib/types"
import { format } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const transactionIcons: Record<TransactionType, typeof ArrowUpRight> = {
  swap: ArrowLeftRight,
  spot: ArrowLeftRight,
  fiat_ramp: ArrowDownRight,
  tge_ido: ArrowUpRight,
  staking: ArrowUpRight,
  lp: ArrowLeftRight,
  nft_buy: ArrowDownRight,
  nft_sell: ArrowUpRight,
  nft_mint: ArrowDownRight,
  airdrop: Gift,
  gas_fee: Fuel,
  transfer: ArrowLeftRight,
}

const transactionLabels: Record<TransactionType, string> = {
  swap: "Swap",
  spot: "Spot",
  fiat_ramp: "Fiat",
  tge_ido: "TGE/IDO",
  staking: "Stake",
  lp: "LP",
  nft_buy: "NFT Buy",
  nft_sell: "NFT Sell",
  nft_mint: "NFT Mint",
  airdrop: "Airdrop",
  gas_fee: "Gas",
  transfer: "Transfer",
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value)
}

export function RecentTransactions() {
  const transactions = useAppStore((state) => state.transactions)

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
    .slice(0, 5)

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Transactions</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/transactions">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {recentTransactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No transactions yet. Record your first trade to get started.
          </p>
        ) : (
          <div className="space-y-4">
            {recentTransactions.map((tx) => {
              const Icon = transactionIcons[tx.type]
              return (
                <div key={tx.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                      <Icon className="h-4 w-4 text-secondary-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{tx.assetSymbol}</p>
                        <Badge variant={tx.status === "settled" ? "default" : "secondary"}>{tx.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {transactionLabels[tx.type]} • {format(new Date(tx.transactionDate), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-medium">
                      {tx.quantity.toLocaleString()} {tx.assetSymbol}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatUsd(tx.totalValue)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
