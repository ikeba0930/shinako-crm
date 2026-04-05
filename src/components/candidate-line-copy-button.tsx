"use client"

import { useEffect, useState } from "react"
import { Check, UserRound } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  gender?: string | null
  url?: string | null
}

export function CandidateLineCopyButton({ gender, url }: Props) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1500)
    return () => window.clearTimeout(timer)
  }, [copied])

  const isMale = gender === "男性"
  const isFemale = gender === "女性"
  const isDisabled = !url

  const buttonClassName = isDisabled
    ? "border-zinc-200 bg-zinc-100 text-zinc-400"
    : isMale
      ? "border-sky-200 bg-sky-100 text-sky-700 hover:bg-sky-200"
      : isFemale
        ? "border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-200"
        : "border-zinc-200 bg-zinc-100 text-zinc-700 hover:bg-zinc-200"

  async function handleCopy() {
    if (!url) return
    await navigator.clipboard.writeText(url)
    setCopied(true)
  }

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleCopy}
        disabled={isDisabled}
        title={url ? "LINE URLをコピー" : "LINE URL未設定"}
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-full border transition-colors",
          buttonClassName,
          isDisabled ? "cursor-not-allowed" : "cursor-pointer"
        )}
      >
        <UserRound className="h-3.5 w-3.5" />
      </button>
      <span
        className={cn(
          "pointer-events-none absolute left-8 top-1/2 inline-flex -translate-y-1/2 items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-semibold text-emerald-700 transition-all",
          copied ? "opacity-100" : "opacity-0"
        )}
      >
        <Check className="mr-1 h-3 w-3" />
        コピーしました
      </span>
    </div>
  )
}
