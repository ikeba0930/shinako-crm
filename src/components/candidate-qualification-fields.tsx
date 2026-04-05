"use client"

import { useMemo, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { SearchableSelect } from "@/components/searchable-select"

type Props = {
  options: readonly string[]
  initialQualifications: string[]
  className: string
}

function normalizeValues(values: string[]) {
  const filtered = values.map((value) => value.trim()).filter(Boolean)
  return filtered.length > 0 ? filtered : [""]
}

export function CandidateQualificationFields({ options, initialQualifications, className }: Props) {
  const [qualifications, setQualifications] = useState<string[]>(normalizeValues(initialQualifications))
  const searchableOptions = useMemo(() => options.map((option) => option), [options])

  function updateQualification(index: number, nextValue: string) {
    setQualifications((current) => current.map((value, currentIndex) => (currentIndex === index ? nextValue : value)))
  }

  function addQualification() {
    setQualifications((current) => [...current, ""])
  }

  function removeQualification(index: number) {
    setQualifications((current) => {
      const next = current.filter((_, currentIndex) => currentIndex !== index)
      return next.length > 0 ? next : [""]
    })
  }

  return (
    <div className="space-y-3">
      {qualifications.map((qualification, index) => (
        <div key={`${index}-${qualification}`} className="flex items-center gap-2">
          <SearchableSelect
            name="qualificationNames"
            defaultValue={qualification}
            value={qualification}
            onValueChange={(nextValue) => updateQualification(index, nextValue)}
            options={searchableOptions}
            className={className}
          />
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
    </div>
  )
}
