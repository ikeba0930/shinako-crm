"use client"

import { deleteSelectionAction } from "@/lib/actions"

type Props = {
  selectionId: string
  candidateId: string
}

export function DeleteSelectionButton({ selectionId, candidateId }: Props) {
  return (
    <form
      action={deleteSelectionAction}
      onSubmit={(e) => {
        if (!confirm("この選考を削除しますか？")) e.preventDefault()
      }}
    >
      <input type="hidden" name="id" value={selectionId} />
      <input type="hidden" name="candidateId" value={candidateId} />
      <button
        type="submit"
        className="rounded-full border border-rose-200/80 bg-[linear-gradient(135deg,rgba(255,241,241,0.95),rgba(255,228,230,0.90))] px-4 py-1.5 text-[10px] font-bold text-rose-600 shadow-[0_6px_16px_-8px_rgba(244,63,94,0.40)] transition duration-200 hover:-translate-y-[1px] hover:bg-[linear-gradient(135deg,rgba(254,226,226,1),rgba(252,205,210,0.95))] hover:shadow-[0_10px_22px_-8px_rgba(244,63,94,0.50)]"
      >
        削除
      </button>
    </form>
  )
}
