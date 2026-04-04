import Link from "next/link"
import { getDashboardData, type AnalysisRow, type SummaryRow } from "@/lib/dashboard"
import { CUSTOMER_RANK_BADGE } from "@/lib/constants"
import { formatCurrency, formatPercent } from "@/lib/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="relative overflow-hidden rounded-[18px] border border-[#dbc7ef] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(250,245,255,0.96)_100%)] shadow-[0_14px_30px_-22px_rgba(72,28,135,0.38)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c084fc] to-transparent" />
      <div className="absolute right-0 top-0 h-16 w-16 rounded-full bg-[radial-gradient(circle,_rgba(196,181,253,0.42)_0%,_transparent_68%)]" />
      <CardHeader className="relative px-3 pb-2 pt-3">
        <CardTitle className="font-serif text-[13px] font-black tracking-tight text-[#22112f]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="relative px-3 pb-3">{children}</CardContent>
    </Card>
  )
}

function TopMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="relative overflow-hidden rounded-[16px] border border-[#d9caef] bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(245,239,255,0.98)_100%)] px-3 py-2.5 shadow-[0_12px_24px_-18px_rgba(88,28,135,0.38)]">
      <div className="absolute -right-3 -top-4 h-12 w-12 rounded-full bg-[radial-gradient(circle,_rgba(244,114,182,0.24)_0%,_transparent_70%)]" />
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#a855f7] via-[#f472b6] to-[#f59e0b]" />
      <p className="relative pl-2 text-[10px] font-semibold text-[#7c3f8c]">{label}</p>
      <strong className="relative mt-1 block pl-2 text-[22px] font-black leading-none tracking-tight text-[#22112f]">{value}</strong>
    </div>
  )
}

