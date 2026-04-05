"use client"

import { useEffect, useState } from "react"
import { Check, Copy, UserRound } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  gender?: string | null
  url?: string | null
}

export function CandidateLineCopyButton({ gender, url }: Props) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return

    const timer = window.setTimeout(() => setCopied(false), 1800)
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
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={handleCopy}
        disabled={isDisabled}
        title={url ? "LINE URLをコピー" : "LINE URL未設定"}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
          buttonClassName,
          isDisabled ? "cursor-not-allowed" : "cursor-pointer"
        )}
      >
        <UserRound className="h-3.5 w-3.5" />
      </button>
      <span
        className={cn(
          "inline-flex min-w-[86px] items-center justify-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-all",
          copied ? "bg-emerald-100 text-emerald-700 opacity-100" : "bg-transparent text-transparent opacity-0"
        )}
      >
        {copied ? <Check className="mr-1 h-3.5 w-3.5" /> : <Copy className="mr-1 h-3.5 w-3.5" />}
        コピーしました
      </span>
    </div>
  )
}
