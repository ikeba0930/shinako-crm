"use server"

import { CandidateOverallStatus, CustomerRank, GoalPeriodType, SelectionStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { prisma } from "./db"
import { calculateCustomerRank } from "./rank"

function parseDate(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string" || !value) return null
  return new Date(value)
}

function parseIntValue(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string" || value === "") return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function parseFloatValue(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string" || value === "") return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function parseQualificationLines(value: string) {
  return value
    .split(/\r?\n|,|、/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function calculateAgeFromBirthDate(birthDate: Date | null) {
  if (!birthDate) return null
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const hasBirthdayPassed =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate())
  if (!hasBirthdayPassed) age -= 1
  return age
}

async function syncCandidateDerivedFields(candidateId: string) {
  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: { qualifications: true, selections: true },
  })

  if (!candidate) return

  const autoRank = calculateCustomerRank(candidate, candidate.qualifications)
  const inactiveStatuses = new Set<SelectionStatus>([
    SelectionStatus.DECLINED,
    SelectionStatus.REJECTED,
    SelectionStatus.CLOSED,
    SelectionStatus.JOINED,
  ])
  const activeSelectionCount = candidate.selections.filter((selection) => !inactiveStatuses.has(selection.selectionStatus)).length

  const nextOverallStatus =
    candidate.joiningDate
      ? CandidateOverallStatus.JOINED
      : candidate.offerAcceptedDate
        ? CandidateOverallStatus.ACCEPTED
        : candidate.offerDate
          ? CandidateOverallStatus.OFFERED
          : activeSelectionCount > 0
            ? CandidateOverallStatus.IN_PROGRESS
            : candidate.proposalDate
              ? CandidateOverallStatus.PROPOSING
              : candidate.interviewDate
                ? CandidateOverallStatus.INTERVIEWED
                : candidate.firstResponseDate
                  ? CandidateOverallStatus.FIRST_CONTACTED
                  : CandidateOverallStatus.NEW

  await prisma.candidate.update({
    where: { id: candidateId },
    data: {
      proposalCount: candidate.selections.filter((selection) => selection.proposedAt !== null).length,
      activeSelectionCount,
      rankAutoResult: autoRank.rank,
      customerRank: candidate.rankManualOverride ? candidate.customerRank : autoRank.rank,
      rankSource: candidate.rankManualOverride ? "manual" : autoRank.source,
      overallStatus: candidate.archived ? CandidateOverallStatus.CLOSED : nextOverallStatus,
    },
  })
}

