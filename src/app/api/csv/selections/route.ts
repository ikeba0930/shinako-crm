import { prisma } from "@/lib/db"
import { SELECTION_STATUS_LABELS } from "@/lib/constants"
import { formatDate } from "@/lib/format"

function toCsvRow(values: Array<string | number | null | undefined>) {
  return values
    .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
    .join(",")
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const keyword = searchParams.get("keyword") ?? ""
  const status = searchParams.get("status") ?? ""
  const owner = searchParams.get("owner") ?? ""

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
    include: { candidate: true },
    orderBy: { updatedAt: "desc" },
  })

  const rows = [
    ["求職者名", "年齢", "希望職種", "ランク", "企業名", "募集職種", "単価", "紹介料率", "企業別ステータス", "提案日", "エントリー日", "書類通過日", "面談設置日", "一次面談日", "二次面談日", "内定日", "承諾日", "入社日", "対応メモ", "担当者"],
    ...selections.map((selection) => [
      selection.candidate.name,
      selection.candidate.age,
      selection.candidate.desiredJobType,
      selection.candidate.customerRank,
      selection.companyName,
      selection.jobType,
      selection.unitPrice,
      selection.feeRate,
      SELECTION_STATUS_LABELS[selection.selectionStatus],
      formatDate(selection.proposedAt),
      formatDate(selection.entryAt),
      formatDate(selection.passedAt),
      formatDate(selection.interviewScheduledAt),
      formatDate(selection.firstInterviewAt),
      formatDate(selection.secondInterviewAt),
      formatDate(selection.offerAt),
      formatDate(selection.offerAcceptedAt),
      formatDate(selection.joiningAt),
      selection.notes,
      selection.ownerName,
    ]),
  ]

  const csv = `\uFEFF${rows.map((row) => toCsvRow(row)).join("\n")}`
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="selections.csv"',
    },
  })
}
