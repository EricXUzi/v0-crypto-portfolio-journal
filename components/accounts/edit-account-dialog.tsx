"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { AccountType } from "@/lib/types"

const accountTypes: { value: AccountType; label: string }[] = [
  { value: "cex", label: "Centralized Exchange (CEX)" },
  { value: "evm_wallet", label: "EVM Wallet (Ethereum, BSC, etc.)" },
  { value: "solana_wallet", label: "Solana Wallet" },
  { value: "cold_wallet", label: "Cold Wallet / Hardware" },
  { value: "other", label: "Other" },
]

const exchanges = ["Binance", "OKX", "Coinbase", "Bybit", "Kraken", "KuCoin", "Gate.io", "Bitget", "Other"]

interface EditAccountDialogProps {
  accountId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditAccountDialog({ accountId, open, onOpenChange }: EditAccountDialogProps) {
  const accounts = useAppStore((state) => state.accounts)
  const updateAccount = useAppStore((state) => state.updateAccount)

  const account = accounts.find((a) => a.id === accountId)

  const [name, setName] = useState("")
  const [type, setType] = useState<AccountType>("cex")
  const [address, setAddress] = useState("")
  const [exchange, setExchange] = useState("")

  useEffect(() => {
    if (account) {
      setName(account.name)
      setType(account.type)
      setAddress(account.address || "")
      setExchange(account.exchange || "")
    }
  }, [account])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    updateAccount(accountId, {
      name,
      type,
      address: address || undefined,
      exchange: exchange || undefined,
    })

    onOpenChange(false)
  }

  const showAddressField = type !== "cex"
  const showExchangeField = type === "cex"

  if (!account) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Account Name</Label>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-type">Account Type</Label>
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
              <Label htmlFor="edit-exchange">Exchange</Label>
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
              <Label htmlFor="edit-address">Wallet Address</Label>
              <Input
                id="edit-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="font-mono"
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
