import { DashboardScreen } from "./DashboardScreen"

type DashboardPageProps = {
  searchParams?: Promise<{
    year?: string
    month?: string
    source?: string
  }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = (await searchParams) ?? {}
  const year = params.year ? Number(params.year) : undefined
  const month = params.month ? Number(params.month) : undefined
  const source = params.source ?? "all"

  return <DashboardScreen year={year} month={month} source={source} />
}
