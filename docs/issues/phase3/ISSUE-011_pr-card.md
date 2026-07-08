# [ISSUE-011] 自己ベストカード

## 概要

ダッシュボードに種目ごとの自己ベスト（PR）カードを追加する。

## 背景・目的

筋力向上の成果をすぐ確認できるようにし、最大重量の更新状況を把握しやすくする。

## 受け入れ条件 (Acceptance Criteria)

- [ ] `/dashboard`で種目ごとの歴代最大重量を表示できる
- [ ] 自己ベストの対象日へ`/log/[date]`リンクで移動できる
- [ ] 同一最大重量が複数ある場合は最新日を表示できる
- [ ] 種目名、重量、レップ数、日付を確認できる
- [ ] 記録がない場合は空状態を表示できる
- [ ] 対応するテストがすべてグリーン

## 技術詳細

- 集計ロジックは`lib/workouts/personal-records.ts`に純粋関数として切り出す
- 最大重量の判定は`weight`を優先し、同重量の場合は`date desc`、同日なら`created_at desc`で最新を選ぶ
- 表示コンポーネントはServer Componentから渡された表示用データだけを扱う
- 既存の`workout_sessions` / `workout_sets` / `exercises`を利用し、DBスキーマ追加はしない

## 関連ファイル（予定）

- `app/dashboard/page.tsx`
- `components/workouts/PersonalRecordCards.tsx`
- `lib/workouts/personal-records.ts`

## 依存 Issue

- ISSUE-005（先に完了が必要）

## 見積もり

- [ ] Small（〜2h）
- [x] Medium（〜1日）
- [ ] Large（〜3日）
