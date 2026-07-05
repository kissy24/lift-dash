# [ISSUE-008] 前回実績値の自動補完

## 概要

記録入力時に、選択した種目の直近セッションで使用したセット値を自動補完する。

## 背景・目的

継続的なトレーニングでは前回値を基準にすることが多いため、入力回数を減らしながら漸進性を確認しやすくする。

## 受け入れ条件 (Acceptance Criteria)

- [ ] 種目ごとに日付が最も新しいセッションのセット値を取得できる
- [ ] 前回値がある場合はプリセットのデフォルト値より優先して展開される
- [ ] 前回値がない場合はプリセット値、どちらもない場合は手動入力初期値を使う
- [ ] 前回値のセット数と各セットの重量・レップ数を再現できる
- [ ] 補完後の値を自由に編集できる
- [ ] 対応するテストがすべてグリーン

## 技術詳細

- 前回値取得はServer Componentまたはserver-only queryに限定する
- `workout_sessions.date desc`、同日の場合は`created_at desc`で直近を決定する
- 取得結果は種目IDをキーとするフォーム初期値へ変換する
- N+1 queryを避け、対象種目をまとめて取得する

## 関連ファイル（予定）

- `app/log/new/page.tsx`
- `components/forms/WorkoutForm.tsx`
- `lib/queries/workout.ts`
- `lib/workouts/previous-values.ts`

## 依存 Issue

- ISSUE-005（先に完了が必要）
- ISSUE-007（先に完了が必要）

## 見積もり

- [ ] Small（〜2h）
- [x] Medium（〜1日）
- [ ] Large（〜3日）
