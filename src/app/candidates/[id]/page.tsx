import { Phone } from "lucide-react"
import { notFound } from "next/navigation"
import { CandidateLocationFields } from "@/components/candidate-location-fields"
import { CandidateLineCopyButton } from "@/components/candidate-line-copy-button"
import { CandidateQualificationFields } from "@/components/candidate-qualification-fields"
import { SearchableSelect } from "@/components/searchable-select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  EXTRA_QUALIFICATION_OPTIONS,
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

const compactInputClassName = "h-8 w-full rounded-xl border border-zinc-200 bg-white px-2.5 text-[10px]"
const inputClassName = "h-10 w-full rounded-2xl border border-zinc-200 px-3"
const formId = "candidate-detail-form"

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
  const [candidate, qualificationMasters] = await Promise.all([
    prisma.candidate.findUnique({
      where: { id },
      include: {
        qualifications: { orderBy: { sortOrder: "asc" } },
        selections: { orderBy: { updatedAt: "desc" } },
      },
    }),
    prisma.qualificationMaster.findMany({
      where: { isActive: true },
      orderBy: [{ rankCategory: "asc" }, { sortOrder: "asc" }],
    }),
  ])

  if (!candidate) notFound()

  const isUnemploymentInsurance = candidate.inflowSource === "失業保険"
  const lineUrlLabel = isUnemploymentInsurance ? "LINE URL（ひとなりのURL）" : "LINE URL"
  const qualificationOptions = Array.from(
    new Set([...qualificationMasters.map((item) => item.name), ...DETAILED_QUALIFICATION_OPTIONS, ...EXTRA_QUALIFICATION_OPTIONS])
  )
  const qualificationOptionSet = new Set(qualificationOptions)
  const qualificationValues = candidate.qualifications.map((item) => item.qualificationName)
  const presetQualifications = qualificationValues.filter((item) => qualificationOptionSet.has(item))
  const freeTextQualifications = qualificationValues.filter((item) => !qualificationOptionSet.has(item)).join("、")
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
  const topMetaItems = [
    { label: "流入経路", value: inflowLabel, className: "bg-violet-100 text-violet-700" },
    { label: "ランク", value: candidate.customerRank, className: CUSTOMER_RANK_BADGE[candidate.customerRank] },
    { label: "ステータス", value: CANDIDATE_STATUS_LABELS[candidate.overallStatus], className: "bg-zinc-100 text-zinc-700" },
    { label: "選考企業社数", value: `${activeCompanyCount}社`, className: "bg-rose-100 text-rose-700" },
  ]
  const headerStatusItems = [
    { label: "流入日", value: candidate.inflowDate, className: "bg-violet-100 text-violet-700" },
    { label: "初回対応日", value: candidate.firstResponseDate, className: "bg-sky-100 text-sky-700" },
    { label: "面談日", value: candidate.interviewDate, className: "bg-pink-100 text-pink-700" },
    { label: "書類作成日", value: candidate.documentCreatedDate, className: "bg-orange-100 text-orange-700" },
    { label: "提案日", value: candidate.proposalDate, className: "bg-amber-100 text-amber-700" },
    { label: "エントリー日", value: headerEntryDate, className: "bg-lime-100 text-lime-700" },
    { label: "企業面談日", value: headerCompanyInterviewDate, className: "bg-emerald-100 text-emerald-700" },
    { label: "内定日", value: candidate.offerDate, className: "bg-cyan-100 text-cyan-700" },
    { label: "承諾日", value: candidate.offerAcceptedDate, className: "bg-blue-100 text-blue-700" },
    { label: "入社日", value: candidate.joiningDate, className: "bg-indigo-100 text-indigo-700" },
  ]

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {isSaved ? (
        <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          保存しました
        </div>
      ) : null}

      <Tabs defaultValue="support" className="space-y-4">
        <TabsList className="rounded-full bg-white/85 p-0.5 shadow-sm">
          <TabsTrigger value="support" className="rounded-full px-3 py-1 text-xs font-semibold">
            対応履歴など
          </TabsTrigger>
          <TabsTrigger value="selections" className="rounded-full px-3 py-1 text-xs font-semibold">
            選考企業
          </TabsTrigger>
        </TabsList>

        <TabsContent value="support" className="space-y-6">
          <form id={formId} action={saveCandidateAction} className="space-y-6">
            <input type="hidden" name="id" value={candidate.id} />

            <div className="rounded-[20px] border border-sky-100 bg-white/95 p-3 shadow-sm">
              <div className="space-y-3">
                <div className="flex flex-col gap-2 xl:flex-row xl:items-start xl:justify-between">
                  <div className="grid flex-1 gap-2 md:grid-cols-3">
                    <label className="space-y-1">
                      <HeaderLabel label="初回担当者" className="bg-teal-100 text-teal-700" />
                      <SearchableSelect
                        name="initialOwnerName"
                        defaultValue={candidate.initialOwnerName ?? candidate.ownerName ?? ""}
                        options={CANDIDATE_OWNER_OPTIONS}
                        className={compactInputClassName}
                      />
                    </label>
                    <label className="space-y-1">
                      <HeaderLabel label="担当者" className="bg-purple-100 text-purple-700" />
                      <SearchableSelect
                        name="ownerName"
                        defaultValue={candidate.ownerName ?? ""}
                        options={CANDIDATE_OWNER_OPTIONS}
                        className={compactInputClassName}
                      />
                    </label>
                    <label className="space-y-1">
                      <HeaderLabel label="電話番号" className="bg-sky-100 text-sky-700" />
                      <div className="flex items-center gap-1.5">
                        <input name="phone" defaultValue={candidate.phone ?? ""} className={compactInputClassName} />
                        {candidate.phone ? (
                          <a
                            href={`tel:${candidate.phone}`}
                            className="inline-flex h-8 shrink-0 items-center justify-center rounded-full border border-sky-200 bg-sky-50 px-2.5 text-sky-700 transition hover:bg-sky-100"
                            title="架電する"
                          >
                            <Phone className="h-3.5 w-3.5" />
                          </a>
                        ) : null}
                      </div>
                    </label>
                  </div>

                  <div className="flex items-start gap-1.5 self-start">
                    <details className="group min-w-[300px] rounded-2xl border border-zinc-200 bg-zinc-50/80 p-1.5">
                      <summary className="cursor-pointer list-none rounded-full bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-600">
                        ステータス変更
                      </summary>
                      <div className="mt-2 grid gap-1.5 md:grid-cols-2 xl:grid-cols-3">
                        <label className="space-y-1">
                          <HeaderLabel label="流入日" className="bg-violet-100 text-violet-700" />
                          <input type="date" name="inflowDate" defaultValue={formatDateInput(candidate.inflowDate)} className={compactInputClassName} />
                        </label>
                        <label className="space-y-1">
                          <HeaderLabel label="初回対応日" className="bg-sky-100 text-sky-700" />
                          <input type="date" name="firstResponseDate" defaultValue={formatDateInput(candidate.firstResponseDate)} className={compactInputClassName} />
                        </label>
                        <label className="space-y-1">
                          <HeaderLabel label="面談日" className="bg-pink-100 text-pink-700" />
                          <input type="date" name="interviewDate" defaultValue={formatDateInput(candidate.interviewDate)} className={compactInputClassName} />
                        </label>
                        <label className="space-y-1">
                          <HeaderLabel label="書類作成日" className="bg-orange-100 text-orange-700" />
                          <input
                            type="date"
                            name="documentCreatedDate"
                            defaultValue={formatDateInput(candidate.documentCreatedDate)}
                            className={compactInputClassName}
                          />
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
                          <input
                            type="date"
                            name="companyInterviewDate"
                            defaultValue={formatDateInput(headerCompanyInterviewDate)}
                            className={compactInputClassName}
                          />
                        </label>
                        <label className="space-y-1">
                          <HeaderLabel label="内定日" className="bg-cyan-100 text-cyan-700" />
                          <input type="date" name="offerDate" defaultValue={formatDateInput(candidate.offerDate)} className={compactInputClassName} />
                        </label>
                        <label className="space-y-1">
                          <HeaderLabel label="承諾日" className="bg-blue-100 text-blue-700" />
                          <input
                            type="date"
                            name="offerAcceptedDate"
                            defaultValue={formatDateInput(candidate.offerAcceptedDate)}
                            className={compactInputClassName}
                          />
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
                          <HeaderLabel label="ランク" className="bg-sky-100 text-sky-700" />
                          <SearchableSelect
                            name="customerRank"
                            defaultValue={candidate.customerRank}
                            options={["S", "A", "B", "C"]}
                            className={compactInputClassName}
                          />
                        </label>
                        <label className="flex items-center gap-2 rounded-2xl bg-white px-3 text-[11px]">
                          <input type="checkbox" name="rankManualOverride" defaultChecked={candidate.rankManualOverride} />
                          ランクを手動で固定する
                        </label>
                      </div>
                    </details>

                    <button type="submit" className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white">
                      保存
                    </button>
                  </div>
                </div>

                <div className="space-y-2 rounded-[18px] bg-sky-50/70 p-3">
                  <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
                    <div className="flex min-w-0 items-center gap-2">
                      <CandidateLineCopyButton gender={candidate.gender} url={candidate.otherConditions} />
                      <h1 className={`truncate text-2xl font-black tracking-tight ${nameColorClassName}`}>{candidate.name}</h1>
                    </div>
                    <div className="grid flex-1 gap-1.5 md:grid-cols-2 xl:grid-cols-4">
                      {topMetaItems.map((item) => (
                        <div key={item.label} className={`flex min-w-0 items-center justify-center rounded-full px-2.5 py-1.5 text-[11px] font-bold ${item.className}`}>
                          <span className="truncate">
                            {item.label} {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-10">
                    {headerStatusItems.map((item) => (
                      <div key={item.label} className="rounded-xl bg-white px-2 py-1.5 text-center shadow-sm">
                        <div className="flex justify-center">
                          <HeaderLabel label={item.label} className={item.className} />
                        </div>
                        <div className="mt-1 text-[10px] font-semibold text-zinc-700">{formatDate(item.value)}</div>
                      </div>
                    ))}
                  </div>
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
                  <SearchableSelect name="address" defaultValue={candidate.address ?? ""} options={PREFECTURE_OPTIONS} className={inputClassName} />
                </label>
                <label className="space-y-1 text-sm md:col-span-3">
                  <span>{lineUrlLabel}</span>
                  <input name="lineUrl" defaultValue={candidate.otherConditions ?? ""} className={inputClassName} />
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
                  <SearchableSelect name="finalEducation" defaultValue={candidate.finalEducation ?? ""} options={FINAL_EDUCATION_OPTIONS} className={inputClassName} />
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
                    options={MANAGEMENT_EXPERIENCE_OPTIONS}
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
                    initialQualifications={presetQualifications}
                    initialFreeText={freeTextQualifications}
                    options={qualificationOptions}
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
                  <input
                    type="date"
                    name="resignationPlannedDate"
                    defaultValue={formatDateInput(candidate.resignationPlannedDate)}
                    className={inputClassName}
                  />
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
        </TabsContent>

        <TabsContent value="selections">
          <Card className="rounded-3xl border-white/70 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-zinc-900">選考企業を紐づけ</CardTitle>
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
                    提案日: {formatDate(selection.proposedAt)} / エントリー: {formatDate(selection.entryAt)} / オファー: {formatDate(selection.offerAt)}
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
