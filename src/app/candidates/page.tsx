import Link from "next/link"
import { SelectionStatus } from "@prisma/client"
import { DeleteCandidateButton } from "@/components/delete-candidate-button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { deleteCandidateAction } from "@/lib/actions"
import {
  CANDIDATE_STATUS_LABELS,
  CONTACT_RESPONSE_STATUS_DETAILS,
  CONTACT_RESPONSE_STATUS_PHASES,
  CUSTOMER_RANK_BADGE,
  INFLOW_ROUTE_OPTIONS,
  inflowRouteMatches,
} from "@/lib/constants"
import { prisma } from "@/lib/db"
import { formatDate } from "@/lib/format"

export const dynamic = "force-dynamic"

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const inactiveSelectionStatuses = new Set<SelectionStatus>([
  SelectionStatus.DECLINED,
  SelectionStatus.REJECTED,
  SelectionStatus.CLOSED,
  SelectionStatus.JOINED,
])

function getLatestSelectionDate(values: Array<Date | null>) {
  return values
    .filter((value): value is Date => value instanceof Date)
    .sort((a, b) => b.getTime() - a.getTime())[0] ?? null
}

function HeaderLabel({ label, className }: { label: string; className: string }) {
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-black tracking-tight ${className}`}>{label}</span>
}

const responseStatusOptions = [
  ...CONTACT_RESPONSE_STATUS_PHASES,
  ...CONTACT_RESPONSE_STATUS_PHASES.flatMap((phase) =>
    (CONTACT_RESPONSE_STATUS_DETAILS[phase] ?? []).map((detail) => `${phase}：${detail}`)
  ),
]

export default async function CandidatesPage({ searchParams }: Props) {
  const params = await searchParams
  const keyword = typeof params.keyword === "string" ? params.keyword : ""
  const rank = typeof params.rank === "string" ? params.rank : ""
  const status = typeof params.status === "string" ? params.status : ""
  const owner = typeof params.owner === "string" ? params.owner : ""
  const inflowSource = typeof params.inflowSource === "string" ? params.inflowSource : ""
  const sort = typeof params.sort === "string" ? params.sort : "updatedAt"

  const candidates = await prisma.candidate.findMany({
    where: {
      archived: false,
      ...(keyword
        ? {
            OR: [
              { candidateCode: { contains: keyword } },
              { name: { contains: keyword } },
              { desiredJobType: { contains: keyword } },
              { ownerName: { contains: keyword } },
              { initialOwnerName: { contains: keyword } },
              { otherConditions: { contains: keyword } },
            ],
          }
        : {}),
      ...(rank ? { customerRank: rank as never } : {}),
      ...(owner ? { ownerName: owner } : {}),
    },
    include: {
      selections: {
        orderBy: { updatedAt: "desc" },
      },
      contactLogs: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: sort === "inflowDate" ? { inflowDate: "desc" } : { updatedAt: "desc" },
  })

  const statusFiltered = status
    ? candidates.filter((candidate) => {
        const responseStatus = candidate.contactLogs[0]?.responseStatus ?? ""
        return responseStatus === status
      })
    : candidates

  const baseFiltered = inflowSource
    ? statusFiltered.filter((candidate) => inflowRouteMatches(candidate.inflowSource, inflowSource))
    : statusFiltered

  const filteredCandidates =
    sort === "naAt"
      ? [...baseFiltered].sort((a, b) => {
          const aT = a.contactLogs[0]?.naAt?.getTime() ?? Number.MAX_SAFE_INTEGER
          const bT = b.contactLogs[0]?.naAt?.getTime() ?? Number.MAX_SAFE_INTEGER
          return aT - bT
        })
      : baseFiltered

  const owners = [...new Set(candidates.map((candidate) => candidate.ownerName).filter(Boolean))]
  const hasActiveFilters = Boolean(keyword || rank || status || owner || inflowSource || (sort && sort !== "updatedAt"))

  return (
    <div className="space-y-3 p-4 lg:p-5">
      <div className="fantasy-page-shell flex items-center justify-between gap-3 px-4 py-3">
        <div>
          <div className="fantasy-kicker mb-2">Moon Archive</div>
          <h1 className="bg-[linear-gradient(120deg,#5b21b6_0%,#db2777_42%,#0ea5e9_82%,#f59e0b_100%)] bg-clip-text font-heading text-[1.45rem] font-bold tracking-[0.05em] text-transparent">
            求職者一覧
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/api/csv/candidates?keyword=${encodeURIComponent(keyword)}&rank=${rank}&status=${status}&owner=${encodeURIComponent(owner)}&inflowSource=${encodeURIComponent(inflowSource)}`}
            className="rounded-full border border-white/60 bg-white/75 px-3 py-1.5 text-[12px] font-semibold text-[#6d4e7e] shadow-[0_10px_24px_-22px_rgba(88,28,135,0.75)] backdrop-blur"
          >
            CSV
          </a>
          <Link
            href="/candidates/new"
            className="rounded-full bg-[linear-gradient(135deg,#7c3aed_0%,#ec4899_48%,#38bdf8_100%)] px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-[0_16px_30px_-20px_rgba(168,85,247,0.92)]"
          >
            + 新規登録
          </Link>
        </div>
      </div>

      <Card className="rounded-[24px] border-white/55 bg-white/62 shadow-[0_22px_48px_-34px_rgba(88,28,135,0.78)]">
        <CardContent className="py-3">
          <details open={hasActiveFilters} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-[20px] border border-white/60 bg-white/70 px-4 py-2 text-sm font-semibold text-[#241433] marker:hidden">
              <span className="flex items-center gap-2">
                <span>絞り込み</span>
                {hasActiveFilters ? (
                  <span className="rounded-full bg-[#f3e8ff] px-2 py-0.5 text-[11px] font-bold text-[#7c3aed]">
                    ON
                  </span>
                ) : null}
              </span>
              <span className="text-xs text-[#6d4e7e] group-open:hidden">表示</span>
              <span className="hidden text-xs text-[#6d4e7e] group-open:inline">閉じる</span>
            </summary>
            <form className="mt-3 grid gap-3 md:grid-cols-6">
              <input
                name="keyword"
                defaultValue={keyword}
                placeholder="氏名 / URL / 希望職種"
                className="h-9 rounded-2xl border border-white/60 bg-white/80 px-3 text-sm"
              />
              <select name="rank" defaultValue={rank} className="h-9 rounded-2xl border border-white/60 bg-white/80 px-3 text-sm">
                <option value="">ランクすべて</option>
                <option value="S">S</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
              <select name="status" defaultValue={status} className="h-9 rounded-2xl border border-white/60 bg-white/80 px-3 text-sm">
                <option value="">対応中ステータスすべて</option>
                {responseStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select name="inflowSource" defaultValue={inflowSource} className="h-9 rounded-2xl border border-white/60 bg-white/80 px-3 text-sm">
                <option value="">流入経路すべて</option>
                {INFLOW_ROUTE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select name="owner" defaultValue={owner} className="h-9 rounded-2xl border border-white/60 bg-white/80 px-3 text-sm">
                <option value="">担当者すべて</option>
                {owners.map((item) => (
                  <option key={item} value={item ?? ""}>
                    {item}
                  </option>
                ))}
              </select>
              <select name="sort" defaultValue={sort} className="h-9 rounded-2xl border border-white/60 bg-white/80 px-3 text-sm">
                <option value="updatedAt">更新日順</option>
                <option value="inflowDate">流入日順</option>
                <option value="naAt">NA日時順（近い順）</option>
              </select>
              <div className="flex gap-2 md:col-span-6 md:justify-end">
                <Link
                  href="/candidates"
                  className="inline-flex h-9 items-center justify-center rounded-2xl border border-white/60 bg-white/80 px-4 text-sm font-semibold text-[#6d4e7e]"
                >
                  リセット
                </Link>
                <button
                  type="submit"
                  className="h-9 rounded-2xl bg-[linear-gradient(135deg,#7c3aed_0%,#ec4899_52%,#f59e0b_100%)] px-4 text-sm font-semibold text-white"
                >
                  適用
                </button>
              </div>
            </form>
          </details>
        </CardContent>
      </Card>

      <Card className="rounded-[24px] border-white/55 bg-white/62 shadow-[0_22px_48px_-34px_rgba(88,28,135,0.78)]">
        <CardHeader>
          <CardTitle className="text-[#241433]">一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="w-full table-auto text-[11px] leading-tight">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-1 py-2"><HeaderLabel label="LステURL" className="bg-sky-100 text-sky-700" /></TableHead>
                <TableHead className="px-1 py-2"><HeaderLabel label="氏名" className="bg-sky-100 text-sky-700" /></TableHead>
                <TableHead className="px-1 py-2"><HeaderLabel label="ランク" className="bg-sky-100 text-sky-700" /></TableHead>
                <TableHead className="px-1 py-2"><HeaderLabel label="対応中ステータス" className="bg-sky-100 text-sky-700" /></TableHead>
                <TableHead className="px-1 py-2"><HeaderLabel label="NA日時" className="bg-rose-100 text-rose-700" /></TableHead>
                <TableHead className="px-1 py-2"><HeaderLabel label="選考中企業" className="bg-rose-100 text-rose-700" /></TableHead>
                <TableHead className="px-1 py-2"><HeaderLabel label="流入日" className="bg-violet-100 text-violet-700" /></TableHead>
                <TableHead className="px-1 py-2"><HeaderLabel label="初回対応日" className="bg-fuchsia-100 text-fuchsia-700" /></TableHead>
                <TableHead className="px-1 py-2"><HeaderLabel label="面談日" className="bg-pink-100 text-pink-700" /></TableHead>
                <TableHead className="px-1 py-2"><HeaderLabel label="書類作成日" className="bg-orange-100 text-orange-700" /></TableHead>
                <TableHead className="px-1 py-2"><HeaderLabel label="提案日" className="bg-amber-100 text-amber-700" /></TableHead>
                <TableHead className="px-1 py-2"><HeaderLabel label="エントリー日" className="bg-lime-100 text-lime-700" /></TableHead>
                <TableHead className="px-1 py-2"><HeaderLabel label="企業面談日" className="bg-emerald-100 text-emerald-700" /></TableHead>
                <TableHead className="px-1 py-2"><HeaderLabel label="内定日" className="bg-cyan-100 text-cyan-700" /></TableHead>
                <TableHead className="px-1 py-2"><HeaderLabel label="承諾日" className="bg-blue-100 text-blue-700" /></TableHead>
                <TableHead className="px-1 py-2"><HeaderLabel label="入社日" className="bg-indigo-100 text-indigo-700" /></TableHead>
                <TableHead className="px-1 py-2"><HeaderLabel label="終了日" className="bg-slate-200 text-slate-700" /></TableHead>
                <TableHead className="px-1 py-2"><HeaderLabel label="初回担当者" className="bg-teal-100 text-teal-700" /></TableHead>
                <TableHead className="px-1 py-2"><HeaderLabel label="担当者" className="bg-purple-100 text-purple-700" /></TableHead>
                <TableHead className="px-1 py-2 text-right"><HeaderLabel label="操作" className="bg-zinc-100 text-zinc-700" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.map((candidate) => {
                const activeSelections = candidate.selections.filter(
                  (selection) => !inactiveSelectionStatuses.has(selection.selectionStatus)
                )
                const activeCompanies = [...new Set(activeSelections.map((selection) => selection.companyName).filter(Boolean))]
                const activeCompanyCountLabel = activeCompanies.length > 0 ? `${activeCompanies.length}社` : "-"
                const entryDate = candidate.entryDate ?? getLatestSelectionDate(candidate.selections.map((selection) => selection.entryAt))
                const companyInterviewDate = candidate.companyInterviewDate ?? getLatestSelectionDate(
                  candidate.selections.flatMap((selection) => [selection.firstInterviewAt, selection.secondInterviewAt, selection.interviewScheduledAt])
                )
                const latestLog = candidate.contactLogs[0]
                const naAt = latestLog?.naAt ?? null
                const bubbleLines = [
                  `氏名: ${candidate.name || "-"}`,
                  `LステURL: ${candidate.otherConditions || "-"}`,
                  `流入経路: ${candidate.inflowSource || "-"}`,
                  `ランク: ${candidate.customerRank}`,
                  `ステータス: ${CANDIDATE_STATUS_LABELS[candidate.overallStatus]}`,
                  `NA日時: ${naAt ? naAt.toLocaleString("ja-JP", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "-"}`,
                  `選考中企業: ${activeCompanyCountLabel}`,
                  `流入日: ${formatDate(candidate.inflowDate)}`,
                  `初回対応日: ${formatDate(candidate.firstResponseDate)}`,
                  `面談日: ${formatDate(candidate.interviewDate)}`,
                  `書類作成日: ${formatDate(candidate.documentCreatedDate)}`,
                  `提案日: ${formatDate(candidate.proposalDate)}`,
                  `エントリー日: ${formatDate(entryDate)}`,
                  `企業面談日: ${formatDate(companyInterviewDate)}`,
                  `内定日: ${formatDate(candidate.offerDate)}`,
                  `承諾日: ${formatDate(candidate.offerAcceptedDate)}`,
                  `入社日: ${formatDate(candidate.joiningDate)}`,
                  `終了日: ${formatDate(candidate.closedDate)}`,
                  `初回担当者: ${candidate.initialOwnerName || "-"}`,
                  `担当者: ${candidate.ownerName || "-"}`,
                ].join("\n")

                return (
                  <TableRow key={candidate.id} title={bubbleLines} className="hover:bg-white/50">
                    <TableCell className="px-1 py-2">
                      {candidate.otherConditions ? (
                        <a
                          href={candidate.otherConditions}
                          target="_blank"
                          rel="noreferrer"
                          title={candidate.otherConditions}
                          className="font-semibold text-sky-600 underline underline-offset-2"
                        >
                          開く
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="max-w-[92px] px-1 py-2">
                      <Link
                        href={`/candidates/${candidate.id}`}
                        title={candidate.name}
                        className="block truncate font-semibold text-zinc-900 hover:text-rose-600"
                      >
                        {candidate.name}
                      </Link>
                    </TableCell>
                    <TableCell className="px-1 py-2">
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${CUSTOMER_RANK_BADGE[candidate.customerRank]}`}>
                        {candidate.customerRank}
                      </span>
                    </TableCell>
                    <TableCell className="px-1 py-2">
                      <Badge variant="secondary" className="px-1.5 py-0.5 text-[10px]">
                        {latestLog?.responseStatus ?? "-"}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-1 py-2">
                      {naAt ? (
                        <span className={`text-[11px] font-semibold ${naAt < new Date() ? "text-rose-600" : "text-violet-700"}`}>
                          {naAt.toLocaleString("ja-JP", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      ) : (
                        <span className="text-zinc-300">-</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[112px] px-1 py-2" title={activeCompanyCountLabel}>
                      <span className="block truncate text-rose-700">{activeCompanyCountLabel}</span>
                    </TableCell>
                    <TableCell className="px-1 py-2">{formatDate(candidate.inflowDate)}</TableCell>
                    <TableCell className="px-1 py-2">{formatDate(candidate.firstResponseDate)}</TableCell>
                    <TableCell className="px-1 py-2">{formatDate(candidate.interviewDate)}</TableCell>
                    <TableCell className="px-1 py-2">{formatDate(candidate.documentCreatedDate)}</TableCell>
                    <TableCell className="px-1 py-2">{formatDate(candidate.proposalDate)}</TableCell>
                    <TableCell className="px-1 py-2">{formatDate(entryDate)}</TableCell>
                    <TableCell className="px-1 py-2">{formatDate(companyInterviewDate)}</TableCell>
                    <TableCell className="px-1 py-2">{formatDate(candidate.offerDate)}</TableCell>
                    <TableCell className="px-1 py-2">{formatDate(candidate.offerAcceptedDate)}</TableCell>
                    <TableCell className="px-1 py-2">{formatDate(candidate.joiningDate)}</TableCell>
                    <TableCell className="px-1 py-2">{formatDate(candidate.closedDate)}</TableCell>
                    <TableCell className="max-w-[84px] px-1 py-2" title={candidate.initialOwnerName ?? "-"}>
                      <span className="block truncate">{candidate.initialOwnerName ?? "-"}</span>
                    </TableCell>
                    <TableCell className="max-w-[84px] px-1 py-2" title={candidate.ownerName ?? "-"}>
                      <span className="block truncate">{candidate.ownerName ?? "-"}</span>
                    </TableCell>
                    <TableCell className="px-1 py-2 text-right">
                      <form action={deleteCandidateAction}>
                        <input type="hidden" name="candidateId" value={candidate.id} />
                        <DeleteCandidateButton candidateName={candidate.name} />
                      </form>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
