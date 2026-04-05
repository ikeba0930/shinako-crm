import Link from "next/link"
import { prisma } from "@/lib/db"
import { createCandidateAction } from "@/lib/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CandidateBasicCreateForm } from "./candidate-basic-create-form"

export default async function CandidateNewPage() {
  const qualificationMasters = await prisma.qualificationMaster.findMany({
    where: { isActive: true },
    orderBy: [{ rankCategory: "asc" }, { sortOrder: "asc" }],
  })

  return (
    <div className="space-y-4 p-4 lg:p-5">
      <div className="flex items-center justify-between gap-4 rounded-[22px] border border-white/55 bg-white/55 px-4 py-3 shadow-[0_18px_40px_-32px_rgba(88,28,135,0.72)] backdrop-blur-xl">
        <div>
          <h1 className="bg-[linear-gradient(120deg,#5b21b6_0%,#db2777_42%,#0ea5e9_82%,#f59e0b_100%)] bg-clip-text text-[20px] font-black tracking-tight text-transparent">
            求職者を新規登録
          </h1>
        </div>
        <Link
          href="/candidates"
          className="rounded-full border border-white/60 bg-white/75 px-3.5 py-2 text-[12px] font-semibold text-[#6d4e7e] shadow-[0_10px_24px_-22px_rgba(88,28,135,0.75)] backdrop-blur"
        >
          一覧に戻る
        </Link>
      </div>

      <Card className="rounded-[24px] border-white/55 bg-white/62 shadow-[0_22px_48px_-34px_rgba(88,28,135,0.78)]">
        <CardHeader>
          <CardTitle className="text-base font-black text-[#241433]">基本入力</CardTitle>
        </CardHeader>
        <CardContent>
          <CandidateBasicCreateForm action={createCandidateAction} qualificationOptions={qualificationMasters.map((item) => item.name)} />
        </CardContent>
      </Card>
    </div>
  )
}
