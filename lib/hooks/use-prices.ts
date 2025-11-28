"use client"

import useSWR from "swr"
import { useAppStore } from "@/lib/store"
import { useEffect } from "react"

const COINGECKO_API = "https://api.coingecko.com/api/v3"

// Map common symbols to CoinGecko IDs
const SYMBOL_TO_ID: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
  USDC: "usd-coin",
  DAI: "dai",
  BNB: "binancecoin",
  SOL: "solana",
  XRP: "ripple",
  ADA: "cardano",
  DOGE: "dogecoin",
  DOT: "polkadot",
  MATIC: "matic-network",
  AVAX: "avalanche-2",
  LINK: "chainlink",
  UNI: "uniswap",
  ATOM: "cosmos",
  LTC: "litecoin",
  ARB: "arbitrum",
  OP: "optimism",
}

interface PriceData {
  [id: string]: {
    usd: number
    usd_24h_change: number
  }
}

const fetcher = async (symbols: string[]): Promise<PriceData> => {
  const ids = symbols
    .map((s) => SYMBOL_TO_ID[s.toUpperCase()])
    .filter(Boolean)
    .join(",")

  if (!ids) return {}

  const res = await fetch(`${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`)

  if (!res.ok) throw new Error("Failed to fetch prices")
  return res.json()
}

export function usePrices(symbols: string[]) {
  const updatePrice = useAppStore((state) => state.updatePrice)
  const priceCache = useAppStore((state) => state.priceCache)

  const { data, error, isLoading } = useSWR(
    symbols.length > 0 ? ["prices", ...symbols] : null,
    () => fetcher(symbols),
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: false,
    },
  )

  useEffect(() => {
    if (data) {
      Object.entries(data).forEach(([id, priceData]) => {
        const symbol = Object.entries(SYMBOL_TO_ID).find(([, v]) => v === id)?.[0]
        if (symbol) {
          updatePrice(symbol, priceData.usd, priceData.usd_24h_change)
        }
      })
    }
  }, [data, updatePrice])

  const getPrice = (symbol: string): number => {
    const cached = priceCache.get(symbol.toUpperCase())
    if (cached) return cached.price

    const id = SYMBOL_TO_ID[symbol.toUpperCase()]
    if (id && data?.[id]) return data[id].usd

    return 0
  }

  const get24hChange = (symbol: string): number => {
    const cached = priceCache.get(symbol.toUpperCase())
    if (cached) return cached.change24h

    const id = SYMBOL_TO_ID[symbol.toUpperCase()]
    if (id && data?.[id]) return data[id].usd_24h_change

    return 0
  }

  return {
    prices: data,
    isLoading,
    error,
    getPrice,
    get24hChange,
  }
}

// Exchange rates hook
export function useExchangeRates() {
  const { data, error, isLoading } = useSWR(
    "exchange-rates",
    async () => {
      const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD")
      if (!res.ok) throw new Error("Failed to fetch exchange rates")
      return res.json()
    },
    {
      refreshInterval: 3600000, // Refresh every hour
      revalidateOnFocus: false,
    },
  )

  return {
    rates: data?.rates as Record<string, number> | undefined,
    isLoading,
    error,
  }
}
