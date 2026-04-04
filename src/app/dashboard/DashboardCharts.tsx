"use client"

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { formatPercent } from "@/lib/format"

type ConversionItem = {
  label: string
  rate: number
}

type DistributionItem = {
  label: string
  count: number
  joined?: number
  offers?: number
  revenue?: number
  proposalRate?: number
  entryRate?: number
  interviewRate?: number
  offerRate?: number
}

const RANK_COLORS = ["#8a1f11", "#d54b2a", "#ff9f45", "#f3c9b1"]

export function ConversionChart({ data }: { data: ConversionItem[] }) {
  return (
    <ResponsiveContainer width="100%" height={205}>
      <BarChart data={data} layout="vertical" margin={{ top: 2, right: 4, left: 0, bottom: 2 }} barCategoryGap={8}>
        <CartesianGrid strokeDasharray="4 6" horizontal={false} stroke="#f1dfd5" />
        <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} stroke="#b08976" fontSize={11} />
        <YAxis type="category" dataKey="label" width={102} stroke="#805948" fontSize={10} />
        <Tooltip
          formatter={(value) => formatPercent(Number(value))}
          contentStyle={{
            borderRadius: 18,
            border: "1px solid #efc7b8",
            backgroundColor: "#fffaf7",
            boxShadow: "0 20px 40px -28px rgba(122,32,0,0.3)",
          }}
        />
        <Bar dataKey="rate" radius={[0, 8, 8, 0]} fill="#d54b2a" maxBarSize={16} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function DistributionChart({
  data,
  titleKey = "count",
  color = "#d54b2a",
}: {
  data: DistributionItem[]
  titleKey?: "count" | "joined" | "offers" | "proposalRate" | "entryRate" | "interviewRate" | "offerRate"
  color?: string
}) {
  return (
    <ResponsiveContainer width="100%" height={170}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }} barCategoryGap={12}>
        <CartesianGrid strokeDasharray="4 6" vertical={false} stroke="#f1dfd5" />
        <XAxis dataKey="label" stroke="#b08976" fontSize={10} />
        <YAxis stroke="#b08976" fontSize={10} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            borderRadius: 18,
            border: "1px solid #efc7b8",
            backgroundColor: "#fffaf7",
            boxShadow: "0 20px 40px -28px rgba(122,32,0,0.3)",
          }}
        />
        <Bar dataKey={titleKey} fill={color} radius={[8, 8, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function RankChart({ data }: { data: DistributionItem[] }) {
  return (
    <ResponsiveContainer width="100%" height={170}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }} barCategoryGap={12}>
        <CartesianGrid strokeDasharray="4 6" vertical={false} stroke="#f1dfd5" />
        <XAxis dataKey="label" stroke="#b08976" fontSize={10} />
        <YAxis stroke="#b08976" fontSize={10} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            borderRadius: 18,
            border: "1px solid #efc7b8",
            backgroundColor: "#fffaf7",
            boxShadow: "0 20px 40px -28px rgba(122,32,0,0.3)",
          }}
        />
        <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={28}>
          {data.map((entry, index) => (
            <Cell key={`${entry.label}-${index}`} fill={RANK_COLORS[index % RANK_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
