# [ISSUE-018] Dependabot開発ツール依存の整合化 作業記録

## 対象

- GitHub Issue: #50 `[ISSUE-018] Dependabot開発ツール依存の整合化`
- 置き換え対象PR: #17、#18、#46、#47
- PR: #51 `chore(deps): align Dependabot toolchain updates`
- ブランチ: `chore/ISSUE-018_dependabot-toolchain-alignment`

## 実施日

- 2026-07-29

## 実施内容

- Vite/Vitest系を`vite 8.1.5`、`@vitejs/plugin-react 6.0.3`、`vitest 4.1.10`、`@vitest/coverage-v8 4.1.10`へまとめて更新した。
- commitlintを`@commitlint/cli 21.2.1`と`@commitlint/config-conventional 21.2.0`へ揃えた。
- `@types/node`を24系の`24.13.3`へ更新し、DependabotではNode型のsemver-major更新を無視する設定を追加した。
- commitlint 21のengine要件に合わせ、READMEのNode.js要件を`22.12.0`以上へ更新した。
- 依存バージョンの整合性とcommit-msgフックのvalid/invalid判定を検証する回帰テストを追加した。
- Bun `1.2.0`で`bun.lock`を再生成した。
- 後継PR #51のQuality、Security Audit、OSV Scanner成功を確認した。
- 置き換え対象PR #17、#18、#46、#47に対応内容と後継PRをコメントし、クローズした。

## 発生した問題と対応

- PR #47は`@vitejs/plugin-react 6`だけを更新してVite 7が残るため、`vite/internal`の解決エラーでテストが起動しなかった。Vite 8とVitest 4を同時に更新した。
- PR #18はVitest 4に対してcoverage providerが3系のままで、coverage生成が`fetchCache`参照エラーになった。Vitestとcoverage providerを同じ`4.1.10`へ揃えた。
- PR #46と#17はSecurity Audit対応後の`bun.lock`と競合したため、最新`main`からlockfileを再生成した。
- ツール更新によりトップレベルの`glob`が7系へ変わり、既存テストがminimatch 9を推移依存から取得できなくなった。特定の依存解決へ結合せず、`brace-expansion`のdefault export互換性を直接検証する形へ修正した。

## 7日間クールタイム確認

- `vite 8.1.5`: 2026-07-16公開。
- `@vitejs/plugin-react 6.0.3`: 2026-06-23公開。
- `vitest 4.1.10`: 2026-07-06公開。
- `@vitest/coverage-v8 4.1.10`: 2026-07-06公開。
- `@commitlint/cli 21.2.1`: 2026-07-08公開。
- `@commitlint/config-conventional 21.2.0`: 2026-06-30公開。
- `@types/node 24.13.3`: 2026-07-08公開。

## 主なコミット

- `738aa7e` chore(deps): align development toolchain updates (#50)

## 検証結果

- TDD Red: 整合性テスト3件が期待どおり失敗
- 依存回帰テスト: 成功（2 files / 8 tests）
- `bunx bun@1.2.0 install --frozen-lockfile --ignore-scripts`: 成功（no changes）
- `bun run type-check`: 成功
- `bun run lint`: 成功（ESLint warnings/errors 0）
- `bun run test:run`: 成功（47 files / 175 tests）
- `bun run test:coverage`: 成功（Statements 88.11%、Lines 93.15%）
- `bun run build`: 成功
- OSV Scanner: 成功（723 packages / No issues found）
- サブエージェントによるコミット前確認: 成功（47 files / 175 tests）
- GitHub Actions Quality: 成功（run `30443273711`）
- GitHub Actions Security Audit: 成功（run `30443249695`）
- GitHub Actions OSV Scanner: 成功

## 注意事項

- Vitestと`@vitest/coverage-v8`は常に同一バージョンへ更新する。
- `@vitejs/plugin-react 6`はVite 8専用のため、Viteのmajorを個別に下げない。
- Node 26へ移行する場合は、ランタイム方針・README・`@types/node`・CIを同じIssueで更新する。
