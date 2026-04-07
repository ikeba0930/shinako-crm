"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createPortal } from "react-dom"
import { saveContactLogAction } from "@/lib/actions"
import {
  CANDIDATE_OWNER_OPTIONS,
  CONTACT_COMMUNICATION_METHOD_OPTIONS,
  CONTACT_NA_CONTENT_OPTIONS,
  CONTACT_REASON_OPTIONS,
  CONTACT_RESPONSE_STATUS_DETAILS,
  CONTACT_RESPONSE_STATUS_PHASES,
} from "@/lib/constants"

type Props = {
  candidateId: string
  ownerName?: string | null
  triggerLabel?: string
  triggerClassName?: string
  onSaved?: () => void
  initialLog?: {
    id: string
    respondedAt: string | Date | null
    respondentName: string | null
    responseStatus: string | null
    direction: string | null
    communicationMethod: string | null
    reason: string | null
    naAt: string | Date | null
    naContent: string | null
    notes: string | null
  }
}

const inputCls =
  "h-9 w-full rounded-xl border border-fuchsia-100/80 bg-white px-2.5 text-[12px] text-[#2f1b3b] outline-none focus:border-fuchsia-300 focus:ring-1 focus:ring-fuchsia-200/70"
const selectCls =
  "h-9 w-full rounded-xl border border-fuchsia-100/80 bg-white px-2 text-[12px] text-[#2f1b3b] outline-none focus:border-fuchsia-300 focus:ring-1 focus:ring-fuchsia-200/70"
const sectionLabelCls = "mb-1 block text-[10px] font-bold text-violet-600"

function nowDate() {
  return new Date().toLocaleDateString("sv-SE")
}

function nowTime() {
  const date = new Date()
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
}

function addDays(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toLocaleDateString("sv-SE")
}

function toDateInputValue(value?: string | Date | null) {
  if (!value) return ""
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("sv-SE")
}

function toTimeInputValue(value?: string | Date | null) {
  if (!value) return ""
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
}

function NowButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-full bg-teal-500 px-2.5 py-1 text-[10px] font-bold text-white transition hover:bg-teal-600"
    >
      現在時刻
    </button>
  )
}

function SectionBand({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`grid gap-x-4 gap-y-3 rounded-2xl px-5 py-4 ${className}`}>{children}</div>
}

const ownerRequiredCheckboxNames = [
  "setAs_interviewDate",
  "setAs_proposalDate",
  "setAs_entryDate",
  "setAs_companyInterviewDate",
  "setAs_offerDate",
  "setAs_offerAcceptedDate",
  "setAs_joiningDate",
  "setAs_closedDate",
] as const

