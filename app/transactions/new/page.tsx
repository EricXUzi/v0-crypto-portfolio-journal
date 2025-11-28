import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { TransactionForm } from "@/components/transactions/transaction-form"

export default function NewTransactionPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 pl-64">
        <Header />
        <main className="p-6">
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
