"use client"

import { useRef, useState, useTransition, useEffect } from "react"
import { createPortal } from "react-dom"
import { saveContactLogAction } from "@/lib/actions"
import {
  CANDIDATE_OWNER_OPTIONS,
  CONTACT_COMMUNICATION_METHOD_OPTIONS,
  CONTACT_NA_CONTENT_OPTIONS,
  CONTACT_REASON_OPTIONS,
  CONTACT_RESPONSE_STATUS_PHASES,
  CONTACT_RESPONSE_STATUS_DETAILS,
} from "@/lib/constants"

type Props = {
  candidateId: string
}

function nowDate() {
  return new Date().toLocaleDateString("sv-SE")
}
function nowTime() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}
function addDays(n: number) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toLocaleDateString("sv-SE")
}

const inputCls =
  "h-9 w-full rounded-xl border border-fuchsia-100/80 bg-white px-2.5 text-[12px] text-[#2f1b3b] outline-none focus:border-fuchsia-300 focus:ring-1 focus:ring-fuchsia-200/70"
const selectCls =
  "h-9 w-full rounded-xl border border-fuchsia-100/80 bg-white px-2 text-[12px] text-[#2f1b3b] outline-none focus:border-fuchsia-300 focus:ring-1 focus:ring-fuchsia-200/70"
const sectionLabelCls = "text-[10px] font-bold text-violet-600 mb-1 block"

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
  return (
    <div className={`grid gap-x-4 gap-y-3 rounded-2xl px-5 py-4 ${className}`}>
      {children}
    </div>
  )
}

