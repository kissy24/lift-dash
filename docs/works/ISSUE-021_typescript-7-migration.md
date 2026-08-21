# [ISSUE-021] TypeScript 7移行 作業記録

## 対象

- GitHub Issue: #58 `[ISSUE-021] TypeScript 7移行`
- 置き換え対象PR: #54
- PR: 作成予定
- ブランチ: `chore/ISSUE-021_typescript-7-migration`

## 実施日

- 2026-08-21

## 実施内容

- TypeScript 7.0.2を`@typescript/native` aliasへ固定し、`type-check`スクリプトからnative CLIを明示的に実行する構成へ移行した。
- Next.js 15.5.21とESLintが利用するJavaScript Compiler APIとしてTypeScript 6.0.3を`typescript`へ固定した。
- `global.d.ts`でCSS副作用importを明示的に宣言し、TypeScript 7の`noUncheckedSideEffectImports`既定有効化へ対応した。
- strict系設定、native CLIの実行バージョン、Next.js向けAPIバージョンを回帰テストで固定した。
- Bun 1.2.0でlockfileを再生成し、frozen installの再現性を確認した。

## 発生した問題と対応

- TypeScript 7へ直接更新すると`app/layout.tsx`の`./globals.css`でTS2882が発生した。`noUncheckedSideEffectImports`を無効化せず、`declare module '*.css'`を追加した。
- TypeScript 7.0は従来の`typescript/lib/typescript.js` APIを同梱しないため、Next.js 15.5.21のlint/buildがTypeScriptを未導入と判定した。TypeScript公式のside-by-side方針に沿ってnative CLIと従来APIを分離した。
- 公式互換パッケージ`@typescript/typescript6`のnested npm aliasはBun 1.2.0で自己参照として解決された。パッケージpatchは行わず、TypeScript 6.0.3を`typescript`へ直接配置し、TypeScript 7 CLIを明示パスで実行する構成にした。
- `next build`と型チェックが`next-env.d.ts`を自動更新したが、目的外差分のためコミット対象から除外した。

## 7日間クールタイム確認

- TypeScript 7.0.2: 2026-07-08公開。
- TypeScript 6.0.3: 2026-04-16公開。
- いずれも2026-08-21時点で7日間を経過済み。

## 主なコミット

- `chore(deps): migrate type checking to typescript 7 (#58)`

## 検証結果

- TDD Red（固定バージョン）: 1 failed / 4 passed
- TypeScript 7 Red（CSS副作用import）: TS2882
- TDD Red（CSS宣言）: 1 failed / 5 passed
- TDD Red（side-by-side構成）: 1 failed / 5 passed
- 対象テスト Green: 1 file / 6 tests
- Bun 1.2.0 `install --frozen-lockfile`: 成功（no changes）
- `bun run type-check`: 成功（TypeScript 7.0.2 native CLI）
- `bun run lint`: 成功（ESLint warnings/errors 0）
- `bun run test:run`: 成功（47 files / 176 tests）
- `bun run test:coverage`: 成功（Statements 88.12%、Lines 93.15%）
- `bun run build`: 成功
- OSV Scanner: 成功（743 packages / No issues found）
- サブエージェントによるコミット前確認: 成功（TypeScript 7型チェック、lint、47 files / 176 tests）
- GitHub Actions Quality: 実施予定
- GitHub Actions Security Audit: 実施予定

## 注意事項

- TypeScript 7.0はJavaScript Compiler APIを持たない。Next.js 15系で`typescript`を直接7系へ更新しない。
- TypeScript 7.1またはNext.js 16.3以降へ移行する際は、side-by-side構成を解消できるか再評価する。
- `type-check`スクリプトのnative CLI明示パスを通常の`tsc`呼び出しへ戻す場合は、実行バージョンを回帰テストで確認する。
- `next build`または型チェック後に、目的外の`next-env.d.ts`差分を含めない。
