"use client"

type DeleteCandidateButtonProps = {
  candidateName: string
}

export function DeleteCandidateButton({ candidateName }: DeleteCandidateButtonProps) {
  return (
    <button
      type="submit"
      className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
      onClick={(event) => {
        if (!window.confirm(`「${candidateName}」を削除します。よろしいですか？`)) {
          event.preventDefault()
        }
      }}
    >
      削除
    </button>
  )
}
