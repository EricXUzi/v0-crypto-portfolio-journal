import type { Account, Asset, Transaction, TradePair } from "./types.ts"
import { z } from "zod"
import { calculateTradePair } from "./portfolio.ts"

const number = z.number().finite().nonnegative()
const text = z.string().trim().min(1)
const dates = { createdAt: z.coerce.date(), updatedAt: z.coerce.date() }
const account = z.object({
  id: text,
  name: text,
  type: z.enum(["cex", "evm_wallet", "solana_wallet", "cold_wallet", "other"]),
  address: z.string().optional(),
  exchange: z.string().optional(),
  icon: z.string().optional(),
  ...dates,
})
const asset = z.object({
  id: text,
  accountId: text,
  symbol: text,
  name: text,
  category: z.enum(["stablecoin", "volatile", "nft"]),
  quantity: number,
  averageCost: number,
  manualPrice: number.optional(),
  ...dates,
})
export const transactionSchema = z
  .object({
    id: text,
    accountId: text,
    type: z.enum([
      "swap",
      "spot",
      "fiat_ramp",
      "tge_ido",
      "staking",
      "lp",
      "nft_buy",
      "nft_sell",
      "nft_mint",
      "airdrop",
      "gas_fee",
      "transfer",
    ]),
    side: z.enum(["buy", "sell"]).optional(),
    status: z.enum(["settled", "unsettled"]),
    assetSymbol: text,
    assetName: text,
    quantity: number.positive(),
    pricePerUnit: number,
    totalValue: number,
    fromAsset: z.string().optional(),
    fromQuantity: number.optional(),
    toAsset: z.string().optional(),
    toQuantity: number.optional(),
    fee: number,
    feeAsset: text,
    feeUsd: number.optional(),
    pairId: z.string().optional(),
    notes: z.string().optional(),
    aiAnalysis: z.string().optional(),
    tags: z.array(z.string()).optional(),
    transactionDate: z.coerce.date(),
    ...dates,
  })
  .refine(
    (t) => Math.abs(t.totalValue - t.quantity * t.pricePerUnit) <= Math.max(0.01, t.totalValue * 1e-9),
    { message: "Transaction value must equal quantity × price." },
  )
const pair = z.object({
  id: text,
  buyTransactionId: text,
  sellTransactionId: text,
  createdAt: z.coerce.date(),
  notes: z.string().optional(),
  aiAnalysis: z.string().optional(),
})
const backup = z.object({
  schemaVersion: z.literal(1).optional(),
  accounts: z.array(account),
  assets: z.array(asset),
  transactions: z.array(transactionSchema),
  tradePairs: z.array(pair),
  isDemo: z.boolean().optional(),
})

export function parseBackup(input: unknown) {
  const data = backup.parse(input)
  for (const records of [data.accounts, data.assets, data.transactions, data.tradePairs]) {
    if (new Set(records.map((r) => r.id)).size !== records.length)
      throw new Error("Duplicate record IDs in backup.")
  }
  const accountIds = new Set(data.accounts.map((a) => a.id))
  if ([...data.assets, ...data.transactions].some((r) => !accountIds.has(r.accountId)))
    throw new Error("Backup references an account that does not exist.")
  const paired = new Set<string>()
  const tradePairs = data.tradePairs.map((p) => {
    const buy = data.transactions.find((t) => t.id === p.buyTransactionId)
    const sell = data.transactions.find((t) => t.id === p.sellTransactionId)
    if (!buy || !sell) throw new Error("Backup contains a trade pair with missing transactions.")
    if (paired.has(buy.id) || paired.has(sell.id))
      throw new Error("A transaction cannot belong to two pairs.")
    paired.add(buy.id)
    paired.add(sell.id)
    return { ...p, ...calculateTradePair(buy, sell) }
  })
  // Derive links and metrics from records rather than trusting cached PnL.
  const transactions = data.transactions.map((t) => ({
    ...t,
    pairId: tradePairs.find((p) => p.buyTransactionId === t.id || p.sellTransactionId === t.id)?.id,
  }))
  return {
    accounts: data.accounts,
    assets: data.assets,
    transactions,
    tradePairs,
    isDemo: data.isDemo ?? false,
  }
}
export type PortfolioData = ReturnType<typeof parseBackup>

export function createBackup(data: {
  accounts: Account[]
  assets: Asset[]
  transactions: Transaction[]
  tradePairs: TradePair[]
  isDemo: boolean
}) {
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    accounts: data.accounts,
    assets: data.assets,
    transactions: data.transactions,
    tradePairs: data.tradePairs,
    isDemo: data.isDemo,
  }
}
