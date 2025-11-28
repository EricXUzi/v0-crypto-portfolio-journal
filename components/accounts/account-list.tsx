"use client"

import { useAppStore } from "@/lib/store"
import { usePortfolio } from "@/lib/hooks/use-portfolio"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Wallet, Building2, HardDrive, Globe, MoreVertical, Pencil, Trash2, Copy } from "lucide-react"
import type { AccountType } from "@/lib/types"
import { useState } from "react"
import { EditAccountDialog } from "./edit-account-dialog"

const accountTypeIcons: Record<AccountType, typeof Wallet> = {
  cex: Building2,
  evm_wallet: Wallet,
  solana_wallet: Globe,
  cold_wallet: HardDrive,
  other: Wallet,
}

const accountTypeLabels: Record<AccountType, string> = {
  cex: "Centralized Exchange",
  evm_wallet: "EVM Wallet",
  solana_wallet: "Solana Wallet",
  cold_wallet: "Cold Wallet",
  other: "Other",
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value)
}

export function AccountList() {
  const { accounts, assetsByAccount, getPrice } = usePortfolio()
  const deleteAccount = useAppStore((state) => state.deleteAccount)
  const [editingAccount, setEditingAccount] = useState<string | null>(null)

  const accountsWithValue = accounts.map((account) => {
    const assets = assetsByAccount[account.id] || []
    const totalValue = assets.reduce((sum, asset) => {
      const price = asset.manualPrice ?? getPrice(asset.symbol)
      return sum + asset.quantity * price
    }, 0)
    return { ...account, totalValue, assets }
  })

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
  }

  if (accounts.length === 0) {
    return (
      <Card className="bg-card">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Wallet className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No accounts yet</h3>
          <p className="mb-4 text-center text-sm text-muted-foreground">
            Add your first account to start tracking your crypto assets
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {accountsWithValue.map((account) => {
        const Icon = accountTypeIcons[account.type]
        return (
          <Card key={account.id} className="bg-card">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{account.name}</CardTitle>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {accountTypeLabels[account.type]}
                  </Badge>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditingAccount(account.id)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  {account.address && (
                    <DropdownMenuItem onClick={() => copyAddress(account.address!)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Address
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => deleteAccount(account.id)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              {account.address && (
                <p className="mb-3 truncate font-mono text-xs text-muted-foreground">{account.address}</p>
              )}
              {account.exchange && <p className="mb-3 text-sm text-muted-foreground">Exchange: {account.exchange}</p>}
              <div className="flex items-center justify-between border-t border-border pt-3">
                <div>
                  <p className="text-xs text-muted-foreground">Total Value</p>
                  <p className="text-xl font-bold">{formatUsd(account.totalValue)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Assets</p>
                  <p className="text-lg font-semibold">{account.assets.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {editingAccount && (
        <EditAccountDialog
          accountId={editingAccount}
          open={!!editingAccount}
          onOpenChange={(open) => !open && setEditingAccount(null)}
        />
      )}
    </div>
  )
}
