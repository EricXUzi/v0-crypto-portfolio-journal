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
import type { AccountType } from "@/lib/types"

const accountTypes: { value: AccountType; label: string }[] = [
  { value: "cex", label: "Centralized Exchange (CEX)" },
  { value: "evm_wallet", label: "EVM Wallet (Ethereum, BSC, etc.)" },
  { value: "solana_wallet", label: "Solana Wallet" },
  { value: "cold_wallet", label: "Cold Wallet / Hardware" },
  { value: "other", label: "Other" },
]

const exchanges = ["Binance", "OKX", "Coinbase", "Bybit", "Kraken", "KuCoin", "Gate.io", "Bitget", "Other"]

export function AddAccountDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState<AccountType>("cex")
  const [address, setAddress] = useState("")
  const [exchange, setExchange] = useState("")

  const addAccount = useAppStore((state) => state.addAccount)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    addAccount({
      name,
      type,
      address: address || undefined,
      exchange: exchange || undefined,
    })

    setName("")
    setType("cex")
    setAddress("")
    setExchange("")
    setOpen(false)
  }

  const showAddressField = type !== "cex"
  const showExchangeField = type === "cex"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Account Name</Label>
            <Input
              id="name"
              placeholder="e.g., Main Binance, MetaMask Hot"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Account Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as AccountType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accountTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showExchangeField && (
            <div className="space-y-2">
              <Label htmlFor="exchange">Exchange</Label>
              <Select value={exchange} onValueChange={setExchange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exchange" />
                </SelectTrigger>
                <SelectContent>
                  {exchanges.map((ex) => (
                    <SelectItem key={ex} value={ex}>
                      {ex}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showAddressField && (
            <div className="space-y-2">
              <Label htmlFor="address">Wallet Address</Label>
              <Input
                id="address"
                placeholder="0x... or sol..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="font-mono"
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Account</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
