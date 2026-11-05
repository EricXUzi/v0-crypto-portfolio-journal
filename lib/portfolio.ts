import type { Asset, PortfolioSummary, Transaction, TradePair } from "./types.ts"

const USD_FEES = new Set(["USD", "USDT", "USDC", "DAI"])
export function feeInUsd(tx: Transaction): number {
  if (tx.fee === 0) return 0
  if (tx.feeUsd !== undefined) return tx.feeUsd
  if (USD_FEES.has(tx.feeAsset.toUpperCase())) return tx.fee
  throw new Error(`Enter the USD equivalent of the ${tx.feeAsset} fee before pairing this trade.`)
}

export function calculateTradePair(buy: Transaction, sell: Transaction) {
  if (buy.id === sell.id) throw new Error("Select two different transactions.")
  if (buy.assetSymbol.toUpperCase() !== sell.assetSymbol.toUpperCase() || buy.accountId !== sell.accountId)
    throw new Error("Pair the same asset in the same account.")
  if (
    buy.side === "sell" ||
    sell.side === "buy" ||
    buy.type === "nft_sell" ||
    !["spot", "swap", "tge_ido", "nft_buy", "nft_mint", "airdrop"].includes(buy.type) ||
    !["spot", "swap", "nft_sell"].includes(sell.type)
  )
    throw new Error("Select a buy first and a sell second.")
  if (
    buy.quantity <= 0 ||
    sell.quantity <= 0 ||
    Math.abs(buy.quantity - sell.quantity) > Math.max(buy.quantity, sell.quantity) * 1e-9
  )
    throw new Error("Pair equal quantities. Split partial exits into separate transaction records first.")
  const elapsed = new Date(sell.transactionDate).getTime() - new Date(buy.transactionDate).getTime()
  if (!Number.isFinite(elapsed) || elapsed < 0)
    throw new Error("The sell date must be on or after the buy date.")
  const cost = buy.totalValue + feeInUsd(buy)
  const pnl = sell.totalValue - feeInUsd(sell) - cost
  const roi = cost > 0 ? (pnl / cost) * 100 : 0
  const holdingDays = elapsed / 86_400_000
  return { pnl, pnlPercentage: roi, roi, holdingDays, apr: holdingDays >= 1 ? (roi / holdingDays) * 365 : 0 }
}

export function summarizePortfolio(
  assets: Asset[],
  pairs: TradePair[],
  getPrice: (s: string) => number,
  getChange: (s: string) => number,
): PortfolioSummary {
  let stablecoinValue = 0,
    volatileAssetValue = 0,
    nftValue = 0,
    previous = 0,
    unsettledPnl = 0
  for (const asset of assets) {
    const price = asset.manualPrice ?? getPrice(asset.symbol)
    // Missing quotes are unknown, not a total loss. A manual zero is a valid valuation.
    if (asset.manualPrice === undefined && !(price > 0)) continue
    const value = price * asset.quantity
    const change = asset.manualPrice === undefined ? getChange(asset.symbol) : 0
    previous += change > -100 ? value / (1 + change / 100) : value
    unsettledPnl += value - asset.quantity * asset.averageCost
    if (asset.category === "stablecoin") stablecoinValue += value
    else if (asset.category === "nft") nftValue += value
    else volatileAssetValue += value
  }
  const totalValueUsd = stablecoinValue + volatileAssetValue + nftValue
  return {
    totalValueUsd,
    stablecoinValue,
    volatileAssetValue,
    nftValue,
    unsettledPnl,
    settledPnl: pairs.reduce((sum, pair) => sum + pair.pnl, 0),
    dailyChange: totalValueUsd - previous,
    dailyChangePercent: previous > 0 ? ((totalValueUsd - previous) / previous) * 100 : 0,
  }
}
