"use client"

import { useExchangeRates } from "@/lib/hooks/use-prices"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCw } from "lucide-react"
import Link from "next/link"

export function Header() {
  const { rates, isLoading } = useExchangeRates()

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>USD/CNY:</span>
          <span className="font-mono text-foreground">{rates?.CNY?.toFixed(2) ?? "—"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>USD/HKD:</span>
          <span className="font-mono text-foreground">{rates?.HKD?.toFixed(2) ?? "—"}</span>
        </div>
        {isLoading && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      <div className="flex items-center gap-2">
        <Button asChild size="sm">
          <Link href="/transactions/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Link>
        </Button>
      </div>
    </header>
  )
}
