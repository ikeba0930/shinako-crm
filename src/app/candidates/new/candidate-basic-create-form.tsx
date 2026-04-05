"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import type { createCandidateAction } from "@/lib/actions"
import { INFLOW_ROUTE_OPTIONS } from "@/lib/constants"

type Props = {
  action: typeof createCandidateAction
}

function Field({
  label,
  required,
  className = "",
  children,
}: {
  label: string
  required?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <label className={`space-y-1.5 text-sm text-[#241433] ${className}`}>
      <span className="block font-semibold">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </span>
      {children}
    </label>
  )
}

export function CandidateBasicCreateForm({ action }: Props) {
  const [inflowSource, setInflowSource] = useState<string>(INFLOW_ROUTE_OPTIONS[0].value)
  const isUnemploymentInsurance = inflowSource === "失業保険"
  const inputClassName = "h-11 w-full rounded-2xl border border-white/60 bg-white/80 px-3 text-sm"

  return (
    <form action={action} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <Field label="求職者氏名" required>
        <input name="name" className={inputClassName} />
      </Field>
      <Field label="電話番号">
        <input name="phone" className={inputClassName} />
      </Field>
      <Field label="メールアドレス">
        <input name="email" className={inputClassName} />
      </Field>
      <Field label="希望職種">
        <input name="desiredJobType" className={inputClassName} />
      </Field>
      <Field label="流入経路" required>
        <select
          name="inflowSource"
          value={inflowSource}
          onChange={(event) => setInflowSource(event.target.value)}
          className={inputClassName}
        >
          {INFLOW_ROUTE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>
      {isUnemploymentInsurance ? (
        <Field label="エージェント パス日" required>
          <input type="date" name="agentPassDate" required className={inputClassName} />
        </Field>
      ) : null}
      {isUnemploymentInsurance ? (
        <Field label="架電希望日時" required>
          <input type="datetime-local" name="callPreferredAt" required className={inputClassName} />
        </Field>
      ) : null}
      <Field label="担当者" className="md:col-span-2 xl:col-span-2">
        <input name="ownerName" className={inputClassName} />
      </Field>
      <div className="flex items-end xl:col-span-1">
        <button
          type="submit"
          className="h-11 w-full rounded-2xl bg-[linear-gradient(135deg,#7c3aed_0%,#ec4899_52%,#38bdf8_100%)] px-4 text-sm font-semibold text-white shadow-[0_18px_34px_-22px_rgba(168,85,247,0.92)]"
        >
          登録して詳細へ進む
        </button>
      </div>
    </form>
  )
}
