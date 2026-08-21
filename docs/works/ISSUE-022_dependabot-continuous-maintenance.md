# [ISSUE-022] Dependabot継続運用ルール整備 作業記録

## 対象

- GitHub Issue: #64 `[ISSUE-022] Dependabot継続運用ルール整備`
- PR: 作成後に記録
- ブランチ: `docs/ISSUE-022_dependabot-continuous-maintenance`

## 実施日

- 2026-08-21

## 実施内容

- ISSUE-019〜021で実施したDependabot対応を、Codexが継続利用する必須ルールとして`AGENTS.md`へ追加した。
- クールタイム、CVE例外、既存mainの基準異常、競合、major/API不互換、transitive dependencyを分類する判断表を追加した。
- `docs/dependabot-maintenance.md`を作成し、棚卸しからマージ後確認までの詳細手順とコマンドをまとめた。
- `docs/LiftDash_requirements.md`のOSV Scanner例を現在の`bun.lock`とreusable workflowへ合わせ、詳細runbookへの参照を追加した。

## 発生した問題と対応

- 要件書のOSV Scanner例が旧形式の`bun.lockb`とaction stepを参照していた。実際の`.github/workflows/security-audit.yml`に合わせ、`bun.lock`とreusable workflowへ修正した。
- Dependabot PRの個別ルールが7日間クールタイムとOSV失敗対応に分散していた。`AGENTS.md`には短い必須フローと判断表を置き、再現可能な詳細は専用runbookへ分離した。

## 主なコミット

- コミット後に記録

## 検証結果

- Bun 1.2.0 `install --frozen-lockfile`: 成功（719 packages / no changes）
- `bun run type-check`: 成功（TypeScript 7.0.2 native CLI）
- `bun run lint`: 成功（ESLint warnings/errors 0）
- `bun run test:run`: 成功（47 files / 176 tests）
- `bun run test:coverage`: 成功（Statements 88.12%、Lines 93.15%）
- `bun run build`: 成功（Next.js 15.5.21 / 13 routes）
- OSV Scanner: 成功（743 packages / No issues found）
- `git diff --check`: 成功
- Prettier: 対象Markdownすべて成功
- サブエージェントによるコミット前確認: 成功（型チェック、lint warnings/errors 0、47 files / 176 tests）
- GitHub Actions: PR作成後に記録

## 注意事項

- 新しいDependabot PRは、以前の判断結果を流用せず、runbookの棚卸しから毎回評価する。
- 後継PRを使った場合、元Dependabot PRは後継PRがマージされるまで閉じない。
- 作業記録のみの追加コミットでも、コミット前のサブエージェント検証を省略しない。
