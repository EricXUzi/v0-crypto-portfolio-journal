"use client"
import { useMemo } from "react"
import { useAppStore } from "@/lib/store"
import { usePrices } from "./use-prices"
import { summarizePortfolio } from "@/lib/portfolio"

export function usePortfolio() {
  const assets = useAppStore((s) => s.assets)
  const accounts = useAppStore((s) => s.accounts)
  const pairs = useAppStore((s) => s.tradePairs)
  const symbols = useMemo(
    () =>
      [
        ...new Set(assets.filter((a) => a.manualPrice === undefined).map((a) => a.symbol.toUpperCase())),
      ].sort(),
    [assets],
  )
  const { getPrice, get24hChange, isLoading, error, refresh, lastUpdated } = usePrices(symbols)
  const summary = useMemo(
    () => summarizePortfolio(assets, pairs, getPrice, get24hChange),
    [assets, pairs, getPrice, get24hChange],
  )
  const assetsByAccount = useMemo(
    () => Object.fromEntries(accounts.map((a) => [a.id, assets.filter((x) => x.accountId === a.id)])),
    [assets, accounts],
  )
  const unpricedAssets = assets.filter(
    (a) => a.quantity > 0 && a.manualPrice === undefined && getPrice(a.symbol) <= 0,
  )
  return {
    summary,
    assets,
    assetsByAccount,
    accounts,
    isLoading,
    getPrice,
    get24hChange,
    unpricedAssets,
    error,
    refresh,
    lastUpdated,
  }
}
