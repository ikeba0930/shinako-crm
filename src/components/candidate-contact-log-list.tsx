"use client"

import { useOptimistic, startTransition } from "react"
import { deleteContactLogAction } from "@/lib/actions"
import { CandidateNaModal } from "@/components/candidate-na-modal"

type ContactLog = {
  id: string
  candidateId: string
  respondedAt: string | Date | null
  respondentName: string | null
  responseStatus: string | null
  direction: string | null
  communicationMethod: string | null
  reason: string | null
  naAt: string | Date | null
  naContent: string | null
  isUnreachable: boolean
  notes: string | null
  createdAt: string | Date
}

type Props = {
  candidateId: string
  initialLogs: ContactLog[]
}

function formatDt(dt: string | Date | null) {
  if (!dt) return "-"
  return new Date(dt).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="min-w-0">
      <div className="text-[9px] font-bold text-violet-500">{label}</div>
      <div className="mt-0.5 text-[11px] font-semibold text-zinc-800">{value || "-"}</div>
    </div>
  )
}

function LogCard({ log, candidateId, onDelete }: { log: ContactLog; candidateId: string; onDelete: (id: string) => void }) {
  const shortId = log.id.slice(-8).toUpperCase()

  return (
    <div className="overflow-hidden rounded-[1.4rem] border border-violet-100/70 bg-white/88 shadow-[0_8px_24px_-16px_rgba(109,40,217,0.32)] transition hover:shadow-[0_12px_28px_-14px_rgba(109,40,217,0.42)]">
      {/* カードヘッダー */}
      <div className="flex items-center justify-between bg-[linear-gradient(90deg,rgba(167,139,250,0.18),rgba(196,167,253,0.14),rgba(147,197,253,0.12))] px-4 py-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] leading-none text-violet-400">✦</span>
          <span className="text-[10px] font-black tracking-wider text-violet-700">対応ID : {shortId}</span>
          {log.isUnreachable && (
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[8px] font-bold text-rose-600">不通</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <form action={deleteContactLogAction}>
            <input type="hidden" name="id" value={log.id} />
            <input type="hidden" name="candidateId" value={candidateId} />
            <button
              type="submit"
              onClick={(e) => {
                if (!confirm("この対応履歴を削除しますか？")) e.preventDefault()
                else startTransition(() => onDelete(log.id))
              }}
              className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[9px] font-semibold text-rose-500 transition hover:bg-rose-100 hover:text-rose-700"
            >
              削除
            </button>
          </form>
        </div>
      </div>

      {/* 対応情報行 */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-b border-violet-50 px-4 py-3 md:grid-cols-5">
        <Field label="対応日時" value={formatDt(log.respondedAt)} />
        <Field label="対応者" value={log.respondentName} />
        <Field label="対応ステータス" value={log.responseStatus} />
        <Field label="受発信" value={log.direction} />
        <Field label="通信手段" value={log.communicationMethod} />
      </div>

      {/* NA情報行 */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 bg-rose-50/30 px-4 py-3 md:grid-cols-3">
        <Field label="NA日時" value={formatDt(log.naAt)} />
        <Field label="NA内容" value={log.naContent} />
        <Field label="理由" value={log.reason} />
      </div>

      {/* 備考 */}
      {log.notes && (
        <div className="border-t border-violet-50/80 px-4 py-2.5">
          <div className="text-[9px] font-bold text-violet-500">備考</div>
          <div className="mt-0.5 text-[11px] leading-relaxed text-zinc-700">{log.notes}</div>
        </div>
      )}
    </div>
  )
}

export function CandidateContactLogList({ candidateId, initialLogs }: Props) {
  const [logs, dispatch] = useOptimistic(
    initialLogs,
    (state, deletedId: string) => state.filter((l) => l.id !== deletedId),
  )

  return (
    <div className="space-y-3">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-black tracking-wide text-violet-900">対応・NAリスト</span>
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-bold text-violet-600">{logs.length}件</span>
        </div>
        <CandidateNaModal candidateId={candidateId} />
      </div>

      {/* ログ一覧 */}
      {logs.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <div className="text-5xl leading-none opacity-20">📋</div>
          <p className="text-[12px] text-violet-400">対応履歴がまだありません</p>
          <p className="text-[10px] text-violet-300">「対応NA」ボタンから記録を追加してください</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <LogCard
              key={log.id}
              log={log}
              candidateId={candidateId}
              onDelete={(id) => dispatch(id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
