"use client"

import { useMemo } from "react"
import { useAppStore } from "@/lib/store"
import { usePrices } from "./use-prices"
import type { PortfolioSummary } from "@/lib/types"

const STABLECOINS = ["USDT", "USDC", "DAI", "BUSD", "TUSD", "FRAX"]

export function usePortfolio() {
  const assets = useAppStore((state) => state.assets)
  const transactions = useAppStore((state) => state.transactions)
  const accounts = useAppStore((state) => state.accounts)
  const priceCache = useAppStore((state) => state.priceCache)

  // Get unique symbols from assets
  const symbols = useMemo(() => {
    const symbolSet = new Set<string>()
    assets.forEach((a) => symbolSet.add(a.symbol.toUpperCase()))
    return Array.from(symbolSet)
  }, [assets])

  const { getPrice, get24hChange, isLoading } = usePrices(symbols)

  const summary = useMemo<PortfolioSummary>(() => {
    let stablecoinValue = 0
    let volatileAssetValue = 0
    let nftValue = 0
    let previousTotalValue = 0

    assets.forEach((asset) => {
      const symbol = asset.symbol.toUpperCase()
      const price = asset.manualPrice ?? getPrice(symbol)
      const value = asset.quantity * price
      const change24h = get24hChange(symbol)
      const previousValue = change24h !== 0 ? value / (1 + change24h / 100) : value

      previousTotalValue += previousValue

      if (asset.category === "stablecoin" || STABLECOINS.includes(symbol)) {
        stablecoinValue += value
      } else if (asset.category === "nft") {
        nftValue += value
      } else {
        volatileAssetValue += value
      }
    })

    const totalValueUsd = stablecoinValue + volatileAssetValue + nftValue
    const dailyChange = totalValueUsd - previousTotalValue
    const dailyChangePercent = previousTotalValue > 0 ? (dailyChange / previousTotalValue) * 100 : 0

    // Calculate settled and unsettled PnL
    const settledPnl = transactions
      .filter((t) => t.status === "settled")
      .reduce((sum, t) => {
        if (t.type === "swap" || t.type === "spot") {
          return sum + (t.totalValue - t.quantity * (t.pricePerUnit || 0) - t.fee)
        }
        return sum
      }, 0)

    const unsettledPnl = assets.reduce((sum, asset) => {
      const currentPrice = asset.manualPrice ?? getPrice(asset.symbol)
      const currentValue = asset.quantity * currentPrice
      const costBasis = asset.quantity * asset.averageCost
      return sum + (currentValue - costBasis)
    }, 0)

    return {
      totalValueUsd,
      stablecoinValue,
      volatileAssetValue,
      nftValue,
      settledPnl,
      unsettledPnl,
      dailyChange,
      dailyChangePercent,
    }
  }, [assets, getPrice, get24hChange, transactions])

  const assetsByAccount = useMemo(() => {
    const grouped: Record<string, typeof assets> = {}
    accounts.forEach((acc) => {
      grouped[acc.id] = assets.filter((a) => a.accountId === acc.id)
    })
    return grouped
  }, [assets, accounts])

  return {
    summary,
    assets,
    assetsByAccount,
    accounts,
    isLoading,
    getPrice,
    get24hChange,
  }
}
