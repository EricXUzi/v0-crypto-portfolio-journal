import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { AssetDistribution } from "@/components/dashboard/asset-distribution"
import { AccountOverview } from "@/components/dashboard/account-overview"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 pl-64">
        <Header />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your crypto portfolio and trading performance</p>
          </div>

          <div className="space-y-6">
            <StatsCards />

            <div className="grid gap-6 lg:grid-cols-2">
              <AssetDistribution />
              <AccountOverview />
            </div>

            <RecentTransactions />
          </div>
        </main>
      </div>
    </div>
  )
}
