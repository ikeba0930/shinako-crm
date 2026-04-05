import { Mail, Phone } from "lucide-react"
import { notFound } from "next/navigation"
import { CandidateLocationFields } from "@/components/candidate-location-fields"
import { CandidateLineCopyButton } from "@/components/candidate-line-copy-button"
import { CandidateQualificationFields } from "@/components/candidate-qualification-fields"
import { PostalCodeAddressFields } from "@/components/postal-code-address-fields"
import { SaveSuccessNotice } from "@/components/save-success-notice"
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

const compactInputClassName =
  "h-9 w-full rounded-[1rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(252,248,255,0.92))] px-2.5 text-[10px] text-[#2f1b3b] shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_10px_22px_-20px_rgba(76,29,149,0.52)] outline-none transition focus:border-fuchsia-300 focus:ring-2 focus:ring-fuchsia-200/60"
const inputClassName =
  "h-10 w-full rounded-[1.25rem] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(252,248,255,0.95))] px-3 text-sm text-[#2f1b3b] shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_14px_28px_-24px_rgba(76,29,149,0.58)] outline-none transition focus:border-fuchsia-300 focus:ring-2 focus:ring-fuchsia-200/60"

function getLatestSelectionDate(values: Array<Date | null>) {
  return values
    .filter((value): value is Date => value instanceof Date)
    .sort((a, b) => b.getTime() - a.getTime())[0] ?? null
}

