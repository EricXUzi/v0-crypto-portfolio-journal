"use client"

import { useAppStore } from "@/lib/store"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { create } from "zustand"
import type { TransactionType, TransactionStatus } from "@/lib/types"

interface FilterState {
  search: string
  accountId: string | null
  type: TransactionType | null
  status: TransactionStatus | null
  setSearch: (search: string) => void
  setAccountId: (id: string | null) => void
  setType: (type: TransactionType | null) => void
  setStatus: (status: TransactionStatus | null) => void
  reset: () => void
}

export const useTransactionFilters = create<FilterState>((set) => ({
  search: "",
  accountId: null,
  type: null,
  status: null,
  setSearch: (search) => set({ search }),
  setAccountId: (accountId) => set({ accountId }),
  setType: (type) => set({ type }),
  setStatus: (status) => set({ status }),
  reset: () => set({ search: "", accountId: null, type: null, status: null }),
}))

const transactionTypes: { value: TransactionType; label: string }[] = [
  { value: "swap", label: "Swap" },
  { value: "spot", label: "Spot Trade" },
  { value: "fiat_ramp", label: "Fiat Ramp" },
  { value: "tge_ido", label: "TGE/IDO" },
  { value: "staking", label: "Staking" },
  { value: "lp", label: "Liquidity Pool" },
  { value: "nft_buy", label: "NFT Buy" },
  { value: "nft_sell", label: "NFT Sell" },
  { value: "nft_mint", label: "NFT Mint" },
  { value: "airdrop", label: "Airdrop" },
  { value: "gas_fee", label: "Gas Fee" },
  { value: "transfer", label: "Transfer" },
]

export function TransactionFilters() {
  const accounts = useAppStore((state) => state.accounts)
  const { search, accountId, type, status, setSearch, setAccountId, setType, setStatus } =
    useTransactionFilters()

  return (
    <Card className="mb-6 bg-card">
      <CardContent className="flex flex-wrap items-center gap-4 pt-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by asset symbol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={accountId || "all"} onValueChange={(v) => setAccountId(v === "all" ? null : v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Accounts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            {accounts.map((acc) => (
              <SelectItem key={acc.id} value={acc.id}>
                {acc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={type || "all"}
          onValueChange={(v) => setType(v === "all" ? null : (v as TransactionType))}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {transactionTypes.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={status || "all"}
          onValueChange={(v) => setStatus(v === "all" ? null : (v as TransactionStatus))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="settled">Settled</SelectItem>
            <SelectItem value="unsettled">Unsettled</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}
