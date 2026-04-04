import { CustomerRank, RankSource, type Candidate, type Qualification } from "@prisma/client"
import { A_RANK_QUALIFICATIONS, S_RANK_QUALIFICATIONS } from "./constants"

type RankCandidate = Pick<Candidate, "age" | "jobSearchStatus" | "desiredTiming" | "rankManualOverride" | "customerRank">
type RankQualification = Pick<Qualification, "qualificationName">

export function calculateCustomerRank(candidate: RankCandidate, qualifications: RankQualification[]) {
  const names = qualifications.map((item) => item.qualificationName)

  if (names.some((name) => S_RANK_QUALIFICATIONS.includes(name as (typeof S_RANK_QUALIFICATIONS)[number]))) {
    return { rank: CustomerRank.S, source: RankSource.auto }
  }

  if (names.some((name) => A_RANK_QUALIFICATIONS.includes(name as (typeof A_RANK_QUALIFICATIONS)[number]))) {
    return { rank: CustomerRank.A, source: RankSource.auto }
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
