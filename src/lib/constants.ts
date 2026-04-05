export const CUSTOMER_RANK_LABELS = {
  S: "S",
  A: "A",
  B: "B",
  C: "C",
} as const

export const CUSTOMER_RANK_BADGE = {
  S: "bg-rose-100 text-rose-700",
  A: "bg-orange-100 text-orange-700",
  B: "bg-sky-100 text-sky-700",
  C: "bg-slate-100 text-slate-700",
} as const

export const INFLOW_ROUTE_OPTIONS = [
  { value: "ポータル（ブルー）", label: "ポータル（ブルー）" },
  { value: "失業保険", label: "失業保険" },
] as const

export const CANDIDATE_GENDER_OPTIONS = [
  { value: "男性", label: "男性" },
  { value: "女性", label: "女性" },
  { value: "その他", label: "その他" },
] as const

export const CANDIDATE_OWNER_OPTIONS = [
  "池場敬太",
  "土師優翔",
  "銭谷勇太",
  "共田悠馬",
  "水見倫",
  "杉山翔太",
  "高木琴乃",
] as const

export const CANDIDATE_AGE_OPTIONS = Array.from({ length: 48 }, (_, index) => String(index + 18))

export const PREFECTURE_OPTIONS = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
] as const

export const CANDIDATE_JOB_OPTIONS = [
  "営業",
  "事務",
  "経理",
  "総務",
  "人事",
  "受付",
  "販売",
  "接客",
  "コールセンター",
  "カスタマーサポート",
  "マーケティング",
  "広報",
  "企画",
  "デザイナー",
  "エンジニア",
  "WEB制作",
  "施工管理",
  "製造",
  "軽作業",
  "物流",
  "ドライバー",
  "警備",
  "介護",
  "看護",
  "保育",
  "清掃",
  "飲食",
  "ホテル",
  "不動産",
  "その他",
] as const

export const CANDIDATE_CONDITION_OPTIONS = [
  "離職中",
  "退職日確定している",
  "転職活動中",
  "転職時期未定",
] as const

export const EXTRA_QUALIFICATION_OPTIONS = [
  "普通自動車免許",
  "特になし",
] as const

export const UNEMPLOYMENT_INSURANCE_CONTRACT_OPTIONS = [
  { value: "あり", label: "あり" },
  { value: "なし", label: "なし" },
] as const

export function inflowRouteMatches(currentValue: string | null | undefined, selectedValue: string) {
  if (!selectedValue) return true
  if (selectedValue === "ポータル（ブルー）") {
    return currentValue === "ポータル（ブルー）" || currentValue === "ポータル"
  }

  return currentValue === selectedValue
}

export const CANDIDATE_STATUS_LABELS = {
  NEW: "新規流入",
  FIRST_CONTACTED: "初回対応済",
  INTERVIEWED: "面談済",
  PROPOSING: "提案中",
  IN_PROGRESS: "選考中",
  OFFERED: "内定",
  ACCEPTED: "承諾",
  JOINED: "入社",
  ON_HOLD: "保留",
  DROPPED: "離脱",
  CLOSED: "終了",
} as const

export const SELECTION_STATUS_LABELS = {
  PROPOSED: "提案済",
  WAITING_ENTRY: "応募待ち",
  ENTERED: "エントリー済",
  DOCUMENT_SCREENING: "書類選考中",
  PASSED_DOCUMENT: "書類通過",
  FIRST_INTERVIEW_ADJUSTING: "一次面談調整中",
  FIRST_INTERVIEW_DONE: "一次面談済",
  SECOND_INTERVIEW_ADJUSTING: "二次面談調整中",
  SECOND_INTERVIEW_DONE: "二次面談済",
  OFFERED: "内定",
  ACCEPTED: "承諾",
  JOINING_SCHEDULED: "入社予定",
  JOINED: "入社済",
  DECLINED: "辞退",
  REJECTED: "見送り",
  CLOSED: "クローズ",
} as const

export const SELECTION_STATUS_BADGE = {
  PROPOSED: "bg-zinc-100 text-zinc-700",
  WAITING_ENTRY: "bg-amber-100 text-amber-700",
  ENTERED: "bg-blue-100 text-blue-700",
  DOCUMENT_SCREENING: "bg-violet-100 text-violet-700",
  PASSED_DOCUMENT: "bg-cyan-100 text-cyan-700",
  FIRST_INTERVIEW_ADJUSTING: "bg-indigo-100 text-indigo-700",
  FIRST_INTERVIEW_DONE: "bg-indigo-100 text-indigo-700",
  SECOND_INTERVIEW_ADJUSTING: "bg-fuchsia-100 text-fuchsia-700",
  SECOND_INTERVIEW_DONE: "bg-fuchsia-100 text-fuchsia-700",
  OFFERED: "bg-emerald-100 text-emerald-700",
  ACCEPTED: "bg-green-100 text-green-700",
  JOINING_SCHEDULED: "bg-lime-100 text-lime-700",
  JOINED: "bg-green-200 text-green-800",
  DECLINED: "bg-rose-100 text-rose-700",
  REJECTED: "bg-red-100 text-red-700",
  CLOSED: "bg-slate-200 text-slate-700",
} as const

export const S_RANK_QUALIFICATIONS = [
  "技術士（建設部門）",
  "1級施工管理技士（建築）",
  "1級施工管理技士（土木）",
  "1級施工管理技士（管工事）",
  "1級施工管理技士（電気工事）",
  "1級施工管理技士（造園）",
  "第一種電気工事士",
  "一級建築士",
  "第三種電気主任技術者",
  "1級自動車整備士",
  "特殊溶接",
  "運行管理者",
] as const

export const A_RANK_QUALIFICATIONS = [
  "第二種電気工事士",
  "フォークリフト運転技能講習",
  "玉掛け",
  "クレーン",
  "大型自動車免許",
  "2級自動車整備士",
  "衛生管理者",
  "消防設備士",
  "危険物取扱者乙種4類",
  "けん引免許",
  "自動車検査員",
] as const
