import { saveSelectionAction } from "@/lib/actions"
import { CUSTOMER_RANK_BADGE, SELECTION_STATUS_LABELS } from "@/lib/constants"
import { prisma } from "@/lib/db"
import { formatDate, formatDateInput } from "@/lib/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DateInputWithShortcuts } from "@/components/date-input-with-shortcuts"

export const dynamic = "force-dynamic"

const ACTION_OVERDUE_THRESHOLD = (() => {
  const date = new Date()
  date.setDate(date.getDate() - 1)
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
              { applicantName: { contains: keyword } },
              { referralSource: { contains: keyword } },
              { jobPostingUrl: { contains: keyword } },
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
    orderBy: [{ nextActionAt: "asc" }, { updatedAt: "desc" }],
  })

  const owners = [...new Set(selections.map((selection) => selection.ownerName).filter(Boolean))]
  const statusTabs = ["", "PROPOSED", "ENTERED", "PASSED_DOCUMENT", "OFFERED", "ACCEPTED", "JOINED"]

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="fantasy-page-header p-6 pl-8">
        <div className="fantasy-kicker mb-2">Selection Chronicle</div>
        <h1 className="fantasy-page-title">選考一覧</h1>
        <p className="fantasy-page-description">候補者ごとの選考紐づけを、応募情報と次回アクション中心で管理します。</p>
      </div>

      <Card className="rounded-3xl border-white/70 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-zinc-900">検索</CardTitle>
        </CardHeader>
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
            <input name="keyword" defaultValue={keyword} placeholder="候補者 / 企業 / 応募者 / 紹介経路" className="h-10 rounded-2xl border border-zinc-200 px-3" />
            <select name="owner" defaultValue={owner} className="h-10 rounded-2xl border border-zinc-200 px-3">
              <option value="">担当者すべて</option>
              {owners.map((item) => (
                <option key={item} value={item ?? ""}>
                  {item}
                </option>
              ))}
            </select>
            <button type="submit" className="h-10 rounded-2xl bg-zinc-900 px-4 text-sm font-semibold text-white">
              適用
            </button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {selections.map((selection) => {
          const actionOverdue = selection.nextActionAt && selection.nextActionAt < ACTION_OVERDUE_THRESHOLD

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
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${CUSTOMER_RANK_BADGE[selection.candidate.customerRank]}`}>
                          {selection.candidate.customerRank}
                        </span>
                        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700">
                          {SELECTION_STATUS_LABELS[selection.selectionStatus]}
                        </span>
                        {actionOverdue ? <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">要対応</span> : null}
                      </div>
                      <p className="text-sm text-zinc-500">
                        {selection.companyName} / 応募者 {selection.applicantName ?? "-"} / 担当 {selection.ownerName ?? "-"} / 紹介経路 {selection.referralSource ?? "-"}
                      </p>
                    </div>
                    <a href={`/candidates/${selection.candidateId}`} className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-700">
                      候補者を見る
                    </a>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <label className="space-y-1 text-xs text-zinc-500">
                      <span>応募日</span>
                      <DateInputWithShortcuts
                        name="applicationDate"
                        defaultValue={formatDateInput(selection.applicationDate ?? selection.proposedAt)}
                        className="h-10 w-full rounded-2xl border border-zinc-200 px-3 text-sm text-zinc-900"
                      />
                    </label>
                    <input name="applicantName" defaultValue={selection.applicantName ?? ""} placeholder="応募者" className="h-10 rounded-2xl border border-zinc-200 px-3" />
                    <input name="ownerName" defaultValue={selection.ownerName ?? ""} placeholder="担当" className="h-10 rounded-2xl border border-zinc-200 px-3" />
                    <input name="companyName" defaultValue={selection.companyName} placeholder="企業名" className="h-10 rounded-2xl border border-zinc-200 px-3" />
                    <select name="selectionStatus" defaultValue={selection.selectionStatus} className="h-10 rounded-2xl border border-zinc-200 px-3">
                      {Object.entries(SELECTION_STATUS_LABELS).map(([code, label]) => (
                        <option key={code} value={code}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <input name="referralSource" defaultValue={selection.referralSource ?? ""} placeholder="紹介経路" className="h-10 rounded-2xl border border-zinc-200 px-3" />
                    <label className="space-y-1 text-xs text-zinc-500">
                      <span>選考ステータス更新日</span>
                      <input type="date" name="statusUpdatedAt" defaultValue={formatDateInput(selection.statusUpdatedAt)} className="h-10 w-full rounded-2xl border border-zinc-200 px-3 text-sm text-zinc-900" />
                    </label>
                    <label className="space-y-1 text-xs text-zinc-500">
                      <span>次回アクション日</span>
                      <input type="date" name="nextActionAt" defaultValue={formatDateInput(selection.nextActionAt)} className="h-10 w-full rounded-2xl border border-zinc-200 px-3 text-sm text-zinc-900" />
                    </label>
                    <label className="space-y-1 text-xs text-zinc-500 md:col-span-2 xl:col-span-3">
                      <span>求人情報リンク</span>
                      <input name="jobPostingUrl" defaultValue={selection.jobPostingUrl ?? ""} className="h-10 w-full rounded-2xl border border-zinc-200 px-3 text-sm text-zinc-900" />
                    </label>
                    <label className="space-y-1 text-xs text-zinc-500 md:col-span-2 xl:col-span-3">
                      <span>メモ</span>
                      <input name="notes" defaultValue={selection.notes ?? ""} className="h-10 w-full rounded-2xl border border-zinc-200 px-3 text-sm text-zinc-900" />
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-500">
                      応募日 {formatDate(selection.applicationDate ?? selection.proposedAt)} / 更新日 {formatDate(selection.statusUpdatedAt)} / 次回 {formatDate(selection.nextActionAt)}
                    </p>
                    <button type="submit" className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white">
                      更新
                    </button>
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
