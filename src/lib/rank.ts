import { CustomerRank, RankSource, type Candidate, type Qualification } from "@prisma/client"
import { A_RANK_QUALIFICATIONS, S_RANK_QUALIFICATIONS } from "./constants"

type RankCandidate = Pick<Candidate, "age" | "jobSearchStatus" | "desiredTiming" | "rankManualOverride" | "customerRank">
type RankQualification = Pick<Qualification, "qualificationName">

export function calculateAutoRankFromAgeAndQualifications(age: number | null | undefined, qualificationNames: string[]) {
  if (qualificationNames.some((name) => S_RANK_QUALIFICATIONS.includes(name as (typeof S_RANK_QUALIFICATIONS)[number]))) {
    return { rank: CustomerRank.S, source: RankSource.auto }
  }

  if (qualificationNames.some((name) => A_RANK_QUALIFICATIONS.includes(name as (typeof A_RANK_QUALIFICATIONS)[number]))) {
    return { rank: CustomerRank.A, source: RankSource.auto }
  }

  if (typeof age === "number" && age <= 29) {
    return { rank: CustomerRank.B, source: RankSource.auto }
  }

  return { rank: CustomerRank.C, source: RankSource.auto }
}

export function calculateCustomerRank(candidate: RankCandidate, qualifications: RankQualification[]) {
  const names = qualifications.map((item) => item.qualificationName)
  const rankFromProfile = calculateAutoRankFromAgeAndQualifications(candidate.age, names)
  if (rankFromProfile.rank !== CustomerRank.C) {
    return rankFromProfile
  }

  const searchText = `${candidate.jobSearchStatus ?? ""} ${candidate.desiredTiming ?? ""}`
  const isActive =
    searchText.includes("離職") ||
    searchText.includes("退職日確定") ||
    searchText.includes("転職活動中")

  if (isActive) {
    return { rank: CustomerRank.B, source: RankSource.auto }
  }

  return { rank: CustomerRank.C, source: RankSource.auto }
}
