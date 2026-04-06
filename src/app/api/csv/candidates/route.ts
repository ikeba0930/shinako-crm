import { SelectionStatus } from "@prisma/client"
import { prisma } from "@/lib/db"
import { CANDIDATE_STATUS_LABELS, inflowRouteMatches } from "@/lib/constants"
import { formatDate } from "@/lib/format"

function toCsvRow(values: Array<string | number | null | undefined>) {
  return values
    .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
    .join(",")
}

const inactiveSelectionStatuses = new Set<SelectionStatus>([
  SelectionStatus.DECLINED,
  SelectionStatus.DECLINED_BEFORE_DOCUMENT,
  SelectionStatus.DECLINED_FIRST_INTERVIEW,
  SelectionStatus.DECLINED_SECOND_INTERVIEW,
  SelectionStatus.DECLINED_THIRD_INTERVIEW,
  SelectionStatus.DECLINED_FINAL_INTERVIEW,
  SelectionStatus.DECLINED_OTHER,
  SelectionStatus.DECLINED_OFFER,
  SelectionStatus.REJECTED,
  SelectionStatus.REJECTED_DOCUMENT,
  SelectionStatus.REJECTED_FIRST_INTERVIEW,
  SelectionStatus.REJECTED_SECOND_INTERVIEW,
  SelectionStatus.REJECTED_THIRD_INTERVIEW,
  SelectionStatus.REJECTED_OTHER,
  SelectionStatus.CLOSED,
  SelectionStatus.JOINED,
])

function getLatestSelectionDate(values: Array<Date | null>) {
  return values
    .filter((value): value is Date => value instanceof Date)
    .sort((a, b) => b.getTime() - a.getTime())[0] ?? null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const keyword = searchParams.get("keyword") ?? ""
  const rank = searchParams.get("rank") ?? ""
  const status = searchParams.get("status") ?? ""
  const owner = searchParams.get("owner") ?? ""
  const inflowSource = searchParams.get("inflowSource") ?? ""

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
      ...(status ? { overallStatus: status as never } : {}),
      ...(owner ? { ownerName: owner } : {}),
    },
    include: {
      selections: {
        orderBy: { updatedAt: "desc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  const filteredCandidates = inflowSource
    ? candidates.filter((candidate) => inflowRouteMatches(candidate.inflowSource, inflowSource))
    : candidates

  const rows = [
    ["LステURL", "氏名", "ランク", "ステータス", "選考中企業", "流入日", "初回対応日", "面談日", "書類作成日", "提案日", "エントリー日", "企業面談日", "内定日", "承諾日", "入社日", "終了日", "初回担当者", "担当者"],
    ...filteredCandidates.map((candidate) => {
      const activeSelections = candidate.selections.filter(
        (selection) => !inactiveSelectionStatuses.has(selection.selectionStatus)
      )
      const activeCompanies = [...new Set(activeSelections.map((selection) => selection.companyName).filter(Boolean))]
      const entryDate = candidate.entryDate ?? getLatestSelectionDate(candidate.selections.map((selection) => selection.entryAt))
      const companyInterviewDate = candidate.companyInterviewDate ?? getLatestSelectionDate(
        candidate.selections.flatMap((selection) => [selection.firstInterviewAt, selection.secondInterviewAt, selection.interviewScheduledAt])
      )

      return [
        candidate.otherConditions,
        candidate.name,
        candidate.customerRank,
        CANDIDATE_STATUS_LABELS[candidate.overallStatus],
        activeCompanies.join(" / "),
        formatDate(candidate.inflowDate),
        formatDate(candidate.firstResponseDate),
        formatDate(candidate.interviewDate),
        formatDate(candidate.documentCreatedDate),
        formatDate(candidate.proposalDate),
        formatDate(entryDate),
        formatDate(companyInterviewDate),
        formatDate(candidate.offerDate),
        formatDate(candidate.offerAcceptedDate),
        formatDate(candidate.joiningDate),
        formatDate(candidate.closedDate),
        candidate.initialOwnerName,
        candidate.ownerName,
      ]
    }),
  ]

  const csv = `\uFEFF${rows.map((row) => toCsvRow(row)).join("\n")}`
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="candidates.csv"',
    },
  })
}
