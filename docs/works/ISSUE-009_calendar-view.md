# [ISSUE-009] カレンダービュー 作業記録

## 対象

- GitHub Issue: #24
- PR: 未作成
- ブランチ: `feat/ISSUE-009_calendar-view`

## 実施日

- 2026-07-08

## 実施内容

- `/log` に月間カレンダーを追加
- URL query `month=yyyy-MM` を表示月の状態源として扱うように変更
- 不正な `month` query は当月へフォールバックするよう実装
- date-fnsで月間カレンダーの週グリッド、前月・翌月リンク、日付リンクを生成
- トレーニング記録がある日をカレンダー上で視覚的に区別し、`/log/[date]` へ遷移できるようにした
- 既存の日付別一覧表示はカレンダー下に維持
- 新規カレンダー依存パッケージは追加せず、既存の date-fns とUIで実装

## 発生した問題と対応

- `Date` の厳密比較がタイムゾーンに依存したため、カレンダー月のテストは年月日フィールドで検証するようにした
- `exactOptionalPropertyTypes` により optional property へ `undefined` を明示代入できなかったため、値がない場合はプロパティ自体を省略する実装にした
- Next.js 15 の PageProps 型に合わせ、`searchParams` は Promise として扱う実装にした

## 主なコミット

- 未コミット

## 検証結果

- 関連テスト:
  - `bun run test:run -- lib/workouts/calendar.test.ts components/workouts/WorkoutCalendar.test.tsx app/log/page.test.tsx`: PASS
- `bun run type-check`: PASS
- `bun run lint`: PASS
- `bun run test:run`: PASS（39 files / 146 tests）
- `NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key bun run build`: PASS
- `osv-scanner scan source -L bun.lock`: PASS（794 packages / No issues found）
- GitHub Actions: 未実施

## 注意事項

- `next-env.d.ts` は Next.js の build / type-check で生成差分が出る場合があるため、目的外の差分としてコミットしない
