# ひとなりDB

人材紹介事業の立ち上げ初期向けに、求職者管理・選考管理・CSV出力・ダッシュボード集計を最短で回すための MVP です。

## 実装済み機能

- ダッシュボード
  - 月間 KPI
  - ファネル
  - 売上見込
  - ランク別 / ステータス別集計
  - 担当者別サマリー
  - アラート
- 求職者一覧
  - 検索
  - 絞り込み
  - 並び替え
  - CSV 出力
  - 新規登録
- 求職者詳細兼編集
  - 基本情報
  - 転職条件
  - ランク手動上書き
  - 進捗日付
  - 内部メモ
  - 保有資格の更新
  - 求職者ごとの選考追加
- 選考管理一覧
  - ステータスタブ
  - キーワード検索
  - 担当者絞り込み
  - 行単位更新
  - 停滞アラート表示
  - CSV 出力
- 設定
  - 目標値
  - ランク判定用資格マスタ確認
  - ステータスマスタ確認
- seed データ
  - 求職者 10 名
  - S/A/B/C をすべて含む
  - 各求職者に複数選考データあり

## 技術構成

- Next.js 16
- TypeScript
- Tailwind CSS
- shadcn/ui ベース
- Prisma 7
- SQLite

## セットアップ手順

### 1. 前提

- Node.js は `22.x` 推奨
- `.env` を用意

`.env`

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="dummy-secret"
```

### 2. 依存インストール

```powershell
cd C:\Users\share_no9\shinako-crm
npm.cmd install
```

### 3. Prisma 反映

```powershell
npx.cmd prisma generate
npx.cmd prisma db push --force-reset
```

### 4. seed 投入

```powershell
npm.cmd run db:seed
```

## 開発サーバー起動方法

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-dev.ps1 -Background
```

停止:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\stop-dev.ps1
```

アクセス先:

- `http://localhost:3000/dashboard`
- `http://localhost:3000/candidates`
- `http://localhost:3000/selections`
- `http://localhost:3000/settings`

## 検証済みコマンド

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

## CSV 出力仕様

### 求職者一覧 CSV

- URL: `/api/csv/candidates`
- BOM 付き UTF-8
- Excel / スプレッドシートで開きやすい形式
- 主な列:
  - 求職者ID
  - 氏名
  - 性別
  - 年齢
  - 現在年収
  - 希望年収
  - 顧客ランク
  - 希望職種
  - 全体ステータス
  - 提案求人数
  - 選考企業数
  - 流入日
  - 面談日
  - 入社日
  - 担当者

### 選考一覧 CSV

- URL: `/api/csv/selections`
- BOM 付き UTF-8
- 主な列:
  - 求職者名
  - 年齢
  - 希望職種
  - ランク
  - 企業名
  - 募集職種
  - 単価
  - 紹介料率
  - 企業別ステータス
  - 提案日
  - エントリー日
  - 書類通過日
  - 面談設置日
  - 一次面談日
  - 二次面談日
  - 内定日
  - 承諾日
  - 入社日
  - 対応メモ
  - 担当者

## ランク判定ロジック

実装ファイル:

- [rank.ts](/C:/Users/share_no9/shinako-crm/src/lib/rank.ts)

判定順:

1. S 資格を 1 つでも保有していれば `S`
2. S がなく A 資格を 1 つでも保有していれば `A`
3. S/A がなく、`離職中` / `退職日確定` / `転職活動中` を含めば `B`
4. 上記以外は `C`

補足:

- 自動判定結果は `rankAutoResult`
- 表示値は `customerRank`
- 手動上書き時は `rankManualOverride = true`
- 手動上書き時は `rankSource = manual`

## ダッシュボード計算ロジック

実装ファイル:

- [dashboard.ts](/C:/Users/share_no9/shinako-crm/src/lib/dashboard.ts)

初期 MVP の基準期間:

- 月間

KPI 集計基準:

- 流入数: `Candidate.inflowDate`
- 面談数: `Candidate.interviewDate`
- 提案数: `Selection.proposedAt`
- エントリー数: `Selection.entryAt`
- 書類通過数: `Selection.passedAt`
- 一次面談数: `Selection.firstInterviewAt`
- 二次面談数: `Selection.secondInterviewAt`
- 内定数: `Selection.offerAt`
- 承諾数: `Selection.offerAcceptedAt`
- 入社数: `Selection.joiningAt`

売上見込:

- 総売上見込: `offerAt` ベース
- 今月売上見込: `offerAcceptedAt` 優先、なければ `offerAt`
- 今月確定売上: `joiningAt` ベース
- 金額計算: `unitPrice * feeRate`

ファネル逆算:

- 月間売上目標 / 平均単価 = 必要入社数
- 以降は現在の実績 CVR で逆算
- CVR が 0 の場合は暫定のデフォルト率を使用

アラート:

- 面談後未提案
- 提案後未エントリー
- エントリー後 14 日以上停滞
- 内定後未承諾停滞
- 初回対応未実施

## ディレクトリ構成

```text
src/
  app/
    api/csv/
    candidates/
    dashboard/
    selections/
    settings/
  components/
    app-sidebar.tsx
    ui/
  lib/
    actions.ts
    constants.ts
    dashboard.ts
    db.ts
    format.ts
    rank.ts
prisma/
  schema.prisma
  seed.js
scripts/
  start-dev.ps1
  stop-dev.ps1
```

## データモデル概要

### Candidate

- 求職者マスタ
- 個人情報、転職条件、管理項目、集計日付を保持

### Selection

- `1求職者 × 1企業`
- 進捗、日付、売上見込を保持

### 補助モデル

- `Education`
- `WorkHistory`
- `Qualification`
- `CandidateCompanyProfile`
- `Attachment`
- `GoalSetting`
- `QualificationMaster`
- `StatusMaster`

## 今後の拡張案

- 企業マスタの独立
- 担当者マスタ化
- 学歴 / 職歴 UI の本格編集
- 添付ファイル実アップロード
- PDF 出力
- JSON 出力整形
- 年間 / 日次ダッシュボード強化
- 認証 / 権限管理