function HeaderLabel({ label, className }: { label: string; className: string }) {
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-black leading-none tracking-tight ${className}`}>{label}</span>
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

  const ageLabel = candidate.age != null ? `満${candidate.age}歳` : null

  const topMetaItems = [
    { label: "流入経路", value: inflowLabel, className: "bg-violet-100 text-violet-700" },
    { label: "ランク", value: candidate.customerRank, className: CUSTOMER_RANK_BADGE[candidate.customerRank] },
    { label: "ステータス", value: CANDIDATE_STATUS_LABELS[candidate.overallStatus], className: "bg-zinc-100 text-zinc-700" },
    { label: "選考企業社数", value: `${activeCompanyCount}社`, className: "bg-rose-100 text-rose-700" },
  ]

  const headerStatusItems = [
    { label: "流入", value: candidate.inflowDate, className: "bg-stone-200 text-stone-700" },
    { label: "初回", value: candidate.firstResponseDate, className: "bg-sky-100 text-sky-700" },
    { label: "面談", value: candidate.interviewDate, className: "bg-green-100 text-green-700" },
    { label: "書類", value: candidate.documentCreatedDate, className: "bg-violet-100 text-violet-700" },
    { label: "提案", value: candidate.proposalDate, className: "bg-rose-100 text-rose-700" },
    { label: "ｴﾝﾄﾘｰ", value: headerEntryDate, className: "bg-amber-100 text-amber-700" },
    { label: "企面", value: headerCompanyInterviewDate, className: "bg-blue-100 text-blue-700" },
    { label: "内定", value: candidate.offerDate, className: "bg-fuchsia-100 text-fuchsia-700" },
    { label: "承諾", value: candidate.offerAcceptedDate, className: "bg-teal-100 text-teal-700" },
    { label: "入社", value: candidate.joiningDate, className: "bg-cyan-100 text-cyan-700" },
    { label: "終", value: candidate.closedDate, className: "bg-slate-200 text-slate-700" },
  ]
  const ownerOptionsWithBlank = [{ label: "空欄", value: "" }, ...CANDIDATE_OWNER_OPTIONS.map((option) => ({ label: option, value: option }))]

  return (
    <div className="space-y-3 p-3 lg:p-4">
      {isSaved ? <SaveSuccessNotice message="保存しました" /> : null}

      <Tabs defaultValue="support" className="space-y-2">
        <TabsList className="rounded-full border border-white/55 bg-white/85 p-0.5 shadow-[0_18px_38px_-28px_rgba(76,29,149,0.86)]">
          <TabsTrigger value="support" className="rounded-full px-3 py-1 text-xs font-semibold">
            対応履歴など
          </TabsTrigger>
          <TabsTrigger value="selections" className="rounded-full px-3 py-1 text-xs font-semibold">
            選考企業
          </TabsTrigger>
        </TabsList>

        <TabsContent value="support" className="space-y-3">
          <form action={saveCandidateAction} className="space-y-3">
            <input type="hidden" name="id" value={candidate.id} />

            <section className="fantasy-page-shell overflow-hidden rounded-[1.7rem] border border-fuchsia-100/70 bg-white/76 shadow-[0_24px_54px_-38px_rgba(76,29,149,0.88)]">
              <div className="flex items-center justify-between gap-2 bg-[linear-gradient(90deg,rgba(244,114,182,0.14),rgba(168,85,247,0.12),rgba(56,189,248,0.12),rgba(250,204,21,0.14))] px-3 py-2">
                <div className="text-sm font-black tracking-tight text-zinc-800">求職者基本情報</div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    className="rounded-full border border-violet-200 bg-white px-3 py-1 text-[10px] font-semibold text-violet-700 transition hover:bg-violet-50"
                  >
                    ファイル格納
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-rose-200 bg-white px-3 py-1 text-[10px] font-semibold text-rose-700 transition hover:bg-rose-50"
                  >
                    対応NA
                  </button>
                  <details className="group rounded-2xl border border-rose-200 bg-white/90 p-1">
                    <summary className="cursor-pointer list-none rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-semibold text-white transition hover:bg-rose-600">
                      ステータス変更
                    </summary>
                    <div className="mt-2 grid gap-1.5 md:grid-cols-2 xl:grid-cols-4">
                      <label className="space-y-1 rounded-2xl border border-violet-200 bg-violet-50/70 p-2">
                        <HeaderLabel label="流入経路" className="bg-violet-100 text-violet-700" />
                        <SearchableSelect
                          name="inflowSource"
                          defaultValue={candidate.inflowSource ?? ""}
                          options={INFLOW_ROUTE_OPTIONS.map((option) => option.value)}
                          className={compactInputClassName}
                        />
                      </label>
                      <label className="space-y-1 rounded-2xl border border-teal-200 bg-teal-50/70 p-2">
                        <HeaderLabel label="初回担当者" className="bg-teal-100 text-teal-700" />
                        <SearchableSelect
                          name="initialOwnerName"
                          defaultValue={candidate.initialOwnerName ?? candidate.ownerName ?? ""}
                          options={ownerOptionsWithBlank}
                          className={compactInputClassName}
                        />
                      </label>
                      <label className="space-y-1 rounded-2xl border border-purple-200 bg-purple-50/70 p-2">
                        <HeaderLabel label="担当者" className="bg-purple-100 text-purple-700" />
                        <SearchableSelect
                          name="ownerName"
                          defaultValue={candidate.ownerName ?? ""}
                          options={ownerOptionsWithBlank}
                          className={compactInputClassName}
                        />
                      </label>
                      <label className="space-y-1">
                        <HeaderLabel label="流入日" className="bg-stone-200 text-stone-700" />
                        <input type="date" name="inflowDate" defaultValue={formatDateInput(candidate.inflowDate)} className={compactInputClassName} />
                      </label>
                      <label className="space-y-1">
                        <HeaderLabel label="初回対応日" className="bg-sky-100 text-sky-700" />
                        <input type="date" name="firstResponseDate" defaultValue={formatDateInput(candidate.firstResponseDate)} className={compactInputClassName} />
                      </label>
                      <label className="space-y-1">
                        <HeaderLabel label="面談日" className="bg-green-100 text-green-700" />
                        <input type="date" name="interviewDate" defaultValue={formatDateInput(candidate.interviewDate)} className={compactInputClassName} />
                      </label>
                      <label className="space-y-1">
                        <HeaderLabel label="書類作成日" className="bg-violet-100 text-violet-700" />
                        <input type="date" name="documentCreatedDate" defaultValue={formatDateInput(candidate.documentCreatedDate)} className={compactInputClassName} />
                      </label>
                      <label className="space-y-1">
                        <HeaderLabel label="提案日" className="bg-rose-100 text-rose-700" />
                        <input type="date" name="proposalDate" defaultValue={formatDateInput(candidate.proposalDate)} className={compactInputClassName} />
                      </label>
                      <label className="space-y-1">
                        <HeaderLabel label="エントリー日" className="bg-amber-100 text-amber-700" />
                        <input type="date" name="entryDate" defaultValue={formatDateInput(headerEntryDate)} className={compactInputClassName} />
                      </label>
                      <label className="space-y-1">
                        <HeaderLabel label="企業面談日" className="bg-blue-100 text-blue-700" />
                        <input type="date" name="companyInterviewDate" defaultValue={formatDateInput(headerCompanyInterviewDate)} className={compactInputClassName} />
                      </label>
                      <label className="space-y-1">
                        <HeaderLabel label="内定日" className="bg-fuchsia-100 text-fuchsia-700" />
                        <input type="date" name="offerDate" defaultValue={formatDateInput(candidate.offerDate)} className={compactInputClassName} />
                      </label>
                      <label className="space-y-1">
                        <HeaderLabel label="承諾日" className="bg-teal-100 text-teal-700" />
                        <input type="date" name="offerAcceptedDate" defaultValue={formatDateInput(candidate.offerAcceptedDate)} className={compactInputClassName} />
                      </label>
                      <label className="space-y-1">
                        <HeaderLabel label="入社日" className="bg-cyan-100 text-cyan-700" />
                        <input type="date" name="joiningDate" defaultValue={formatDateInput(candidate.joiningDate)} className={compactInputClassName} />
                      </label>
                      <label className="space-y-1">
                        <HeaderLabel label="終了日" className="bg-slate-200 text-slate-700" />
                        <input type="date" name="closedDate" defaultValue={formatDateInput(candidate.closedDate)} className={compactInputClassName} />
                      </label>
                      <label className="space-y-1">
                        <HeaderLabel label="ランク" className="bg-sky-100 text-sky-700" />
                        <SearchableSelect name="customerRank" defaultValue={candidate.customerRank} options={["S", "A", "B", "C"]} className={compactInputClassName} />
                      </label>
                      <label className="flex items-center gap-2 rounded-xl bg-white px-2.5 text-[10px]">
                        <input type="checkbox" name="rankManualOverride" defaultChecked={candidate.rankManualOverride} />
                        ランク手動固定
                      </label>
                    </div>
                  </details>

                  <button type="submit" className="rounded-full bg-zinc-900 px-3 py-1 text-[10px] font-semibold text-white">
                    保存
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 px-2 py-2">
                <div className="grid gap-x-4 gap-y-1 pl-6 text-[10px] md:grid-cols-[84px_84px_170px_170px_minmax(0,1fr)]">
                  <div className="leading-tight">
                    <div className="font-bold text-zinc-500">初回担当者</div>
                    <div className="mt-0.5 font-semibold text-zinc-800">{candidate.initialOwnerName ?? candidate.ownerName ?? "-"}</div>
                  </div>
                  <div className="leading-tight">
                    <div className="font-bold text-zinc-500">担当者</div>
                    <div className="mt-0.5 font-semibold text-zinc-800">{candidate.ownerName ?? "-"}</div>
                  </div>
                  <div className="leading-tight">
                    <div className="font-bold text-zinc-500">電話番号</div>
                    {candidate.phone ? (
                      <a href={`tel:${candidate.phone}`} className="mt-0.5 inline-flex items-center gap-1 font-semibold text-sky-700 underline-offset-2 hover:underline">
                        <Phone className="h-3 w-3" />
                        {candidate.phone}
                      </a>
                    ) : (
                      <div className="mt-0.5 font-semibold text-zinc-800">-</div>
                    )}
                  </div>
                  <div className="leading-tight">
                    <div className="font-bold text-zinc-500">メールアドレス</div>
                    {candidate.email ? (
                      <a href={`mailto:${candidate.email}`} className="mt-0.5 inline-flex items-center gap-1 font-semibold text-sky-700 underline-offset-2 hover:underline">
                        <Mail className="h-3 w-3" />
                        {candidate.email}
                      </a>
                    ) : (
                      <div className="mt-0.5 font-semibold text-zinc-800">-</div>
                    )}
                  </div>
                  <div className="leading-tight">
                    <div className="font-bold text-zinc-500">現住所</div>
                    {candidate.postalCode || candidate.address ? (
                      <div className="mt-0.5 space-y-0.5 font-semibold text-zinc-800">
                        <div>{candidate.postalCode ? `〒${candidate.postalCode}` : "-"}</div>
                        <div>{candidate.address ?? "-"}</div>
                      </div>
                    ) : (
                      <div className="mt-0.5 font-semibold text-zinc-800">-</div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1 xl:flex-row xl:items-end xl:justify-between">
                  <div className="min-w-0">
                    <div className="mb-0.5 pl-6 text-[9px] font-semibold leading-none tracking-wide text-zinc-500">{candidate.nameKana || "-"}</div>
                    <div className="flex items-center gap-1">
                      <CandidateLineCopyButton gender={candidate.gender} url={candidate.otherConditions} />
                      <h1 className={`truncate text-[18px] font-black leading-none tracking-tight ${nameColorClassName}`}>{candidate.name}</h1>
                      {ageLabel ? <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-600">{ageLabel}</span> : null}
                    </div>
                  </div>

                  <div className="grid flex-1 gap-1 sm:grid-cols-2 xl:ml-2 xl:grid-cols-4">
                    {topMetaItems.map((item) => (
                      <div key={item.label} className={`flex min-w-0 items-center justify-center rounded-full px-2 py-0.5 text-[9px] font-bold ${item.className}`}>
                        <span className="truncate">
                          {item.label} {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-1 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-11">
                  {headerStatusItems.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-zinc-100 bg-white px-1 py-1 text-center">
                      <div className="flex justify-center">
                        <HeaderLabel label={item.label} className={item.className} />
                      </div>
                      <div className="mt-0.5 text-[9px] font-semibold leading-none text-zinc-700">{formatDate(item.value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <Card className="fantasy-form-card rounded-3xl border-white/70 bg-white/90 shadow-sm" data-tone="sky">
              <CardHeader className="border-b border-white/55 bg-[linear-gradient(90deg,rgba(244,114,182,0.14),rgba(168,85,247,0.12),rgba(56,189,248,0.12),rgba(250,204,21,0.14))] py-3">
                <CardTitle className="text-zinc-900">基本情報</CardTitle>
              </CardHeader>
              <CardContent className="fantasy-form-grid grid gap-4 md:grid-cols-3">
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
                <div className="text-sm md:col-span-3">
                  <PostalCodeAddressFields
                    postalCode={candidate.postalCode}
                    address={candidate.address}
                    postalCodeClassName={inputClassName}
                    addressClassName={inputClassName}
                  />
                </div>
                <label className="space-y-1 text-sm md:col-span-3">
                  <span>{lineUrlLabel}</span>
                  <input name="lineUrl" defaultValue={candidate.otherConditions ?? ""} className={inputClassName} />
                </label>
              </CardContent>
            </Card>

            <Card className="fantasy-form-card rounded-3xl border-white/70 bg-white/90 shadow-sm" data-tone="violet">
              <CardHeader className="border-b border-white/55 bg-[linear-gradient(90deg,rgba(168,85,247,0.14),rgba(236,72,153,0.12),rgba(96,165,250,0.12),rgba(244,114,182,0.14))] py-3">
                <CardTitle className="text-zinc-900">経歴</CardTitle>
              </CardHeader>
              <CardContent className="fantasy-form-grid grid gap-4 md:grid-cols-3">
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

            <Card className="fantasy-form-card rounded-3xl border-white/70 bg-white/90 shadow-sm" data-tone="emerald">
              <CardHeader className="border-b border-white/55 bg-[linear-gradient(90deg,rgba(52,211,153,0.16),rgba(45,212,191,0.12),rgba(96,165,250,0.12),rgba(250,204,21,0.14))] py-3">
                <CardTitle className="text-zinc-900">活動情報</CardTitle>
              </CardHeader>
              <CardContent className="fantasy-form-grid grid gap-4 md:grid-cols-3">
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
                  <SearchableSelect name="desiredTiming" defaultValue={candidate.desiredTiming ?? ""} options={DESIRED_TIMING_OPTIONS} className={inputClassName} />
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

            <Card className="fantasy-form-card rounded-3xl border-white/70 bg-white/90 shadow-sm" data-tone="amber">
              <CardHeader className="border-b border-white/55 bg-[linear-gradient(90deg,rgba(250,204,21,0.18),rgba(251,146,60,0.12),rgba(236,72,153,0.1),rgba(168,85,247,0.12))] py-3">
                <CardTitle className="text-zinc-900">希望条件</CardTitle>
              </CardHeader>
              <CardContent className="fantasy-form-grid grid gap-4 md:grid-cols-3">
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
          </form>
        </TabsContent>

        <TabsContent value="selections">
          <Card className="rounded-3xl border-white/70 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-zinc-900">選考企業を紐づけ</CardTitle>
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
