// Core Types for Web3 Portfolio System

export type AccountType = "cex" | "evm_wallet" | "solana_wallet" | "cold_wallet" | "other"

export type AssetCategory = "stablecoin" | "volatile" | "nft"

export type TransactionType =
  | "swap"
  | "spot"
  | "fiat_ramp"
  | "tge_ido"
  | "staking"
  | "lp"
  | "nft_buy"
  | "nft_sell"
  | "nft_mint"
  | "airdrop"
  | "gas_fee"
  | "transfer"

export type TransactionStatus = "settled" | "unsettled"

export interface Account {
  id: string
  name: string
  type: AccountType
  address?: string // For wallet addresses
  exchange?: string // For CEX accounts
  icon?: string
  createdAt: Date
  updatedAt: Date
}

export interface Asset {
  id: string
  accountId: string
  symbol: string
  name: string
  category: AssetCategory
  quantity: number
  averageCost: number // USD cost basis per unit
  manualPrice?: number // For manual price override
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  id: string
  accountId: string
  type: TransactionType
  status: TransactionStatus

  // Asset details
  assetSymbol: string
  assetName: string
  quantity: number
  pricePerUnit: number // in USD
  totalValue: number // quantity * pricePerUnit

  // For swaps/trades
  fromAsset?: string
  fromQuantity?: number
  toAsset?: string
  toQuantity?: number

  // Fees
  fee: number
  feeAsset: string

  // Trade pairing
  pairId?: string // Links buy/sell transactions

  // Metadata
  notes?: string
  aiAnalysis?: string
  tags?: string[]

  // Timestamps
  transactionDate: Date
  createdAt: Date
  updatedAt: Date
}

export interface TradePair {
  id: string
  buyTransactionId: string
  sellTransactionId: string

  // Calculated fields
  pnl: number
  pnlPercentage: number
  roi: number
  apr: number
  holdingDays: number

  notes?: string
  aiAnalysis?: string

  createdAt: Date
}

export interface PriceCache {
  symbol: string
  price: number
  change24h: number
  lastUpdated: Date
}

export interface PortfolioSummary {
  totalValueUsd: number
  stablecoinValue: number
  volatileAssetValue: number
  nftValue: number
  settledPnl: number
  unsettledPnl: number
  dailyChange: number
  dailyChangePercent: number
}

// Exchange rate for fiat display
export interface ExchangeRate {
  currency: string
  rate: number // to USD
  lastUpdated: Date
}
