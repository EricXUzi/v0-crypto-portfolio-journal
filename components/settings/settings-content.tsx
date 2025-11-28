"use client"

import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Download, Upload, Trash2, Database } from "lucide-react"

export function SettingsContent() {
  const accounts = useAppStore((state) => state.accounts)
  const transactions = useAppStore((state) => state.transactions)
  const assets = useAppStore((state) => state.assets)
  const tradePairs = useAppStore((state) => state.tradePairs)

  const handleExport = () => {
    const data = {
      accounts,
      transactions,
      assets,
      tradePairs,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cryptofolio-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const text = await file.text()
      try {
        const data = JSON.parse(text)
        // Restore data to localStorage
        localStorage.setItem(
          "cryptofolio-storage",
          JSON.stringify({
            state: {
              accounts: data.accounts || [],
              transactions: data.transactions || [],
              assets: data.assets || [],
              tradePairs: data.tradePairs || [],
            },
          }),
        )
        window.location.reload()
      } catch (error) {
        console.error("Failed to import data:", error)
        alert("Failed to import data. Please check the file format.")
      }
    }
    input.click()
  }

  const handleClearData = () => {
    localStorage.removeItem("cryptofolio-storage")
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Summary
          </CardTitle>
          <CardDescription>Overview of your stored data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-2xl font-bold">{accounts.length}</p>
              <p className="text-sm text-muted-foreground">Accounts</p>
            </div>
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-2xl font-bold">{transactions.length}</p>
              <p className="text-sm text-muted-foreground">Transactions</p>
            </div>
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-2xl font-bold">{assets.length}</p>
              <p className="text-sm text-muted-foreground">Assets</p>
            </div>
            <div className="rounded-lg bg-secondary p-4">
              <p className="text-2xl font-bold">{tradePairs.length}</p>
              <p className="text-sm text-muted-foreground">Trade Pairs</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Backup & Restore</CardTitle>
          <CardDescription>Export or import your portfolio data</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button variant="outline" onClick={handleImport}>
            <Upload className="mr-2 h-4 w-4" />
            Import Data
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive bg-card">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your accounts, transactions, assets,
                  and trade pairs from local storage.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearData}>Yes, delete everything</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
