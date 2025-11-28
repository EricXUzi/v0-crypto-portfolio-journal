import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { AssetList } from "@/components/assets/asset-list"
import { AddAssetDialog } from "@/components/assets/add-asset-dialog"

export default function AssetsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 pl-64">
        <Header />
        <main className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Assets</h1>
              <p className="text-muted-foreground">Manage your crypto holdings and set manual prices</p>
            </div>
            <AddAssetDialog />
          </div>

          <AssetList />
        </main>
      </div>
    </div>
  )
}
