import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { AccountList } from "@/components/accounts/account-list"
import { AddAccountDialog } from "@/components/accounts/add-account-dialog"

export default function AccountsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1 lg:pl-60">
        <Header />
        <main className="mx-auto max-w-[1600px] p-4 sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Accounts</h1>
              <p className="text-muted-foreground">Manage your CEX accounts, wallets, and cold storage</p>
            </div>
            <AddAccountDialog />
          </div>

          <AccountList />
        </main>
      </div>
    </div>
  )
}
