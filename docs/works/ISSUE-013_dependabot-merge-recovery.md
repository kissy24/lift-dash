# [ISSUE-013] Dependabotマージ後の依存関係修復 作業記録

## 対象

- GitHub Issue: #14 `[ISSUE-013] Dependabotマージ後の依存関係修復`
- PR: #15 `fix(deps): restore reproducible dependency baseline`
- ブランチ: `fix/ISSUE-013_dependabot-merge-recovery`

## 実施日

- 2026-07-04

## 実施内容

- Dependabot PR #7〜#11のマージ後状態を調査した。
- `package.json`と`bun.lock`を同期し、frozen installを復旧した。
- 要求仕様と既存設定に合わせてTailwind CSSを`3.4.18`へ戻した。
- Zod `4.4.3`、React Hook Form `7.80.0`、React Testing Library `16.3.2`、jsdom `29.1.1`はクールタイムと品質検証を確認して維持した。
- Bun `1.2.0`を`packageManager`と品質CIで固定した。
- DependabotでTailwind CSSのsemver-major更新を除外した。
- PRとmain pushでfrozen install、型チェック、Lint、全テスト、buildを実行する品質CIを追加した。

## 発生した問題と対応

- Dependabot PRは`package.json`だけを更新し、`bun.lock`を更新していなかったため、`bun install --frozen-lockfile`が失敗した。Bunでlockfileを再生成し、再度frozen installが成功することを確認した。
- Tailwind CSS `4.3.1`は7日クールタイムを満たしていたが、v4で必要な専用PostCSS pluginとCSS移行がなく、要求仕様もv3固定だったため`3.4.18`へ戻した。
- 同種の不整合をマージ前に検出できるCIがなかったため、`quality.yml`を追加した。
- 2026-06-18公開でクールタイムを満たすOSV Scanner `2.4.0`を導入し、`bun.lock`内794パッケージに既知の問題がないことを確認した。
- `next build`により`next-env.d.ts`へ目的外の生成差分が発生したため、コミット対象から除外した。

## 主なコミット

- `38227cf fix(deps): restore reproducible dependency baseline (#14)`

## 検証結果

- `bun install --frozen-lockfile`: 成功
- `bun run type-check`: 成功
- `bun run lint`: 成功（ESLint warning 0）
- `bun run test:run`: 成功（14 files / 53 tests）
- `bun run build`: 成功
- OSV Scanner `2.4.0`: 成功（794 packages / No issues found）
- サブエージェントによるコミット前確認: 成功
- GitHub Actions: 成功（Quality / Security Audit / Dependabot設定検証 / OSV Scanner）

## 注意事項

- Dependabot PRは`package.json`だけでなく`bun.lock`も更新されていることを確認してからマージする。
- `quality` checkが失敗している依存更新PRはマージしない。
- Tailwind CSS v4への移行は依存更新だけで行わず、専用IssueでPostCSS、CSS、theme、ブラウザ表示をまとめて移行する。
