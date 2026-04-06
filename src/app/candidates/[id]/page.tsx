import { Mail, Phone } from "lucide-react"
import { notFound } from "next/navigation"
import { CandidateFileVault } from "@/components/candidate-file-vault"
import { CandidateNaModal } from "@/components/candidate-na-modal"
import { CandidateContactLogList } from "@/components/candidate-contact-log-list"
import { CandidateLocationFields } from "@/components/candidate-location-fields"
import { CandidateLineCopyButton } from "@/components/candidate-line-copy-button"
import { CandidateQualificationFields } from "@/components/candidate-qualification-fields"
import { DateInputWithShortcuts } from "@/components/date-input-with-shortcuts"
import { PostalCodeAddressFields } from "@/components/postal-code-address-fields"
import { SaveSuccessNotice } from "@/components/save-success-notice"
import { SearchableSelect } from "@/components/searchable-select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createSelectionAction, saveCandidateAction, saveSelectionAction } from "@/lib/actions"
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
  SELECTION_STATUS_GROUPS,
  SELECTION_STATUS_LABELS,
  UNEMPLOYMENT_INSURANCE_CONTRACT_OPTIONS,
  getSelectionStatusGroup,
} from "@/lib/constants"
import { prisma } from "@/lib/db"
import { formatDate, formatDateInput, formatDateTimeInput } from "@/lib/format"
import { DETAILED_QUALIFICATION_OPTIONS } from "@/lib/qualification-options"

export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ saved?: string; ownerRequired?: string; openStatus?: string }>
}

const compactInputClassName =
  "h-9 w-full rounded-[1rem] border border-fuchsia-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(249,243,255,0.97)_54%,rgba(239,246,255,0.95))] px-2.5 text-[10px] text-[#2f1b3b] shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_14px_26px_-20px_rgba(76,29,149,0.62)] outline-none transition duration-200 hover:-translate-y-[1px] hover:border-fuchsia-200 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_18px_34px_-20px_rgba(168,85,247,0.45)] focus:border-fuchsia-300 focus:bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(252,244,255,0.99))] focus:ring-2 focus:ring-fuchsia-200/70"
const inputClassName =
  "h-10 w-full rounded-[1.25rem] border border-fuchsia-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(250,243,255,0.98)_52%,rgba(239,247,255,0.96))] px-3 text-sm text-[#2f1b3b] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_16px_30px_-22px_rgba(76,29,149,0.64)] outline-none transition duration-200 hover:-translate-y-[1px] hover:border-fuchsia-200 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.94),0_20px_36px_-22px_rgba(168,85,247,0.48)] focus:border-fuchsia-300 focus:bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(255,246,255,1))] focus:ring-2 focus:ring-fuchsia-200/70"
const selectionReferralOptions = [
  { label: "自社", value: "自社" },
  { label: "circus", value: "circus" },
]

function getLatestSelectionDate(values: Array<Date | null>) {
  return values
    .filter((value): value is Date => value instanceof Date)
    .sort((a, b) => b.getTime() - a.getTime())[0] ?? null
}

