import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { TransactionForm } from "@/components/transactions/transaction-form"

export default function NewTransactionPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1 lg:pl-60">
        <Header />
        <main className="mx-auto max-w-[1600px] p-4 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Add Transaction</h1>
            <p className="text-muted-foreground">Record a new trade, swap, or other transaction</p>
          </div>

          <TransactionForm />
        </main>
      </div>
    </div>
  )
}
