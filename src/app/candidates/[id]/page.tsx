import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createSelectionAction, saveCandidateAction } from "@/lib/actions"
import {
  CANDIDATE_AGE_OPTIONS,
  CANDIDATE_CONDITION_OPTIONS,
  CANDIDATE_GENDER_OPTIONS,
  CANDIDATE_JOB_OPTIONS,
  CANDIDATE_OWNER_OPTIONS,
  CANDIDATE_STATUS_LABELS,
  CUSTOMER_RANK_BADGE,
  INFLOW_ROUTE_OPTIONS,
  SELECTION_STATUS_LABELS,
  UNEMPLOYMENT_INSURANCE_CONTRACT_OPTIONS,
} from "@/lib/constants"
import { prisma } from "@/lib/db"
import { formatCurrency, formatDate, formatDateInput, formatDateTimeInput } from "@/lib/format"

export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{ id: string }>
}

const inputClassName = "h-10 w-full rounded-2xl border border-zinc-200 px-3"
const textareaClassName = "min-h-24 w-full rounded-2xl border border-zinc-200 px-3 py-2"

function getLatestSelectionDate(values: Array<Date | null>) {
  return values
    .filter((value): value is Date => value instanceof Date)
    .sort((a, b) => b.getTime() - a.getTime())[0] ?? null
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

  const isUnemploymentInsurance = candidate.inflowSource === "失業保険"
  const lineUrlLabel = isUnemploymentInsurance ? "LステURL（ひとなりのURL）" : "LステURL"
  const qualificationLines = candidate.qualifications.map((item) => item.qualificationName).join("\n")
  const activeCompanies = [...new Set(candidate.selections.map((selection) => selection.companyName).filter(Boolean))]
  const fallbackEntryDate = getLatestSelectionDate(candidate.selections.map((selection) => selection.entryAt))
  const fallbackCompanyInterviewDate = getLatestSelectionDate(
    candidate.selections.flatMap((selection) => [selection.firstInterviewAt, selection.secondInterviewAt, selection.interviewScheduledAt])
  )
  const headerEntryDate = candidate.entryDate ?? fallbackEntryDate
  const headerCompanyInterviewDate = candidate.companyInterviewDate ?? fallbackCompanyInterviewDate
  const nameColorClassName =
    candidate.gender === "男性" ? "text-sky-600" : candidate.gender === "女性" ? "text-rose-600" : "text-zinc-900"

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <form action={saveCandidateAction} className="space-y-6">
        <input type="hidden" name="id" value={candidate.id} />

      <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-sm">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              {candidate.otherConditions ? (
                <a
                  href={candidate.otherConditions}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex text-2xl font-extrabold tracking-tight underline decoration-2 underline-offset-4 ${nameColorClassName}`}
                >
                  {candidate.name}
                </a>
              ) : (
                <h1 className={`text-2xl font-extrabold tracking-tight ${nameColorClassName}`}>{candidate.name}</h1>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${CUSTOMER_RANK_BADGE[candidate.customerRank]}`}>
                  {candidate.customerRank}
                </span>
                <Badge variant="secondary">{CANDIDATE_STATUS_LABELS[candidate.overallStatus]}</Badge>
                <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
                  {activeCompanies.join(" / ") || "選考中企業なし"}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <button type="submit" className="rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white">
                保存
              </button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-6">
            <label className="space-y-1 text-sm md:col-span-2">
              <span>氏名</span>
              <input name="name" defaultValue={candidate.name} className={inputClassName} />
            </label>
            <label className="space-y-1 text-sm md:col-span-2">
              <span>{lineUrlLabel}</span>
              <input name="lineUrl" defaultValue={candidate.otherConditions ?? ""} className={inputClassName} />
            </label>
            <label className="space-y-1 text-sm">
              <span>性別</span>
              <select name="gender" defaultValue={candidate.gender ?? ""} className={inputClassName}>
                <option value="">選択してください</option>
                {CANDIDATE_GENDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span>ランク</span>
              <select name="customerRank" defaultValue={candidate.customerRank} className={inputClassName}>
                <option value="S">S</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span>ステータス</span>
              <div className="flex h-10 items-center rounded-2xl border border-zinc-200 bg-zinc-50 px-3 text-sm font-semibold text-zinc-700">
                {CANDIDATE_STATUS_LABELS[candidate.overallStatus]}
              </div>
            </label>
            <label className="space-y-1 text-sm md:col-span-2">
              <span>選考中企業</span>
              <div className="flex h-10 items-center rounded-2xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-700">
                {activeCompanies.join(" / ") || "-"}
              </div>
            </label>
            <label className="space-y-1 text-sm">
              <span>流入日</span>
              <input type="date" name="inflowDate" defaultValue={formatDateInput(candidate.inflowDate)} className={inputClassName} />
            </label>
            <label className="space-y-1 text-sm">
              <span>初回対応日</span>
              <input type="date" name="firstResponseDate" defaultValue={formatDateInput(candidate.firstResponseDate)} className={inputClassName} />
            </label>
            <label className="space-y-1 text-sm">
              <span>面談日</span>
              <input type="date" name="interviewDate" defaultValue={formatDateInput(candidate.interviewDate)} className={inputClassName} />
            </label>
            <label className="space-y-1 text-sm">
              <span>書類作成日</span>
              <input type="date" name="documentCreatedDate" defaultValue={formatDateInput(candidate.documentCreatedDate)} className={inputClassName} />
            </label>
            <label className="space-y-1 text-sm">
              <span>提案日</span>
              <input type="date" name="proposalDate" defaultValue={formatDateInput(candidate.proposalDate)} className={inputClassName} />
            </label>
            <label className="space-y-1 text-sm">
              <span>エントリー日</span>
              <input type="date" name="entryDate" defaultValue={formatDateInput(headerEntryDate)} className={inputClassName} />
            </label>
            <label className="space-y-1 text-sm">
              <span>企業面談日</span>
              <input type="date" name="companyInterviewDate" defaultValue={formatDateInput(headerCompanyInterviewDate)} className={inputClassName} />
            </label>
            <label className="space-y-1 text-sm">
              <span>内定日</span>
              <input type="date" name="offerDate" defaultValue={formatDateInput(candidate.offerDate)} className={inputClassName} />
            </label>
            <label className="space-y-1 text-sm">
              <span>承諾日</span>
              <input type="date" name="offerAcceptedDate" defaultValue={formatDateInput(candidate.offerAcceptedDate)} className={inputClassName} />
            </label>
            <label className="space-y-1 text-sm">
              <span>入社日</span>
              <input type="date" name="joiningDate" defaultValue={formatDateInput(candidate.joiningDate)} className={inputClassName} />
            </label>
            <label className="space-y-1 text-sm">
              <span>終了日</span>
              <input type="date" name="closedDate" defaultValue={formatDateInput(candidate.closedDate)} className={inputClassName} />
            </label>
            <label className="space-y-1 text-sm">
              <span>初回担当者</span>
              <select name="initialOwnerName" defaultValue={candidate.initialOwnerName ?? candidate.ownerName ?? ""} className={inputClassName}>
                <option value="">選択してください</option>
                {CANDIDATE_OWNER_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span>担当者</span>
              <select name="ownerName" defaultValue={candidate.ownerName ?? ""} className={inputClassName}>
                <option value="">選択してください</option>
                {CANDIDATE_OWNER_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 rounded-2xl bg-zinc-50 px-3 text-sm">
              <input type="checkbox" name="rankManualOverride" defaultChecked={candidate.rankManualOverride} />
              ランクを手動固定
            </label>
          </div>
        </div>
      </div>

      <Card className="rounded-3xl border-white/70 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-zinc-900">基本情報</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <label className="space-y-1 text-sm">
            <span>流入経路</span>
            <select name="inflowSource" defaultValue={candidate.inflowSource ?? ""} className={inputClassName}>
              <option value="">選択してください</option>
              {INFLOW_ROUTE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span>氏名（かな）</span>
            <input name="nameKana" defaultValue={candidate.nameKana ?? ""} className={inputClassName} />
          </label>
          <label className="space-y-1 text-sm">
            <span>年齢</span>
            <select name="age" defaultValue={candidate.age ? String(candidate.age) : ""} className={inputClassName}>
              <option value="">選択してください</option>
              {CANDIDATE_AGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}歳
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span>生年月日</span>
            <input type="date" name="birthDate" defaultValue={formatDateInput(candidate.birthDate)} className={inputClassName} />
          </label>
          <label className="space-y-1 text-sm">
            <span>電話番号</span>
            <input name="phone" defaultValue={candidate.phone ?? ""} className={inputClassName} />
          </label>
          <label className="space-y-1 text-sm">
            <span>メールアドレス</span>
            <input name="email" defaultValue={candidate.email ?? ""} className={inputClassName} />
          </label>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-white/70 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-zinc-900">登録情報</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <label className="space-y-1 text-sm">
            <span>条件</span>
            <select name="jobSearchStatus" defaultValue={candidate.jobSearchStatus ?? ""} className={inputClassName}>
              <option value="">選択してください</option>
              {CANDIDATE_CONDITION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          {isUnemploymentInsurance ? (
            <>
              <label className="space-y-1 text-sm">
                <span>失業保険契約</span>
                <select
                  name="unemploymentInsuranceContract"
                  defaultValue={candidate.unemploymentInsuranceContract ?? ""}
                  className={inputClassName}
                >
                  <option value="">選択してください</option>
                  {UNEMPLOYMENT_INSURANCE_CONTRACT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-sm">
                <span>退職日</span>
                <input type="date" name="retirementDate" defaultValue={formatDateInput(candidate.retirementDate)} className={inputClassName} />
              </label>
              <label className="space-y-1 text-sm">
                <span>エージェント パス日</span>
                <input type="date" name="agentPassDate" defaultValue={formatDateInput(candidate.agentPassDate)} className={inputClassName} />
              </label>
              <label className="space-y-1 text-sm">
                <span>架電希望日時</span>
                <input
                  type="datetime-local"
                  name="callPreferredAt"
                  defaultValue={formatDateTimeInput(candidate.callPreferredAt)}
                  className={inputClassName}
                />
              </label>
            </>
          ) : (
            <>
              <label className="space-y-1 text-sm">
                <span>希望職種</span>
                <select name="desiredJobType" defaultValue={candidate.desiredJobType ?? ""} className={inputClassName}>
                  <option value="">選択してください</option>
                  {CANDIDATE_JOB_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-sm md:col-span-3">
                <span>資格</span>
                <textarea name="qualificationLines" defaultValue={qualificationLines} className="min-h-28 w-full rounded-2xl border border-zinc-200 px-3 py-2" />
              </label>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-white/70 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-zinc-900">詳細情報</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <label className="space-y-1 text-sm">
            <span>希望勤務地</span>
            <input name="desiredLocation" defaultValue={candidate.desiredLocation ?? ""} className={inputClassName} />
          </label>
          <label className="space-y-1 text-sm">
            <span>現在年収（万円）</span>
            <input name="currentAnnualIncome" defaultValue={candidate.currentAnnualIncome ?? ""} className={inputClassName} />
          </label>
          <label className="space-y-1 text-sm">
            <span>希望年収（万円）</span>
            <input name="desiredAnnualIncome" defaultValue={candidate.desiredAnnualIncome ?? ""} className={inputClassName} />
          </label>
          <label className="space-y-1 text-sm">
            <span>転職時期</span>
            <input name="desiredTiming" defaultValue={candidate.desiredTiming ?? ""} className={inputClassName} />
          </label>
          <label className="space-y-1 text-sm">
            <span>雇用状況</span>
            <input name="employmentStatus" defaultValue={candidate.employmentStatus ?? ""} className={inputClassName} />
          </label>
          <label className="space-y-1 text-sm">
            <span>雇用形態希望</span>
            <input name="employmentTypePreference" defaultValue={candidate.employmentTypePreference ?? ""} className={inputClassName} />
          </label>
          <label className="space-y-1 text-sm">
            <span>稼働可能時期</span>
            <input name="availability" defaultValue={candidate.availability ?? ""} className={inputClassName} />
          </label>
          <label className="space-y-1 text-sm md:col-span-3">
            <span>内部メモ</span>
            <textarea name="internalMemo" defaultValue={candidate.internalMemo ?? ""} className="min-h-28 w-full rounded-2xl border border-zinc-200 px-3 py-2" />
          </label>
          <label className="space-y-1 text-sm md:col-span-3">
            <span>活かせるスキル</span>
            <textarea name="transferableSkills" defaultValue={candidate.transferableSkills ?? ""} className={textareaClassName} />
          </label>
          <label className="space-y-1 text-sm md:col-span-3">
            <span>強み</span>
            <textarea name="strengths" defaultValue={candidate.strengths ?? ""} className={textareaClassName} />
          </label>
          <label className="space-y-1 text-sm md:col-span-3">
            <span>転職理由</span>
            <textarea name="reasonForChange" defaultValue={candidate.reasonForChange ?? ""} className={textareaClassName} />
          </label>
          <label className="space-y-1 text-sm">
            <span>PCスキル</span>
            <textarea name="pcSkills" defaultValue={candidate.pcSkills ?? ""} className={textareaClassName} />
          </label>
          <label className="space-y-1 text-sm">
            <span>語学</span>
            <textarea name="languageSkills" defaultValue={candidate.languageSkills ?? ""} className={textareaClassName} />
          </label>
          <label className="space-y-1 text-sm">
            <span>アーカイブ</span>
            <div className="flex h-10 items-center rounded-2xl border border-zinc-200 px-3">
              <input type="checkbox" name="archived" defaultChecked={candidate.archived} />
            </div>
          </label>
        </CardContent>
      </Card>

        <div className="flex justify-end">
          <button type="submit" className="rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white">
            保存
          </button>
        </div>
      </form>

      <Card className="rounded-3xl border-white/70 bg-white/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-zinc-900">選考一覧</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {candidate.selections.map((selection) => (
            <div key={selection.id} className="rounded-2xl bg-zinc-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-zinc-900">{selection.companyName}</p>
                  <p className="text-sm text-zinc-500">
                    {selection.jobType ?? "-"} / {formatCurrency(Math.round((selection.unitPrice ?? 0) * (selection.feeRate ?? 0)))}
                  </p>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700">
                  {SELECTION_STATUS_LABELS[selection.selectionStatus]}
                </span>
              </div>
              <p className="mt-2 text-sm text-zinc-500">
                提案: {formatDate(selection.proposedAt)} / エントリー: {formatDate(selection.entryAt)} / オファー: {formatDate(selection.offerAt)}
              </p>
            </div>
          ))}

          <form action={createSelectionAction} className="grid gap-3 rounded-2xl border border-dashed border-zinc-200 p-4 md:grid-cols-5">
            <input type="hidden" name="candidateId" value={candidate.id} />
            <input type="hidden" name="ownerName" value={candidate.ownerName ?? ""} />
            <input name="companyName" placeholder="企業名" className="h-10 rounded-2xl border border-zinc-200 px-3" />
            <input name="jobType" placeholder="募集職種" className="h-10 rounded-2xl border border-zinc-200 px-3" />
            <input name="unitPrice" placeholder="単価" className="h-10 rounded-2xl border border-zinc-200 px-3" />
            <input name="feeRate" placeholder="料率 0.35" className="h-10 rounded-2xl border border-zinc-200 px-3" />
            <button type="submit" className="h-10 rounded-2xl bg-zinc-900 px-4 text-sm font-semibold text-white">
              選考を追加
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
