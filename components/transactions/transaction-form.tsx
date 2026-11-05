"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { TransactionType, TransactionStatus } from "@/lib/types"

const transactionTypes: { value: TransactionType; label: string; description: string }[] = [
  { value: "swap", label: "Swap", description: "Token to token exchange" },
  { value: "spot", label: "Spot Trade", description: "Buy/sell with stablecoins" },
  { value: "fiat_ramp", label: "Fiat Ramp", description: "CNY/HKD to USDT/USDC" },
  { value: "tge_ido", label: "TGE/IDO", description: "Token launch participation" },
  { value: "staking", label: "Staking", description: "Single asset staking" },
  { value: "lp", label: "Liquidity Pool", description: "Provide LP tokens" },
  { value: "nft_buy", label: "NFT Buy", description: "Purchase NFT" },
  { value: "nft_sell", label: "NFT Sell", description: "Sell NFT" },
  { value: "nft_mint", label: "NFT Mint", description: "Mint new NFT" },
  { value: "airdrop", label: "Airdrop", description: "Received tokens" },
  { value: "gas_fee", label: "Gas Fee", description: "Network fees" },
  { value: "transfer", label: "Transfer", description: "Move between accounts" },
]

export function TransactionForm() {
  const router = useRouter()
  const accounts = useAppStore((state) => state.accounts)
  const addTransaction = useAppStore((state) => state.addTransaction)

  const [accountId, setAccountId] = useState("")
  const [type, setType] = useState<TransactionType>("spot")
  const [status, setStatus] = useState<TransactionStatus>("unsettled")
  const [assetSymbol, setAssetSymbol] = useState("")
  const [assetName, setAssetName] = useState("")
  const [quantity, setQuantity] = useState("")
  const [pricePerUnit, setPricePerUnit] = useState("")
  const [fee, setFee] = useState("0")
  const feeAsset = "USD"
  const [side, setSide] = useState<"buy" | "sell">("buy")
  const [date, setDate] = useState<Date>(new Date())
  const [notes, setNotes] = useState("")

  // For swaps
  const [fromAsset, setFromAsset] = useState("")
  const [fromQuantity, setFromQuantity] = useState("")

  const totalValue = Number.parseFloat(quantity || "0") * Number.parseFloat(pricePerUnit || "0")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!assetSymbol.trim() || !accountId || Number(quantity) <= 0) return
    const transaction = {
      accountId,
      type,
      status,
      side: ["spot", "swap"].includes(type) ? side : undefined,
      assetSymbol: assetSymbol.trim().toUpperCase(),
      assetName: assetName || assetSymbol.toUpperCase(),
      quantity: Number.parseFloat(quantity),
      pricePerUnit: Number.parseFloat(pricePerUnit),
      totalValue,
      fromAsset: type === "swap" ? fromAsset.toUpperCase() : undefined,
      fromQuantity: type === "swap" ? Number.parseFloat(fromQuantity) : undefined,
      toAsset: type === "swap" ? assetSymbol.toUpperCase() : undefined,
      toQuantity: type === "swap" ? Number.parseFloat(quantity) : undefined,
      fee: Number(fee || "0"),
      feeAsset,
      notes,
      transactionDate: date,
    }

    addTransaction(transaction)

    router.push("/transactions")
  }

  const isSwap = type === "swap"

  if (!accounts.length)
    return (
      <Card>
        <CardContent className="space-y-4 p-8">
          <p>Create an account before recording a transaction.</p>
          <Button asChild>
            <Link href="/accounts">Create an account</Link>
          </Button>
        </CardContent>
      </Card>
    )

  return (
    <Card className="mx-auto max-w-2xl bg-card">
      <CardHeader>
        <CardTitle>Transaction details</CardTitle>
        <p className="text-sm text-muted-foreground">
          Journal entries are records only. Maintain current balances separately in Assets.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
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

            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as TransactionType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {transactionTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <div>
                        <span>{t.label}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{t.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {["spot", "swap"].includes(type) && (
            <div className="space-y-2">
              <Label htmlFor="trade-side">Trade side</Label>
              <select
                id="trade-side"
                className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
                value={side}
                onChange={(e) => setSide(e.target.value as "buy" | "sell")}
              >
                <option value="buy">Buy / entry</option>
                <option value="sell">Sell / exit</option>
              </select>
            </div>
          )}

          {isSwap && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fromAsset">From Asset</Label>
                <Input
                  id="fromAsset"
                  placeholder="USDT"
                  value={fromAsset}
                  onChange={(e) => setFromAsset(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fromQuantity">From Quantity</Label>
                <Input
                  id="fromQuantity"
                  type="number"
                  step="any"
                  min="0"
                  placeholder="1000"
                  value={fromQuantity}
                  onChange={(e) => setFromQuantity(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="assetSymbol">{isSwap ? "To Asset" : "Asset Symbol"}</Label>
              <Input
                id="assetSymbol"
                placeholder="ETH, BTC, SOL..."
                value={assetSymbol}
                onChange={(e) => setAssetSymbol(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assetName">Asset Name (optional)</Label>
              <Input
                id="assetName"
                placeholder="Ethereum"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="any"
                min="0.000000000000000001"
                placeholder="0.5"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricePerUnit">Price per Unit (USD)</Label>
              <Input
                id="pricePerUnit"
                type="number"
                step="any"
                min="0"
                placeholder="2000"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Total Value</Label>
              <div className="flex h-10 items-center rounded-md bg-secondary px-3">
                <span className="font-mono text-sm">
                  ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="fee">Fee (USD equivalent)</Label>
              <Input
                id="fee"
                type="number"
                step="any"
                min="0"
                placeholder="0"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feeAsset">Fee Asset</Label>
              <Input id="feeAsset" value="USD" readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TransactionStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unsettled">Unsettled (Open Position)</SelectItem>
                  <SelectItem value="settled">Settled (Closed)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Transaction Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this transaction..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit">Save Transaction</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
