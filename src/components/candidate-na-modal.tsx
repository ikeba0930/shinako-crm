"use client"

import { useRef, useState, useTransition } from "react"
import { saveContactLogAction } from "@/lib/actions"
import {
  CANDIDATE_OWNER_OPTIONS,
  CONTACT_COMMUNICATION_METHOD_OPTIONS,
  CONTACT_NA_CONTENT_OPTIONS,
  CONTACT_REASON_OPTIONS,
  CONTACT_RESPONSE_STATUS_OPTIONS,
} from "@/lib/constants"

type Props = {
  candidateId: string
}

function nowDate() {
  return new Date().toLocaleDateString("sv-SE") // YYYY-MM-DD
}

function nowTime() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

const labelCls = "block text-[9px] font-bold text-violet-600 mb-0.5"
const inputCls =
  "h-8 w-full rounded-xl border border-fuchsia-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(249,243,255,0.97))] px-2.5 text-[11px] text-[#2f1b3b] outline-none focus:border-fuchsia-300 focus:ring-1 focus:ring-fuchsia-200/70"
const selectCls =
  "h-8 w-full rounded-xl border border-fuchsia-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(249,243,255,0.97))] px-2 text-[11px] text-[#2f1b3b] outline-none focus:border-fuchsia-300 focus:ring-1 focus:ring-fuchsia-200/70"

function NowButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-full bg-teal-500 px-2 py-0.5 text-[9px] font-bold text-white transition hover:bg-teal-600"
    >
      現在時刻
    </button>
  )
}

export function CandidateNaModal({ candidateId }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [respondedDate, setRespondedDate] = useState("")
  const [respondedTime, setRespondedTime] = useState("")
  const [naDate, setNaDate] = useState("")
  const [naTime, setNaTime] = useState("")
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      await saveContactLogAction(formData)
      setIsOpen(false)
      formRef.current?.reset()
      setRespondedDate("")
      setRespondedTime("")
      setNaDate("")
      setNaTime("")
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-full border border-rose-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,242,246,0.92))] px-3 py-1 text-[10px] font-semibold text-rose-700 shadow-[0_14px_26px_-22px_rgba(244,63,94,0.68)] transition hover:bg-rose-50"
      >
        対応NA
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* オーバーレイ */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* モーダル本体 */}
          <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[1.6rem] border border-fuchsia-100/60 bg-[linear-gradient(135deg,rgba(255,250,255,0.99),rgba(250,246,255,0.98),rgba(243,249,255,0.97))] shadow-[0_32px_64px_-24px_rgba(109,40,217,0.6)]">
            {/* ヘッダー */}
            <div className="flex items-center justify-between border-b border-fuchsia-100/50 bg-[linear-gradient(90deg,rgba(244,114,182,0.14),rgba(168,85,247,0.12),rgba(56,189,248,0.1))] px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">📋</span>
                <span className="text-[13px] font-black tracking-wide text-violet-900">対応・NA登録</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-[10px] font-semibold text-zinc-500 transition hover:bg-zinc-50"
              >
                ✕ キャンセル
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 p-5">
              <input type="hidden" name="candidateId" value={candidateId} />

              {/* 対応日時・対応者・対応中ステータス */}
              <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-3">
                <div className="col-span-2">
                  <label className={labelCls}>対応日時</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="date"
                      name="respondedAtDate"
                      value={respondedDate}
                      onChange={(e) => setRespondedDate(e.target.value)}
                      className={inputCls}
                    />
                    <input
                      type="time"
                      name="respondedAtTime"
                      value={respondedTime}
                      onChange={(e) => setRespondedTime(e.target.value)}
                      className={`${inputCls} w-28 shrink-0`}
                    />
                    <NowButton onClick={() => { setRespondedDate(nowDate()); setRespondedTime(nowTime()) }} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>対応者</label>
                  <select name="respondentName" className={selectCls}>
                    <option value="">選択してください</option>
                    {CANDIDATE_OWNER_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>対応中ステータス</label>
                  <select name="responseStatus" className={selectCls}>
                    <option value="">選択してください</option>
                    {CONTACT_RESPONSE_STATUS_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 受発信・通信手段・理由 */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>受発信</label>
                  <div className="flex h-8 items-center gap-3 px-1 text-[11px]">
                    {["受信", "発信"].map((v) => (
                      <label key={v} className="flex items-center gap-1 cursor-pointer text-violet-800">
                        <input type="radio" name="direction" value={v} className="accent-fuchsia-500" />
                        {v}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>通信手段</label>
                  <select name="communicationMethod" className={selectCls}>
                    <option value="">選択してください</option>
                    {CONTACT_COMMUNICATION_METHOD_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>理由</label>
                  <select name="reason" className={selectCls}>
                    <option value="">選択してください</option>
                    {CONTACT_REASON_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* NA日時・NA内容・不通フラグ */}
              <div className="rounded-2xl border border-rose-100/70 bg-rose-50/40 p-3">
                <div className="mb-2 text-[9px] font-black uppercase tracking-wider text-rose-400">NA情報</div>
                <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
                  <div>
                    <label className={labelCls}>NA日時</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="date"
                        name="naAtDate"
                        value={naDate}
                        onChange={(e) => setNaDate(e.target.value)}
                        className={inputCls}
                      />
                      <input
                        type="time"
                        name="naAtTime"
                        value={naTime}
                        onChange={(e) => setNaTime(e.target.value)}
                        className={`${inputCls} w-24 shrink-0`}
                      />
                      <NowButton onClick={() => { setNaDate(nowDate()); setNaTime(nowTime()) }} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>NA内容</label>
                    <select name="naContent" className={selectCls}>
                      <option value="">選択してください</option>
                      {CONTACT_NA_CONTENT_OPTIONS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-rose-700 pb-1">
                      <input type="checkbox" name="isUnreachable" className="accent-rose-500 h-3.5 w-3.5" />
                      不通フラグ
                    </label>
                  </div>
                </div>
              </div>

              {/* 備考 */}
              <div>
                <label className={labelCls}>備考</label>
                <textarea
                  name="notes"
                  rows={4}
                  className="w-full rounded-xl border border-fuchsia-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(249,243,255,0.97))] px-3 py-2 text-[11px] text-[#2f1b3b] outline-none focus:border-fuchsia-300 focus:ring-1 focus:ring-fuchsia-200/70 resize-none"
                />
              </div>

              {/* 登録ボタン */}
              <div className="flex justify-center pt-1">
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-full bg-[linear-gradient(135deg,rgba(124,58,237,0.92),rgba(168,85,247,0.88))] px-8 py-2 text-[12px] font-black text-white shadow-[0_10px_26px_-14px_rgba(124,58,237,0.85)] transition hover:shadow-[0_14px_30px_-12px_rgba(124,58,237,0.95)] disabled:opacity-60"
                >
                  {isPending ? "✦ 登録中..." : "✦ 登録する"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
