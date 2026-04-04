import { CustomerRank } from "@prisma/client"
import { prisma } from "./db"

type PeriodKey = "month" | "year" | "day" | "all"

export type SummaryRow = {
  key: string
  label: string
  count: number
  rate: number | null
}

export type AnalysisRow = {
  label: string
  proposalCount: number
  proposalRate: number
  proposalAvgDays: number | null
  entryCount: number
  entryRate: number
  entryAvgDays: number | null
  scheduledCount: number
  scheduledRate: number
  scheduledAvgDays: number | null
  interviewCount: number
  interviewRate: number
  interviewAvgDays: number | null
  offerCount: number
  offerRate: number
  offerAvgDays: number | null
  passedCount: number
  passedRate: number
  passedAvgDays: number | null
  interviewFromEntryCount: number
  interviewFromEntryRate: number
  interviewFromEntryAvgDays: number | null
  offerFromEntryCount: number
  offerFromEntryRate: number
  offerFromEntryAvgDays: number | null
}

type DashboardOptions = {
  period?: PeriodKey
  year?: number
  month?: number
  source?: string
}

function getPeriodRange(period: PeriodKey, year?: number, month?: number) {
  const now = new Date()
  const targetYear = year ?? now.getFullYear()
  const targetMonth = month ?? now.getMonth() + 1
  const start = new Date(now)
  const end = new Date(now)

  if (period === "day") {
    start.setFullYear(targetYear, targetMonth - 1, now.getDate())
    end.setFullYear(targetYear, targetMonth - 1, now.getDate())
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
    return { start, end, targetYear, targetMonth }
  }

  if (period === "month") {
    start.setFullYear(targetYear, targetMonth - 1, 1)
    start.setHours(0, 0, 0, 0)
    end.setFullYear(targetYear, targetMonth, 0)
    end.setHours(23, 59, 59, 999)
    return { start, end, targetYear, targetMonth }
  }

  if (period === "year") {
    start.setFullYear(targetYear, 0, 1)
    start.setHours(0, 0, 0, 0)
    end.setFullYear(targetYear, 11, 31)
    end.setHours(23, 59, 59, 999)
    return { start, end, targetYear, targetMonth }
  }

  return {
    start: new Date("2000-01-01"),
    end: new Date("2100-12-31"),
    targetYear,
    targetMonth,
  }
}

function inRange(value: Date | null, start: Date, end: Date) {
  if (!value) return false
  return value >= start && value <= end
}

function avg(values: number[]) {
  if (values.length === 0) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function diffDays(from: Date, to: Date) {
  return Math.max(0, Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)))
}

function firstDate(dates: (Date | null | undefined)[]) {
  return dates
    .filter((value): value is Date => Boolean(value))
    .sort((a, b) => a.getTime() - b.getTime())[0]
}

function buildSummaryRows(values: {
  inflow: number
  firstResponse: number
  interview: number
  documentCreated: number
  entry: number
  passed: number
  interviewScheduled: number
  interviewExecuted: number
  offer: number
  accepted: number
  joined: number
}): SummaryRow[] {
  return [
    { key: "inflow", label: "流入", count: values.inflow, rate: null },
    {
      key: "firstResponse",
      label: "初回対応",
      count: values.firstResponse,
      rate: values.inflow === 0 ? null : (values.firstResponse / values.inflow) * 100,
    },
    {
      key: "interview",
      label: "面談",
      count: values.interview,
      rate: values.firstResponse === 0 ? null : (values.interview / values.firstResponse) * 100,
    },
    {
      key: "documentCreated",
      label: "書類作成",
      count: values.documentCreated,
      rate: values.interview === 0 ? null : (values.documentCreated / values.interview) * 100,
    },
    {
      key: "entry",
      label: "エントリー",
      count: values.entry,
      rate: values.documentCreated === 0 ? null : (values.entry / values.documentCreated) * 100,
    },
    {
      key: "passed",
      label: "通過",
      count: values.passed,
      rate: values.entry === 0 ? null : (values.passed / values.entry) * 100,
    },
    {
      key: "interviewScheduled",
      label: "面接設置",
      count: values.interviewScheduled,
      rate: values.passed === 0 ? null : (values.interviewScheduled / values.passed) * 100,
    },
    {
      key: "interviewExecuted",
      label: "面接実施",
      count: values.interviewExecuted,
      rate: values.interviewScheduled === 0 ? null : (values.interviewExecuted / values.interviewScheduled) * 100,
    },
    {
      key: "offer",
      label: "内定",
      count: values.offer,
      rate: values.interviewExecuted === 0 ? null : (values.offer / values.interviewExecuted) * 100,
    },
    {
      key: "accepted",
      label: "承諾",
      count: values.accepted,
      rate: values.offer === 0 ? null : (values.accepted / values.offer) * 100,
    },
    {
      key: "joined",
      label: "入社",
      count: values.joined,
      rate: values.accepted === 0 ? null : (values.joined / values.accepted) * 100,
    },
  ]
}

