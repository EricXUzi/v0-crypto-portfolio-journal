import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { TradePairList } from "@/components/journal/trade-pair-list"
import { CreatePairDialog } from "@/components/journal/create-pair-dialog"

export default function JournalPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 pl-64">
        <Header />
        <main className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Trade Journal</h1>
              <p className="text-muted-foreground">Pair trades, review performance, and get AI-powered insights</p>
            </div>
            <CreatePairDialog />
          </div>

          <TradePairList />
        </main>
      </div>
    </div>
  )
}