export async function saveCandidateAction(formData: FormData) {
  const id = String(formData.get("id") ?? "")
  const qualificationLines = parseQualificationLines(String(formData.get("qualificationLines") ?? ""))
  const birthDate = parseDate(formData.get("birthDate"))
  const age = parseIntValue(formData.get("age"))
  const manualRank = String(formData.get("customerRank") ?? "C") as CustomerRank
  const rankManualOverride = formData.get("rankManualOverride") === "on"
  const inflowSource = String(formData.get("inflowSource") ?? "") || null
  const initialOwnerName = String(formData.get("initialOwnerName") ?? "") || null
  const ownerName = String(formData.get("ownerName") ?? "") || null
  const unemploymentInsuranceContract = String(formData.get("unemploymentInsuranceContract") ?? "") || null
  const retirementDate = parseDate(formData.get("retirementDate"))
  const agentPassDate = parseDate(formData.get("agentPassDate"))
  const callPreferredAt = parseDate(formData.get("callPreferredAt"))
  const entryDate = parseDate(formData.get("entryDate"))
  const companyInterviewDate = parseDate(formData.get("companyInterviewDate"))

  await prisma.candidate.update({
    where: { id },
    data: {
      name: String(formData.get("name") ?? ""),
      nameKana: String(formData.get("nameKana") ?? "") || null,
      birthDate,
      age: birthDate ? calculateAgeFromBirthDate(birthDate) : age,
      gender: String(formData.get("gender") ?? "") || null,
      phone: String(formData.get("phone") ?? "") || null,
      email: String(formData.get("email") ?? "") || null,
      address: String(formData.get("address") ?? "") || null,
      desiredJobType: String(formData.get("desiredJobType") ?? "") || null,
      desiredLocation: String(formData.get("desiredLocation") ?? "") || null,
      currentAnnualIncome: parseIntValue(formData.get("currentAnnualIncome")),
      desiredAnnualIncome: parseIntValue(formData.get("desiredAnnualIncome")),
      jobSearchStatus: String(formData.get("jobSearchStatus") ?? "") || null,
      desiredTiming: String(formData.get("desiredTiming") ?? "") || null,
      initialOwnerName,
      ownerName,
      otherConditions: String(formData.get("lineUrl") ?? "") || null,
      inflowSource,
      unemploymentInsuranceContract,
      retirementDate,
      agentPassDate,
      callPreferredAt,
      inflowDate: parseDate(formData.get("inflowDate")),
      firstResponseDate: parseDate(formData.get("firstResponseDate")),
      interviewDate: parseDate(formData.get("interviewDate")),
      proposalDate: parseDate(formData.get("proposalDate")),
      documentCreatedDate: parseDate(formData.get("documentCreatedDate")),
      entryDate,
      companyInterviewDate,
      offerDate: parseDate(formData.get("offerDate")),
      offerAcceptedDate: parseDate(formData.get("offerAcceptedDate")),
      joiningDate: parseDate(formData.get("joiningDate")),
      closedDate: parseDate(formData.get("closedDate")),
      employmentStatus: String(formData.get("employmentStatus") ?? "") || null,
      employmentTypePreference: String(formData.get("employmentTypePreference") ?? "") || null,
      availability: String(formData.get("availability") ?? "") || null,
      qualificationText: qualificationLines.join("、"),
      strengths: String(formData.get("strengths") ?? "") || null,
      reasonForChange: String(formData.get("reasonForChange") ?? "") || null,
      transferableSkills: String(formData.get("transferableSkills") ?? "") || null,
      pcSkills: String(formData.get("pcSkills") ?? "") || null,
      languageSkills: String(formData.get("languageSkills") ?? "") || null,
      internalMemo: String(formData.get("internalMemo") ?? "") || null,
      archived: formData.get("archived") === "on",
      customerRank: manualRank,
      rankManualOverride,
      rankSource: rankManualOverride ? "manual" : "auto",
      qualifications: {
        deleteMany: {},
        create: qualificationLines.map((qualificationName, index) => ({
          qualificationName,
          isRankRelevant: true,
          sortOrder: index,
        })),
      },
    },
  })

  await syncCandidateDerivedFields(id)
  revalidatePath("/candidates")
  revalidatePath(`/candidates/${id}`)
  revalidatePath("/dashboard")
  revalidatePath("/selections")
  redirect(`/candidates/${id}?saved=1`)
}

export async function createCandidateAction(formData: FormData) {
  const now = new Date()
  const count = await prisma.candidate.count()
  const inflowSource = String(formData.get("inflowSource") ?? "") || "ポータル（ブルー）"
  const unemploymentInsuranceContract = String(formData.get("unemploymentInsuranceContract") ?? "") || null
  const retirementDate = parseDate(formData.get("retirementDate"))
  const agentPassDate = parseDate(formData.get("agentPassDate"))
  const callPreferredAt = parseDate(formData.get("callPreferredAt"))
  const age = parseIntValue(formData.get("age"))
  const condition = String(formData.get("jobSearchStatus") ?? "") || null
  const initialOwnerName = String(formData.get("initialOwnerName") ?? "") || null
  const qualificationNames = formData
    .getAll("qualificationNames")
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value, index, values) => values.indexOf(value) === index)
  const autoRank = calculateCustomerRank(
    {
      age,
      jobSearchStatus: condition,
      desiredTiming: null,
      rankManualOverride: false,
      customerRank: "C",
    },
    qualificationNames.map((qualificationName) => ({ qualificationName }))
  )

  if (inflowSource === "失業保険" && (!agentPassDate || !callPreferredAt)) {
    throw new Error("失業保険を選択した場合は、エージェント パス日と架電希望日時が必須です。")
  }

  const candidate = await prisma.candidate.create({
    data: {
      candidateCode: `C-${String(count + 1).padStart(4, "0")}`,
      name: String(formData.get("name") ?? "新規求職者"),
      gender: String(formData.get("gender") ?? "") || null,
      age,
      phone: String(formData.get("phone") ?? "") || null,
      jobSearchStatus: condition,
      desiredJobType: String(formData.get("desiredJobType") ?? "") || null,
      initialOwnerName,
      ownerName: initialOwnerName,
      otherConditions: String(formData.get("lineUrl") ?? "") || null,
      customerRank: autoRank.rank,
      rankAutoResult: autoRank.rank,
      rankSource: autoRank.source,
      qualificationText: qualificationNames.join("、"),
      inflowSource,
      unemploymentInsuranceContract,
      retirementDate,
      agentPassDate,
      callPreferredAt,
      inflowDate: now,
      qualifications: {
        create: qualificationNames.map((qualificationName, index) => ({
          qualificationName,
          isRankRelevant: true,
          sortOrder: index,
        })),
      },
    },
  })

  await syncCandidateDerivedFields(candidate.id)
  revalidatePath("/candidates")
  redirect(`/candidates/${candidate.id}`)
}

