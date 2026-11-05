"use client"

import type React from "react"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Link } from "lucide-react"
import { format } from "date-fns"

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value)
}

export function CreatePairDialog() {
  const [error, setError] = useState("")
  const [open, setOpen] = useState(false)
  const [buyId, setBuyId] = useState("")
  const [sellId, setSellId] = useState("")

  const transactions = useAppStore((state) => state.transactions)
  const createTradePair = useAppStore((state) => state.createTradePair)

  // Filter unpaired transactions
  const unpairedTransactions = transactions.filter((t) => !t.pairId)

  const buyTransactions = unpairedTransactions.filter(
    (t) =>
      ["spot", "swap", "tge_ido", "nft_buy", "nft_mint", "airdrop"].includes(t.type) && t.side !== "sell",
  )

  const sellTransactions = unpairedTransactions.filter(
    (t) => t.id !== buyId && ["spot", "swap", "nft_sell"].includes(t.type) && t.side !== "buy",
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (buyId && sellId) {
      try {
        createTradePair(buyId, sellId)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to pair trades.")
        return
      }
      setError("")
      setBuyId("")
      setSellId("")
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Link className="mr-2 h-4 w-4" />
          Pair Trades
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Trade Pair</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs leading-5 text-muted-foreground">
            Pair one entry and one exit for the same asset, account and quantity. For partial exits, split the
            records before pairing.
          </p>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="space-y-2">
            <Label>Buy Transaction</Label>
            <Select value={buyId} onValueChange={setBuyId}>
              <SelectTrigger>
                <SelectValue placeholder="Select buy transaction" />
              </SelectTrigger>
              <SelectContent>
                {buyTransactions.map((tx) => (
                  <SelectItem key={tx.id} value={tx.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{tx.assetSymbol}</span>
                      <span className="text-muted-foreground">
                        {tx.quantity} @ {formatUsd(tx.pricePerUnit)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(tx.transactionDate), "MMM d")}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Sell Transaction</Label>
            <Select value={sellId} onValueChange={setSellId}>
              <SelectTrigger>
                <SelectValue placeholder="Select sell transaction" />
              </SelectTrigger>
              <SelectContent>
                {sellTransactions.map((tx) => (
                  <SelectItem key={tx.id} value={tx.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{tx.assetSymbol}</span>
                      <span className="text-muted-foreground">
                        {tx.quantity} @ {formatUsd(tx.pricePerUnit)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(tx.transactionDate), "MMM d")}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!buyId || !sellId}>
              Create Pair
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
