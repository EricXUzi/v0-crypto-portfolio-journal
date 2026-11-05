import { create } from "zustand"
import { calculateTradePair } from "./portfolio"
import { parseBackup } from "./backup"
import { persist } from "zustand/middleware"
import type { Account, Transaction, Asset, PriceCache, TradePair } from "./types"

interface AppState {
  isDemo: boolean
  replaceData: (data: unknown) => void
  resetData: () => void

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
      isDemo: false,
      replaceData: (data) => set({ ...parseBackup(data), priceCache: new Map(), selectedAccountId: null }),
      resetData: () =>
        set({
          accounts: [],
          assets: [],
          transactions: [],
          tradePairs: [],
          isDemo: false,
          priceCache: new Map(),
          selectedAccountId: null,
        }),
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
          accounts: state.accounts.map((a) =>
            a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a,
          ),
        })),

      deleteAccount: (id) => {
        const state = get()
        const deleted = new Set(state.transactions.filter((t) => t.accountId === id).map((t) => t.id))
        const remainingPairs = state.tradePairs.filter(
          (p) => !deleted.has(p.buyTransactionId) && !deleted.has(p.sellTransactionId),
        )
        const pairIds = new Set(remainingPairs.map((p) => p.id))
        set({
          accounts: state.accounts.filter((a) => a.id !== id),
          assets: state.assets.filter((a) => a.accountId !== id),
          transactions: state.transactions
            .filter((t) => !deleted.has(t.id))
            .map((t) => ({ ...t, pairId: t.pairId && pairIds.has(t.pairId) ? t.pairId : undefined })),
          tradePairs: remainingPairs,
          selectedAccountId: state.selectedAccountId === id ? null : state.selectedAccountId,
        })
      },

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

      updateTransaction: (id, updates) => {
        const state = get()
        const transactions = state.transactions.map((t) =>
          t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t,
        )
        const tradePairs = state.tradePairs.map((p) =>
          p.buyTransactionId === id || p.sellTransactionId === id
            ? {
                ...p,
                ...calculateTradePair(
                  transactions.find((t) => t.id === p.buyTransactionId)!,
                  transactions.find((t) => t.id === p.sellTransactionId)!,
                ),
              }
            : p,
        )
        set({ transactions, tradePairs })
      },
      deleteTransaction: (id) => {
        const state = get()
        const pair = state.tradePairs.find((p) => p.buyTransactionId === id || p.sellTransactionId === id)
        set({
          transactions: state.transactions
            .filter((t) => t.id !== id)
            .map((t) => (pair && t.pairId === pair.id ? { ...t, pairId: undefined } : t)),
          tradePairs: state.tradePairs.filter((p) => p.id !== pair?.id),
        })
      },

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

        if (!buyTx || !sellTx) throw new Error("Select two existing transactions.")
        if (buyTx.pairId || sellTx.pairId) throw new Error("A selected transaction is already paired.")
        const { pnl, pnlPercentage, roi, holdingDays, apr } = calculateTradePair(buyTx, sellTx)

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
              roi,
              apr,
              holdingDays,
              createdAt: new Date(),
            },
          ],
          transactions: state.transactions.map((t) =>
            t.id === buyId || t.id === sellId
              ? { ...t, pairId, status: "settled" as const, updatedAt: new Date() }
              : t,
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
        isDemo: state.isDemo,
      }),
    },
  ),
)
