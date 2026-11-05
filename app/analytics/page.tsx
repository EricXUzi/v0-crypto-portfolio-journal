import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { MonthlyPnlChart } from "@/components/analytics/monthly-pnl-chart"
import { PerformanceStats } from "@/components/analytics/performance-stats"
import { AssetPerformance } from "@/components/analytics/asset-performance"

export default function AnalyticsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1 lg:pl-60">
        <Header />
        <main className="mx-auto max-w-[1600px] p-4 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Track your trading performance and portfolio growth</p>
          </div>

          <div className="space-y-6">
            <PerformanceStats />
            <MonthlyPnlChart />
            <AssetPerformance />
          </div>
        </main>
      </div>
    </div>
  )
}
