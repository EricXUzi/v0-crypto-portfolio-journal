import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { AccountList } from "@/components/accounts/account-list"
import { AddAccountDialog } from "@/components/accounts/add-account-dialog"

export default function AccountsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 pl-64">
        <Header />
        <main className="p-6">
          <div className="mb-6 flex items-center justify-between">
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
