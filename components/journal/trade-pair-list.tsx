"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Trash2, Sparkles, TrendingUp, TrendingDown, Clock, Calendar, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value)
}

function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`
}

export function TradePairList() {
  const tradePairs = useAppStore((state) => state.tradePairs)
  const transactions = useAppStore((state) => state.transactions)
  const deleteTradePair = useAppStore((state) => state.deleteTradePair)
  const updateTransaction = useAppStore((state) => state.updateTransaction)

  const [analyzingId, setAnalyzingId] = useState<string | null>(null)

  const pairsWithDetails = tradePairs
    .map((pair) => {
      const buyTx = transactions.find((t) => t.id === pair.buyTransactionId)
      const sellTx = transactions.find((t) => t.id === pair.sellTransactionId)
      return { ...pair, buyTx, sellTx }
    })
    .filter((p) => p.buyTx && p.sellTx)

  const handleAiAnalysis = async (pairId: string) => {
    const pair = pairsWithDetails.find((p) => p.id === pairId)
    if (!pair || !pair.buyTx || !pair.sellTx) return

    setAnalyzingId(pairId)

    const review = [
      "Local rule-based review · not AI-generated or investment advice.",
      `Net result: ${formatUsd(pair.pnl)} after entry and exit fees.`,
      `Holding period: ${pair.holdingDays.toFixed(1)} days.`,
      pair.pnl >= 0
        ? "Review whether the exit followed the original target, rather than judging the decision only by the profit."
        : "Compare the exit with your planned invalidation level and review whether the position size was appropriate.",
      "Execution quality and risk-adjusted performance cannot be inferred from prices alone. Record your entry thesis, position size, stop level and reason for exit.",
    ].join("\n\n")
    updateTransaction(pair.sellTx.id, { aiAnalysis: review })
    setAnalyzingId(null)
  }

  if (pairsWithDetails.length === 0) {
    return (
      <Card className="bg-card">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <TrendingUp className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No trade pairs yet</h3>
          <p className="mb-4 text-center text-sm text-muted-foreground">
            Pair your buy and sell transactions to track performance and review your decisions
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {pairsWithDetails.map((pair) => {
        const isProfitable = pair.pnl >= 0

        return (
          <Card key={pair.id} className="bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full",
                      isProfitable ? "bg-success/10" : "bg-destructive/10",
                    )}
                  >
                    {isProfitable ? (
                      <TrendingUp className="h-5 w-5 text-success" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{pair.buyTx?.assetSymbol}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {format(new Date(pair.buyTx!.transactionDate), "MMM d")} -{" "}
                        {format(new Date(pair.sellTx!.transactionDate), "MMM d, yyyy")}
                      </span>
                      <Clock className="ml-2 h-3 w-3" />
                      <span>{pair.holdingDays.toFixed(1)} days</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={isProfitable ? "default" : "destructive"}>
                    {formatUsd(pair.pnl)} ({formatPercent(pair.pnlPercentage)})
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Unpair trade"
                    onClick={() => {
                      if (window.confirm("Unpair this trade? The transaction records will remain."))
                        deleteTradePair(pair.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">Buy Price</p>
                  <p className="font-mono font-semibold">{formatUsd(pair.buyTx!.pricePerUnit)}</p>
                </div>
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">Sell Price</p>
                  <p className="font-mono font-semibold">{formatUsd(pair.sellTx!.pricePerUnit)}</p>
                </div>
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">ROI</p>
                  <p
                    className={cn(
                      "font-mono font-semibold",
                      isProfitable ? "text-success" : "text-destructive",
                    )}
                  >
                    {formatPercent(pair.roi)}
                  </p>
                </div>
                <div className="rounded-lg bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">APR</p>
                  <p
                    className={cn(
                      "font-mono font-semibold",
                      pair.apr >= 0 ? "text-success" : "text-destructive",
                    )}
                  >
                    {pair.holdingDays >= 1 ? formatPercent(pair.apr) : "—"}
                  </p>
                </div>
              </div>

              <Accordion type="single" collapsible>
                <AccordionItem value="analysis" className="border-none">
                  <AccordionTrigger className="py-2 hover:no-underline">
                    <span className="flex items-center gap-2 text-sm">
                      <Sparkles className="h-4 w-4" />
                      Trade Analysis & Notes
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      {pair.buyTx?.notes && (
                        <div>
                          <p className="mb-1 text-xs font-medium text-muted-foreground">Buy Notes</p>
                          <p className="text-sm">{pair.buyTx.notes}</p>
                        </div>
                      )}
                      {pair.sellTx?.notes && (
                        <div>
                          <p className="mb-1 text-xs font-medium text-muted-foreground">Sell Notes</p>
                          <p className="text-sm">{pair.sellTx.notes}</p>
                        </div>
                      )}

                      {pair.sellTx?.aiAnalysis ? (
                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                          <div className="mb-2 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Local review</span>
                          </div>
                          <p className="whitespace-pre-wrap text-sm">{pair.sellTx.aiAnalysis}</p>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => handleAiAnalysis(pair.id)}
                          disabled={analyzingId === pair.id}
                        >
                          {analyzingId === pair.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Generate local review
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