export function CandidateNaModal({ candidateId }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [respondedDate, setRespondedDate] = useState("")
  const [respondedTime, setRespondedTime] = useState("")
  const [naDate, setNaDate] = useState("")
  const [naTime, setNaTime] = useState("")
  const [statusPhase, setStatusPhase] = useState("")
  const [statusDetail, setStatusDetail] = useState("")
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => { setMounted(true) }, [])

  function open() {
    setIsOpen(true)
  }

  function close() {
    setIsOpen(false)
    formRef.current?.reset()
    setRespondedDate("")
    setRespondedTime("")
    setNaDate("")
    setNaTime("")
    setStatusPhase("")
    setStatusDetail("")
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      await saveContactLogAction(formData)
      close()
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="rounded-full border border-rose-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,242,246,0.92))] px-3 py-1 text-[10px] font-semibold text-rose-700 shadow-[0_14px_26px_-22px_rgba(244,63,94,0.68)] transition hover:bg-rose-50"
      >
        対応NA
      </button>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* 背景オーバーレイ */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={close} />
          {/* モーダル本体 */}
          <div
            className="relative flex flex-col overflow-hidden rounded-[1.8rem] border border-fuchsia-100/60 bg-[linear-gradient(135deg,rgba(255,250,255,0.99),rgba(250,246,255,0.99),rgba(243,249,255,0.99))] shadow-[0_32px_64px_-24px_rgba(109,40,217,0.55)]"
            style={{ width: "94vw", maxWidth: "1560px", maxHeight: "92vh" }}
          >

            {/* トップバー */}
            <div className="flex shrink-0 items-center justify-between bg-[linear-gradient(90deg,rgba(244,114,182,0.22),rgba(168,85,247,0.18),rgba(56,189,248,0.16))] px-6 py-3 shadow-[0_4px_16px_-8px_rgba(109,40,217,0.3)]">
              <span className="text-[14px] font-black tracking-wide text-violet-900">📋 対応・NA登録</span>
              <button
                type="button"
                onClick={close}
                className="rounded-full border border-zinc-200 bg-white/90 px-4 py-1.5 text-[11px] font-semibold text-zinc-600 transition hover:bg-zinc-50"
              >
                ✕ キャンセル
              </button>
            </div>

            {/* フォーム本体（スクロール可） */}
            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
              <input type="hidden" name="candidateId" value={candidateId} />

              <div className="mx-auto w-full max-w-5xl flex-1 space-y-3 px-6 py-5">

                {/* ─── 対応情報 ─── */}
                <SectionBand className="border border-violet-100/60 bg-[linear-gradient(135deg,rgba(245,243,255,0.8),rgba(250,246,255,0.7))] grid-cols-1 md:grid-cols-[1.05fr_1fr_1.2fr]">
                  {/* 対応日時 */}
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
                      <NowButton onClick={() => { setRespondedDate(nowDate()); setRespondedTime(nowTime()) }} />
                    </div>
                  </div>
                  {/* 対応者 */}
                  <div>
                    <label className={sectionLabelCls}>対応者</label>
                    <select name="respondentName" className={selectCls}>
                      <option value="">選択してください</option>
                      {CANDIDATE_OWNER_OPTIONS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  {/* 対応中ステータス（2段） */}
                  <div className="space-y-1.5">
                    <label className={sectionLabelCls}>対応中ステータス</label>
                    {/* hidden で結合値を送る */}
                    <input
                      type="hidden"
                      name="responseStatus"
                      value={statusPhase && statusDetail ? `${statusPhase}：${statusDetail}` : statusPhase}
                    />
                    <select
                      value={statusPhase}
                      onChange={(e) => { setStatusPhase(e.target.value); setStatusDetail("") }}
                      className={selectCls}
                    >
                      <option value="">① フェーズを選択</option>
                      {CONTACT_RESPONSE_STATUS_PHASES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    {statusPhase && (
                      <select
                        value={statusDetail}
                        onChange={(e) => setStatusDetail(e.target.value)}
                        className={selectCls}
                      >
                        <option value="">② 詳細状況を選択</option>
                        {(CONTACT_RESPONSE_STATUS_DETAILS[statusPhase] ?? []).map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </SectionBand>

                {/* ─── 受発信・通信手段 ─── */}
                <SectionBand className="border border-violet-100/60 bg-[linear-gradient(135deg,rgba(255,250,240,0.8),rgba(255,246,235,0.7))] grid-cols-1 md:grid-cols-2">
                  {/* 受発信 */}
                  <div>
                    <label className={sectionLabelCls}>受発信</label>
                    <div className="flex h-9 items-center gap-4 px-1">
                      {["未選択", "受信", "発信"].map((v) => (
                        <label key={v} className="flex cursor-pointer items-center gap-1 text-[12px] font-semibold text-violet-800">
                          <input
                            type="radio"
                            name="direction"
                            value={v === "未選択" ? "" : v}
                            defaultChecked={v === "未選択"}
                            className="accent-fuchsia-500"
                          />
                          {v}
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* 通信手段 */}
                  <div>
                    <label className={sectionLabelCls}>通信手段</label>
                    <select name="communicationMethod" className={selectCls}>
                      <option value="">選択してください</option>
                      {CONTACT_COMMUNICATION_METHOD_OPTIONS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                </SectionBand>

                {/* ─── 終了理由（対応終了時のみ表示） ─── */}
                {statusPhase === "対応終了" && (
                  <div className="rounded-2xl border border-amber-200/70 bg-[linear-gradient(135deg,rgba(255,251,235,0.9),rgba(255,248,225,0.85))] px-5 py-4">
                    <label className={`${sectionLabelCls} text-amber-700`}>終了理由</label>
                    <select name="reason" className={selectCls}>
                      <option value="">選択してください</option>
                      {CONTACT_REASON_OPTIONS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* ─── NA情報 ─── */}
                <SectionBand className="border border-rose-100/70 bg-[linear-gradient(135deg,rgba(255,245,245,0.8),rgba(255,240,240,0.7))] grid-cols-1 xl:grid-cols-[minmax(0,1.35fr)_260px]">
                  {/* NA日時 */}
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
                      <NowButton onClick={() => { setNaDate(nowDate()); setNaTime(nowTime()) }} />
                      <button type="button" onClick={() => setNaDate(addDays(1))} className="shrink-0 rounded-full bg-violet-400 px-2.5 py-1 text-[10px] font-bold text-white transition hover:bg-violet-500">翌日</button>
                      <button type="button" onClick={() => setNaDate(addDays(2))} className="shrink-0 rounded-full bg-violet-400 px-2.5 py-1 text-[10px] font-bold text-white transition hover:bg-violet-500">2日後</button>
                      <button type="button" onClick={() => setNaDate(addDays(7))} className="shrink-0 rounded-full bg-violet-400 px-2.5 py-1 text-[10px] font-bold text-white transition hover:bg-violet-500">1週間後</button>
                    </div>
                  </div>
                  {/* NA内容 */}
                  <div className="min-w-0 xl:min-w-[260px]">
                    <label className={sectionLabelCls}>NA内容</label>
                    <select name="naContent" className={selectCls}>
                      <option value="">選択してください</option>
                      {CONTACT_NA_CONTENT_OPTIONS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                </SectionBand>

                {/* ─── 備考 ─── */}
                <div className="rounded-2xl border border-violet-100/60 bg-white/70 px-5 py-4">
                  <label className={sectionLabelCls}>備考</label>
                  <textarea
                    name="notes"
                    rows={6}
                    className="w-full rounded-xl border border-fuchsia-100/80 bg-white px-3 py-2.5 text-[12px] text-[#2f1b3b] outline-none focus:border-fuchsia-300 focus:ring-1 focus:ring-fuchsia-200/70 resize-none"
                    placeholder="自由記述..."
                  />
                </div>

                {/* ─── このステータスとして設定 ─── */}
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

              {/* 登録ボタン（固定フッター） */}
              <div className="shrink-0 border-t border-violet-100/60 bg-white/80 px-6 py-4 text-center backdrop-blur-md">
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-full bg-[linear-gradient(135deg,rgba(124,58,237,0.92),rgba(168,85,247,0.88))] px-12 py-2.5 text-[13px] font-black text-white shadow-[0_10px_26px_-14px_rgba(124,58,237,0.85)] transition hover:shadow-[0_14px_30px_-12px_rgba(124,58,237,0.95)] disabled:opacity-60"
                >
                  {isPending ? "✦ 登録中..." : "✦ 登録する"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
