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
    <aside className="sticky top-0 z-10 flex h-screen w-64 flex-shrink-0 flex-col border-r border-white/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.72)_0%,rgba(250,245,255,0.74)_52%,rgba(239,246,255,0.76)_100%)] shadow-[20px_0_60px_-46px_rgba(88,28,135,0.75)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[#d8b4fe] to-transparent" />
      <div className="border-b border-white/50 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[1.35rem] bg-[linear-gradient(135deg,#fb7185_0%,#a855f7_34%,#38bdf8_66%,#facc15_100%)] font-bold text-white shadow-[0_14px_30px_-18px_rgba(168,85,247,0.95)]">
            H
          </div>
          <div>
            <p className="bg-[linear-gradient(120deg,#7c3aed_0%,#ec4899_38%,#0ea5e9_72%,#f59e0b_100%)] bg-clip-text text-lg font-extrabold tracking-tight text-transparent">
              ひとなりDB
            </p>
            <p className="text-xs text-[#7b5d8b]">人材紹介 集計MVP</p>
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
                  ? "bg-[linear-gradient(135deg,#7c3aed_0%,#ec4899_48%,#38bdf8_100%)] text-white shadow-[0_18px_32px_-20px_rgba(168,85,247,0.92)]"
                  : "text-[#6d4e7e] hover:bg-white/60 hover:text-[#2e1740]"
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
