"use client"

import { useMemo, useState } from "react"
import { SearchableSelect } from "@/components/searchable-select"
import { MUNICIPALITIES_BY_PREFECTURE_CODE } from "@/lib/japan-municipalities"
import { PREFECTURE_OPTIONS } from "@/lib/constants"

type Props = {
  prefecture?: string | null
  city?: string | null
  detail?: string | null
  selectClassName: string
  inputClassName: string
}

function getPrefectureCode(prefecture: string) {
  const index = (PREFECTURE_OPTIONS as readonly string[]).indexOf(prefecture)
  return index >= 0 ? String(index + 1) : ""
}

export function CandidateLocationFields({ prefecture, city, detail, selectClassName, inputClassName }: Props) {
  const [selectedPrefecture, setSelectedPrefecture] = useState(prefecture ?? "")
  const [selectedCity, setSelectedCity] = useState(city ?? "")
  const [locationDetail, setLocationDetail] = useState(detail ?? "")

  const cityOptions = useMemo(() => {
    const code = getPrefectureCode(selectedPrefecture)
    return code ? MUNICIPALITIES_BY_PREFECTURE_CODE[code] ?? [] : []
  }, [selectedPrefecture])

  const composedLocation = [selectedPrefecture, selectedCity, locationDetail].filter(Boolean).join(" / ")

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-1">
        <span className="block text-sm">都道府県</span>
        <SearchableSelect
          name="desiredPrefecture"
          defaultValue={selectedPrefecture}
          value={selectedPrefecture}
          onValueChange={(nextValue) => {
            setSelectedPrefecture(nextValue)
            if (!(MUNICIPALITIES_BY_PREFECTURE_CODE[getPrefectureCode(nextValue)] ?? []).includes(selectedCity)) {
              setSelectedCity("")
            }
          }}
          options={PREFECTURE_OPTIONS}
          className={selectClassName}
        />
      </div>
      <div className="space-y-1">
        <span className="block text-sm">市区町村</span>
        <SearchableSelect
          name="desiredCity"
          defaultValue={selectedCity}
          value={selectedCity}
          onValueChange={setSelectedCity}
          options={cityOptions}
          placeholder={selectedPrefecture ? "市区町村を選択" : "都道府県を先に選択"}
          className={selectClassName}
        />
      </div>
      <input type="hidden" name="desiredLocation" value={composedLocation} readOnly />
      <div className="space-y-1">
        <span className="block text-sm">補足</span>
        <input
          name="desiredLocationDetail"
          value={locationDetail}
          onChange={(event) => setLocationDetail(event.target.value)}
          placeholder="希望エリア補足"
          className={inputClassName}
        />
      </div>
    </div>
  )
}
