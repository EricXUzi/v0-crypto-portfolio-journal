import { calculateTradePair } from "./portfolio"
import type { Account, Asset, Transaction } from "./types"
export function createDemoData() {
  const now = new Date()
  const ago = (days: number) => new Date(now.getTime() - days * 86400000)
  const accounts: Account[] = [
    {
      id: "demo-exchange",
      name: "Trading account",
      type: "cex",
      exchange: "Demo exchange",
      createdAt: now,
      updatedAt: now,
    },
    { id: "demo-wallet", name: "Long-term wallet", type: "cold_wallet", createdAt: now, updatedAt: now },
  ]
  const assets: Asset[] = [
    {
      id: "demo-btc",
      accountId: "demo-wallet",
      symbol: "BTC",
      name: "Bitcoin",
      category: "volatile",
      quantity: 0.25,
      averageCost: 60000,
      manualPrice: 68000,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "demo-eth",
      accountId: "demo-exchange",
      symbol: "ETH",
      name: "Ethereum",
      category: "volatile",
      quantity: 3,
      averageCost: 2200,
      manualPrice: 2600,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "demo-usdc",
      accountId: "demo-exchange",
      symbol: "USDC",
      name: "USD Coin",
      category: "stablecoin",
      quantity: 12000,
      averageCost: 1,
      manualPrice: 1,
      createdAt: now,
      updatedAt: now,
    },
  ]
  const transactions: Transaction[] = []
  const tradePairs = [60, 30, 5].map((days, i) => {
    const buy: Transaction = {
      id: `demo-buy-${i}`,
      accountId: "demo-exchange",
      type: "spot",
      side: "buy",
      status: "settled",
      assetSymbol: "SOL",
      assetName: "Solana",
      quantity: 10,
      pricePerUnit: 100,
      totalValue: 1000,
      fee: 2,
      feeAsset: "USD",
      notes: "Sample entry: predefined position size and exit level.",
      transactionDate: ago(days + 10),
      createdAt: now,
      updatedAt: now,
    }
    const sell: Transaction = {
      ...buy,
      id: `demo-sell-${i}`,
      side: "sell",
      pricePerUnit: i === 1 ? 90 : 125,
      totalValue: i === 1 ? 900 : 1250,
      notes: "Sample exit: reviewed the original trade plan.",
      transactionDate: ago(days),
    }
    const pair = {
      id: `demo-pair-${i}`,
      buyTransactionId: buy.id,
      sellTransactionId: sell.id,
      ...calculateTradePair(buy, sell),
      createdAt: now,
    }
    buy.pairId = pair.id
    sell.pairId = pair.id
    transactions.push(buy, sell)
    return pair
  })
  return { accounts, assets, transactions, tradePairs, isDemo: true }
}
