"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building2, LayoutDashboard, Settings, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/candidates", label: "求職者一覧", icon: Users },
  { href: "/selections", label: "選考管理", icon: Building2 },
  { href: "/settings", label: "設定", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 z-10 flex h-screen w-64 flex-shrink-0 flex-col border-r border-white/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(250,242,255,0.8)_36%,rgba(238,244,255,0.82)_100%)] shadow-[20px_0_70px_-44px_rgba(76,29,149,0.88)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[#d8b4fe] to-transparent" />
      <div className="pointer-events-none absolute inset-x-3 top-3 h-28 rounded-[1.8rem] bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.2),rgba(244,114,182,0)_60%),radial-gradient(circle_at_80%_30%,rgba(14,165,233,0.18),rgba(14,165,233,0)_55%)] blur-xl" />

      <div className="border-b border-white/50 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-[1.45rem] bg-[linear-gradient(135deg,#fb7185_0%,#a855f7_34%,#38bdf8_66%,#facc15_100%)] font-heading text-lg font-bold text-white shadow-[0_18px_36px_-18px_rgba(168,85,247,0.98)] before:absolute before:inset-[2px] before:rounded-[1.2rem] before:border before:border-white/35 before:content-['']">
            人
          </div>
          <div>
            <p className="bg-[linear-gradient(120deg,#7c3aed_0%,#ec4899_38%,#0ea5e9_72%,#f59e0b_100%)] bg-clip-text font-heading text-[1.2rem] font-bold tracking-[0.06em] text-transparent">
              ひとなりDB
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7b5d8b]">Fantasy CRM Atelier</p>
          </div>
        </div>
      </div>

      <nav className="relative z-10 flex-1 space-y-1 p-3 pb-6">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-[1.1rem] px-3 py-2.5 text-sm font-semibold transition duration-300",
                active
                  ? "bg-[linear-gradient(135deg,#7c3aed_0%,#ec4899_44%,#38bdf8_100%)] text-white shadow-[0_22px_36px_-22px_rgba(168,85,247,0.96)]"
                  : "text-[#6d4e7e] hover:bg-white/70 hover:text-[#2e1740] hover:shadow-[0_16px_32px_-28px_rgba(76,29,149,0.82)]"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
