"use client"

import type React from "react"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import type { AssetCategory } from "@/lib/types"

const assetCategories: { value: AssetCategory; label: string }[] = [
  { value: "volatile", label: "Volatile (BTC, ETH, Altcoins)" },
  { value: "stablecoin", label: "Stablecoin (USDT, USDC)" },
  { value: "nft", label: "NFT" },
]

export function AddAssetDialog() {
  const [open, setOpen] = useState(false)
  const [accountId, setAccountId] = useState("")
  const [symbol, setSymbol] = useState("")
  const [name, setName] = useState("")
  const [category, setCategory] = useState<AssetCategory>("volatile")
  const [quantity, setQuantity] = useState("")
  const [averageCost, setAverageCost] = useState("")

  const accounts = useAppStore((state) => state.accounts)
  const addAsset = useAppStore((state) => state.addAsset)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    addAsset({
      accountId,
      symbol: symbol.toUpperCase(),
      name: name || symbol.toUpperCase(),
      category,
      quantity: Number.parseFloat(quantity),
      averageCost: Number.parseFloat(averageCost),
    })

    setAccountId("")
    setSymbol("")
    setName("")
    setCategory("volatile")
    setQuantity("")
    setAverageCost("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Asset
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account">Account</Label>
            <Select value={accountId} onValueChange={setAccountId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol</Label>
              <Input
                id="symbol"
                placeholder="ETH"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name (optional)</Label>
              <Input id="name" placeholder="Ethereum" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as AssetCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {assetCategories.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="any"
                placeholder="1.5"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="averageCost">Avg Cost (USD)</Label>
              <Input
                id="averageCost"
                type="number"
                step="any"
                placeholder="2000"
                value={averageCost}
                onChange={(e) => setAverageCost(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Asset</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