export async function deleteCandidateAction(formData: FormData) {
  const candidateId = String(formData.get("candidateId") ?? "")

  if (!candidateId) return

  await prisma.candidate.update({
    where: { id: candidateId },
    data: {
      archived: true,
      closedDate: new Date(),
    },
  })

  await syncCandidateDerivedFields(candidateId)
  revalidatePath("/candidates")
  revalidatePath(`/candidates/${candidateId}`)
  revalidatePath("/dashboard")
  revalidatePath("/selections")
}

export async function saveSelectionAction(formData: FormData) {
  const id = String(formData.get("id") ?? "")
  const candidateId = String(formData.get("candidateId") ?? "")

  await prisma.selection.update({
    where: { id },
    data: {
      companyName: String(formData.get("companyName") ?? ""),
      jobType: String(formData.get("jobType") ?? "") || null,
      ownerName: String(formData.get("ownerName") ?? "") || null,
      unitPrice: parseIntValue(formData.get("unitPrice")),
      feeRate: parseFloatValue(formData.get("feeRate")),
      selectionStatus: String(formData.get("selectionStatus") ?? "PROPOSED") as SelectionStatus,
      proposedAt: parseDate(formData.get("proposedAt")),
      entryAt: parseDate(formData.get("entryAt")),
      passedAt: parseDate(formData.get("passedAt")),
      interviewScheduledAt: parseDate(formData.get("interviewScheduledAt")),
      firstInterviewAt: parseDate(formData.get("firstInterviewAt")),
      secondInterviewAt: parseDate(formData.get("secondInterviewAt")),
      offerAt: parseDate(formData.get("offerAt")),
      offerAcceptedAt: parseDate(formData.get("offerAcceptedAt")),
      joiningAt: parseDate(formData.get("joiningAt")),
      notes: String(formData.get("notes") ?? "") || null,
    },
  })

  await syncCandidateDerivedFields(candidateId)
  revalidatePath("/selections")
  revalidatePath("/dashboard")
  revalidatePath(`/candidates/${candidateId}`)
}

export async function createSelectionAction(formData: FormData) {
  const candidateId = String(formData.get("candidateId") ?? "")
  await prisma.selection.create({
    data: {
      candidateId,
      companyName: String(formData.get("companyName") ?? ""),
      jobType: String(formData.get("jobType") ?? "") || null,
      ownerName: String(formData.get("ownerName") ?? "") || null,
      selectionStatus: SelectionStatus.PROPOSED,
      proposedAt: parseDate(formData.get("proposedAt")) ?? new Date(),
      unitPrice: parseIntValue(formData.get("unitPrice")),
      feeRate: parseFloatValue(formData.get("feeRate")),
      notes: String(formData.get("notes") ?? "") || null,
    },
  })

  await syncCandidateDerivedFields(candidateId)
  revalidatePath("/selections")
  revalidatePath("/dashboard")
  revalidatePath(`/candidates/${candidateId}`)
}

export async function saveGoalSettingAction(formData: FormData) {
  const year = Number(formData.get("year"))
  const monthRaw = String(formData.get("month") ?? "")
  const month = monthRaw ? Number(monthRaw) : 0
  const periodType = String(formData.get("periodType") ?? "monthly") as GoalPeriodType

  await prisma.goalSetting.upsert({
    where: {
      periodType_year_month: {
        periodType,
        year,
        month,
      },
    },
    update: {
      annualRevenueTarget: parseIntValue(formData.get("annualRevenueTarget")),
      monthlyRevenueTarget: parseIntValue(formData.get("monthlyRevenueTarget")),
      averageUnitPrice: parseIntValue(formData.get("averageUnitPrice")) ?? 800000,
    },
    create: {
      periodType,
      year,
      month,
      annualRevenueTarget: parseIntValue(formData.get("annualRevenueTarget")),
      monthlyRevenueTarget: parseIntValue(formData.get("monthlyRevenueTarget")),
      averageUnitPrice: parseIntValue(formData.get("averageUnitPrice")) ?? 800000,
    },
  })

  revalidatePath("/settings")
  revalidatePath("/dashboard")
}