export async function getDashboardData(options: DashboardOptions = {}) {
  const period = options.period ?? "month"
  const { start, end, targetYear, targetMonth } = getPeriodRange(period, options.year, options.month)
  const source = options.source ?? "all"

  const [candidates, selections, goals] = await Promise.all([
    prisma.candidate.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.selection.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.goalSetting.findMany(),
  ])

  const monthlyGoal = goals.find(
    (goal) => goal.periodType === "monthly" && goal.year === targetYear && goal.month === targetMonth
  )
  const yearlyGoal = goals.find((goal) => goal.periodType === "yearly" && goal.year === targetYear)
  const averageUnitPrice = monthlyGoal?.averageUnitPrice ?? yearlyGoal?.averageUnitPrice ?? 800000

  const activeCandidates = candidates.filter((candidate) => {
    if (candidate.archived) return false
    if (source === "all") return true
    return candidate.inflowSource === source
  })
  const activeCandidateIds = new Set(activeCandidates.map((candidate) => candidate.id))
  const filteredSelections = selections.filter((selection) => activeCandidateIds.has(selection.candidateId))

  const monthlySummary = buildSummaryRows({
    inflow: activeCandidates.filter((candidate) => inRange(candidate.inflowDate, start, end)).length,
    firstResponse: activeCandidates.filter((candidate) => inRange(candidate.firstResponseDate, start, end)).length,
    interview: activeCandidates.filter((candidate) => inRange(candidate.interviewDate, start, end)).length,
    documentCreated: activeCandidates.filter((candidate) => inRange(candidate.documentCreatedDate, start, end)).length,
    entry: filteredSelections.filter((selection) => inRange(selection.entryAt, start, end)).length,
    passed: filteredSelections.filter((selection) => inRange(selection.passedAt, start, end)).length,
    interviewScheduled: filteredSelections.filter((selection) => inRange(selection.interviewScheduledAt, start, end)).length,
    interviewExecuted: filteredSelections.filter(
      (selection) => inRange(selection.firstInterviewAt, start, end) || inRange(selection.secondInterviewAt, start, end)
    ).length,
    offer: filteredSelections.filter((selection) => inRange(selection.offerAt, start, end)).length,
    accepted: filteredSelections.filter((selection) => inRange(selection.offerAcceptedAt, start, end)).length,
    joined: filteredSelections.filter((selection) => inRange(selection.joiningAt, start, end)).length,
  })

  const cumulativeSummary = buildSummaryRows({
    inflow: activeCandidates.filter((candidate) => candidate.inflowDate && candidate.inflowDate <= end).length,
    firstResponse: activeCandidates.filter((candidate) => candidate.firstResponseDate && candidate.firstResponseDate <= end).length,
    interview: activeCandidates.filter((candidate) => candidate.interviewDate && candidate.interviewDate <= end).length,
    documentCreated: activeCandidates.filter((candidate) => candidate.documentCreatedDate && candidate.documentCreatedDate <= end).length,
    entry: filteredSelections.filter((selection) => selection.entryAt && selection.entryAt <= end).length,
    passed: filteredSelections.filter((selection) => selection.passedAt && selection.passedAt <= end).length,
    interviewScheduled: filteredSelections.filter((selection) => selection.interviewScheduledAt && selection.interviewScheduledAt <= end).length,
    interviewExecuted: filteredSelections.filter(
      (selection) =>
        (selection.firstInterviewAt && selection.firstInterviewAt <= end) ||
        (selection.secondInterviewAt && selection.secondInterviewAt <= end)
    ).length,
    offer: filteredSelections.filter((selection) => selection.offerAt && selection.offerAt <= end).length,
    accepted: filteredSelections.filter((selection) => selection.offerAcceptedAt && selection.offerAcceptedAt <= end).length,
    joined: filteredSelections.filter((selection) => selection.joiningAt && selection.joiningAt <= end).length,
  })

  const cumulativeRevenue = filteredSelections
    .filter((selection) => selection.joiningAt && selection.joiningAt <= end)
    .reduce((sum, selection) => sum + Math.round((selection.unitPrice ?? 0) * (selection.feeRate ?? 0)), 0)

  const monthlyExpectedRevenue = filteredSelections
    .filter((selection) => inRange(selection.offerAcceptedAt ?? selection.offerAt, start, end))
    .reduce((sum, selection) => sum + Math.round((selection.unitPrice ?? 0) * (selection.feeRate ?? 0)), 0)

  const fixedRevenue = filteredSelections
    .filter((selection) => inRange(selection.joiningAt, start, end))
    .reduce((sum, selection) => sum + Math.round((selection.unitPrice ?? 0) * (selection.feeRate ?? 0)), 0)

  const selectionsByCandidate = filteredSelections.reduce<Record<string, typeof filteredSelections>>((acc, selection) => {
    if (!acc[selection.candidateId]) acc[selection.candidateId] = []
    acc[selection.candidateId].push(selection)
    return acc
  }, {})

  const buildAnalysis = (groups: { label: string; candidates: typeof activeCandidates }[]): AnalysisRow[] =>
    groups.map((group) => {
      const firstResponseCandidates = group.candidates.filter((candidate) => inRange(candidate.firstResponseDate, start, end))
      const groupSelections = group.candidates.flatMap((candidate) => selectionsByCandidate[candidate.id] ?? [])

      const proposalCount = firstResponseCandidates.filter((candidate) =>
        (selectionsByCandidate[candidate.id] ?? []).some((selection) => inRange(selection.proposedAt, start, end))
      ).length

      const entryCandidates = firstResponseCandidates.filter((candidate) =>
        (selectionsByCandidate[candidate.id] ?? []).some((selection) => inRange(selection.entryAt, start, end))
      )

      const scheduledCount = firstResponseCandidates.filter((candidate) =>
        (selectionsByCandidate[candidate.id] ?? []).some((selection) => inRange(selection.interviewScheduledAt, start, end))
      ).length

      const interviewCount = firstResponseCandidates.filter((candidate) =>
        (selectionsByCandidate[candidate.id] ?? []).some(
          (selection) => inRange(selection.firstInterviewAt, start, end) || inRange(selection.secondInterviewAt, start, end)
        )
      ).length

      const offerCount = firstResponseCandidates.filter((candidate) =>
        (selectionsByCandidate[candidate.id] ?? []).some((selection) => inRange(selection.offerAt, start, end))
      ).length

      const entrySelectionRows = groupSelections.filter((selection) => inRange(selection.entryAt, start, end))
      const passedCount = entrySelectionRows.filter((selection) => inRange(selection.passedAt, start, end)).length
      const interviewFromEntryCount = entrySelectionRows.filter(
        (selection) => inRange(selection.firstInterviewAt, start, end) || inRange(selection.secondInterviewAt, start, end)
      ).length
      const offerFromEntryCount = entrySelectionRows.filter((selection) => inRange(selection.offerAt, start, end)).length

      const proposalAvgDays = avg(
        firstResponseCandidates
          .map((candidate) => {
            const from = candidate.firstResponseDate
            const to = firstDate((selectionsByCandidate[candidate.id] ?? []).map((selection) => selection.proposedAt))
            return from && to ? diffDays(from, to) : null
          })
          .filter((value): value is number => value !== null)
      )

      const entryAvgDays = avg(
        firstResponseCandidates
          .map((candidate) => {
            const from = candidate.firstResponseDate
            const to = firstDate((selectionsByCandidate[candidate.id] ?? []).map((selection) => selection.entryAt))
            return from && to ? diffDays(from, to) : null
          })
          .filter((value): value is number => value !== null)
      )

      const scheduledAvgDays = avg(
        firstResponseCandidates
          .map((candidate) => {
            const from = candidate.firstResponseDate
            const to = firstDate((selectionsByCandidate[candidate.id] ?? []).map((selection) => selection.interviewScheduledAt))
            return from && to ? diffDays(from, to) : null
          })
          .filter((value): value is number => value !== null)
      )

      const interviewAvgDays = avg(
        firstResponseCandidates
          .map((candidate) => {
            const from = candidate.firstResponseDate
            const to = firstDate(
              (selectionsByCandidate[candidate.id] ?? []).flatMap((selection) => [selection.firstInterviewAt, selection.secondInterviewAt])
            )
            return from && to ? diffDays(from, to) : null
          })
          .filter((value): value is number => value !== null)
      )

      const offerAvgDays = avg(
        firstResponseCandidates
          .map((candidate) => {
            const from = candidate.firstResponseDate
            const to = firstDate((selectionsByCandidate[candidate.id] ?? []).map((selection) => selection.offerAt))
            return from && to ? diffDays(from, to) : null
          })
          .filter((value): value is number => value !== null)
      )

      const passedAvgDays = avg(
        entrySelectionRows
          .map((selection) => (selection.entryAt && selection.passedAt ? diffDays(selection.entryAt, selection.passedAt) : null))
          .filter((value): value is number => value !== null)
      )

      const interviewFromEntryAvgDays = avg(
        entrySelectionRows
          .map((selection) => {
            const to = firstDate([selection.firstInterviewAt, selection.secondInterviewAt])
            return selection.entryAt && to ? diffDays(selection.entryAt, to) : null
          })
          .filter((value): value is number => value !== null)
      )

      const offerFromEntryAvgDays = avg(
        entrySelectionRows
          .map((selection) => (selection.entryAt && selection.offerAt ? diffDays(selection.entryAt, selection.offerAt) : null))
          .filter((value): value is number => value !== null)
      )

      return {
        label: group.label,
        proposalCount,
        proposalRate: firstResponseCandidates.length === 0 ? 0 : (proposalCount / firstResponseCandidates.length) * 100,
        proposalAvgDays,
        entryCount: entryCandidates.length,
        entryRate: firstResponseCandidates.length === 0 ? 0 : (entryCandidates.length / firstResponseCandidates.length) * 100,
        entryAvgDays,
        scheduledCount,
        scheduledRate: firstResponseCandidates.length === 0 ? 0 : (scheduledCount / firstResponseCandidates.length) * 100,
        scheduledAvgDays,
        interviewCount,
        interviewRate: firstResponseCandidates.length === 0 ? 0 : (interviewCount / firstResponseCandidates.length) * 100,
        interviewAvgDays,
        offerCount,
        offerRate: firstResponseCandidates.length === 0 ? 0 : (offerCount / firstResponseCandidates.length) * 100,
        offerAvgDays,
        passedCount,
        passedRate: entrySelectionRows.length === 0 ? 0 : (passedCount / entrySelectionRows.length) * 100,
        passedAvgDays,
        interviewFromEntryCount,
        interviewFromEntryRate: entrySelectionRows.length === 0 ? 0 : (interviewFromEntryCount / entrySelectionRows.length) * 100,
        interviewFromEntryAvgDays,
        offerFromEntryCount,
        offerFromEntryRate: entrySelectionRows.length === 0 ? 0 : (offerFromEntryCount / entrySelectionRows.length) * 100,
        offerFromEntryAvgDays,
      }
    })

  const ageAnalysis = buildAnalysis([
    { label: "20代", candidates: activeCandidates.filter((candidate) => (candidate.age ?? 0) >= 20 && (candidate.age ?? 0) <= 29) },
    { label: "30代", candidates: activeCandidates.filter((candidate) => (candidate.age ?? 0) >= 30 && (candidate.age ?? 0) <= 39) },
    { label: "40代", candidates: activeCandidates.filter((candidate) => (candidate.age ?? 0) >= 40 && (candidate.age ?? 0) <= 49) },
    { label: "50代以上", candidates: activeCandidates.filter((candidate) => (candidate.age ?? 0) >= 50) },
  ])

  const jobTypeAnalysis = buildAnalysis(
    Object.entries(
      activeCandidates.reduce<Record<string, typeof activeCandidates>>((acc, candidate) => {
        const key = candidate.desiredJobType || "未設定"
        if (!acc[key]) acc[key] = []
        acc[key].push(candidate)
        return acc
      }, {})
    )
      .map(([label, groupCandidates]) => ({ label, candidates: groupCandidates }))
      .sort((a, b) => b.candidates.length - a.candidates.length)
      .slice(0, 5)
  )

  const rankAnalysis = buildAnalysis(
    Object.values(CustomerRank).map((rank) => ({
      label: rank,
      candidates: activeCandidates.filter((candidate) => candidate.customerRank === rank),
    }))
  )

  return {
    source,
    targetYear,
    targetMonth,
    averageUnitPrice,
    revenues: {
      fixedRevenue,
      cumulativeRevenue,
      monthlyExpectedRevenue,
    },
    monthlySummary,
    cumulativeSummary,
    ageAnalysis,
    jobTypeAnalysis,
    rankAnalysis,
  }
}
