import Link from "next/link"
import { createCandidateAction } from "@/lib/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CandidateNewPage() {
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
          一覧へ戻る
        </Link>
      </div>

      <Card className="rounded-[24px] border-white/55 bg-white/62 shadow-[0_22px_48px_-34px_rgba(88,28,135,0.78)]">
        <CardHeader>
          <CardTitle className="text-base font-black text-[#241433]">基本入力</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createCandidateAction} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <input name="name" placeholder="新規求職者名" className="h-11 rounded-2xl border border-white/60 bg-white/80 px-3 text-sm" />
            <input name="phone" placeholder="電話番号" className="h-11 rounded-2xl border border-white/60 bg-white/80 px-3 text-sm" />
            <input name="email" placeholder="メールアドレス" className="h-11 rounded-2xl border border-white/60 bg-white/80 px-3 text-sm" />
            <input name="desiredJobType" placeholder="希望職種" className="h-11 rounded-2xl border border-white/60 bg-white/80 px-3 text-sm" />
            <input name="ownerName" placeholder="担当者" className="h-11 rounded-2xl border border-white/60 bg-white/80 px-3 text-sm md:col-span-2 xl:col-span-3" />
            <button
              type="submit"
              className="h-11 rounded-2xl bg-[linear-gradient(135deg,#7c3aed_0%,#ec4899_52%,#38bdf8_100%)] px-4 text-sm font-semibold text-white shadow-[0_18px_34px_-22px_rgba(168,85,247,0.92)]"
            >
              登録して詳細へ進む
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
