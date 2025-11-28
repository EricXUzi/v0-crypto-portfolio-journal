"use client"

import { usePortfolio } from "@/lib/hooks/use-portfolio"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, Building2, HardDrive, Globe } from "lucide-react"
import type { AccountType } from "@/lib/types"

const accountTypeIcons: Record<AccountType, typeof Wallet> = {
  cex: Building2,
  evm_wallet: Wallet,
  solana_wallet: Globe,
  cold_wallet: HardDrive,
  other: Wallet,
}

const accountTypeLabels: Record<AccountType, string> = {
  cex: "CEX",
  evm_wallet: "EVM",
  solana_wallet: "Solana",
  cold_wallet: "Cold",
  other: "Other",
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value)
}

export function AccountOverview() {
  const { accounts, assetsByAccount, getPrice } = usePortfolio()

  const accountsWithValue = accounts.map((account) => {
    const assets = assetsByAccount[account.id] || []
    const totalValue = assets.reduce((sum, asset) => {
      const price = asset.manualPrice ?? getPrice(asset.symbol)
      return sum + asset.quantity * price
    }, 0)
    return { ...account, totalValue, assetCount: assets.length }
  })

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Accounts</CardTitle>
      </CardHeader>
      <CardContent>
        {accountsWithValue.length === 0 ? (
          <p className="text-sm text-muted-foreground">No accounts yet. Add your first account to start tracking.</p>
        ) : (
          <div className="space-y-4">
            {accountsWithValue.map((account) => {
              const Icon = accountTypeIcons[account.type]
              return (
                <div key={account.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <Icon className="h-5 w-5 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {accountTypeLabels[account.type]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{account.assetCount} assets</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold">{formatUsd(account.totalValue)}</p>
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