export function CandidateNaModal({ candidateId, ownerName, triggerLabel = "対応NA", triggerClassName, onSaved, initialLog }: Props) {
  const router = useRouter()
  const initialStatusPhase = initialLog?.responseStatus?.split("：")[0] ?? ""
  const initialStatusDetail = initialLog?.responseStatus?.split("：").slice(1).join("：") ?? ""

  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [respondedDate, setRespondedDate] = useState(toDateInputValue(initialLog?.respondedAt))
  const [respondedTime, setRespondedTime] = useState(toTimeInputValue(initialLog?.respondedAt))
  const [naDate, setNaDate] = useState(toDateInputValue(initialLog?.naAt))
  const [naTime, setNaTime] = useState(toTimeInputValue(initialLog?.naAt))
  const [statusPhase, setStatusPhase] = useState(initialStatusPhase)
  const [statusDetail, setStatusDetail] = useState(initialStatusDetail)
  const [candidateOwnerName, setCandidateOwnerName] = useState(ownerName ?? "")
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  function open() {
    setIsOpen(true)
  }

  function close() {
    setIsOpen(false)
    formRef.current?.reset()
    setRespondedDate(toDateInputValue(initialLog?.respondedAt))
    setRespondedTime(toTimeInputValue(initialLog?.respondedAt))
    setNaDate(toDateInputValue(initialLog?.naAt))
    setNaTime(toTimeInputValue(initialLog?.naAt))
    setStatusPhase(initialStatusPhase)
    setStatusDetail(initialStatusDetail)
    setCandidateOwnerName(ownerName ?? "")
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const needsOwner = ownerRequiredCheckboxNames.some((name) => formData.get(name) === "on")
    const selectedOwnerName = String(formData.get("candidateOwnerName") ?? "").trim()

    if (needsOwner && !ownerName && !selectedOwnerName) {
      alert("担当者が未入力です。この画面で担当者を選択してから保存してください。")
      return
    }

    startTransition(async () => {
      await saveContactLogAction(formData)
      onSaved?.()
      router.refresh()
      close()
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className={
          triggerClassName ??
          "rounded-full border border-rose-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,242,246,0.92))] px-3 py-1 text-[10px] font-semibold text-rose-700 shadow-[0_14px_26px_-22px_rgba(244,63,94,0.68)] transition hover:bg-rose-50"
        }
      >
        {triggerLabel}
      </button>

      {isOpen && mounted
        ? createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={close} />
              <div
                className="relative flex max-h-[92vh] flex-col overflow-hidden rounded-[1.8rem] border border-fuchsia-100/60 bg-[linear-gradient(135deg,rgba(255,250,255,0.99),rgba(250,246,255,0.99),rgba(243,249,255,0.99))] shadow-[0_32px_64px_-24px_rgba(109,40,217,0.55)]"
                style={{ width: "94vw", maxWidth: "1560px" }}
              >
                <div className="flex shrink-0 items-center justify-between bg-[linear-gradient(90deg,rgba(244,114,182,0.22),rgba(168,85,247,0.18),rgba(56,189,248,0.16))] px-6 py-3 shadow-[0_4px_16px_-8px_rgba(109,40,217,0.3)]">
                  <span className="text-[14px] font-black tracking-wide text-violet-900">対応・NA登録</span>
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-full border border-zinc-200 bg-white/90 px-4 py-1.5 text-[11px] font-semibold text-zinc-600 transition hover:bg-zinc-50"
                  >
                    キャンセル
                  </button>
                </div>

                <form ref={formRef} onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
                  <input type="hidden" name="candidateId" value={candidateId} />
                  <input type="hidden" name="id" value={initialLog?.id ?? ""} />

                  <div className="mx-auto w-full max-w-5xl flex-1 space-y-3 px-6 py-5">
                    <SectionBand className="grid-cols-1 border border-violet-100/60 bg-[linear-gradient(135deg,rgba(245,243,255,0.8),rgba(250,246,255,0.7))] md:grid-cols-[1.05fr_1fr_1.2fr]">
                      <div>
                        <label className={sectionLabelCls}>対応日時</label>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <input
                            type="date"
                            name="respondedAtDate"
                            value={respondedDate}
                            onChange={(e) => setRespondedDate(e.target.value)}
                            required
                            className={`${inputCls} min-w-[152px] flex-1 md:flex-none`}
                          />
                          <input
                            type="time"
                            name="respondedAtTime"
                            value={respondedTime}
                            onChange={(e) => setRespondedTime(e.target.value)}
                            className={`${inputCls} w-24 shrink-0`}
                          />
                          <NowButton
                            onClick={() => {
                              setRespondedDate(nowDate())
                              setRespondedTime(nowTime())
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={sectionLabelCls}>対応者</label>
                        <select name="respondentName" defaultValue={initialLog?.respondentName ?? ""} className={selectCls}>
                          <option value="">選択してください</option>
                          {CANDIDATE_OWNER_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className={sectionLabelCls}>対応中ステータス</label>
                        <input
                          type="hidden"
                          name="responseStatus"
                          value={statusPhase && statusDetail ? `${statusPhase}：${statusDetail}` : statusPhase}
                        />
                        <select
                          value={statusPhase}
                          onChange={(e) => {
                            setStatusPhase(e.target.value)
                            setStatusDetail("")
                          }}
                          className={selectCls}
                        >
                          <option value="">フェーズを選択</option>
                          {CONTACT_RESPONSE_STATUS_PHASES.map((phase) => (
                            <option key={phase} value={phase}>
                              {phase}
                            </option>
                          ))}
                        </select>
                        {statusPhase ? (
                          <select value={statusDetail} onChange={(e) => setStatusDetail(e.target.value)} className={selectCls}>
                            <option value="">詳細ステータスを選択</option>
                            {(CONTACT_RESPONSE_STATUS_DETAILS[statusPhase] ?? []).map((detail) => (
                              <option key={detail} value={detail}>
                                {detail}
                              </option>
                            ))}
                          </select>
                        ) : null}
                      </div>
                    </SectionBand>

                    {!ownerName ? (
                      <div className="rounded-2xl border border-amber-200/70 bg-[linear-gradient(135deg,rgba(255,251,235,0.92),rgba(255,245,225,0.86))] px-5 py-4">
                        <label className={`${sectionLabelCls} text-amber-700`}>担当者（面談以降の更新時は必須）</label>
                        <select
                          name="candidateOwnerName"
                          value={candidateOwnerName}
                          onChange={(e) => setCandidateOwnerName(e.target.value)}
                          className={selectCls}
                        >
                          <option value="">選択してください</option>
                          {CANDIDATE_OWNER_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <input type="hidden" name="candidateOwnerName" value={ownerName} />
                    )}

                    <SectionBand className="grid-cols-1 border border-violet-100/60 bg-[linear-gradient(135deg,rgba(255,250,240,0.8),rgba(255,246,235,0.7))] md:grid-cols-2">
                      <div>
                        <label className={sectionLabelCls}>受発信</label>
                        <div className="flex h-9 items-center gap-4 px-1">
                          {[
                            { label: "未選択", value: "" },
                            { label: "受信", value: "受信" },
                            { label: "発信", value: "発信" },
                          ].map((option) => (
                            <label key={option.label} className="flex cursor-pointer items-center gap-1 text-[12px] font-semibold text-violet-800">
                              <input
                                type="radio"
                                name="direction"
                                value={option.value}
                                defaultChecked={(initialLog?.direction ?? "") === option.value}
                                className="accent-fuchsia-500"
                              />
                              {option.label}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className={sectionLabelCls}>通話手段</label>
                        <select name="communicationMethod" defaultValue={initialLog?.communicationMethod ?? ""} className={selectCls}>
                          <option value="">選択してください</option>
                          {CONTACT_COMMUNICATION_METHOD_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </SectionBand>

                    {statusPhase === "対応終了" ? (
                      <div className="rounded-2xl border border-amber-200/70 bg-[linear-gradient(135deg,rgba(255,251,235,0.9),rgba(255,248,225,0.85))] px-5 py-4">
                        <label className={`${sectionLabelCls} text-amber-700`}>対応終了理由</label>
                        <select name="reason" defaultValue={initialLog?.reason ?? ""} className={selectCls}>
                          <option value="">選択してください</option>
                          {CONTACT_REASON_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : null}

                    <SectionBand className="grid-cols-1 border border-rose-100/70 bg-[linear-gradient(135deg,rgba(255,245,245,0.8),rgba(255,240,240,0.7))] xl:grid-cols-[minmax(0,1.35fr)_260px]">
                      <div>
                        <label className={sectionLabelCls}>NA日時</label>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <input
                            type="date"
                            name="naAtDate"
                            value={naDate}
                            onChange={(e) => setNaDate(e.target.value)}
                            className={`${inputCls} min-w-[152px] flex-1 xl:flex-none`}
                          />
                          <input
                            type="time"
                            name="naAtTime"
                            value={naTime}
                            onChange={(e) => setNaTime(e.target.value)}
                            className={`${inputCls} w-24 shrink-0`}
                          />
                          <NowButton
                            onClick={() => {
                              setNaDate(nowDate())
                              setNaTime(nowTime())
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setNaDate(addDays(1))}
                            className="shrink-0 rounded-full bg-violet-400 px-2.5 py-1 text-[10px] font-bold text-white transition hover:bg-violet-500"
                          >
                            翌日
                          </button>
                          <button
                            type="button"
                            onClick={() => setNaDate(addDays(2))}
                            className="shrink-0 rounded-full bg-violet-400 px-2.5 py-1 text-[10px] font-bold text-white transition hover:bg-violet-500"
                          >
                            2日後
                          </button>
                          <button
                            type="button"
                            onClick={() => setNaDate(addDays(7))}
                            className="shrink-0 rounded-full bg-violet-400 px-2.5 py-1 text-[10px] font-bold text-white transition hover:bg-violet-500"
                          >
                            1週間後
                          </button>
                        </div>
                      </div>

                      <div className="min-w-0 xl:min-w-[260px]">
                        <label className={sectionLabelCls}>NA内容</label>
                        <select name="naContent" defaultValue={initialLog?.naContent ?? ""} className={selectCls}>
                          <option value="">選択してください</option>
                          {CONTACT_NA_CONTENT_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </SectionBand>

                    <div className="rounded-2xl border border-violet-100/60 bg-white/70 px-5 py-4">
                      <label className={sectionLabelCls}>備考</label>
                      <textarea
                        name="notes"
                        defaultValue={initialLog?.notes ?? ""}
                        rows={6}
                        className="w-full resize-none rounded-xl border border-fuchsia-100/80 bg-white px-3 py-2.5 text-[12px] text-[#2f1b3b] outline-none focus:border-fuchsia-300 focus:ring-1 focus:ring-fuchsia-200/70"
                        placeholder="自由記述..."
                      />
                    </div>

                    <div className="rounded-2xl border border-violet-100/60 bg-[linear-gradient(135deg,rgba(245,243,255,0.85),rgba(250,246,255,0.75))] px-5 py-4">
                      <div className="mb-3 text-[10px] font-bold text-violet-700">このステータスとして設定（登録日が自動入力されます）</div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 md:grid-cols-5">
                        {[
                          { name: "setAs_firstResponseDate", label: "初回対応日" },
                          { name: "setAs_interviewDate", label: "面談日" },
                          { name: "setAs_documentCreatedDate", label: "書類作成日" },
                          { name: "setAs_proposalDate", label: "提案日" },
                          { name: "setAs_entryDate", label: "エントリー日" },
                          { name: "setAs_companyInterviewDate", label: "企業面談日" },
                          { name: "setAs_offerDate", label: "内定日" },
                          { name: "setAs_offerAcceptedDate", label: "承諾日" },
                          { name: "setAs_joiningDate", label: "入社日" },
                          { name: "setAs_closedDate", label: "終了日" },
                        ].map(({ name, label }) => (
                          <label key={name} className="flex cursor-pointer items-center gap-1.5 text-[11px] font-semibold text-violet-800">
                            <input type="checkbox" name={name} className="h-3.5 w-3.5 accent-fuchsia-500" />
                            {label}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 border-t border-violet-100/60 bg-white/80 px-6 py-4 text-center backdrop-blur-md">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="rounded-full bg-[linear-gradient(135deg,rgba(124,58,237,0.92),rgba(168,85,247,0.88))] px-12 py-2.5 text-[13px] font-black text-white shadow-[0_10px_26px_-14px_rgba(124,58,237,0.85)] transition hover:shadow-[0_14px_30px_-12px_rgba(124,58,237,0.95)] disabled:opacity-60"
                    >
                      {isPending ? "登録中..." : "登録する"}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  )
}
