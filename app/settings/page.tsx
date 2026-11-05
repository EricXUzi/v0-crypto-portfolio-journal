import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { SettingsContent } from "@/components/settings/settings-content"

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1 lg:pl-60">
        <Header />
        <main className="mx-auto max-w-[1600px] p-4 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your app preferences and data</p>
          </div>

          <SettingsContent />
        </main>
      </div>
    </div>
  )
}