function HeaderLabel({ label, className }: { label: string; className: string }) {
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-black leading-none tracking-tight ${className}`}>{label}</span>
}

function StatusDateField({
  label,
  colorClassName,
  name,
  defaultValue,
  inputClassName,
}: {
  label: string
  colorClassName: string
  name: string
  defaultValue: string
  inputClassName: string
}) {
  return (
    <label className="space-y-1">
      <HeaderLabel label={label} className={colorClassName} />
      <input type="date" name={name} defaultValue={defaultValue} className={inputClassName} />
      <span className="flex items-center gap-1.5 px-1 text-[10px] font-semibold text-zinc-500">
        <input type="checkbox" name={`setToday_${name}`} className="h-3.5 w-3.5 accent-fuchsia-500" />
        今日を入れる
      </span>
    </label>
  )
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
        attachments: { orderBy: { createdAt: "desc" } },
        contactLogs: { orderBy: { createdAt: "desc" } },
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
  const isOwnerRequired = query.ownerRequired === "1"
  const shouldOpenStatus = query.openStatus === "1"
  const nameColorClassName =
    candidate.gender === "男性" ? "text-sky-600" : candidate.gender === "女性" ? "text-rose-600" : "text-zinc-900"
  const inflowLabel =
    INFLOW_ROUTE_OPTIONS.find((option) => option.value === candidate.inflowSource)?.label ?? candidate.inflowSource ?? "未設定"

  const ageLabel = candidate.age != null ? `満${candidate.age}歳` : null

  const topMetaItems = [
    { key: "inflow", label: "流入経路", value: inflowLabel },
    { key: "status", label: "対応中ステータス", value: candidate.contactLogs[0]?.responseStatus ?? "未設定" },
    { key: "rank", label: "ランク", value: candidate.customerRank },
    { key: "companyCount", label: "選考企業社数", value: `${activeCompanyCount}社` },
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
      {isOwnerRequired ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm font-semibold text-rose-700 shadow-[0_14px_30px_-24px_rgba(244,63,94,0.6)]">
          面談以降のフラグを立てるには担当者の入力が必要です。ステータス変更から担当者を入れてください。
        </div>
      ) : null}

      <Tabs defaultValue="basic" className="space-y-2">
        <TabsList className="rounded-full border border-white/55 bg-white/85 p-0.5 shadow-[0_18px_38px_-28px_rgba(76,29,149,0.86)]">
          <TabsTrigger value="basic" className="rounded-full px-3 py-1 text-xs font-semibold">
            基本情報
          </TabsTrigger>
          <TabsTrigger value="contact" className="rounded-full px-3 py-1 text-xs font-semibold">
            対応履歴
          </TabsTrigger>
          <TabsTrigger value="selections" className="rounded-full px-3 py-1 text-xs font-semibold">
            選考企業
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-3">
          <form action={saveCandidateAction} className="space-y-3">
            <input type="hidden" name="id" value={candidate.id} />

            <section className="fantasy-page-shell overflow-hidden rounded-[1.7rem] border border-fuchsia-100/70 bg-white/76 shadow-[0_24px_54px_-38px_rgba(76,29,149,0.88)]">
              <div className="flex items-center bg-[linear-gradient(90deg,rgba(244,114,182,0.14),rgba(168,85,247,0.12),rgba(56,189,248,0.12),rgba(250,204,21,0.14))] px-3 py-2">
                <div className="text-sm font-black tracking-tight text-zinc-800">求職者基本情報</div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-1.5 border-b border-white/55 bg-[linear-gradient(90deg,rgba(255,245,251,0.58),rgba(248,244,255,0.56),rgba(241,248,255,0.54),rgba(255,250,239,0.56))] px-3 py-2 backdrop-blur-xl">
                  <CandidateFileVault candidateId={candidate.id} initialAttachments={candidate.attachments} />
                  <CandidateNaModal candidateId={candidate.id} ownerName={candidate.ownerName} />
                  <details open={shouldOpenStatus} className="group rounded-2xl border border-rose-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,244,248,0.86))] p-1 shadow-[0_14px_26px_-22px_rgba(244,63,94,0.64)]">
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
                      <StatusDateField label="流入日" colorClassName="bg-stone-200 text-stone-700" name="inflowDate" defaultValue={formatDateInput(candidate.inflowDate)} inputClassName={compactInputClassName} />
                      <StatusDateField label="初回対応日" colorClassName="bg-sky-100 text-sky-700" name="firstResponseDate" defaultValue={formatDateInput(candidate.firstResponseDate)} inputClassName={compactInputClassName} />
                      <StatusDateField label="面談日" colorClassName="bg-green-100 text-green-700" name="interviewDate" defaultValue={formatDateInput(candidate.interviewDate)} inputClassName={compactInputClassName} />
                      <StatusDateField label="書類作成日" colorClassName="bg-violet-100 text-violet-700" name="documentCreatedDate" defaultValue={formatDateInput(candidate.documentCreatedDate)} inputClassName={compactInputClassName} />
                      <StatusDateField label="提案日" colorClassName="bg-rose-100 text-rose-700" name="proposalDate" defaultValue={formatDateInput(candidate.proposalDate)} inputClassName={compactInputClassName} />
                      <StatusDateField label="エントリー日" colorClassName="bg-amber-100 text-amber-700" name="entryDate" defaultValue={formatDateInput(headerEntryDate)} inputClassName={compactInputClassName} />
                      <StatusDateField label="企業面談日" colorClassName="bg-blue-100 text-blue-700" name="companyInterviewDate" defaultValue={formatDateInput(headerCompanyInterviewDate)} inputClassName={compactInputClassName} />
                      <StatusDateField label="内定日" colorClassName="bg-fuchsia-100 text-fuchsia-700" name="offerDate" defaultValue={formatDateInput(candidate.offerDate)} inputClassName={compactInputClassName} />
                      <StatusDateField label="承諾日" colorClassName="bg-teal-100 text-teal-700" name="offerAcceptedDate" defaultValue={formatDateInput(candidate.offerAcceptedDate)} inputClassName={compactInputClassName} />
                      <StatusDateField label="入社日" colorClassName="bg-cyan-100 text-cyan-700" name="joiningDate" defaultValue={formatDateInput(candidate.joiningDate)} inputClassName={compactInputClassName} />
                      <StatusDateField label="終了日" colorClassName="bg-slate-200 text-slate-700" name="closedDate" defaultValue={formatDateInput(candidate.closedDate)} inputClassName={compactInputClassName} />
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

                  <button type="submit" className="rounded-full bg-[linear-gradient(135deg,#18181b_0%,#312e81_100%)] px-3 py-1 text-[10px] font-semibold text-white shadow-[0_14px_26px_-18px_rgba(49,46,129,0.72)]">
                    保存
                  </button>
              </div>

              <div className="space-y-1.5 px-2 py-2">
                <div className="grid gap-x-4 gap-y-1 pl-6 text-[10px] md:grid-cols-[84px_84px_170px_190px_220px_minmax(80px,1fr)_minmax(180px,2fr)_minmax(50px,auto)_minmax(70px,auto)]">
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
                  {topMetaItems.map((item) => (
                    <div key={item.key} className="min-w-0 self-start leading-tight">
                      <div className="text-[9px] font-bold text-zinc-500">{item.label}</div>
                      <div
                        className={`mt-0.5 truncate text-[10px] font-semibold ${
                          item.key === "inflow"
                            ? item.value === "ポータル（ブルー）" || item.value === "ポータル"
                              ? "text-sky-600"
                              : item.value === "失業保険"
                                ? "text-rose-600"
                                : "text-zinc-700"
                            : "text-zinc-700"
                        }`}
                      >
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="min-w-0">
                  <div className="mb-0.5 pl-6 text-[9px] font-semibold leading-none tracking-wide text-zinc-500">{candidate.nameKana || "-"}</div>
                  <div className="flex items-center gap-1">
                    <CandidateLineCopyButton gender={candidate.gender} url={candidate.otherConditions} />
                    <h1 className={`truncate text-[22px] font-black leading-none tracking-tight ${nameColorClassName}`}>{candidate.name}</h1>
                    {ageLabel ? <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-600">{ageLabel}</span> : null}
                  </div>
                </div>

                <div className="grid gap-1 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-11">
                  {headerStatusItems.map((item) => (
                    <div key={item.label} className="px-1 py-1.5 text-center">
                      <div className="flex justify-center">
                        <HeaderLabel label={item.label} className={`${item.className} text-[12px]`} />
                      </div>
                      <div className="mt-1 text-[11px] font-semibold leading-none tracking-tight text-zinc-700">{formatDate(item.value)}</div>
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
                ) : null}
              </CardContent>
            </Card>

            <Card className="fantasy-form-card rounded-3xl border-white/70 bg-white/90 shadow-sm" data-tone="amber">
              <CardHeader className="border-b border-white/55 bg-[linear-gradient(90deg,rgba(250,204,21,0.18),rgba(251,146,60,0.12),rgba(236,72,153,0.1),rgba(168,85,247,0.12))] py-3">
                <CardTitle className="text-zinc-900">希望条件</CardTitle>
              </CardHeader>
              <CardContent className="fantasy-form-grid grid gap-4 md:grid-cols-3">
                <label className="space-y-1 text-sm">
                  <span>希望転職時期</span>
                  <SearchableSelect name="desiredTiming" defaultValue={candidate.desiredTiming ?? ""} options={DESIRED_TIMING_OPTIONS} className={inputClassName} />
                </label>
                {!isUnemploymentInsurance ? (
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
                ) : null}
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

        <TabsContent value="contact" className="space-y-3">
          <CandidateContactLogList candidateId={candidate.id} ownerName={candidate.ownerName} initialLogs={candidate.contactLogs} />
        </TabsContent>

        <TabsContent value="selections">
          <Card className="border-zinc-200 bg-white shadow-none">
            <CardHeader className="border-b border-zinc-200 pb-3">
              <CardTitle className="text-zinc-900">選考企業を紐づけ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 py-4 md:px-6">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {SELECTION_STATUS_GROUPS.map((group) => (
                  <div key={group.label} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-xs">
                    <div className="text-[12px] font-semibold text-zinc-900">{group.label}</div>
                    <div className="mt-1 text-[11px] leading-snug text-zinc-500">
                      {group.statusCodes.map((code) => SELECTION_STATUS_LABELS[code]).join(" / ")}
                    </div>
                  </div>
                ))}
              </div>
              {candidate.selections.map((selection) => {
                const statusGroup = getSelectionStatusGroup(selection.selectionStatus)
                return (
                  <form
                  key={selection.id}
                  action={saveSelectionAction}
                  className="space-y-4 rounded-xl border border-zinc-300 bg-white p-4"
                >
                  <input type="hidden" name="id" value={selection.id} />
                  <input type="hidden" name="candidateId" value={candidate.id} />

                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-3 text-sm">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-zinc-700">
                      <div className="font-medium">
                        応募日 <span className="text-zinc-900">{formatDate(selection.applicationDate ?? selection.proposedAt)}</span>
                      </div>
                      <div className="font-medium text-zinc-500">
                        最終更新 <span className="text-zinc-700">{formatDate(selection.updatedAt)}</span>
                      </div>
                    </div>
                    <button type="submit" className="h-9 rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white">
                      更新
                    </button>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_180px_260px]">
                    <div className="space-y-4">
                      <div>
                        <div className="mb-1 text-xs font-bold tracking-wide text-zinc-500">応募者</div>
                        <div className="text-base font-semibold tracking-[0.3em] text-zinc-900">{candidate.name || "-"}</div>
                      </div>

                      <div>
                        <div className="mb-1 text-xs font-bold tracking-wide text-zinc-500">選考企業</div>
                        <input
                          name="companyName"
                          defaultValue={selection.companyName}
                          placeholder="選考企業"
                          className="h-14 w-full border-0 bg-transparent px-0 text-[36px] font-semibold leading-none text-blue-700 outline-none placeholder:text-zinc-300"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs font-bold tracking-wide text-zinc-500">求人情報</div>
                        <input
                          name="jobPostingUrl"
                          type="url"
                          defaultValue={selection.jobPostingUrl ?? ""}
                          placeholder="https://..."
                          className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-blue-700"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="text-xs font-bold tracking-wide text-zinc-500">進捗状況</div>
                        <div className="text-xs font-semibold text-rose-600">{statusGroup.label}</div>
                        <select name="selectionStatus" defaultValue={selection.selectionStatus} className="h-10 w-full rounded-none border border-zinc-900 bg-white px-3 text-sm">
                          {Object.entries(SELECTION_STATUS_LABELS).map(([code, label]) => (
                            <option key={code} value={code}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs font-bold tracking-wide text-zinc-500">紹介経路</div>
                        <SearchableSelect
                          name="referralSource"
                          defaultValue={selection.referralSource || "自社"}
                          options={selectionReferralOptions}
                          className="h-10 w-full rounded-none border border-zinc-900 bg-white px-3 text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs font-bold tracking-wide text-zinc-500">担当</div>
                        <SearchableSelect
                          name="ownerName"
                          defaultValue={selection.ownerName ?? candidate.ownerName ?? ""}
                          options={ownerOptionsWithBlank}
                          className="h-10 w-full rounded-none border border-zinc-900 bg-white px-3 text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs font-bold tracking-wide text-zinc-500">次回アクション</div>
                        <input
                          type="date"
                          name="nextActionAt"
                          defaultValue={formatDateInput(selection.nextActionAt)}
                          className="h-10 w-full rounded-none border border-zinc-900 bg-white px-3 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="text-xs font-bold tracking-wide text-zinc-500">メモ</div>
                        <textarea
                          name="notes"
                          defaultValue={selection.notes ?? ""}
                          rows={6}
                          placeholder="メモ"
                          className="min-h-[176px] w-full rounded-none border border-zinc-900 bg-white px-3 py-2 text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs font-bold tracking-wide text-zinc-500">応募日を変更</div>
                        <DateInputWithShortcuts
                          name="applicationDate"
                          defaultValue={formatDateInput(selection.applicationDate ?? selection.proposedAt)}
                          className="h-10 w-full rounded-none border border-zinc-900 bg-white px-3 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </form>
              )
              })}

              <form action={createSelectionAction} className="space-y-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4">
                <input type="hidden" name="candidateId" value={candidate.id} />
                <input type="hidden" name="applicantName" value={candidate.name} />

                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-3 text-sm">
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-zinc-700">
                    <div className="font-medium">
                      応募日 <span className="text-zinc-900">{formatDate(new Date())}</span>
                    </div>
                    <div className="font-medium text-zinc-500">最終更新 保存後に自動反映</div>
                  </div>
                  <button type="submit" className="h-9 rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white">
                    選考を追加
                  </button>
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_180px_260px]">
                  <div className="space-y-4">
                    <div>
                      <div className="mb-1 text-xs font-bold tracking-wide text-zinc-500">応募者</div>
                      <div className="text-base font-semibold tracking-[0.3em] text-zinc-900">{candidate.name || "-"}</div>
                    </div>

                    <div>
                      <div className="mb-1 text-xs font-bold tracking-wide text-zinc-500">選考企業</div>
                      <input
                        name="companyName"
                        placeholder="選考企業"
                        className="h-14 w-full border-0 bg-transparent px-0 text-[36px] font-semibold leading-none text-blue-700 outline-none placeholder:text-zinc-300"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-bold tracking-wide text-zinc-500">求人情報</div>
                      <input
                        name="jobPostingUrl"
                        type="url"
                        placeholder="https://..."
                        className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-blue-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="text-xs font-bold tracking-wide text-zinc-500">進捗状況</div>
                      <select name="selectionStatus" defaultValue="PROPOSED" className="h-10 w-full rounded-none border border-zinc-900 bg-white px-3 text-sm">
                        {Object.entries(SELECTION_STATUS_LABELS).map(([code, label]) => (
                          <option key={code} value={code}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-bold tracking-wide text-zinc-500">紹介経路</div>
                      <SearchableSelect
                        name="referralSource"
                        defaultValue="自社"
                        options={selectionReferralOptions}
                        className="h-10 w-full rounded-none border border-zinc-900 bg-white px-3 text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-bold tracking-wide text-zinc-500">担当</div>
                      <SearchableSelect
                        name="ownerName"
                        defaultValue={candidate.ownerName ?? ""}
                        options={ownerOptionsWithBlank}
                        className="h-10 w-full rounded-none border border-zinc-900 bg-white px-3 text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-bold tracking-wide text-zinc-500">次回アクション</div>
                      <input type="date" name="nextActionAt" className="h-10 w-full rounded-none border border-zinc-900 bg-white px-3 text-sm" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="text-xs font-bold tracking-wide text-zinc-500">メモ</div>
                      <textarea
                        name="notes"
                        rows={6}
                        placeholder="メモ"
                        className="min-h-[176px] w-full rounded-none border border-zinc-900 bg-white px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-bold tracking-wide text-zinc-500">応募日を設定</div>
                      <DateInputWithShortcuts
                        name="applicationDate"
                        defaultValue={formatDateInput(new Date())}
                        className="h-10 w-full rounded-none border border-zinc-900 bg-white px-3 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
