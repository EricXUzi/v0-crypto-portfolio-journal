"use client"
import Link from "next/link"
import { useAppStore } from "@/lib/store"
import { createDemoData } from "@/lib/demo"
import { usePortfolio } from "@/lib/hooks/use-portfolio"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowRight, Wallet, BookOpen, Layers, RefreshCw } from "lucide-react"
const usd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n)
export function WorkspaceOverview() {
  const { summary, accounts, assets, unpricedAssets, error, refresh, isLoading } = usePortfolio()
  const isDemo = useAppStore((s) => s.isDemo)
  const replaceData = useAppStore((s) => s.replaceData)
  const txCount = useAppStore((s) => s.transactions.length)
  const pairs = useAppStore((s) => s.tradePairs)
  if (!accounts.length && !assets.length && !txCount)
    return (
      <section className="overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-10">
        <div className="max-w-xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[.18em] text-primary">
            A clearer view of your capital
          </p>
          <h2 className="text-3xl font-semibold leading-tight sm:text-5xl">
            Every position.
            <br />
            Every decision.
            <br />
            <span className="text-primary">In perspective.</span>
          </h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">
            Bring your accounts together, keep a record of your trades, and learn from the results. Your
            workspace starts here.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/accounts">
                Create your first account <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button variant="outline" onClick={() => replaceData(createDemoData())}>
              Explore with demo data
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            No sign-up. No wallet connection. Data stays in this browser.
          </p>
        </div>
        <div className="mt-10 grid gap-5 border-t border-border pt-6 sm:grid-cols-3">
          {[
            [Wallet, "Add accounts", "Organize exchanges and wallets."],
            [Layers, "Track holdings", "Record balances and cost basis."],
            [BookOpen, "Review decisions", "Pair exits with entries to see net PnL."],
          ].map(([Icon, title, description]) => {
            const I = Icon as typeof Wallet
            return (
              <div key={String(title)}>
                <I className="mb-3 size-5 text-primary" />
                <p className="text-sm font-semibold">{String(title)}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{String(description)}</p>
              </div>
            )
          })}
        </div>
      </section>
    )
  const exposures = [
    { label: "Risk assets", value: summary.volatileAssetValue, color: "bg-primary" },
    { label: "Stablecoins", value: summary.stablecoinValue, color: "bg-success" },
    { label: "NFTs", value: summary.nftValue, color: "bg-chart-3" },
  ]
  return (
    <div className="space-y-5">
      {isDemo && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-primary">
          <span>
            Demo workspace · Illustrative holdings and fixed prices. These are not live market quotes.
          </span>
          <Link href="/settings" className="font-semibold underline">
            Manage demo data
          </Link>
        </div>
      )}
      {(error || unpricedAssets.length > 0) && (
        <p
          role="status"
          className="rounded-lg border border-warning/25 bg-warning/5 p-3 text-xs text-warning"
        >
          {error ? "Live quotes are unavailable. " : ""}
          {unpricedAssets.length
            ? `${unpricedAssets.length} unpriced holding(s) excluded from valuation and unrealized PnL. Set a manual price in Assets.`
            : "Previously fetched quotes may be stale."}
        </p>
      )}
      <section className="grid overflow-hidden rounded-2xl border border-border bg-card xl:grid-cols-[1.2fr_1fr]">
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-[.14em] text-muted-foreground">
              Portfolio valuation
            </p>
            <Button
              aria-label="Refresh market prices"
              size="icon"
              variant="ghost"
              onClick={() => refresh()}
              disabled={isLoading}
            >
              <RefreshCw className={isLoading ? "size-4 animate-spin" : "size-4"} />
            </Button>
          </div>
          <p className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
            {usd(summary.totalValueUsd)}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            {accounts.length} accounts <span className="mx-2">·</span>
            {assets.length} holdings <span className="mx-2">·</span>USD
          </p>
          <div
            className="mt-8 flex h-3 overflow-hidden rounded-full bg-secondary"
            aria-label="Asset allocation"
          >
            {exposures.map((e) => (
              <div
                key={e.label}
                className={e.color}
                style={{ width: `${summary.totalValueUsd ? (e.value / summary.totalValueUsd) * 100 : 0}%` }}
              />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {exposures.map((e) => (
              <span key={e.label} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className={`size-2 rounded-full ${e.color}`} />
                {e.label}
                <strong className="font-mono text-foreground">
                  {summary.totalValueUsd ? ((e.value / summary.totalValueUsd) * 100).toFixed(0) : 0}%
                </strong>
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 border-t border-border bg-secondary/30 xl:border-l xl:border-t-0">
          {[
            {
              label: "Realized PnL",
              value: usd(summary.settledPnl),
              detail: `${pairs.length} paired trades · after fees`,
              positive: summary.settledPnl >= 0,
            },
            {
              label: "Unrealized PnL",
              value: usd(summary.unsettledPnl),
              detail: "Valued holdings vs. cost basis",
              positive: summary.unsettledPnl >= 0,
            },
            {
              label: "Stablecoin reserve",
              value: usd(summary.stablecoinValue),
              detail: "Current marked value",
            },
            { label: "Transactions", value: String(txCount), detail: "Recorded in your journal" },
          ].map((s, i) => (
            <div
              key={s.label}
              className={`p-5 sm:p-6 ${i < 2 ? "border-b border-border" : ""} ${i % 2 === 0 ? "border-r border-border" : ""}`}
            >
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p
                className={`mt-3 text-xl font-semibold tracking-tight sm:text-2xl ${s.positive === undefined ? "" : s.positive ? "text-success" : "text-destructive"}`}
              >
                {s.value}
              </p>
              <p className="mt-2 text-[10px] text-muted-foreground">{s.detail}</p>
            </div>
          ))}
        </div>
      </section>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>Balances are maintained manually. Journal entries do not move funds or change holdings.</p>
        <Link href="/assets" className="inline-flex items-center gap-1 text-primary">
          Manage holdings <ArrowUpRight className="size-3" />
        </Link>
      </div>
    </div>
  )
}
