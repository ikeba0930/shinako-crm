"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

type Props = {
  message: string
}

export function SaveSuccessNotice({ message }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const hideTimer = window.setTimeout(() => {
      setVisible(false)
    }, 1800)

    const cleanupTimer = window.setTimeout(() => {
      const nextParams = new URLSearchParams(searchParams.toString())
      nextParams.delete("saved")
      const nextQuery = nextParams.toString()
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false })
    }, 2300)

    return () => {
      window.clearTimeout(hideTimer)
      window.clearTimeout(cleanupTimer)
    }
  }, [pathname, router, searchParams])

  return (
    <div
      className={`rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition-all duration-500 ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
      }`}
    >
      {message}
    </div>
  )
}
