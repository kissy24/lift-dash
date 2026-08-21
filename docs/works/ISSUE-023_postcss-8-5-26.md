# [ISSUE-023] PostCSS 8.5.26更新 作業記録

## 対象

- GitHub Issue: #66 `[ISSUE-023] PostCSS 8.5.26更新`
- 置き換え対象PR: #59
- PR: 作成後に記録
- ブランチ: `chore/ISSUE-023_postcss-8-5-26`

## 実施日

- 2026-08-21

## 実施内容

- 最新`main`のPostCSS 8.5.23を8.5.26へ更新した。
- devDependencyとtransitive consumer向けoverrideを同じ8.5.26へ揃えた。
- package.jsonの固定値と実際に解決されるPostCSS runtime versionを回帰テストで検証した。
- Bun 1.2.0でlockfileを再生成し、既存のnanoid 3.3.18を維持した。

## 発生した問題と対応

- Dependabot PR #59はPostCSS 8.5.18時点の`main`から作成されており、現在の8.5.23と競合していた。botの古いlockfile差分は使わず、最新`main`から後継Issue・ブランチを作成した。
- Dependabot PR #59にはQuality/Security Auditのcheckがなかった。後継PRでローカル全検証とGitHub Actionsを実行する。

## 7日間クールタイム確認

- PostCSS 8.5.26: 2026-08-06公開。
- 2026-08-21時点で7日間を経過済み。
- 公式releaseでは`list.split()`回帰修正と、source map path protectionでのsymlink追跡が記載されている。

## 主なコミット

- コミット後に記録

## 検証結果

- 最新`main`基準: frozen install、型チェック、lint、47 files / 176 tests、OSV Scannerすべて成功
- TDD Red: 1 failed / 6 passed（期待8.5.26、実際8.5.23）
- 対象テスト Green: 1 file / 7 tests
- Bun 1.2.0 `install --frozen-lockfile`: 成功（719 packages / no changes）
- `bun run type-check`: 成功（TypeScript 7.0.2 native CLI）
- `bun run lint`: 成功（ESLint warnings/errors 0）
- `bun run test:run`: 成功（47 files / 177 tests）
- `bun run test:coverage`: 成功（Statements 88.12%、Lines 93.15%）
- `bun run build`: 成功（Next.js 15.5.21 / 13 routes）
- OSV Scanner: 成功（743 packages / No issues found）
- サブエージェントによるコミット前確認: 成功（型チェック、lint warnings/errors 0、47 files / 177 tests）
- GitHub Actions: PR作成後に記録

## 注意事項

- PostCSSはdevDependencyとoverrideのversionを常に揃える。
- Dependabot PRが古いPostCSS基準で再作成された場合は、最新`main`のversionを確認してからlockfileを生成する。
- build/type-checkが生成する目的外の`next-env.d.ts`差分はコミットしない。
