"use client"
import { Button } from "@/components/ui/button"
import { Plus, BookOpen, LockKeyhole } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { navigation } from "./sidebar"
import { cn } from "@/lib/utils"
export function Header() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="flex h-20 items-center justify-between gap-3 px-4 sm:px-8">
        <div>
          <span className="hidden text-xs text-muted-foreground lg:inline">
            Workspace <span className="mx-3 text-border">/</span>
          </span>
          <span className="text-sm font-medium">
            {navigation.find((n) => (n.href === "/" ? pathname === "/" : pathname.startsWith(n.href)))
              ?.name ?? "New transaction"}
          </span>
          <BookOpen className="mr-2 inline size-4 text-primary lg:hidden" />
        </div>
        <div className="flex items-center gap-5">
          <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
            <LockKeyhole className="size-3" />
            Local workspace
          </span>
          <Button asChild size="sm">
            <Link href="/transactions/new">
              <Plus className="mr-1 size-4" />
              Add transaction
            </Link>
          </Button>
        </div>
      </div>
      <nav aria-label="Mobile navigation" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:hidden">
        {navigation.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            aria-current={pathname === n.href ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-md px-3 py-2 text-xs",
              pathname === n.href ? "bg-primary text-white" : "text-muted-foreground",
            )}
          >
            {n.name}
          </Link>
        ))}
      </nav>
    </header>
  )
}
