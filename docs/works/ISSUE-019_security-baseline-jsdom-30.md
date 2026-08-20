# [ISSUE-019] セキュリティ基準線回復とjsdom 30移行 作業記録

## 対象

- GitHub Issue: #56 `[ISSUE-019] セキュリティ基準線回復とjsdom 30移行`
- 置き換え対象PR: #55
- PR: #61
- ブランチ: `chore/ISSUE-019_security-baseline-jsdom-30`

## 実施日

- 2026-08-17〜2026-08-20

## 実施内容

- `app/log/page.test.tsx`で表示対象月を明示し、実行月に依存するテストを安定化した。
- `jsdom`を`30.0.1`へ更新し、脆弱な`undici 7.28.0`を親依存更新で`8.10.0`へ置き換えた。
- `postcss`を`8.5.23`へ更新し、推移依存の`nanoid`を`3.3.18`へ更新した。
- `brace-expansion`、`fast-uri`、`js-yaml`のoverridesを脆弱性修正版へ更新した。
- `brace-expansion 5.0.9`向けにBun/Minimatch互換パッチを移植した。
- `jsdom 30.0.1`に合わせ、Node.js engineとREADMEの要件を`^22.22.2 || ^24.15.0 || >=26.0.0`へ更新した。
- 依存・Node要件の回帰テストを更新した。

## 発生した問題と対応

- 既存の記録一覧テストが実行月を暗黙利用し、2026年8月には2026年7月の見出しを取得できなかった。テスト入力で`month=2026-07`を明示した。
- `brace-expansion 5.0.9`は5.0.8と同様にMinimatch旧版が期待するdefault/callable exportを持たなかった。脆弱性修正を維持したまま既存互換パッチを5.0.9へ移植した。
- `next build`が`next-env.d.ts`を自動更新したが目的外差分のためコミット対象から除外した。

## 7日間クールタイム確認

- `jsdom 30.0.1`: 2026-07-29公開。
- `brace-expansion 5.0.9`: 2026-07-30公開。
- `fast-uri 3.1.5`: 2026-07-31公開。
- `js-yaml 4.3.1`: 2026-07-31公開。
- `postcss 8.5.23`: 2026-07-24公開。
- `nanoid 3.3.18`: 2026-08-07公開。
- `undici 8.10.0`: 2026-08-03公開。

## 主なコミット

- `302f889 chore(deps): restore secure dependency baseline (#56)`

## 検証結果

- TDD Red（日時依存テスト）: 1 failed / 3 passed
- TDD Red（jsdom・Node要件）: 1 failed / 4 passed
- 対象テスト: 成功（3 files / 12 tests）
- `bunx bun@1.2.0 install --frozen-lockfile`: 成功（no changes）
- `bun run type-check`: 成功
- `bun run lint`: 成功（ESLint warnings/errors 0）
- `bun run test:run`: 成功（47 files / 175 tests）
- `bun run test:coverage`: 成功（Statements 88.12%、Lines 93.15%）
- `bun run build`: 成功
- OSV Scanner: 成功（722 packages / No issues found）
- サブエージェントによるコミット前確認: 成功（型チェック、lint、47 files / 175 tests）
- GitHub Actions Quality: 成功（run 32357546829）
- GitHub Actions Security Audit: 成功（run 32357513225）
- GitHub Advanced Security OSV Scanner: 成功（run 96389881732）

## 注意事項

- `jsdom 30`はNode.js `^22.22.2 || ^24.15.0 || >=26.0.0`を要求する。
- `brace-expansion`を更新する場合は互換パッチの適用位置とMinimatch 3/9/10の実動を再確認する。
- `next build`後に目的外の`next-env.d.ts`差分を含めない。
