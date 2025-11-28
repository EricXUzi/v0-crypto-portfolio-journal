import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Account, Transaction, Asset, PriceCache, TradePair } from "./types"

interface AppState {
  // Data
  accounts: Account[]
  transactions: Transaction[]
  assets: Asset[]
  priceCache: Map<string, PriceCache>
  tradePairs: TradePair[]

  // UI State
  selectedAccountId: string | null

  // Account Actions
  addAccount: (account: Omit<Account, "id" | "createdAt" | "updatedAt">) => void
  updateAccount: (id: string, updates: Partial<Account>) => void
  deleteAccount: (id: string) => void

  // Transaction Actions
  addTransaction: (transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  settleTransaction: (id: string) => void

  // Asset Actions
  addAsset: (asset: Omit<Asset, "id" | "createdAt" | "updatedAt">) => void
  updateAsset: (id: string, updates: Partial<Asset>) => void
  deleteAsset: (id: string) => void

  // Trade Pair Actions
  createTradePair: (buyId: string, sellId: string) => void
  deleteTradePair: (id: string) => void

  // Price Actions
  updatePrice: (symbol: string, price: number, change24h: number) => void

  // UI Actions
  setSelectedAccount: (id: string | null) => void
}

const generateId = () => crypto.randomUUID()

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      accounts: [],
      transactions: [],
      assets: [],
      priceCache: new Map(),
      tradePairs: [],
      selectedAccountId: null,

      // Account Actions
      addAccount: (account) =>
        set((state) => ({
          accounts: [
            ...state.accounts,
            {
              ...account,
              id: generateId(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        })),

      updateAccount: (id, updates) =>
        set((state) => ({
          accounts: state.accounts.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a)),
        })),

      deleteAccount: (id) =>
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
          transactions: state.transactions.filter((t) => t.accountId !== id),
          assets: state.assets.filter((a) => a.accountId !== id),
        })),

      // Transaction Actions
      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [
            ...state.transactions,
            {
              ...transaction,
              id: generateId(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        })),

      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t)),
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      settleTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, status: "settled" as const, updatedAt: new Date() } : t,
          ),
        })),

      // Asset Actions
      addAsset: (asset) =>
        set((state) => ({
          assets: [
            ...state.assets,
            {
              ...asset,
              id: generateId(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        })),

      updateAsset: (id, updates) =>
        set((state) => ({
          assets: state.assets.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a)),
        })),

      deleteAsset: (id) =>
        set((state) => ({
          assets: state.assets.filter((a) => a.id !== id),
        })),

      // Trade Pair Actions
      createTradePair: (buyId, sellId) => {
        const state = get()
        const buyTx = state.transactions.find((t) => t.id === buyId)
        const sellTx = state.transactions.find((t) => t.id === sellId)

        if (!buyTx || !sellTx) return

        const pnl = sellTx.totalValue - buyTx.totalValue - buyTx.fee - sellTx.fee
        const pnlPercentage = (pnl / buyTx.totalValue) * 100
        const holdingDays = Math.ceil(
          (new Date(sellTx.transactionDate).getTime() - new Date(buyTx.transactionDate).getTime()) /
            (1000 * 60 * 60 * 24),
        )
        const apr = holdingDays > 0 ? (pnlPercentage / holdingDays) * 365 : 0

        const pairId = generateId()

        set((state) => ({
          tradePairs: [
            ...state.tradePairs,
            {
              id: pairId,
              buyTransactionId: buyId,
              sellTransactionId: sellId,
              pnl,
              pnlPercentage,
              roi: pnlPercentage,
              apr,
              holdingDays,
              createdAt: new Date(),
            },
          ],
          transactions: state.transactions.map((t) =>
            t.id === buyId || t.id === sellId ? { ...t, pairId, status: "settled" as const, updatedAt: new Date() } : t,
          ),
        }))
      },

      deleteTradePair: (id) => {
        const state = get()
        const pair = state.tradePairs.find((p) => p.id === id)
        if (!pair) return

        set((state) => ({
          tradePairs: state.tradePairs.filter((p) => p.id !== id),
          transactions: state.transactions.map((t) =>
            t.id === pair.buyTransactionId || t.id === pair.sellTransactionId
              ? { ...t, pairId: undefined, updatedAt: new Date() }
              : t,
          ),
        }))
      },

      // Price Actions
      updatePrice: (symbol, price, change24h) =>
        set((state) => {
          const newCache = new Map(state.priceCache)
          newCache.set(symbol.toUpperCase(), {
            symbol: symbol.toUpperCase(),
            price,
            change24h,
            lastUpdated: new Date(),
          })
          return { priceCache: newCache }
        }),

      // UI Actions
      setSelectedAccount: (id) => set({ selectedAccountId: id }),
    }),
    {
      name: "cryptofolio-storage",
      partialize: (state) => ({
        accounts: state.accounts,
        transactions: state.transactions,
        assets: state.assets,
        tradePairs: state.tradePairs,
      }),
    },
  ),
)
