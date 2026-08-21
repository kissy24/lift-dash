# [ISSUE-023] PostCSS 8.5.26更新

## 概要

競合したDependabot PR #59を置き換え、最新`main`のPostCSSを8.5.23から8.5.26へ更新する。

## 背景・目的

Dependabot PR #59はPostCSS 8.5.18を基準に作成されているが、最新`main`はセキュリティ基準修復により8.5.23へ更新済みで、PRは競合している。8.5.26にはsource map読込時のpath protectionでsymlinkを追跡する改善と回帰修正が含まれるため、最新`main`から必要最小限の後継PRとして取り込む。

## 受け入れ条件 (Acceptance Criteria)

- [ ] `postcss`のdirect devDependencyとoverrideが8.5.26へ固定されている
- [ ] `bun.lock`のPostCSSが8.5.26で、対象外の依存関係に不要な差分がない
- [ ] `nanoid`は安全な3.3.18を維持している
- [ ] PostCSSの実行versionを確認する回帰テストが追加されている
- [ ] Bun 1.2.0の`bun install --frozen-lockfile`が成功する
- [ ] `bun run type-check`、`bun run lint`、`bun run test:run`、`bun run test:coverage`、`bun run build`が成功する
- [ ] OSV Scannerで既知脆弱性が検出されない
- [ ] GitHub ActionsのQualityとSecurity Auditが成功する
- [ ] Dependabot PR #59に後継PRを案内してクローズする
- [ ] 対応するテストがすべてグリーン

## 技術詳細

- PostCSS 8.5.26は2026-08-06公開で、2026-08-21時点で7日間クールタイムを満たしている
- 最新`main`の8.5.23を起点とし、Dependabot PR #59の古いlockfile差分は使用しない
- package.jsonのdevDependencyとoverrideを同じversionへ揃える
- Tailwind CSS 3.4.18、Autoprefixer 10.5.2、Vite 8.1.5のPostCSS peer/range内であることを確認する
- source map path protectionを含む公式release diffを確認し、OSV ScannerとCSS buildで検証する

## 関連ファイル（予定）

- `package.json`
- `bun.lock`
- `lib/dependencies/`
- `docs/works/ISSUE-023_postcss-8-5-26.md`

## 依存 Issue

- ISSUE-022（完了済み）

## 見積もり

- [x] Small（〜2h）
- [ ] Medium（〜1日）
- [ ] Large（〜3日）
