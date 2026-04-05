import { prisma } from "@/lib/db"
import { CANDIDATE_STATUS_LABELS, inflowRouteMatches } from "@/lib/constants"
import { formatDate } from "@/lib/format"

function toCsvRow(values: Array<string | number | null | undefined>) {
  return values
    .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
    .join(",")
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
            ],
          }
        : {}),
      ...(rank ? { customerRank: rank as never } : {}),
      ...(status ? { overallStatus: status as never } : {}),
      ...(owner ? { ownerName: owner } : {}),
    },
    orderBy: { updatedAt: "desc" },
  })

  const filteredCandidates = inflowSource
    ? candidates.filter((candidate) => inflowRouteMatches(candidate.inflowSource, inflowSource))
    : candidates

  const rows = [
    ["求職者ID", "氏名", "性別", "年齢", "現在年収", "希望年収", "顧客ランク", "希望職種", "全体ステータス", "提案求人数", "選考企業数", "流入日", "面談日", "入社日", "担当者"],
    ...filteredCandidates.map((candidate) => [
      candidate.candidateCode,
      candidate.name,
      candidate.gender,
      candidate.age,
      candidate.currentAnnualIncome,
      candidate.desiredAnnualIncome,
      candidate.customerRank,
      candidate.desiredJobType,
      CANDIDATE_STATUS_LABELS[candidate.overallStatus],
      candidate.proposalCount,
      candidate.activeSelectionCount,
      formatDate(candidate.inflowDate),
      formatDate(candidate.interviewDate),
      formatDate(candidate.joiningDate),
      candidate.ownerName,
    ]),
  ]

  const csv = `\uFEFF${rows.map((row) => toCsvRow(row)).join("\n")}`
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="candidates.csv"',
    },
  })
}
