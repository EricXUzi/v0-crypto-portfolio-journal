import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { WorkspaceOverview } from "@/components/dashboard/workspace-overview"
import { AssetDistribution } from "@/components/dashboard/asset-distribution"
import { AccountOverview } from "@/components/dashboard/account-overview"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
export default function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1 lg:pl-60">
        <Header />
        <main id="main-content" className="mx-auto max-w-[1600px] space-y-7 p-4 sm:p-8">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.2em] text-muted-foreground">
              Your portfolio at a glance
            </p>
            <h1 className="text-3xl font-semibold">Portfolio overview</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Capital, positions, and the decisions behind them.
            </p>
          </div>
          <WorkspaceOverview />
          <div className="grid gap-6 xl:grid-cols-2">
            <AssetDistribution />
            <AccountOverview />
          </div>
          <RecentTransactions />
        </main>
      </div>
    </div>
  )
}
