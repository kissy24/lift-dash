# [ISSUE-010] ダッシュボードグラフ

## 概要

ダッシュボードにトレーニング実績を可視化する主要グラフを追加する。

## 背景・目的

記録した重量・ボリューム・頻度・部位別傾向をひと目で確認できるようにし、継続状況と成長傾向を把握しやすくする。

## 受け入れ条件 (Acceptance Criteria)

- [ ] `/dashboard`で種目別最大重量推移を折れ線グラフで表示できる
- [ ] `/dashboard`で種目別総ボリューム推移を棒グラフで表示できる
- [ ] `/dashboard`でトレーニング頻度ヒートマップを表示できる
- [ ] `/dashboard`で部位別トレーニング割合をドーナツグラフで表示できる
- [ ] `/dashboard`で週次ボリューム合計を棒グラフで表示できる
- [ ] 記録がない場合でも空状態を表示し、画面が壊れない
- [ ] 対応するテストがすべてグリーン

## 技術詳細

- Rechartsを使って折れ線・棒・ドーナツグラフを実装する
- ヒートマップは新規依存を追加せず、CSS gridで実装する
- 集計ロジックは`lib/workouts/dashboard-metrics.ts`に純粋関数として切り出す
- ページのServer Componentでセッション・セット・種目情報を取得し、Client Componentへ表示用データのみ渡す
- `SUM(weight × reps)`は重量0の自重系セットも安全に扱う

## 関連ファイル（予定）

- `app/dashboard/page.tsx`
- `components/charts/MaxWeightLineChart.tsx`
- `components/charts/VolumeBarChart.tsx`
- `components/charts/FrequencyHeatmap.tsx`
- `components/charts/MuscleGroupDonutChart.tsx`
- `components/charts/WeeklyVolumeChart.tsx`
- `lib/workouts/dashboard-metrics.ts`

## 依存 Issue

- ISSUE-005（先に完了が必要）
- ISSUE-009（先に完了が必要）

## 見積もり

- [ ] Small（〜2h）
- [ ] Medium（〜1日）
- [x] Large（〜3日）
