import { notFound } from "next/navigation"
import { CandidateLocationFields } from "@/components/candidate-location-fields"
import { CandidateLineCopyButton } from "@/components/candidate-line-copy-button"
import { CandidateQualificationFields } from "@/components/candidate-qualification-fields"
import { SearchableSelect } from "@/components/searchable-select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createSelectionAction, saveCandidateAction } from "@/lib/actions"
import {
  CANDIDATE_CONDITION_OPTIONS,
  CANDIDATE_EXPERIENCE_COMPANY_COUNT_OPTIONS,
  CANDIDATE_GENDER_OPTIONS,
  CANDIDATE_OWNER_OPTIONS,
  CANDIDATE_STATUS_LABELS,
  CAREER_AXIS_OPTIONS,
  CUSTOMER_RANK_BADGE,
  DESIRED_TIMING_OPTIONS,
  DETAILED_CANDIDATE_JOB_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  FINAL_EDUCATION_OPTIONS,
  INFLOW_ROUTE_OPTIONS,
  MANAGEMENT_EXPERIENCE_OPTIONS,
  PREFECTURE_OPTIONS,
  SELECTION_STATUS_LABELS,
  UNEMPLOYMENT_INSURANCE_CONTRACT_OPTIONS,
} from "@/lib/constants"
import { prisma } from "@/lib/db"
import { formatCurrency, formatDate, formatDateInput, formatDateTimeInput } from "@/lib/format"
import { DETAILED_QUALIFICATION_OPTIONS } from "@/lib/qualification-options"

export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ saved?: string }>
}

const compactInputClassName = "h-9 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-[11px]"
const inputClassName = "h-10 w-full rounded-2xl border border-zinc-200 px-3"

function getLatestSelectionDate(values: Array<Date | null>) {
  return values
    .filter((value): value is Date => value instanceof Date)
    .sort((a, b) => b.getTime() - a.getTime())[0] ?? null
}

