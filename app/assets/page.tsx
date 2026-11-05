import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { AssetList } from "@/components/assets/asset-list"
import { AddAssetDialog } from "@/components/assets/add-asset-dialog"

export default function AssetsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1 lg:pl-60">
        <Header />
        <main className="mx-auto max-w-[1600px] p-4 sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
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
