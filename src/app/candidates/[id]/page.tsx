import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { createSelectionAction, saveCandidateAction } from "@/lib/actions"
import { CANDIDATE_STATUS_LABELS, CUSTOMER_RANK_BADGE, SELECTION_STATUS_LABELS } from "@/lib/constants"
import { formatCurrency, formatDate, formatDateInput } from "@/lib/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{ id: string }>
}

export default async function CandidateDetailPage({ params }: Props) {
  const { id } = await params
  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: {
      qualifications: { orderBy: { sortOrder: "asc" } },
      selections: { orderBy: { updatedAt: "desc" } },
    },
  })

  if (!candidate) notFound()

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">{candidate.name}</h1>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${CUSTOMER_RANK_BADGE[candidate.customerRank]}`}>{candidate.customerRank}</span>
              <Badge variant="secondary">{CANDIDATE_STATUS_LABELS[candidate.overallStatus]}</Badge>
            </div>
            <p className="mt-2 text-sm text-zinc-500">
              {candidate.candidateCode} / 担当者: {candidate.ownerName ?? "未設定"} / 流入日: {formatDate(candidate.inflowDate)}
            </p>
          </div>
        </div>
      </div>

      <form action={saveCandidateAction} className="space-y-6">
        <input type="hidden" name="id" value={candidate.id} />

        <Card className="rounded-3xl border-white/70 bg-white/90 shadow-sm">
          <CardHeader><CardTitle className="text-lg font-bold text-zinc-900">基本情報</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <label className="space-y-1 text-sm"><span>氏名 *</span><input name="name" defaultValue={candidate.name} className="h-10 w-full rounded-2xl border border-zinc-200 px-3" /></label>
            <label className="space-y-1 text-sm"><span>氏名（かな）</span><input name="nameKana" defaultValue={candidate.nameKana ?? ""} className="h-10 w-full rounded-2xl border border-zinc-200 px-3" /></label>
            <label className="space-y-1 text-sm"><span>生年月日</span><input type="date" name="birthDate" defaultValue={formatDateInput(candidate.birthDate)} className="h-10 w-full rounded-2xl border border-zinc-200 px-3" /></label>
            <label className="space-y-1 text-sm"><span>性別</span><input name="gender" defaultValue={candidate.gender ?? ""} className="h-10 w-full rounded-2xl border border-zinc-200 px-3" /></label>
            <label className="space-y-1 text-sm"><span>電話番号</span><input name="phone" defaultValue={candidate.phone ?? ""} className="h-10 w-full rounded-2xl border border-zinc-200 px-3" /></label>
            <label className="space-y-1 text-sm"><span>メール</span><input name="email" defaultValue={candidate.email ?? ""} className="h-10 w-full rounded-2xl border border-zinc-200 px-3" /></label>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-white/70 bg-white/90 shadow-sm">
          <CardHeader><CardTitle className="text-lg font-bold text-zinc-900">転職条件・ランク</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <label className="space-y-1 text-sm"><span>希望職種</span><input name="desiredJobType" defaultValue={candidate.desiredJobType ?? ""} className="h-10 w-full rounded-2xl border border-zinc-200 px-3" /></label>
            <label className="space-y-1 text-sm"><span>希望勤務地</span><input name="desiredLocation" defaultValue={candidate.desiredLocation ?? ""} className="h-10 w-full rounded-2xl border border-zinc-200 px-3" /></label>
            <label className="space-y-1 text-sm"><span>担当者</span><input name="ownerName" defaultValue={candidate.ownerName ?? ""} className="h-10 w-full rounded-2xl border border-zinc-200 px-3" /></label>
            <label className="space-y-1 text-sm"><span>現在年収（万円）</span><input name="currentAnnualIncome" defaultValue={candidate.currentAnnualIncome ?? ""} className="h-10 w-full rounded-2xl border border-zinc-200 px-3" /></label>
            <label className="space-y-1 text-sm"><span>希望年収（万円）</span><input name="desiredAnnualIncome" defaultValue={candidate.desiredAnnualIncome ?? ""} className="h-10 w-full rounded-2xl border border-zinc-200 px-3" /></label>
            <label className="space-y-1 text-sm"><span>転職状況</span><input name="jobSearchStatus" defaultValue={candidate.jobSearchStatus ?? ""} className="h-10 w-full rounded-2xl border border-zinc-200 px-3" /></label>
            <label className="space-y-1 text-sm"><span>転職時期</span><input name="desiredTiming" defaultValue={candidate.desiredTiming ?? ""} className="h-10 w-full rounded-2xl border border-zinc-200 px-3" /></label>
            <label className="space-y-1 text-sm"><span>ランク（手動）</span><select name="customerRank" defaultValue={candidate.customerRank} className="h-10 w-full rounded-2xl border border-zinc-200 px-3"><option value="S">S</option><option value="A">A</option><option value="B">B</option><option value="C">C</option></select></label>
            <label className="flex items-center gap-2 rounded-2xl bg-zinc-50 px-3 text-sm"><input type="checkbox" name="rankManualOverride" defaultChecked={candidate.rankManualOverride} />手動上書きを有効にする</label>
            <label className="space-y-1 text-sm md:col-span-3"><span>保有資格（改行 or カンマ区切り）</span><textarea name="qualificationLines" defaultValue={candidate.qualifications.map((item) => item.qualificationName).join("\n")} className="min-h-28 w-full rounded-2xl border border-zinc-200 px-3 py-2" /></label>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-white/70 bg-white/90 shadow-sm">
          <CardHeader><CardTitle className="text-lg font-bold text-zinc-900">進捗日付・内部メモ</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <label className="space-y-1 text-sm"><span>流入日</span><input type="date" name="inflowDate" defaultValue={formatDateInput(candidate.inflowDate)} className="h-10 w-full rounded-2xl border border-zinc-200 px-3" /></label>
            <label className="space-y-1 text-sm"><span>初回対応日</span><input type="date" name="firstResponseDate" defaultValue={formatDateInput(candidate.firstResponseDate)} className="h-10 w-full rounded-2xl border border-zinc-200 px-3" /></label>
            <label className="space-y-1 text-sm"><span>面談日</span><input type="date" name="interviewDate" defaultValue={formatDateInput(candidate.interviewDate)} className="h-10 w-full rounded-2xl border border-zinc-200 px-3" /></label>
            <label className="space-y-1 text-sm"><span>提案日</span><input type="date" name="proposalDate" defaultValue={formatDateInput(candidate.proposalDate)} className="h-10 w-full rounded-2xl border border-zinc-200 px-3" /></label>
            <label className="space-y-1 text-sm"><span>書類作成日</span><input type="date" name="documentCreatedDate" defaultValue={formatDateInput(candidate.documentCreatedDate)} className="h-10 w-full rounded-2xl border border-zinc-200 px-3" /></label>
            <label className="space-y-1 text-sm"><span>内定日</span><input type="date" name="offerDate" defaultValue={formatDateInput(candidate.offerDate)} className="h-10 w-full rounded-2xl border border-zinc-200 px-3" /></label>
            <label className="space-y-1 text-sm"><span>承諾日</span><input type="date" name="offerAcceptedDate" defaultValue={formatDateInput(candidate.offerAcceptedDate)} className="h-10 w-full rounded-2xl border border-zinc-200 px-3" /></label>
            <label className="space-y-1 text-sm"><span>入社日</span><input type="date" name="joiningDate" defaultValue={formatDateInput(candidate.joiningDate)} className="h-10 w-full rounded-2xl border border-zinc-200 px-3" /></label>
            <label className="space-y-1 text-sm"><span>終了日</span><input type="date" name="closedDate" defaultValue={formatDateInput(candidate.closedDate)} className="h-10 w-full rounded-2xl border border-zinc-200 px-3" /></label>
            <label className="space-y-1 text-sm md:col-span-3"><span>内部メモ</span><textarea name="internalMemo" defaultValue={candidate.internalMemo ?? ""} className="min-h-28 w-full rounded-2xl border border-zinc-200 px-3 py-2" /></label>
            <label className="space-y-1 text-sm md:col-span-3"><span>活かせるスキル</span><textarea name="transferableSkills" defaultValue={candidate.transferableSkills ?? ""} className="min-h-24 w-full rounded-2xl border border-zinc-200 px-3 py-2" /></label>
            <label className="space-y-1 text-sm md:col-span-3"><span>強み</span><textarea name="strengths" defaultValue={candidate.strengths ?? ""} className="min-h-24 w-full rounded-2xl border border-zinc-200 px-3 py-2" /></label>
            <label className="space-y-1 text-sm md:col-span-3"><span>転職理由</span><textarea name="reasonForChange" defaultValue={candidate.reasonForChange ?? ""} className="min-h-24 w-full rounded-2xl border border-zinc-200 px-3 py-2" /></label>
            <label className="space-y-1 text-sm"><span>PCスキル</span><textarea name="pcSkills" defaultValue={candidate.pcSkills ?? ""} className="min-h-24 w-full rounded-2xl border border-zinc-200 px-3 py-2" /></label>
            <label className="space-y-1 text-sm"><span>語学</span><textarea name="languageSkills" defaultValue={candidate.languageSkills ?? ""} className="min-h-24 w-full rounded-2xl border border-zinc-200 px-3 py-2" /></label>
            <label className="space-y-1 text-sm"><span>アーカイブ</span><div className="flex h-10 items-center rounded-2xl border border-zinc-200 px-3"><input type="checkbox" name="archived" defaultChecked={candidate.archived} /></div></label>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <button type="submit" className="rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white">保存</button>
        </div>
      </form>

      <Card className="rounded-3xl border-white/70 bg-white/90 shadow-sm">
        <CardHeader><CardTitle className="text-lg font-bold text-zinc-900">選考一覧</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {candidate.selections.map((selection) => (
            <div key={selection.id} className="rounded-2xl bg-zinc-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-zinc-900">{selection.companyName}</p>
                  <p className="text-sm text-zinc-500">{selection.jobType ?? "-"} / {formatCurrency(Math.round((selection.unitPrice ?? 0) * (selection.feeRate ?? 0)))}</p>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700">{SELECTION_STATUS_LABELS[selection.selectionStatus]}</span>
              </div>
              <p className="mt-2 text-sm text-zinc-500">提案: {formatDate(selection.proposedAt)} / エントリー: {formatDate(selection.entryAt)} / 内定: {formatDate(selection.offerAt)}</p>
            </div>
          ))}

          <form action={createSelectionAction} className="grid gap-3 rounded-2xl border border-dashed border-zinc-200 p-4 md:grid-cols-5">
            <input type="hidden" name="candidateId" value={candidate.id} />
            <input type="hidden" name="ownerName" value={candidate.ownerName ?? ""} />
            <input name="companyName" placeholder="企業名" className="h-10 rounded-2xl border border-zinc-200 px-3" />
            <input name="jobType" placeholder="募集職種" className="h-10 rounded-2xl border border-zinc-200 px-3" />
            <input name="unitPrice" placeholder="単価" className="h-10 rounded-2xl border border-zinc-200 px-3" />
            <input name="feeRate" placeholder="紹介料率 0.35" className="h-10 rounded-2xl border border-zinc-200 px-3" />
            <button type="submit" className="h-10 rounded-2xl bg-zinc-900 px-4 text-sm font-semibold text-white">選考を追加</button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
