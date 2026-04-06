"use client"

import { useState } from "react"

type Props = {
  name: string
  defaultValue?: string
  className?: string
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function DateInputWithShortcuts({ name, defaultValue = "", className }: Props) {
  const [value, setValue] = useState(defaultValue)

  return (
    <div className="space-y-1">
      <input type="date" name={name} value={value} onChange={(event) => setValue(event.target.value)} className={className} />
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setValue(formatLocalDate(new Date()))}
          className="px-1 text-[10px] font-semibold text-zinc-500 transition hover:text-zinc-900"
        >
          今日
        </button>
      </div>
    </div>
  )
}
