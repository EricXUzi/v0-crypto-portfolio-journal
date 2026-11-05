import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { TradePairList } from "@/components/journal/trade-pair-list"
import { CreatePairDialog } from "@/components/journal/create-pair-dialog"

export default function JournalPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1 lg:pl-60">
        <Header />
        <main className="mx-auto max-w-[1600px] p-4 sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Trade Journal</h1>
              <p className="text-muted-foreground">
                Pair trades, review performance, and review your decisions
              </p>
            </div>
            <CreatePairDialog />
          </div>

          <TradePairList />
        </main>
      </div>
    </div>
  )
}
