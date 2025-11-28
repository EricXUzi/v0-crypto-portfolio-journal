"use client"

import { useMemo } from "react"
import { useAppStore } from "@/lib/store"
import { useTransactionFilters } from "./transaction-filters"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreVertical, Pencil, Trash2, CheckCircle, LinkIcon, ArrowLeftRight } from "lucide-react"
import { format } from "date-fns"
import type { TransactionType } from "@/lib/types"

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

export function TransactionList() {
  const transactions = useAppStore((state) => state.transactions)
  const accounts = useAppStore((state) => state.accounts)
  const deleteTransaction = useAppStore((state) => state.deleteTransaction)
  const settleTransaction = useAppStore((state) => state.settleTransaction)

  const { search, accountId, type, status } = useTransactionFilters()

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        if (search && !tx.assetSymbol.toLowerCase().includes(search.toLowerCase())) {
          return false
        }
        if (accountId && tx.accountId !== accountId) {
          return false
        }
        if (type && tx.type !== type) {
          return false
        }
        if (status && tx.status !== status) {
          return false
        }
        return true
      })
      .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
  }, [transactions, search, accountId, type, status])

  const getAccountName = (accId: string) => {
    return accounts.find((a) => a.id === accId)?.name || "Unknown"
  }

  if (transactions.length === 0) {
    return (
      <Card className="bg-card">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ArrowLeftRight className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No transactions yet</h3>
          <p className="text-center text-sm text-muted-foreground">
            Record your first transaction to start tracking your trades
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
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Account</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="font-mono text-sm">
                  {format(new Date(tx.transactionDate), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{transactionLabels[tx.type]}</Badge>
                </TableCell>
                <TableCell className="font-medium">{tx.assetSymbol}</TableCell>
                <TableCell className="text-muted-foreground">{getAccountName(tx.accountId)}</TableCell>
                <TableCell className="text-right font-mono">{tx.quantity.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono">{formatUsd(tx.pricePerUnit)}</TableCell>
                <TableCell className="text-right font-mono font-medium">{formatUsd(tx.totalValue)}</TableCell>
                <TableCell>
                  <Badge variant={tx.status === "settled" ? "default" : "secondary"}>{tx.status}</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {tx.status === "unsettled" && (
                        <DropdownMenuItem onClick={() => settleTransaction(tx.id)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Settled
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <LinkIcon className="mr-2 h-4 w-4" />
                        Pair Trade
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteTransaction(tx.id)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
