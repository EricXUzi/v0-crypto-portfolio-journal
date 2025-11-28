"use client"

import { useAppStore } from "@/lib/store"
import { usePortfolio } from "@/lib/hooks/use-portfolio"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Pencil, Trash2, Coins, TrendingUp, TrendingDown } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import type { AssetCategory } from "@/lib/types"

const categoryLabels: Record<AssetCategory, string> = {
  stablecoin: "Stablecoin",
  volatile: "Volatile",
  nft: "NFT",
}

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

export function AssetList() {
  const { assets, accounts, getPrice, get24hChange } = usePortfolio()
  const updateAsset = useAppStore((state) => state.updateAsset)
  const deleteAsset = useAppStore((state) => state.deleteAsset)

  const [editingPriceId, setEditingPriceId] = useState<string | null>(null)
  const [manualPrice, setManualPrice] = useState("")

  const getAccountName = (accId: string) => {
    return accounts.find((a) => a.id === accId)?.name || "Unknown"
  }

  const handleSetManualPrice = (assetId: string) => {
    const price = Number.parseFloat(manualPrice)
    if (!isNaN(price) && price > 0) {
      updateAsset(assetId, { manualPrice: price })
    }
    setEditingPriceId(null)
    setManualPrice("")
  }

  const handleClearManualPrice = (assetId: string) => {
    updateAsset(assetId, { manualPrice: undefined })
  }

  if (assets.length === 0) {
    return (
      <Card className="bg-card">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Coins className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No assets yet</h3>
          <p className="text-center text-sm text-muted-foreground">
            Add assets manually or they will be created automatically when you record transactions
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">24h</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="text-right">PnL</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => {
              const price = asset.manualPrice ?? getPrice(asset.symbol)
              const change24h = get24hChange(asset.symbol)
              const value = asset.quantity * price
              const costBasis = asset.quantity * asset.averageCost
              const pnl = value - costBasis
              const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0

              return (
                <TableRow key={asset.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{asset.symbol}</span>
                      {asset.name !== asset.symbol && (
                        <span className="text-xs text-muted-foreground">{asset.name}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{getAccountName(asset.accountId)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{categoryLabels[asset.category]}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">{asset.quantity.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    {editingPriceId === asset.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <Input
                          type="number"
                          step="any"
                          value={manualPrice}
                          onChange={(e) => setManualPrice(e.target.value)}
                          className="h-7 w-24 text-right"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSetManualPrice(asset.id)
                            if (e.key === "Escape") setEditingPriceId(null)
                          }}
                        />
                        <Button size="sm" variant="ghost" onClick={() => handleSetManualPrice(asset.id)}>
                          Set
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <span className="font-mono">{formatUsd(price)}</span>
                        {asset.manualPrice && (
                          <Badge variant="secondary" className="text-xs">
                            Manual
                          </Badge>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell
                    className={cn("text-right font-mono", change24h >= 0 ? "text-success" : "text-destructive")}
                  >
                    {change24h !== 0 ? (
                      <div className="flex items-center justify-end gap-1">
                        {change24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {formatPercent(change24h)}
                      </div>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">{formatUsd(value)}</TableCell>
                  <TableCell className={cn("text-right font-mono", pnl >= 0 ? "text-success" : "text-destructive")}>
                    <div>
                      {formatUsd(pnl)}
                      <span className="ml-1 text-xs">({formatPercent(pnlPercent)})</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingPriceId(asset.id)
                            setManualPrice(price.toString())
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Set Manual Price
                        </DropdownMenuItem>
                        {asset.manualPrice && (
                          <DropdownMenuItem onClick={() => handleClearManualPrice(asset.id)}>
                            Clear Manual Price
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => deleteAsset(asset.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
