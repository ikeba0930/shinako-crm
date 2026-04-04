import Link from "next/link"
import { deleteCandidateAction } from "@/lib/actions"
import { DeleteCandidateButton } from "@/components/delete-candidate-button"
import { prisma } from "@/lib/db"
import { CANDIDATE_STATUS_LABELS, CUSTOMER_RANK_BADGE } from "@/lib/constants"
import { formatDate, formatManYen } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export const dynamic = "force-dynamic"

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

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
            ],
          }
        : {}),
      ...(rank ? { customerRank: rank as never } : {}),
      ...(status ? { overallStatus: status as never } : {}),
      ...(owner ? { ownerName: owner } : {}),
    },
    orderBy: sort === "inflowDate" ? { inflowDate: "desc" } : { updatedAt: "desc" },
  })

  const filteredCandidates = inflowSource
    ? candidates.filter((candidate) => candidate.inflowSource === inflowSource)
    : candidates

  const owners = [...new Set(candidates.map((candidate) => candidate.ownerName).filter(Boolean))]

  return (
    <div className="space-y-4 p-4 lg:p-5">
      <div className="flex items-center justify-between gap-4 rounded-[22px] border border-white/55 bg-white/55 px-4 py-3 shadow-[0_18px_40px_-32px_rgba(88,28,135,0.72)] backdrop-blur-xl">
        <div>
          <h1 className="bg-[linear-gradient(120deg,#5b21b6_0%,#db2777_42%,#0ea5e9_82%,#f59e0b_100%)] bg-clip-text text-[20px] font-black tracking-tight text-transparent">
            求職者一覧
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/api/csv/candidates?keyword=${encodeURIComponent(keyword)}&rank=${rank}&status=${status}&owner=${encodeURIComponent(owner)}&inflowSource=${encodeURIComponent(inflowSource)}`}
            className="rounded-full border border-white/60 bg-white/75 px-3.5 py-2 text-[12px] font-semibold text-[#6d4e7e] shadow-[0_10px_24px_-22px_rgba(88,28,135,0.75)] backdrop-blur"
          >
            CSV
          </a>
          <Link
            href="/candidates/new"
            className="rounded-full bg-[linear-gradient(135deg,#7c3aed_0%,#ec4899_48%,#38bdf8_100%)] px-4 py-2 text-[12px] font-semibold text-white shadow-[0_16px_30px_-20px_rgba(168,85,247,0.92)]"
          >
            + 新規登録
          </Link>
        </div>
      </div>

      <Card className="rounded-[24px] border-white/55 bg-white/62 shadow-[0_22px_48px_-34px_rgba(88,28,135,0.78)]">
        <CardHeader>
          <CardTitle className="text-base font-black text-[#241433]">絞り込み</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-3 md:grid-cols-6">
            <input
              name="keyword"
              defaultValue={keyword}
              placeholder="氏名 / 求職者ID / 希望職種"
              className="h-10 rounded-2xl border border-white/60 bg-white/80 px-3 text-sm"
            />
            <select name="rank" defaultValue={rank} className="h-10 rounded-2xl border border-white/60 bg-white/80 px-3 text-sm">
              <option value="">ランクすべて</option>
              <option value="S">S</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
            <select name="status" defaultValue={status} className="h-10 rounded-2xl border border-white/60 bg-white/80 px-3 text-sm">
              <option value="">ステータスすべて</option>
              {Object.entries(CANDIDATE_STATUS_LABELS).map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
            <select name="inflowSource" defaultValue={inflowSource} className="h-10 rounded-2xl border border-white/60 bg-white/80 px-3 text-sm">
              <option value="">流入元すべて</option>
              <option value="ポータル">ポータル</option>
              <option value="紹介会社">紹介会社</option>
            </select>
            <select name="owner" defaultValue={owner} className="h-10 rounded-2xl border border-white/60 bg-white/80 px-3 text-sm">
              <option value="">担当者すべて</option>
              {owners.map((item) => (
                <option key={item} value={item ?? ""}>
                  {item}
                </option>
              ))}
            </select>
            <select name="sort" defaultValue={sort} className="h-10 rounded-2xl border border-white/60 bg-white/80 px-3 text-sm">
              <option value="updatedAt">更新日順</option>
              <option value="inflowDate">流入日順</option>
            </select>
            <button
              type="submit"
              className="h-10 rounded-2xl bg-[linear-gradient(135deg,#7c3aed_0%,#ec4899_52%,#f59e0b_100%)] px-4 text-sm font-semibold text-white md:col-span-6"
            >
              適用
            </button>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-[24px] border-white/55 bg-white/62 shadow-[0_22px_48px_-34px_rgba(88,28,135,0.78)]">
        <CardHeader>
          <CardTitle className="text-base font-black text-[#241433]">一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>求職者ID</TableHead>
                <TableHead>氏名</TableHead>
                <TableHead>年齢</TableHead>
                <TableHead>現在年収</TableHead>
                <TableHead>希望年収</TableHead>
                <TableHead>ランク</TableHead>
                <TableHead>希望職種</TableHead>
                <TableHead>全体ステータス</TableHead>
                <TableHead>提案求人数</TableHead>
                <TableHead>選考企業数</TableHead>
                <TableHead>流入日</TableHead>
                <TableHead>面談日</TableHead>
                <TableHead>担当者</TableHead>
                <TableHead className="text-right">削除</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCandidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>{candidate.candidateCode}</TableCell>
                  <TableCell>
                    <Link href={`/candidates/${candidate.id}`} className="font-semibold text-zinc-900 hover:text-rose-600">
                      {candidate.name}
                    </Link>
                  </TableCell>
                  <TableCell>{candidate.age ?? "-"}</TableCell>
                  <TableCell>{formatManYen(candidate.currentAnnualIncome)}</TableCell>
                  <TableCell>{formatManYen(candidate.desiredAnnualIncome)}</TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${CUSTOMER_RANK_BADGE[candidate.customerRank]}`}>
                      {candidate.customerRank}
                    </span>
                  </TableCell>
                  <TableCell>{candidate.desiredJobType ?? "-"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{CANDIDATE_STATUS_LABELS[candidate.overallStatus]}</Badge>
                  </TableCell>
                  <TableCell>{candidate.proposalCount}</TableCell>
                  <TableCell>{candidate.activeSelectionCount}</TableCell>
                  <TableCell>{formatDate(candidate.inflowDate)}</TableCell>
                  <TableCell>{formatDate(candidate.interviewDate)}</TableCell>
                  <TableCell>{candidate.ownerName ?? "-"}</TableCell>
                  <TableCell className="text-right">
                    <form action={deleteCandidateAction}>
                      <input type="hidden" name="candidateId" value={candidate.id} />
                      <DeleteCandidateButton candidateName={candidate.name} />
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
