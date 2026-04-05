"use client"

import { useMemo, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { SearchableSelect } from "@/components/searchable-select"

type Props = {
  options: readonly string[]
  initialQualifications: string[]
  initialFreeText?: string
  freeTextName?: string
  required?: boolean
  className: string
  onQualificationsChange?: (values: string[]) => void
}

function normalizeValues(values: string[]) {
  const filtered = values.map((value) => value.trim()).filter(Boolean)
  return filtered.length > 0 ? filtered : [""]
}

function splitFreeText(value: string) {
  return value
    .split(/\r?\n|,|、/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function CandidateQualificationFields({
  options,
  initialQualifications,
  initialFreeText = "",
  freeTextName = "qualificationFreeText",
  required = false,
  className,
  onQualificationsChange,
}: Props) {
  const [qualifications, setQualifications] = useState<string[]>(normalizeValues(initialQualifications))
  const [freeText, setFreeText] = useState(initialFreeText)
  const searchableOptions = useMemo(() => options.map((option) => option), [options])

  function emitQualifications(nextQualifications: string[], nextFreeText: string) {
    const combined = [...nextQualifications.map((value) => value.trim()).filter(Boolean), ...splitFreeText(nextFreeText)]
    onQualificationsChange?.(combined)
  }

  function updateQualification(index: number, nextValue: string) {
    setQualifications((current) => {
      const nextQualifications = current.map((value, currentIndex) => (currentIndex === index ? nextValue : value))
      emitQualifications(nextQualifications, freeText)
      return nextQualifications
    })
  }

  function addQualification() {
    setQualifications((current) => {
      const nextQualifications = [...current, ""]
      emitQualifications(nextQualifications, freeText)
      return nextQualifications
    })
  }

  function removeQualification(index: number) {
    setQualifications((current) => {
      const next = current.filter((_, currentIndex) => currentIndex !== index)
      const normalized = next.length > 0 ? next : [""]
      emitQualifications(normalized, freeText)
      return normalized
    })
  }

  return (
    <div className="space-y-3">
      {qualifications.map((qualification, index) => (
        <div key={`${index}-${qualification}`} className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <SearchableSelect
              name="qualificationNames"
              defaultValue={qualification}
              value={qualification}
              onValueChange={(nextValue) => updateQualification(index, nextValue)}
              options={searchableOptions}
              required={required && index === 0}
              className={className}
            />
          </div>
          <button
            type="button"
            onClick={() => removeQualification(index)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50"
            aria-label="資格を削除"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addQualification}
        className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100"
      >
        <Plus className="h-4 w-4" />
        資格を追加
      </button>
      <div className="space-y-1">
        <span className="block text-sm">資格フリーワード</span>
        <input
          name={freeTextName}
          value={freeText}
          onChange={(event) => {
            const nextValue = event.target.value
            setFreeText(nextValue)
            emitQualifications(qualifications, nextValue)
          }}
          placeholder="候補にない資格は自由入力"
          className={className}
        />
      </div>
    </div>
  )
}
