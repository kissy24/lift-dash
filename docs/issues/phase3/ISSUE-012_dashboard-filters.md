# [ISSUE-012] ダッシュボードフィルター

## 概要

ダッシュボードに期間・種目フィルターを追加し、グラフと自己ベスト表示を絞り込めるようにする。

## 背景・目的

直近30日・90日などの期間や特定種目に絞って推移を確認できるようにし、分析したい範囲を明確にする。

## 受け入れ条件 (Acceptance Criteria)

- [ ] `/dashboard`で期間フィルターを選択できる
- [ ] 期間は直近30日 / 90日 / 180日 / 1年 / 全期間から選択できる
- [ ] `/dashboard`で全種目または特定種目を選択できる
- [ ] フィルター状態をURL queryで表現できる
- [ ] 不正なqueryは安全な初期値へフォールバックする
- [ ] フィルター変更後もグラフ・自己ベストカードが一貫したデータを表示できる
- [ ] 対応するテストがすべてグリーン

## 技術詳細

- URL query（例: `?range=90d&exercise=<id>`）を状態源とする
- フィルターqueryのバリデーションは`lib/validations`または純粋関数で実装する
- 期間フィルターはServer Component側の取得・集計対象に反映する
- 種目フィルターは対象種目のグラフ・PR表示に反映する
- Client Componentは選択UIとリンク生成に限定し、DBアクセスは行わない

## 関連ファイル（予定）

- `app/dashboard/page.tsx`
- `components/workouts/DashboardFilters.tsx`
- `lib/workouts/dashboard-filters.ts`
- `lib/workouts/dashboard-metrics.ts`
- `lib/workouts/personal-records.ts`

## 依存 Issue

- ISSUE-010（先に完了が必要）
- ISSUE-011（先に完了が必要）

## 見積もり

- [ ] Small（〜2h）
- [x] Medium（〜1日）
- [ ] Large（〜3日）
