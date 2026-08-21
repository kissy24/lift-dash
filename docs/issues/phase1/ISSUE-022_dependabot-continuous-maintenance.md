# [ISSUE-022] Dependabot継続運用ルール整備

## 概要

今回のDependabot対応で確立した調査、セキュリティ判定、後継PR作成、検証、マージ、元PRクローズまでの手順を、Codexが継続的に適用できるリポジトリルールとして明文化する。

## 背景・目的

Dependabot PRは、7日間クールタイムを満たしていても、最新`main`との競合、lockfile不整合、既存の脆弱性、ツールチェーン間の互換性問題により、そのままマージできるとは限らない。ISSUE-019〜021で実施した実証的な判断方法を`AGENTS.md`と運用手順書へ残し、以後のCodexが同じ品質・セキュリティ基準で再現できる状態にする。

## 受け入れ条件 (Acceptance Criteria)

- [ ] `AGENTS.md`にDependabot PR対応の必須フローと判断基準が追加されている
- [ ] 詳細な運用手順書に、棚卸し、リリース日・diff・互換性・脆弱性の確認方法が記載されている
- [ ] 最新`main`のセキュリティ基準が壊れている場合は、依存更新より先に別Issueで基準を修復するルールが記載されている
- [ ] staleまたは競合したDependabot PRを無理に直さず、最新`main`から後継Issue・ブランチ・PRを作る条件が記載されている
- [ ] direct/transitive dependency、major update、toolchain API不互換の判断方法が記載されている
- [ ] frozen install、型、lint、全テスト、coverage、build、OSV、シークレット、目的外差分を含むローカル検証が記載されている
- [ ] コミット前のサブエージェント検証、PR CI監視、作業記録、squash merge、元Dependabot PRの記録付きクローズが記載されている
- [ ] `LiftDash_requirements.md`の依存関係管理記述と実際の`bun.lock`運用が一致し、詳細手順への参照が追加されている
- [ ] 既存の開発ルールと矛盾・重複がないことをレビューしている
- [ ] 対応する検証がすべてグリーン

## 技術詳細

- `AGENTS.md`には毎回必ず実行する短い規範と判断表を置き、詳細は専用runbookへリンクする
- runbookは「調査→分類→候補作成→ローカル検証→PR検証→マージ後確認」の順で、実行コマンドと停止条件を示す
- セキュリティ修正の例外適用時もdiff確認とOSV検証を省略しない
- transitive dependencyは親パッケージ更新を優先し、`overrides`は必要最小限の最終手段とする
- major updateやCompiler API不互換では、公式情報と再現結果に基づき、明示的なpin/aliasまたは延期を選択する
- 元Dependabot PRを置換した場合は、後継Issue/PRをコメントしてからクローズする

## 関連ファイル（予定）

- `AGENTS.md`
- `docs/dependabot-maintenance.md`
- `docs/LiftDash_requirements.md`
- `docs/works/ISSUE-022_dependabot-continuous-maintenance.md`

## 依存 Issue

- ISSUE-019（完了済み）
- ISSUE-020（完了済み）
- ISSUE-021（完了済み）

## 見積もり

- [x] Small（〜2h）
- [ ] Medium（〜1日）
- [ ] Large（〜3日）
