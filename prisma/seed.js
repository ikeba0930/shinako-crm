/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient, CandidateOverallStatus, CustomerRank, GoalPeriodType, MasterScope, SelectionStatus } = require("@prisma/client")
const { PrismaPg } = require("@prisma/adapter-pg")

const connectionString = process.env.DATABASE_URL?.trim()

if (!connectionString) {
  throw new Error("DATABASE_URL is not set")
}

const adapter = new PrismaPg(connectionString)
const prisma = new PrismaClient({ adapter })

const S_QUALIFICATIONS = [
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
]

const A_QUALIFICATIONS = [
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
]

const candidateStatuses = [
  ["NEW", "新規流入"],
  ["FIRST_CONTACTED", "初回対応済"],
  ["INTERVIEWED", "面談済"],
  ["PROPOSING", "提案中"],
  ["IN_PROGRESS", "選考中"],
  ["OFFERED", "内定"],
  ["ACCEPTED", "承諾"],
  ["JOINED", "入社"],
  ["ON_HOLD", "保留"],
  ["DROPPED", "離脱"],
  ["CLOSED", "終了"],
]

const selectionStatuses = [
  ["PROPOSED", "提案済"],
  ["WAITING_ENTRY", "応募待ち"],
  ["ENTERED", "エントリー済"],
  ["DOCUMENT_SCREENING", "書類選考中"],
  ["PASSED_DOCUMENT", "書類通過"],
  ["FIRST_INTERVIEW_ADJUSTING", "一次面談調整中"],
  ["FIRST_INTERVIEW_DONE", "一次面談済"],
  ["SECOND_INTERVIEW_ADJUSTING", "二次面談調整中"],
  ["SECOND_INTERVIEW_DONE", "二次面談済"],
  ["OFFERED", "内定"],
  ["ACCEPTED", "承諾"],
  ["JOINING_SCHEDULED", "入社予定"],
  ["JOINED", "入社済"],
  ["DECLINED", "辞退"],
  ["REJECTED", "見送り"],
  ["CLOSED", "クローズ"],
]

function daysAgo(days) {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - days)
  return date
}

function daysAhead(days) {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + days)
  return date
}

