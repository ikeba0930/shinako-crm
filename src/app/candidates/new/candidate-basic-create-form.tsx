"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { calculateAutoRankFromAgeAndQualifications } from "@/lib/rank"
import type { createCandidateAction } from "@/lib/actions"
import {
  CANDIDATE_AGE_OPTIONS,
  CANDIDATE_CONDITION_OPTIONS,
  CANDIDATE_GENDER_OPTIONS,
  CANDIDATE_JOB_OPTIONS,
  CANDIDATE_OWNER_OPTIONS,
  INFLOW_ROUTE_OPTIONS,
} from "@/lib/constants"

type Props = {
  action: typeof createCandidateAction
  qualificationOptions: string[]
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

export function CandidateBasicCreateForm({ action, qualificationOptions }: Props) {
  const [inflowSource, setInflowSource] = useState<string>(INFLOW_ROUTE_OPTIONS[0].value)
  const [age, setAge] = useState<string>("")
  const [condition, setCondition] = useState<string>("")
  const [selectedQualifications, setSelectedQualifications] = useState<string[]>([])
  const isUnemploymentInsurance = inflowSource === "失業保険"
  const inputClassName = "h-11 w-full rounded-2xl border border-white/60 bg-white/80 px-3 text-sm"
  const rankPreview = calculateAutoRankFromAgeAndQualifications(
    age ? Number(age) : null,
    selectedQualifications,
    condition || null
  ).rank

  return (
    <form action={action} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <Field label="氏名" required>
        <input name="name" className={inputClassName} />
      </Field>
      <Field label="性別" required>
        <select name="gender" defaultValue="" className={inputClassName}>
          <option value="">選択してください</option>
          {CANDIDATE_GENDER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="LINE URL">
        <input name="lineUrl" className={inputClassName} />
      </Field>
      <Field label="年齢" required>
        <select name="age" value={age} onChange={(event) => setAge(event.target.value)} className={inputClassName}>
          <option value="">選択してください</option>
          {CANDIDATE_AGE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}歳
            </option>
          ))}
        </select>
      </Field>
      <Field label="希望職種" required>
        <select name="desiredJobType" defaultValue="" className={inputClassName}>
          <option value="">選択してください</option>
          {CANDIDATE_JOB_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>
      <Field label="初回担当者" required>
        <select name="ownerName" defaultValue="" className={inputClassName}>
          <option value="">選択してください</option>
          {CANDIDATE_OWNER_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>
      <Field label="条件" required>
        <select name="jobSearchStatus" value={condition} onChange={(event) => setCondition(event.target.value)} className={inputClassName}>
          <option value="">選択してください</option>
          {CANDIDATE_CONDITION_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>
      <Field label="ランク" required>
        <input value={rankPreview} readOnly className={`${inputClassName} font-bold text-[#7c3aed]`} />
      </Field>
      <Field label="資格" className="md:col-span-2 xl:col-span-2">
        <div className="w-full rounded-2xl border border-white/60 bg-white/80 p-3">
          <select
            name="qualificationNames"
            multiple
            size={6}
            value={selectedQualifications}
            onChange={(event) => {
              let values = Array.from(event.currentTarget.selectedOptions, (option) => option.value)
              if (values.includes("特になし")) {
                values = ["特になし"]
              } else {
                values = values.filter((value) => value !== "特になし")
              }
              setSelectedQualifications(values)
            }}
            className="w-full bg-transparent text-sm outline-none"
          >
            {qualificationOptions.map((option) => (
              <option
                key={option}
                value={option}
                className={option === "普通自動車免許" ? "text-sky-600" : option === "特になし" ? "text-zinc-500" : undefined}
              >
                {option}
              </option>
            ))}
          </select>
        </div>
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
      <div className="flex items-end md:col-span-2 xl:col-span-4">
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
