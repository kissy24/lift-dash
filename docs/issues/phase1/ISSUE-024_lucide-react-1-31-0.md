# [ISSUE-024] lucide-react 1.31.0更新

## 概要

CI未実行のDependabot PR #60を置き換え、lucide-reactを0.552.0から1.31.0へ安全にmajor更新する。

## 背景・目的

Dependabot PR #60は最新`main`より前に作成され、Quality/Security Auditが実行されていない。0系から1系へのmajor更新であるためbot差分を直接マージせず、公式release情報、React peer互換性、package entrypoint、React描画を最新`main`上で検証する。

## 受け入れ条件 (Acceptance Criteria)

- [ ] `lucide-react`が1.31.0へ固定されている
- [ ] `bun.lock`のlucide-reactが1.31.0で、対象外の依存関係に不要な差分がない
- [ ] React 18.3.1が公式peer dependency範囲内である
- [ ] 代表的なicon componentのimportとReact描画が成功する回帰テストが追加されている
- [ ] Bun 1.2.0の`bun install --frozen-lockfile`が成功する
- [ ] `bun run type-check`、`bun run lint`、`bun run test:run`、`bun run test:coverage`、`bun run build`が成功する
- [ ] OSV Scannerで既知脆弱性が検出されない
- [ ] GitHub ActionsのQualityとSecurity Auditが成功する
- [ ] Dependabot PR #60に後継PRを案内してクローズする
- [ ] 対応するテストがすべてグリーン

## 技術詳細

- lucide-react 1.31.0は2026-08-09公開で、2026-08-21時点で7日間クールタイムを満たしている
- 公式peer dependencyはReact 16.5.1〜19系で、プロジェクトのReact 18.3.1を含む
- 1.0.0はupstreamが意図しない公開としているが、候補の1.31.0はその後の修正を含む安定releaseである
- 現在の本番コードにlucide-reactのimportはないため、version固定に加えて代表iconのimport・SSRまたはcomponent描画をテストする
- 1.32.0と1.33.0は7日間クールタイム未満のため採用しない

## 関連ファイル（予定）

- `package.json`
- `bun.lock`
- `lib/dependencies/`
- `docs/works/ISSUE-024_lucide-react-1-31-0.md`

## 依存 Issue

- ISSUE-023（先に完了が必要）

## 見積もり

- [x] Small（〜2h）
- [ ] Medium（〜1日）
- [ ] Large（〜3日）
