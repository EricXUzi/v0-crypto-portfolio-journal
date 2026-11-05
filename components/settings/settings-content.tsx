"use client"
import { useRef, useState } from "react"
import { useAppStore } from "@/lib/store"
import { createBackup, parseBackup, type PortfolioData } from "@/lib/backup"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Upload, LockKeyhole } from "lucide-react"
export function SettingsContent() {
  const state = useAppStore()
  const input = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<PortfolioData | null>(null)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [confirmClear, setConfirmClear] = useState(false)
  function exportData() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(createBackup(state), null, 2)], { type: "application/json" }),
    )
    const a = document.createElement("a")
    a.href = url
    a.download = `cryptofolio-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMessage("Backup downloaded. Keep it somewhere private.")
  }
  return (
    <div className="max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Workspace data</CardTitle>
          <CardDescription>
            {state.isDemo
              ? "Demo workspace — sample records and fixed prices."
              : "Saved in this browser on this device."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ["Accounts", state.accounts.length],
              ["Holdings", state.assets.length],
              ["Transactions", state.transactions.length],
              ["Trade pairs", state.tradePairs.length],
            ].map(([name, count]) => (
              <div key={name} className="rounded-lg bg-secondary p-4">
                <p className="text-2xl font-semibold">{count}</p>
                <p className="mt-1 text-xs text-muted-foreground">{name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Backup & restore</CardTitle>
          <CardDescription>
            Export a portable JSON backup. Importing replaces this workspace after confirmation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button onClick={exportData}>
              <Download className="mr-2 size-4" />
              Export backup
            </Button>
            <Button variant="outline" onClick={() => input.current?.click()}>
              <Upload className="mr-2 size-4" />
              Choose backup
            </Button>
          </div>
          <input
            ref={input}
            type="file"
            accept=".json,application/json"
            className="hidden"
            aria-label="Choose JSON backup"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              e.target.value = ""
              if (!file) return
              setError("")
              setPending(null)
              try {
                setPending(parseBackup(JSON.parse(await file.text())))
              } catch {
                setError("This backup is invalid or contains inconsistent records. Nothing was changed.")
              }
            }}
          />
          {pending && (
            <div className="space-y-3 rounded-lg border border-warning/30 p-4">
              <p className="text-sm">
                Replace the current workspace with {pending.accounts.length} accounts, {pending.assets.length}{" "}
                holdings and {pending.transactions.length} transactions? Export your current data first if you
                need to keep it.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    state.replaceData(pending)
                    setPending(null)
                    setMessage("Backup restored.")
                  }}
                >
                  Replace workspace
                </Button>
                <Button variant="outline" onClick={() => setPending(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          {message && (
            <p role="status" className="text-sm text-success">
              {message}
            </p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LockKeyhole className="size-4" />
            Privacy & storage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
          <p>
            Accounts, balances and journal notes stay in browser storage. They are not encrypted. Clearing
            browser data or changing browsers will remove access unless you have a backup.
          </p>
          <p>
            Market quotes request asset symbols from CoinGecko. Wallet addresses and notes are not sent with
            quote requests. Trade reviews run locally; no AI service or paid API is required.
          </p>
          <p>
            Holdings are manual snapshots. Recording, editing or deleting journal entries does not change
            them. This tool does not execute trades, connect wallets or provide tax reports.
          </p>
        </CardContent>
      </Card>
      <Card className="border-destructive/25">
        <CardHeader>
          <CardTitle>Reset workspace</CardTitle>
          <CardDescription>
            {state.isDemo
              ? "Remove the sample data and start with an empty workspace."
              : "Remove all accounts, holdings, transactions and pairs from this browser."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {confirmClear ? (
            <div className="space-y-3">
              <p className="text-sm">This cannot be undone without a backup. Clear this workspace?</p>
              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  onClick={() => {
                    state.resetData()
                    setConfirmClear(false)
                    setPending(null)
                    setMessage("Workspace cleared.")
                  }}
                >
                  Confirm clear
                </Button>
                <Button variant="outline" onClick={() => setConfirmClear(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" className="text-destructive" onClick={() => setConfirmClear(true)}>
              {state.isDemo ? "Clear demo data" : "Clear workspace"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
