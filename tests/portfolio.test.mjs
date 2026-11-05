import { test } from "node:test"
import assert from "node:assert/strict"
import { calculateTradePair, summarizePortfolio } from "../lib/portfolio.ts"
import { parseBackup, createBackup } from "../lib/backup.ts"
const date = new Date("2026-01-01T00:00:00Z")
const buy = {
  id: "b",
  accountId: "a",
  type: "spot",
  side: "buy",
  status: "settled",
  assetSymbol: "ETH",
  assetName: "Ethereum",
  quantity: 2,
  pricePerUnit: 100,
  totalValue: 200,
  fee: 2,
  feeAsset: "USD",
  transactionDate: date,
  createdAt: date,
  updatedAt: date,
}
const sell = {
  ...buy,
  id: "s",
  side: "sell",
  pricePerUnit: 150,
  totalValue: 300,
  fee: 3,
  transactionDate: new Date("2026-01-11T00:00:00Z"),
}
const account = { id: "a", name: "Test", type: "cex", createdAt: date, updatedAt: date }
const holding = {
  id: "h",
  accountId: "a",
  symbol: "ETH",
  name: "Ethereum",
  category: "volatile",
  quantity: 2,
  averageCost: 100,
  createdAt: date,
  updatedAt: date,
}
const backup = () => ({
  accounts: [account],
  assets: [holding],
  transactions: [buy, sell],
  tradePairs: [{ id: "p", buyTransactionId: "b", sellTransactionId: "s", createdAt: date }],
})
test("realized PnL includes both USD fees and fee-inclusive ROI", () => {
  const p = calculateTradePair(buy, sell)
  assert.equal(p.pnl, 95)
  assert.equal(p.roi, (95 / 202) * 100)
  assert.equal(p.holdingDays, 10)
})
test("pair requires distinct records, equal quantities, matching account and asset, ordered dates and sides", () => {
  for (const [b, s] of [
    [buy, buy],
    [buy, { ...sell, quantity: 1 }],
    [buy, { ...sell, accountId: "z" }],
    [buy, { ...sell, assetSymbol: "SOL" }],
    [buy, { ...sell, transactionDate: new Date(0) }],
    [{ ...buy, side: "sell" }, sell],
  ])
    assert.throws(() => calculateTradePair(b, s))
})
test("non-USD fees require an explicit USD equivalent", () => {
  assert.throws(() => calculateTradePair({ ...buy, feeAsset: "ETH" }, sell))
  assert.equal(calculateTradePair({ ...buy, feeAsset: "ETH", feeUsd: 4 }, sell).pnl, 93)
})
test("same-day trades produce finite APR", () => {
  assert.equal(calculateTradePair(buy, { ...sell, transactionDate: date }).apr, 0)
})
test("missing quotes do not turn cost basis into a total loss", () => {
  const s = summarizePortfolio(
    [holding],
    [],
    () => 0,
    () => 0,
  )
  assert.equal(s.totalValueUsd, 0)
  assert.equal(s.unsettledPnl, 0)
})
test("manual zero is valid and manual prices do not use live daily changes", () => {
  assert.equal(
    summarizePortfolio(
      [{ ...holding, manualPrice: 0 }],
      [],
      () => 150,
      () => 20,
    ).unsettledPnl,
    -200,
  )
  assert.equal(
    summarizePortfolio(
      [{ ...holding, manualPrice: 150 }],
      [],
      () => 150,
      () => 20,
    ).dailyChange,
    0,
  )
})
test("portfolio realized PnL comes from closed pairs", () => {
  const p = {
    id: "p",
    buyTransactionId: "b",
    sellTransactionId: "s",
    createdAt: date,
    ...calculateTradePair(buy, sell),
  }
  assert.equal(
    summarizePortfolio(
      [holding],
      [p],
      () => 150,
      () => 0,
    ).settledPnl,
    95,
  )
})
test("backup roundtrip restores dates, links and derived PnL", () => {
  const parsed = parseBackup(backup())
  const restored = parseBackup(JSON.parse(JSON.stringify(createBackup(parsed))))
  assert.ok(restored.transactions[0].transactionDate instanceof Date)
  assert.equal(restored.transactions[0].pairId, "p")
  assert.equal(restored.tradePairs[0].pnl, 95)
})
test("invalid backups are rejected before any state replacement", () => {
  const cases = [
    {},
    { ...backup(), schemaVersion: 2 },
    { ...backup(), accounts: [] },
    { ...backup(), transactions: [buy] },
    { ...backup(), assets: [{ ...holding, quantity: -1 }] },
    { ...backup(), accounts: [account, account] },
    { ...backup(), transactions: [{ ...buy, totalValue: 999 }, sell] },
    { ...backup(), tradePairs: [...backup().tradePairs, { ...backup().tradePairs[0], id: "p2" }] },
  ]
  for (const data of cases) assert.throws(() => parseBackup(data))
})