function HeaderLabel({ label, className }: { label: string; className: string }) {
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-black tracking-tight ${className}`}>{label}</span>
}

export default async function CandidateDetailPage({ params, searchParams }: Props) {
  const { id } = await params
  const query = (await searchParams) ?? {}
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
  const qualificationValues = candidate.qualifications.map((item) => item.qualificationName)
  const activeCompanies = [...new Set(candidate.selections.map((selection) => selection.companyName).filter(Boolean))]
  const activeCompanyCount = activeCompanies.length
  const fallbackEntryDate = getLatestSelectionDate(candidate.selections.map((selection) => selection.entryAt))
  const fallbackCompanyInterviewDate = getLatestSelectionDate(
    candidate.selections.flatMap((selection) => [selection.firstInterviewAt, selection.secondInterviewAt, selection.interviewScheduledAt])
  )
  const headerEntryDate = candidate.entryDate ?? fallbackEntryDate
  const headerCompanyInterviewDate = candidate.companyInterviewDate ?? fallbackCompanyInterviewDate
  const isSaved = query.saved === "1"
  const nameColorClassName =
    candidate.gender === "男性" ? "text-sky-600" : candidate.gender === "女性" ? "text-rose-600" : "text-zinc-900"
  const inflowLabel =
    INFLOW_ROUTE_OPTIONS.find((option) => option.value === candidate.inflowSource)?.label ?? candidate.inflowSource ?? "未設定"

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <form action={saveCandidateAction} className="space-y-6">
        <input type="hidden" name="id" value={candidate.id} />

        {isSaved ? (
          <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            保存しました
          </div>
        ) : null}

        <div className="rounded-[24px] border border-white/70 bg-white/90 p-4 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className={`text-2xl font-extrabold tracking-tight ${nameColorClassName}`}>{candidate.name}</h1>
                  <CandidateLineCopyButton gender={candidate.gender} url={candidate.otherConditions} />
                  <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 md:grid-cols-4">
                    <div className="flex min-w-0 items-center justify-center rounded-full bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-700">
                      <span className="truncate">{inflowLabel}</span>
                    </div>
                    <div
                      className={`flex min-w-0 items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold ${CUSTOMER_RANK_BADGE[candidate.customerRank]}`}
                    >
                      <span className="truncate">ランク {candidate.customerRank}</span>
                    </div>
                    <div className="flex min-w-0 items-center justify-center">
                      <Badge variant="secondary" className="w-full justify-center truncate rounded-full px-3 py-1.5 text-xs">
                        {CANDIDATE_STATUS_LABELS[candidate.overallStatus]}
                      </Badge>
                    </div>
                    <div className="flex min-w-0 items-center justify-center rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700">
                      <span className="truncate">選考企業 {activeCompanyCount}社</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end">
                <button type="submit" className="rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white">
                  保存
                </button>
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-4 xl:grid-cols-6">
              <label className="space-y-1 md:col-span-2">
                <HeaderLabel label={lineUrlLabel} className="bg-sky-100 text-sky-700" />
                <input name="lineUrl" defaultValue={candidate.otherConditions ?? ""} className={compactInputClassName} />
              </label>
              <label className="space-y-1">
                <HeaderLabel label="ランク" className="bg-sky-100 text-sky-700" />
                <SearchableSelect name="customerRank" defaultValue={candidate.customerRank} options={["S", "A", "B", "C"]} className={compactInputClassName} />
              </label>
              <label className="space-y-1">
                <HeaderLabel label="ステータス" className="bg-sky-100 text-sky-700" />
                <div className="flex h-9 items-center rounded-2xl border border-zinc-200 bg-zinc-50 px-3 text-[11px] font-semibold text-zinc-700">
                  {CANDIDATE_STATUS_LABELS[candidate.overallStatus]}
                </div>
              </label>
              <label className="space-y-1 md:col-span-2">
                <HeaderLabel label="選考中企業" className="bg-rose-100 text-rose-700" />
                <div className="flex h-9 items-center rounded-2xl border border-zinc-200 bg-zinc-50 px-3 text-[11px] text-zinc-700">
                  {activeCompanies.join(" / ") || "-"}
                </div>
              </label>
              <label className="space-y-1">
                <HeaderLabel label="流入日" className="bg-violet-100 text-violet-700" />
                <input type="date" name="inflowDate" defaultValue={formatDateInput(candidate.inflowDate)} className={compactInputClassName} />
              </label>
              <label className="space-y-1">
                <HeaderLabel label="初回対応日" className="bg-fuchsia-100 text-fuchsia-700" />
                <input type="date" name="firstResponseDate" defaultValue={formatDateInput(candidate.firstResponseDate)} className={compactInputClassName} />
              </label>
              <label className="space-y-1">
                <HeaderLabel label="面談日" className="bg-pink-100 text-pink-700" />
                <input type="date" name="interviewDate" defaultValue={formatDateInput(candidate.interviewDate)} className={compactInputClassName} />
              </label>
              <label className="space-y-1">
                <HeaderLabel label="書類作成日" className="bg-orange-100 text-orange-700" />
                <input type="date" name="documentCreatedDate" defaultValue={formatDateInput(candidate.documentCreatedDate)} className={compactInputClassName} />
              </label>
              <label className="space-y-1">
                <HeaderLabel label="提案日" className="bg-amber-100 text-amber-700" />
                <input type="date" name="proposalDate" defaultValue={formatDateInput(candidate.proposalDate)} className={compactInputClassName} />
              </label>
              <label className="space-y-1">
                <HeaderLabel label="エントリー日" className="bg-lime-100 text-lime-700" />
                <input type="date" name="entryDate" defaultValue={formatDateInput(headerEntryDate)} className={compactInputClassName} />
              </label>
              <label className="space-y-1">
                <HeaderLabel label="企業面談日" className="bg-emerald-100 text-emerald-700" />
                <input type="date" name="companyInterviewDate" defaultValue={formatDateInput(headerCompanyInterviewDate)} className={compactInputClassName} />
              </label>
              <label className="space-y-1">
                <HeaderLabel label="内定日" className="bg-cyan-100 text-cyan-700" />
                <input type="date" name="offerDate" defaultValue={formatDateInput(candidate.offerDate)} className={compactInputClassName} />
              </label>
              <label className="space-y-1">
                <HeaderLabel label="承諾日" className="bg-blue-100 text-blue-700" />
                <input type="date" name="offerAcceptedDate" defaultValue={formatDateInput(candidate.offerAcceptedDate)} className={compactInputClassName} />
              </label>
              <label className="space-y-1">
                <HeaderLabel label="入社日" className="bg-indigo-100 text-indigo-700" />
                <input type="date" name="joiningDate" defaultValue={formatDateInput(candidate.joiningDate)} className={compactInputClassName} />
              </label>
              <label className="space-y-1">
                <HeaderLabel label="終了日" className="bg-slate-200 text-slate-700" />
                <input type="date" name="closedDate" defaultValue={formatDateInput(candidate.closedDate)} className={compactInputClassName} />
              </label>
              <label className="space-y-1">
                <HeaderLabel label="初回担当者" className="bg-teal-100 text-teal-700" />
                <SearchableSelect
                  name="initialOwnerName"
                  defaultValue={candidate.initialOwnerName ?? candidate.ownerName ?? ""}
                  options={CANDIDATE_OWNER_OPTIONS.map((option) => option)}
                  className={compactInputClassName}
                />
              </label>
              <label className="space-y-1">
                <HeaderLabel label="担当者" className="bg-purple-100 text-purple-700" />
                <SearchableSelect
                  name="ownerName"
                  defaultValue={candidate.ownerName ?? ""}
                  options={CANDIDATE_OWNER_OPTIONS.map((option) => option)}
                  className={compactInputClassName}
                />
              </label>
              <label className="flex items-center gap-2 rounded-2xl bg-zinc-50 px-3 text-[11px]">
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
              <span>氏名</span>
              <input name="name" defaultValue={candidate.name} className={inputClassName} />
            </label>
            <label className="space-y-1 text-sm">
              <span>氏名（かな）</span>
              <input name="nameKana" defaultValue={candidate.nameKana ?? ""} className={inputClassName} />
            </label>
            <label className="space-y-1 text-sm">
              <span>メールアドレス</span>
              <input name="email" defaultValue={candidate.email ?? ""} className={inputClassName} />
            </label>
            <label className="space-y-1 text-sm">
              <span>電話番号</span>
              <input name="phone" defaultValue={candidate.phone ?? ""} className={inputClassName} />
            </label>
            <label className="space-y-1 text-sm">
              <span>性別</span>
              <SearchableSelect
                name="gender"
                defaultValue={candidate.gender ?? ""}
                options={CANDIDATE_GENDER_OPTIONS.filter((option) => option.value === "男性" || option.value === "女性").map((option) => option.value)}
                className={inputClassName}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>生年月日</span>
              <input type="date" name="birthDate" defaultValue={formatDateInput(candidate.birthDate)} className={inputClassName} />
            </label>
            <label className="space-y-1 text-sm md:col-span-2">
              <span>居住地</span>
              <SearchableSelect name="address" defaultValue={candidate.address ?? ""} options={PREFECTURE_OPTIONS.map((option) => option)} className={inputClassName} />
            </label>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-white/70 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-zinc-900">経歴</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <label className="space-y-1 text-sm">
              <span>最終学歴</span>
              <SearchableSelect name="finalEducation" defaultValue={candidate.finalEducation ?? ""} options={FINAL_EDUCATION_OPTIONS.map((option) => option)} className={inputClassName} />
            </label>
            <label className="space-y-1 text-sm">
              <span>経験社数</span>
              <SearchableSelect
                name="experienceCompanyCount"
                defaultValue={candidate.experienceCompanyCount != null ? String(candidate.experienceCompanyCount) : ""}
                options={CANDIDATE_EXPERIENCE_COMPANY_COUNT_OPTIONS}
                className={inputClassName}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>マネジメント経験</span>
              <SearchableSelect
                name="managementExperience"
                defaultValue={candidate.managementExperience ?? ""}
                options={MANAGEMENT_EXPERIENCE_OPTIONS.map((option) => option)}
                className={inputClassName}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>現在の職種</span>
              <SearchableSelect
                name="currentJobType"
                defaultValue={candidate.currentJobType ?? ""}
                options={DETAILED_CANDIDATE_JOB_OPTIONS}
                className={inputClassName}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>雇用形態</span>
              <SearchableSelect
                name="employmentStatus"
                defaultValue={candidate.employmentStatus ?? ""}
                options={EMPLOYMENT_TYPE_OPTIONS}
                className={inputClassName}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>現在の年収</span>
              <input type="number" min="0" name="currentAnnualIncome" defaultValue={candidate.currentAnnualIncome ?? ""} className={inputClassName} />
            </label>
            <div className="space-y-1 text-sm md:col-span-3">
              <span className="block">資格</span>
              <CandidateQualificationFields
                initialQualifications={qualificationValues}
                options={DETAILED_QUALIFICATION_OPTIONS}
                className={inputClassName}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-white/70 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-zinc-900">活動情報</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <label className="space-y-1 text-sm">
              <span>条件</span>
              <SearchableSelect name="jobSearchStatus" defaultValue={candidate.jobSearchStatus ?? ""} options={CANDIDATE_CONDITION_OPTIONS} className={inputClassName} />
            </label>
            <label className="space-y-1 text-sm">
              <span>離職日</span>
              <input type="date" name="resignationDate" defaultValue={formatDateInput(candidate.resignationDate)} className={inputClassName} />
            </label>
            <label className="space-y-1 text-sm">
              <span>離職予定日</span>
              <input type="date" name="resignationPlannedDate" defaultValue={formatDateInput(candidate.resignationPlannedDate)} className={inputClassName} />
            </label>
            <label className="space-y-1 text-sm">
              <span>希望時期</span>
              <SearchableSelect
                name="desiredTiming"
                defaultValue={candidate.desiredTiming ?? ""}
                options={DESIRED_TIMING_OPTIONS}
                className={inputClassName}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>転職軸 第一候補</span>
              <SearchableSelect
                name="careerAxisPrimary"
                defaultValue={candidate.careerAxisPrimary ?? ""}
                options={CAREER_AXIS_OPTIONS}
                className={inputClassName}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span>転職軸 第二候補</span>
              <SearchableSelect
                name="careerAxisSecondary"
                defaultValue={candidate.careerAxisSecondary ?? ""}
                options={CAREER_AXIS_OPTIONS}
                className={inputClassName}
              />
            </label>

            {isUnemploymentInsurance ? (
              <>
                <label className="space-y-1 text-sm">
                  <span>失業保険契約</span>
                  <SearchableSelect
                    name="unemploymentInsuranceContract"
                    defaultValue={candidate.unemploymentInsuranceContract ?? ""}
                    options={UNEMPLOYMENT_INSURANCE_CONTRACT_OPTIONS.map((option) => option.value)}
                    className={inputClassName}
                  />
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
                  <input type="datetime-local" name="callPreferredAt" defaultValue={formatDateTimeInput(candidate.callPreferredAt)} className={inputClassName} />
                </label>
              </>
            ) : (
              <>
                <label className="space-y-1 text-sm">
                  <span>希望職種 第一候補</span>
                  <SearchableSelect
                    name="desiredJobType"
                    defaultValue={candidate.desiredJobType ?? ""}
                    options={DETAILED_CANDIDATE_JOB_OPTIONS}
                    className={inputClassName}
                  />
                </label>
                <label className="space-y-1 text-sm">
                  <span>希望職種 第二候補</span>
                  <SearchableSelect
                    name="desiredJobTypeSecond"
                    defaultValue={candidate.desiredJobTypeSecond ?? ""}
                    options={DETAILED_CANDIDATE_JOB_OPTIONS}
                    className={inputClassName}
                  />
                </label>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-white/70 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-zinc-900">希望条件</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1 text-sm md:col-span-3">
              <span className="block">希望勤務地</span>
              <CandidateLocationFields
                prefecture={candidate.desiredPrefecture}
                city={candidate.desiredCity}
                detail={candidate.desiredLocationDetail}
                selectClassName={inputClassName}
                inputClassName={inputClassName}
              />
            </div>
            <label className="space-y-1 text-sm">
              <span>希望年収</span>
              <input type="number" min="0" name="desiredAnnualIncome" defaultValue={candidate.desiredAnnualIncome ?? ""} className={inputClassName} />
            </label>
            <label className="space-y-1 text-sm">
              <span>雇用形態希望</span>
              <SearchableSelect
                name="employmentTypePreference"
                defaultValue={candidate.employmentTypePreference ?? ""}
                options={EMPLOYMENT_TYPE_OPTIONS}
                className={inputClassName}
              />
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