function SummaryTable({ title, rows }: { title: string; rows: SummaryRow[] }) {
  return (
    <Panel title={title}>
      <div className="overflow-hidden rounded-[14px] border border-[#eadcf7]">
        <div className="grid grid-cols-[0.9fr_0.45fr_0.5fr] bg-[linear-gradient(135deg,#faf5ff_0%,#fff1f2_100%)] px-2 py-1.5 text-[9px] font-semibold text-[#7c3f8c]">
          <span>項目</span>
          <span className="text-right">数</span>
          <span className="text-right">率</span>
        </div>
        {rows.map((row) => (
          <div key={row.key} className="grid grid-cols-[0.9fr_0.45fr_0.5fr] items-center border-t border-[#f3ebfb] bg-white px-2 py-1 text-[9px]">
            <span className="text-[#5f3a6d]">{row.label}</span>
            <span className="text-right font-semibold text-[#22112f]">{row.count}</span>
            <span className="text-right text-[#8b695b]">{row.rate === null ? "-" : formatPercent(row.rate)}</span>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function formatDays(value: number | null) {
  if (value === null) return "-"
  return `${value.toFixed(1)}日`
}

function RateTable({ title, rows, isRank = false }: { title: string; rows: AnalysisRow[]; isRank?: boolean }) {
  return (
    <Panel title={`${title}の転化率`}>
      <div className="overflow-x-auto">
        <div className="min-w-[960px] overflow-hidden rounded-[14px] border border-[#eadcf7]">
          <div className="grid grid-cols-[0.7fr_repeat(8,0.82fr)] bg-[linear-gradient(135deg,#faf5ff_0%,#fff1f2_100%)] px-2 py-1.5 text-[8px] font-semibold text-[#7c3f8c]">
            <span>{isRank ? "ランク" : title}</span>
            <span className="text-right">初回→提案</span>
            <span className="text-right">初回→エン</span>
            <span className="text-right">初回→面接設置</span>
            <span className="text-right">初回→面接実施</span>
            <span className="text-right">初回→内定</span>
            <span className="text-right">エン→通過</span>
            <span className="text-right">エン→面接実施</span>
            <span className="text-right">エン→内定</span>
          </div>
          {rows.map((row) => (
            <div key={row.label} className="grid grid-cols-[0.7fr_repeat(8,0.82fr)] items-center border-t border-[#f3ebfb] bg-white px-2 py-1 text-[8px]">
              <span
                className={
                  isRank
                    ? `inline-flex w-fit rounded-full px-2 py-0.5 text-[9px] font-semibold ${CUSTOMER_RANK_BADGE[row.label as keyof typeof CUSTOMER_RANK_BADGE]}`
                    : "font-semibold text-[#22112f]"
                }
              >
                {row.label}
              </span>
              <span className="text-right text-[#8b695b]">{row.proposalCount} / {formatPercent(row.proposalRate)}</span>
              <span className="text-right text-[#8b695b]">{row.entryCount} / {formatPercent(row.entryRate)}</span>
              <span className="text-right text-[#8b695b]">{row.scheduledCount} / {formatPercent(row.scheduledRate)}</span>
              <span className="text-right text-[#8b695b]">{row.interviewCount} / {formatPercent(row.interviewRate)}</span>
              <span className="text-right text-[#8b695b]">{row.offerCount} / {formatPercent(row.offerRate)}</span>
              <span className="text-right text-[#8b695b]">{row.passedCount} / {formatPercent(row.passedRate)}</span>
              <span className="text-right text-[#8b695b]">{row.interviewFromEntryCount} / {formatPercent(row.interviewFromEntryRate)}</span>
              <span className="text-right text-[#8b695b]">{row.offerFromEntryCount} / {formatPercent(row.offerFromEntryRate)}</span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  )
}

function IntervalTable({ title, rows, isRank = false }: { title: string; rows: AnalysisRow[]; isRank?: boolean }) {
  return (
    <Panel title={`${title}の平均経過日数`}>
      <div className="overflow-x-auto">
        <div className="min-w-[960px] overflow-hidden rounded-[14px] border border-[#eadcf7]">
          <div className="grid grid-cols-[0.7fr_repeat(8,0.82fr)] bg-[linear-gradient(135deg,#faf5ff_0%,#fff1f2_100%)] px-2 py-1.5 text-[8px] font-semibold text-[#7c3f8c]">
            <span>{isRank ? "ランク" : title}</span>
            <span className="text-right">初回→提案</span>
            <span className="text-right">初回→エン</span>
            <span className="text-right">初回→面接設置</span>
            <span className="text-right">初回→面接実施</span>
            <span className="text-right">初回→内定</span>
            <span className="text-right">エン→通過</span>
            <span className="text-right">エン→面接実施</span>
            <span className="text-right">エン→内定</span>
          </div>
          {rows.map((row) => (
            <div key={row.label} className="grid grid-cols-[0.7fr_repeat(8,0.82fr)] items-center border-t border-[#f3ebfb] bg-white px-2 py-1 text-[8px]">
              <span
                className={
                  isRank
                    ? `inline-flex w-fit rounded-full px-2 py-0.5 text-[9px] font-semibold ${CUSTOMER_RANK_BADGE[row.label as keyof typeof CUSTOMER_RANK_BADGE]}`
                    : "font-semibold text-[#22112f]"
                }
              >
                {row.label}
              </span>
              <span className="text-right text-[#8b695b]">{formatDays(row.proposalAvgDays)}</span>
              <span className="text-right text-[#8b695b]">{formatDays(row.entryAvgDays)}</span>
              <span className="text-right text-[#8b695b]">{formatDays(row.scheduledAvgDays)}</span>
              <span className="text-right text-[#8b695b]">{formatDays(row.interviewAvgDays)}</span>
              <span className="text-right text-[#8b695b]">{formatDays(row.offerAvgDays)}</span>
              <span className="text-right text-[#8b695b]">{formatDays(row.passedAvgDays)}</span>
              <span className="text-right text-[#8b695b]">{formatDays(row.interviewFromEntryAvgDays)}</span>
              <span className="text-right text-[#8b695b]">{formatDays(row.offerFromEntryAvgDays)}</span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  )
}

function MonthNavigation({ year, month }: { year: number; month: number }) {
  const prev = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 }
  const next = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 }
  const monthLabel = `${year}年${month}月`

  return (
    <div className="flex items-center gap-2.5">
      <Link
        href={`/dashboard?year=${prev.year}&month=${prev.month}`}
        className="rounded-full border border-[#dcc8f1] bg-white/90 px-3.5 py-1.5 text-[12px] font-semibold tracking-[0.04em] text-[#6b3e92] shadow-[0_8px_18px_-18px_rgba(88,28,135,0.45)] transition hover:border-[#c084fc] hover:text-[#5b21b6]"
      >
        前月
      </Link>
      <Link
        href={`/dashboard?year=${next.year}&month=${next.month}`}
        className="rounded-full border border-[#dcc8f1] bg-white/90 px-3.5 py-1.5 text-[12px] font-semibold tracking-[0.04em] text-[#6b3e92] shadow-[0_8px_18px_-18px_rgba(88,28,135,0.45)] transition hover:border-[#c084fc] hover:text-[#5b21b6]"
      >
        翌月
      </Link>
      <div className="rounded-full border border-[#dcc8f1] bg-[linear-gradient(135deg,#ffffff_0%,#faf5ff_100%)] px-5 py-1.5 text-[18px] font-black tracking-[0.02em] text-[#22112f] shadow-[0_10px_22px_-18px_rgba(88,28,135,0.5)]">
        {monthLabel}
      </div>
    </div>
  )
}

function SourceNavigation({ year, month, source }: { year: number; month: number; source: string }) {
  const items = [
    { key: "all", label: "ALL" },
    { key: "ポータル", label: "ポータル" },
    { key: "失業保険", label: "失業保険" },
  ]

  return (
    <div className="flex items-center gap-1.5">
      {items.map((item) => {
        const active = source === item.key
        return (
          <Link
            key={item.key}
            href={`/dashboard?year=${year}&month=${month}&source=${encodeURIComponent(item.key)}`}
            className={
              active
                ? "rounded-full bg-[linear-gradient(135deg,#7e22ce_0%,#db2777_100%)] px-3 py-1 text-[11px] font-semibold text-white shadow-[0_10px_20px_-16px_rgba(126,34,206,0.8)]"
                : "rounded-full border border-[#e5d5ff] bg-[linear-gradient(135deg,#faf5ff_0%,#fff1f2_100%)] px-3 py-1 text-[11px] font-semibold text-[#7e22ce]"
            }
          >
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}

export async function DashboardScreen({ year, month, source }: { year?: number; month?: number; source?: string }) {
  const data = await getDashboardData({ period: "month", year, month, source })

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(192,132,252,0.18),_transparent_18%),radial-gradient(circle_at_top_right,_rgba(244,114,182,0.12),_transparent_20%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.12),_transparent_22%),linear-gradient(180deg,_#fcf8ff_0%,_#fffdfb_45%,_#ffffff_100%)]">
      <div className="space-y-2.5 p-3 lg:space-y-2.5 lg:p-3">
        <section className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <MonthNavigation year={data.targetYear} month={data.targetMonth} />
          </div>
          <SourceNavigation year={data.targetYear} month={data.targetMonth} source={data.source} />
        </section>

        <section className="grid gap-2 xl:grid-cols-4">
          <TopMetric label="売上実績（転化日ベース）" value={formatCurrency(data.revenues.fixedRevenue)} />
          <TopMetric label="売上実績（発生日ベース）" value={formatCurrency(data.revenues.cumulativeRevenue)} />
          <TopMetric label="売上実績（着地見込み）" value={formatCurrency(data.revenues.monthlyExpectedRevenue)} />
          <TopMetric label="平均単価" value={formatCurrency(data.averageUnitPrice)} />
        </section>

        <section className="grid gap-3 xl:grid-cols-2">
          <SummaryTable title="転化日ベース" rows={data.monthlySummary} />
          <SummaryTable title="流入日ベース" rows={data.cumulativeSummary} />
        </section>

        <section className="grid gap-3 xl:grid-cols-2">
          <RateTable title="年代別" rows={data.ageAnalysis} />
          <IntervalTable title="年代別" rows={data.ageAnalysis} />
        </section>

        <section className="grid gap-3 xl:grid-cols-2">
          <RateTable title="ランク別" rows={data.rankAnalysis} isRank />
          <IntervalTable title="ランク別" rows={data.rankAnalysis} isRank />
        </section>
      </div>
    </div>
  )
}
