import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { TransactionList } from "@/components/transactions/transaction-list"
import { TransactionFilters } from "@/components/transactions/transaction-filters"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function TransactionsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1 lg:pl-60">
        <Header />
        <main className="mx-auto max-w-[1600px] p-4 sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Transactions</h1>
              <p className="text-muted-foreground">View and manage all your crypto transactions</p>
            </div>
            <Button asChild>
              <Link href="/transactions/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Link>
            </Button>
          </div>

          <TransactionFilters />
          <TransactionList />
        </main>
      </div>
    </div>
  )
}