async function main() {
  await prisma.attachment.deleteMany()
  await prisma.candidateCompanyProfile.deleteMany()
  await prisma.qualification.deleteMany()
  await prisma.workHistory.deleteMany()
  await prisma.education.deleteMany()
  await prisma.selection.deleteMany()
  await prisma.candidate.deleteMany()
  await prisma.goalSetting.deleteMany()
  await prisma.qualificationMaster.deleteMany()
  await prisma.statusMaster.deleteMany()

  await prisma.qualificationMaster.createMany({
    data: [
      ...S_QUALIFICATIONS.map((name, index) => ({ name, rankCategory: CustomerRank.S, sortOrder: index })),
      ...A_QUALIFICATIONS.map((name, index) => ({ name, rankCategory: CustomerRank.A, sortOrder: 100 + index })),
    ],
  })

  await prisma.statusMaster.createMany({
    data: [
      ...candidateStatuses.map(([code, label], index) => ({ scope: MasterScope.candidate, code, label, sortOrder: index })),
      ...selectionStatuses.map(([code, label], index) => ({ scope: MasterScope.selection, code, label, sortOrder: index })),
    ],
  })

  const now = new Date()
  await prisma.goalSetting.createMany({
    data: [
      { periodType: GoalPeriodType.yearly, year: now.getFullYear(), month: 0, annualRevenueTarget: 96000000, averageUnitPrice: 800000 },
      { periodType: GoalPeriodType.monthly, year: now.getFullYear(), month: now.getMonth() + 1, monthlyRevenueTarget: 8000000, averageUnitPrice: 800000 },
    ],
  })

  const candidates = [
    ["C-0001", "田中 一真", "タナカ カズマ", "男性", 38, "candidate001@example.com", "施工管理", "東京都", 720, 820, "佐藤", 18, 17, 15, 12, CandidateOverallStatus.IN_PROGRESS, CustomerRank.S, ["1級施工管理技士（建築）"], "転職活動中"],
    ["C-0002", "鈴木 健太", "スズキ ケンタ", "男性", 29, "candidate002@example.com", "電気工事", "神奈川県", 460, 540, "佐藤", 10, 9, 6, 4, CandidateOverallStatus.PROPOSING, CustomerRank.A, ["第二種電気工事士"], "転職活動中"],
    ["C-0003", "高橋 美咲", "タカハシ ミサキ", "女性", 34, "candidate003@example.com", "品質管理", "千葉県", 430, 500, "村上", 25, 24, 21, 19, CandidateOverallStatus.INTERVIEWED, CustomerRank.B, [], "離職中"],
    ["C-0004", "伊藤 恒一", "イトウ コウイチ", "男性", 52, "candidate004@example.com", "設備保全", "埼玉県", 580, 620, "村上", 42, 40, 35, 30, CandidateOverallStatus.ON_HOLD, CustomerRank.C, [], "転職時期未定"],
    ["C-0005", "山本 遥", "ヤマモト ハルカ", "女性", 31, "candidate005@example.com", "物流管理", "大阪府", 410, 490, "井上", 14, 13, 11, 8, CandidateOverallStatus.OFFERED, CustomerRank.A, ["フォークリフト運転技能講習"], "転職活動中"],
    ["C-0006", "中村 直人", "ナカムラ ナオト", "男性", 44, "candidate006@example.com", "自動車整備", "愛知県", 530, 620, "井上", 9, 8, 7, 5, CandidateOverallStatus.ACCEPTED, CustomerRank.S, ["1級自動車整備士"], "退職日確定"],
    ["C-0007", "小林 翼", "コバヤシ ツバサ", "男性", 27, "candidate007@example.com", "製造オペレーター", "群馬県", 360, 420, "高田", 6, 4, 2, null, CandidateOverallStatus.FIRST_CONTACTED, CustomerRank.B, [], "転職活動中"],
    ["C-0008", "加藤 真由", "カトウ マユ", "女性", 47, "candidate008@example.com", "衛生管理", "福岡県", 510, 560, "高田", 60, 58, 54, 50, CandidateOverallStatus.JOINED, CustomerRank.A, ["衛生管理者"], "転職活動中"],
    ["C-0009", "吉田 翔", "ヨシダ ショウ", "男性", 50, "candidate009@example.com", "運行管理", "兵庫県", 620, 700, "佐藤", 32, 31, 29, 27, CandidateOverallStatus.PROPOSING, CustomerRank.S, ["運行管理者"], "転職活動中"],
    ["C-0010", "松本 彩花", "マツモト アヤカ", "女性", 26, "candidate010@example.com", "事務", "東京都", 320, 380, "村上", 3, null, null, null, CandidateOverallStatus.NEW, CustomerRank.C, [], "転職時期未定"],
  ]

  for (let index = 0; index < candidates.length; index += 1) {
    const [candidateCode, name, nameKana, gender, age, email, desiredJobType, desiredLocation, currentAnnualIncome, desiredAnnualIncome, ownerName, inflow, firstResponse, interview, proposal, overallStatus, customerRank, qualificationNames, jobSearchStatus] = candidates[index]

    const candidate = await prisma.candidate.create({
      data: {
        candidateCode,
        name,
        nameKana,
        gender,
        age,
        inflowSource: index % 2 === 0 ? "ポータル" : "失業保険",
        birthDate: new Date(1990, index % 12, Math.min(index + 1, 28)),
        phone: `090-1111-00${String(index + 1).padStart(2, "0")}`,
        email,
        desiredJobType,
        desiredLocation,
        currentAnnualIncome,
        desiredAnnualIncome,
        ownerName,
        inflowDate: inflow === null ? null : daysAgo(inflow),
        firstResponseDate: firstResponse === null ? null : daysAgo(firstResponse),
        interviewDate: interview === null ? null : daysAgo(interview),
        proposalDate: proposal === null ? null : daysAgo(proposal),
        overallStatus,
        customerRank,
        rankAutoResult: customerRank,
        rankSource: "auto",
        jobSearchStatus,
        employmentStatus: jobSearchStatus,
        desiredTiming: jobSearchStatus,
        qualificationText: qualificationNames.join("、"),
        managementExperience: index % 3 === 0 ? "3名チームのリーダー経験あり" : "なし",
        pcSkills: "Excel, Word, Google Workspace",
        languageSkills: index % 4 === 0 ? "英語日常会話" : "特になし",
        transferableSkills: "報連相, 改善提案, 安全意識",
        strengths: "継続力があり、現場での対応品質が安定",
        reasonForChange: "年収改善と働き方の見直し",
        resumePreferenceText: "夜勤なし、通勤90分以内",
        otherConditions: "社宅制度があれば尚可",
        moneyNote: index % 2 === 0 ? "次回給与までの生活費は確保済み" : "入社時期は早め希望",
        internalMemo: "seedデータ: 面談メモと希望条件の確認済み",
        educations: {
          create: [{ year: 2013 + (index % 4), month: 3, category: "卒業", schoolName: "〇〇工業高校 機械科", sortOrder: 1 }],
        },
        workHistories: {
          create: [{
            joinedYear: 2016 + (index % 5),
            joinedMonth: 4,
            leftYear: index % 3 === 0 ? null : 2024,
            leftMonth: index % 3 === 0 ? null : 12,
            isCurrent: index % 3 === 0,
            companyName: `サンプル製造株式会社 ${index + 1}`,
            industry: "製造",
            employeeCount: "101-300名",
            departmentRole: "製造部 / 班長候補",
            employmentType: "正社員",
            workDescription: "ライン管理、品質確認、設備点検",
            achievements: "改善提案で不良率を低減",
            advisorMemo: "安定就業。対人コミュニケーション良好",
            sortOrder: 1,
          }],
        },
        qualifications: {
          create: qualificationNames.map((qualificationName, qIndex) => ({
            qualificationName,
            acquiredYear: 2018 + qIndex,
            acquiredMonth: 6,
            isRankRelevant: true,
            sortOrder: qIndex,
          })),
        },
        companyProfiles: {
          create: [{ companyName: "サンプル工業株式会社", selfPr: "現場改善と安全品質の両立に強みがあります。", motivation: "安定した製造現場で長期就業したいため。", sortOrder: 1 }],
        },
        attachments: {
          create: [{ name: "resume.pdf", filePath: "/dummy/resume.pdf", mimeType: "application/pdf", isOutput: true }],
        },
      },
    })

    const selectionTemplates = [
      {
        companyName: "東日本設備株式会社",
        jobType: desiredJobType,
        unitPrice: 900000,
        feeRate: 0.35,
        selectionStatus: index % 5 === 0 ? SelectionStatus.OFFERED : SelectionStatus.ENTERED,
        proposedAt: daysAgo(8 + index),
        entryAt: daysAgo(6 + index),
        passedAt: index % 2 === 0 ? daysAgo(4 + index) : null,
        interviewScheduledAt: index % 2 === 0 ? daysAgo(3 + index) : null,
        firstInterviewAt: index % 3 === 0 ? daysAgo(2 + index) : null,
        secondInterviewAt: index % 5 === 0 ? daysAgo(1 + index) : null,
        offerAt: index % 5 === 0 ? daysAgo(index) : null,
        offerAcceptedAt: index % 6 === 0 ? daysAgo(Math.max(index - 1, 0)) : null,
        joiningAt: index % 7 === 0 ? daysAhead(10) : null,
      },
      {
        companyName: "サンプル物流株式会社",
        jobType: desiredJobType,
        unitPrice: 750000,
        feeRate: 0.3,
        selectionStatus: index % 4 === 0 ? SelectionStatus.PASSED_DOCUMENT : SelectionStatus.PROPOSED,
        proposedAt: daysAgo(5 + index),
        entryAt: index % 4 === 0 ? daysAgo(3 + index) : null,
        passedAt: index % 4 === 0 ? daysAgo(1 + index) : null,
      },
    ]

    await prisma.selection.createMany({
      data: selectionTemplates.map((selection, selectionIndex) => ({
        candidateId: candidate.id,
        companyName: selection.companyName,
        jobType: selection.jobType,
        unitPrice: selection.unitPrice,
        feeRate: selection.feeRate,
        selectionStatus: selection.selectionStatus,
        ownerName,
        proposedAt: selection.proposedAt,
        entryAt: selection.entryAt,
        passedAt: selection.passedAt,
        interviewScheduledAt: selection.interviewScheduledAt || null,
        firstInterviewAt: selection.firstInterviewAt || null,
        secondInterviewAt: selection.secondInterviewAt || null,
        offerAt: selection.offerAt || null,
        offerAcceptedAt: selection.offerAcceptedAt || null,
        joiningAt: selection.joiningAt || null,
        notes: `seedデータ ${selectionIndex + 1}: 企業との進捗メモ`,
      })),
    })

    const selections = await prisma.selection.findMany({ where: { candidateId: candidate.id } })
    await prisma.candidate.update({
      where: { id: candidate.id },
      data: {
        proposalCount: selections.filter((selection) => selection.proposedAt).length,
        activeSelectionCount: selections.filter((selection) => !["DECLINED", "REJECTED", "CLOSED", "JOINED"].includes(selection.selectionStatus)).length,
      },
    })
  }

  console.log("Seed completed.")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
