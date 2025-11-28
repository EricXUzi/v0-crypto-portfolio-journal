import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { MonthlyPnlChart } from "@/components/analytics/monthly-pnl-chart"
import { PerformanceStats } from "@/components/analytics/performance-stats"
import { AssetPerformance } from "@/components/analytics/asset-performance"

export default function AnalyticsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 pl-64">
        <Header />
        <main className="p-6">
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
