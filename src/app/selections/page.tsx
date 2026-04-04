import { prisma } from "@/lib/db"
import { saveSelectionAction } from "@/lib/actions"
import { CUSTOMER_RANK_BADGE, SELECTION_STATUS_LABELS } from "@/lib/constants"
import { formatDate, formatDateInput, formatManYen } from "@/lib/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const STALLED_ENTRY_THRESHOLD = (() => {
  const date = new Date()
  date.setDate(date.getDate() - 14)
  return date
})()

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function SelectionsPage({ searchParams }: Props) {
  const params = await searchParams
  const keyword = typeof params.keyword === "string" ? params.keyword : ""
  const status = typeof params.status === "string" ? params.status : ""
  const owner = typeof params.owner === "string" ? params.owner : ""

  const selections = await prisma.selection.findMany({
    where: {
      ...(keyword
        ? {
            OR: [
              { companyName: { contains: keyword } },
              { jobType: { contains: keyword } },
              { candidate: { name: { contains: keyword } } },
            ],
          }
        : {}),
      ...(status ? { selectionStatus: status as never } : {}),
      ...(owner ? { ownerName: owner } : {}),
    },
    include: {
      candidate: true,
    },
    orderBy: { updatedAt: "desc" },
  })

  const owners = [...new Set(selections.map((selection) => selection.ownerName).filter(Boolean))]
  const statusTabs = ["", "PROPOSED", "ENTERED", "PASSED_DOCUMENT", "OFFERED", "ACCEPTED", "JOINED"]

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-sm">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">選考管理</h1>
        <p className="mt-1 text-sm text-zinc-500">1行 = 1求職者 × 1企業。ここで日付とステータスを更新します。</p>
      </div>

      <Card className="rounded-3xl border-white/70 bg-white/90 shadow-sm">
        <CardHeader><CardTitle className="text-lg font-bold text-zinc-900">検索・絞り込み</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {statusTabs.map((tab) => (
              <a
                key={tab || "all"}
                href={`/selections?status=${tab}&keyword=${encodeURIComponent(keyword)}&owner=${encodeURIComponent(owner)}`}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${status === tab ? "bg-rose-500 text-white" : "bg-zinc-100 text-zinc-700"}`}
              >
                {tab ? SELECTION_STATUS_LABELS[tab as keyof typeof SELECTION_STATUS_LABELS] : "すべて"}
              </a>
            ))}
          </div>
          <form className="grid gap-3 md:grid-cols-3">
            <input type="hidden" name="status" value={status} />
            <input name="keyword" defaultValue={keyword} placeholder="求職者名 / 企業名 / 職種" className="h-10 rounded-2xl border border-zinc-200 px-3" />
            <select name="owner" defaultValue={owner} className="h-10 rounded-2xl border border-zinc-200 px-3">
              <option value="">担当者すべて</option>
              {owners.map((item) => (
                <option key={item} value={item ?? ""}>{item}</option>
              ))}
            </select>
            <button type="submit" className="h-10 rounded-2xl bg-zinc-900 px-4 text-sm font-semibold text-white">適用</button>
          </form>
          <a href={`/api/csv/selections?keyword=${encodeURIComponent(keyword)}&status=${status}&owner=${encodeURIComponent(owner)}`} className="inline-flex rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700">
            CSV出力
          </a>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {selections.map((selection) => {
          const stalled =
            selection.entryAt &&
            !selection.passedAt &&
            selection.entryAt < STALLED_ENTRY_THRESHOLD

          return (
            <Card key={selection.id} className="rounded-3xl border-white/70 bg-white/90 shadow-sm">
              <CardContent className="pt-6">
                <form action={saveSelectionAction} className="space-y-4">
                  <input type="hidden" name="id" value={selection.id} />
                  <input type="hidden" name="candidateId" value={selection.candidateId} />

                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-zinc-900">{selection.candidate.name}</strong>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${CUSTOMER_RANK_BADGE[selection.candidate.customerRank]}`}>{selection.candidate.customerRank}</span>
                        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700">{SELECTION_STATUS_LABELS[selection.selectionStatus]}</span>
                        {stalled ? <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">停滞アラート</span> : null}
                      </div>
                      <p className="text-sm text-zinc-500">
                        {selection.companyName} / {selection.jobType ?? "-"} / 年齢 {selection.candidate.age ?? "-"} / 希望職種 {selection.candidate.desiredJobType ?? "-"} / 単価 {formatManYen(selection.unitPrice)}
                      </p>
                    </div>
                    <a href={`/candidates/${selection.candidateId}`} className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-700">詳細を見る</a>
                  </div>

                  <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-6">
                    <input name="companyName" defaultValue={selection.companyName} className="h-10 rounded-2xl border border-zinc-200 px-3" />
                    <input name="jobType" defaultValue={selection.jobType ?? ""} className="h-10 rounded-2xl border border-zinc-200 px-3" />
                    <input name="ownerName" defaultValue={selection.ownerName ?? ""} className="h-10 rounded-2xl border border-zinc-200 px-3" />
                    <input name="unitPrice" defaultValue={selection.unitPrice ?? ""} className="h-10 rounded-2xl border border-zinc-200 px-3" />
                    <input name="feeRate" defaultValue={selection.feeRate ?? ""} className="h-10 rounded-2xl border border-zinc-200 px-3" />
                    <select name="selectionStatus" defaultValue={selection.selectionStatus} className="h-10 rounded-2xl border border-zinc-200 px-3">
                      {Object.entries(SELECTION_STATUS_LABELS).map(([code, label]) => (
                        <option key={code} value={code}>{label}</option>
                      ))}
                    </select>
                    <label className="space-y-1 text-xs text-zinc-500"><span>提案日</span><input type="date" name="proposedAt" defaultValue={formatDateInput(selection.proposedAt)} className="h-10 w-full rounded-2xl border border-zinc-200 px-3 text-sm text-zinc-900" /></label>
                    <label className="space-y-1 text-xs text-zinc-500"><span>エントリー日</span><input type="date" name="entryAt" defaultValue={formatDateInput(selection.entryAt)} className="h-10 w-full rounded-2xl border border-zinc-200 px-3 text-sm text-zinc-900" /></label>
                    <label className="space-y-1 text-xs text-zinc-500"><span>書類通過日</span><input type="date" name="passedAt" defaultValue={formatDateInput(selection.passedAt)} className="h-10 w-full rounded-2xl border border-zinc-200 px-3 text-sm text-zinc-900" /></label>
                    <label className="space-y-1 text-xs text-zinc-500"><span>面談設置日</span><input type="date" name="interviewScheduledAt" defaultValue={formatDateInput(selection.interviewScheduledAt)} className="h-10 w-full rounded-2xl border border-zinc-200 px-3 text-sm text-zinc-900" /></label>
                    <label className="space-y-1 text-xs text-zinc-500"><span>一次面談日</span><input type="date" name="firstInterviewAt" defaultValue={formatDateInput(selection.firstInterviewAt)} className="h-10 w-full rounded-2xl border border-zinc-200 px-3 text-sm text-zinc-900" /></label>
                    <label className="space-y-1 text-xs text-zinc-500"><span>二次面談日</span><input type="date" name="secondInterviewAt" defaultValue={formatDateInput(selection.secondInterviewAt)} className="h-10 w-full rounded-2xl border border-zinc-200 px-3 text-sm text-zinc-900" /></label>
                    <label className="space-y-1 text-xs text-zinc-500"><span>内定日</span><input type="date" name="offerAt" defaultValue={formatDateInput(selection.offerAt)} className="h-10 w-full rounded-2xl border border-zinc-200 px-3 text-sm text-zinc-900" /></label>
                    <label className="space-y-1 text-xs text-zinc-500"><span>承諾日</span><input type="date" name="offerAcceptedAt" defaultValue={formatDateInput(selection.offerAcceptedAt)} className="h-10 w-full rounded-2xl border border-zinc-200 px-3 text-sm text-zinc-900" /></label>
                    <label className="space-y-1 text-xs text-zinc-500"><span>入社日</span><input type="date" name="joiningAt" defaultValue={formatDateInput(selection.joiningAt)} className="h-10 w-full rounded-2xl border border-zinc-200 px-3 text-sm text-zinc-900" /></label>
                    <label className="space-y-1 text-xs text-zinc-500 md:col-span-4 xl:col-span-3"><span>対応メモ</span><input name="notes" defaultValue={selection.notes ?? ""} className="h-10 w-full rounded-2xl border border-zinc-200 px-3 text-sm text-zinc-900" /></label>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-500">提案 {formatDate(selection.proposedAt)} / エントリー {formatDate(selection.entryAt)} / 内定 {formatDate(selection.offerAt)}</p>
                    <button type="submit" className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white">更新</button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
