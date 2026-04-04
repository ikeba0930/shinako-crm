import { prisma } from "@/lib/db"
import { saveGoalSettingAction } from "@/lib/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function SettingsPage() {
  const now = new Date()
  const [goals, qualificationMasters, statusMasters] = await Promise.all([
    prisma.goalSetting.findMany({ orderBy: [{ year: "desc" }, { month: "desc" }] }),
    prisma.qualificationMaster.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.statusMaster.findMany({ orderBy: [{ scope: "asc" }, { sortOrder: "asc" }] }),
  ])

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-sm">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">設定</h1>
        <p className="mt-1 text-sm text-zinc-500">MVP では目標値とマスタ確認を行います。</p>
      </div>

      <Card className="rounded-3xl border-white/70 bg-white/90 shadow-sm">
        <CardHeader><CardTitle className="text-lg font-bold text-zinc-900">目標設定</CardTitle></CardHeader>
        <CardContent>
          <form action={saveGoalSettingAction} className="grid gap-4 md:grid-cols-5">
            <input type="hidden" name="periodType" value="monthly" />
            <label className="space-y-1 text-sm"><span>年</span><input name="year" defaultValue={String(now.getFullYear())} className="h-10 w-full rounded-2xl border border-zinc-200 px-3" /></label>
            <label className="space-y-1 text-sm"><span>月</span><input name="month" defaultValue={String(now.getMonth() + 1)} className="h-10 w-full rounded-2xl border border-zinc-200 px-3" /></label>
            <label className="space-y-1 text-sm"><span>月間売上目標</span><input name="monthlyRevenueTarget" defaultValue={goals.find((goal) => goal.periodType === "monthly")?.monthlyRevenueTarget ?? 8000000} className="h-10 w-full rounded-2xl border border-zinc-200 px-3" /></label>
            <label className="space-y-1 text-sm"><span>年間売上目標</span><input name="annualRevenueTarget" defaultValue={goals.find((goal) => goal.periodType === "yearly")?.annualRevenueTarget ?? 96000000} className="h-10 w-full rounded-2xl border border-zinc-200 px-3" /></label>
            <label className="space-y-1 text-sm"><span>平均単価</span><input name="averageUnitPrice" defaultValue={goals[0]?.averageUnitPrice ?? 800000} className="h-10 w-full rounded-2xl border border-zinc-200 px-3" /></label>
            <button type="submit" className="h-10 rounded-2xl bg-rose-500 px-4 text-sm font-semibold text-white md:col-span-5">保存</button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-3xl border-white/70 bg-white/90 shadow-sm">
          <CardHeader><CardTitle className="text-lg font-bold text-zinc-900">ランク判定用資格マスタ</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {qualificationMasters.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl bg-zinc-50 px-3 py-2">
                <span>{item.name}</span>
                <strong>{item.rankCategory}</strong>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-white/70 bg-white/90 shadow-sm">
          <CardHeader><CardTitle className="text-lg font-bold text-zinc-900">ステータスマスタ</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {statusMasters.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl bg-zinc-50 px-3 py-2">
                <span>{item.label}</span>
                <strong>{item.scope}</strong>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
