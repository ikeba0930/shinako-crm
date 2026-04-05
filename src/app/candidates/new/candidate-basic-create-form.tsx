"use client"

import { useState } from "react"
import type { createCandidateAction } from "@/lib/actions"
import { INFLOW_ROUTE_OPTIONS } from "@/lib/constants"

type Props = {
  action: typeof createCandidateAction
}

export function CandidateBasicCreateForm({ action }: Props) {
  const [inflowSource, setInflowSource] = useState<string>(INFLOW_ROUTE_OPTIONS[0].value)
  const isUnemploymentInsurance = inflowSource === "失業保険"

  return (
    <form action={action} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <input name="name" placeholder="求職者氏名" className="h-11 rounded-2xl border border-white/60 bg-white/80 px-3 text-sm" />
      <input name="phone" placeholder="電話番号" className="h-11 rounded-2xl border border-white/60 bg-white/80 px-3 text-sm" />
      <input name="email" placeholder="メールアドレス" className="h-11 rounded-2xl border border-white/60 bg-white/80 px-3 text-sm" />
      <input name="desiredJobType" placeholder="希望職種" className="h-11 rounded-2xl border border-white/60 bg-white/80 px-3 text-sm" />
      <select
        name="inflowSource"
        value={inflowSource}
        onChange={(event) => setInflowSource(event.target.value)}
        className="h-11 rounded-2xl border border-white/60 bg-white/80 px-3 text-sm"
      >
        {INFLOW_ROUTE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {isUnemploymentInsurance ? (
        <input
          type="date"
          name="agentPassDate"
          required
          aria-label="エージェント パス日"
          title="エージェント パス日"
          className="h-11 rounded-2xl border border-white/60 bg-white/80 px-3 text-sm"
        />
      ) : null}
      {isUnemploymentInsurance ? (
        <input
          type="datetime-local"
          name="callPreferredAt"
          required
          aria-label="架電希望日時"
          title="架電希望日時"
          className="h-11 rounded-2xl border border-white/60 bg-white/80 px-3 text-sm"
        />
      ) : null}
      <input
        name="ownerName"
        placeholder="担当者"
        className="h-11 rounded-2xl border border-white/60 bg-white/80 px-3 text-sm md:col-span-2 xl:col-span-2"
      />
      <button
        type="submit"
        className="h-11 rounded-2xl bg-[linear-gradient(135deg,#7c3aed_0%,#ec4899_52%,#38bdf8_100%)] px-4 text-sm font-semibold text-white shadow-[0_18px_34px_-22px_rgba(168,85,247,0.92)] xl:col-span-1"
      >
        登録して詳細へ進む
      </button>
    </form>
  )
}
