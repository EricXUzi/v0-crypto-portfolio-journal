"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  LineChart,
  Settings,
  BookOpen,
  Coins,
  ArrowUpRight,
  LockKeyhole,
} from "lucide-react"
export const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Accounts", href: "/accounts", icon: Wallet },
  { name: "Assets", href: "/assets", icon: Coins },
  { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { name: "Trade journal", href: "/journal", icon: BookOpen },
  { name: "Analytics", href: "/analytics", icon: LineChart },
  { name: "Settings", href: "/settings", icon: Settings },
]
export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-60 flex-col bg-sidebar text-sidebar-foreground lg:flex">
      <Link href="/" className="flex h-24 items-center gap-3 px-7">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-white">
          <BookOpen className="size-5" />
        </span>
        <span className="text-xl font-semibold tracking-tight">
          CryptoFolio
          <span className="block text-[10px] font-medium uppercase tracking-[.22em] text-sidebar-foreground/45">
            Portfolio & journal
          </span>
        </span>
      </Link>
      <p className="px-7 pb-3 pt-6 text-[10px] font-semibold uppercase tracking-[.2em] text-sidebar-foreground/35">
        Workspace
      </p>
      <nav aria-label="Main navigation" className="flex-1 space-y-1 px-4">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={
              (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)) ? "page" : undefined
            }
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors",
              (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href))
                ? "bg-white/10 text-white"
                : "text-sidebar-foreground/55 hover:bg-white/5 hover:text-white",
            )}
          >
            <item.icon className="size-[18px]" />
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="m-4 rounded-xl border border-white/10 p-4">
        <LockKeyhole className="mb-3 size-5 text-primary" />
        <p className="text-sm font-medium">Your private ledger.</p>
        <p className="mt-1 text-xs leading-relaxed text-sidebar-foreground/50">
          Saved in this browser. Back up your workspace regularly.
        </p>
        <a
          href="https://github.com/EricXUzi/v0-crypto-portfolio-journal"
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex items-center gap-2 text-xs text-sidebar-foreground/70"
        >
          View project on GitHub <ArrowUpRight className="size-3" />
        </a>
      </div>
      <p className="px-7 pb-6 text-[10px] text-sidebar-foreground/30">CryptoFolio · v0.2</p>
    </aside>
  )
}
