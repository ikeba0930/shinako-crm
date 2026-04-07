"use client"

import { useState } from "react"
import { SELECTION_STATUS_GROUPS, SELECTION_STATUS_LABELS, getSelectionStatusGroup } from "@/lib/constants"
import type { SelectionStatusCode } from "@/lib/constants"

type Props = {
  defaultValue: string
  selectClassName: string
}

// 各グループで新規追加時のデフォルト（最初のコード）
const GROUP_DEFAULT: Record<string, SelectionStatusCode> = {
  "選考中": "DOCUMENT_SCREENING",
  "内定": "OFFERED_NO_SCHEDULE",
  "選考終了（辞退）": "DECLINED_BEFORE_DOCUMENT",
  "選考終了（見送り）": "REJECTED_DOCUMENT",
  "選考終了（入社）": "JOINED",
}

// ドロップダウンに表示するコード（旧互換コードは非表示）
const HIDDEN_CODES = new Set(["PROPOSED", "WAITING_ENTRY", "ENTERED", "OFFERED", "JOINING_SCHEDULED", "REJECTED", "CLOSED"])

export function SelectionStatusCascader({ defaultValue, selectClassName }: Props) {
  const defaultGroup = getSelectionStatusGroup(defaultValue as SelectionStatusCode)
  const [groupLabel, setGroupLabel] = useState(defaultGroup.label)
  const [subStatus, setSubStatus] = useState(defaultValue)

  const currentGroup = SELECTION_STATUS_GROUPS.find((g) => g.label === groupLabel) ?? SELECTION_STATUS_GROUPS[0]
  const visibleCodes = currentGroup.statusCodes.filter((c) => !HIDDEN_CODES.has(c))

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLabel = e.target.value
    setGroupLabel(newLabel)
    const defaultCode = GROUP_DEFAULT[newLabel] ?? (SELECTION_STATUS_GROUPS.find((g) => g.label === newLabel)?.statusCodes[0] ?? "DOCUMENT_SCREENING")
    setSubStatus(defaultCode)
  }

  return (
    <div className="space-y-2">
      {/* 大カテゴリ */}
      <select
        value={groupLabel}
        onChange={handleGroupChange}
        className={selectClassName}
      >
        {SELECTION_STATUS_GROUPS.map((group) => (
          <option key={group.label} value={group.label}>
            【{group.label}】
          </option>
        ))}
      </select>

      {/* 小ステータス */}
      <select
        name="selectionStatus"
        value={subStatus}
        onChange={(e) => setSubStatus(e.target.value)}
        className={selectClassName}
      >
        {visibleCodes.map((code) => (
          <option key={code} value={code}>
            {SELECTION_STATUS_LABELS[code]}
          </option>
        ))}
      </select>
    </div>
  )
}
