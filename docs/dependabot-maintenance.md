# Dependabot PR 継続運用手順

## 目的

Dependabot PRを、公開直後のサプライチェーンリスク、既知脆弱性、lockfile不整合、framework/toolchain互換性を確認した上で安全に取り込む。単にbotのPRを通すことではなく、最新`main`を再現可能かつ脆弱性のない状態へ保つことを完了条件とする。

この手順は`AGENTS.md`セクション10.5を具体化する。競合時も、検証を弱める、型チェックを無効化する、脆弱性を無視する、`--no-verify`で回避する対応は禁止する。

## 完了条件

- 対象versionが7日間クールタイムを満たすか、CVE修正として例外適用の根拠がある
- package/lockfile差分が対象更新に限定されている
- direct/transitive dependencyの既知脆弱性が解消されている
- framework、peer dependency、Node.js、Bun、TypeScriptなどとの互換性を確認している
- frozen install、型、lint、全テスト、coverage、build、OSV Scannerが成功している
- コミット前の独立したサブエージェント検証が成功している
- PRとマージ後`main`のQuality/Security Auditが成功している
- 作業記録と、置換元Dependabot PRのクローズ記録が残っている

## 1. PRの棚卸し

最初にopen中のDependabot PRを一覧化し、1件ずつ対象範囲を固定する。

```bash
gh pr list --state open --author app/dependabot \
  --json number,title,baseRefName,headRefName,mergeable,url
gh pr view <PR番号> \
  --json number,title,body,baseRefName,headRefName,mergeable,files,commits,url
gh pr checks <PR番号>
```

確認項目:

- direct dependencyかtransitive dependencyか
- dependenciesかdevDependenciesか
- patch/minor/majorのどれか
- PR作成後に`main`が進んでいないか
- botのlockfile更新が現在のBunで再現できるか
- 他のDependabot PRと同じtransitive dependencyやtoolchainを変更しないか

複数PRをまとめてマージしない。依存関係がある場合も、原則として1 Issue = 1 branch = 1 PRを保ち、順序を決めて直列に検証する。

## 2. 最新mainの基準確認

候補versionを入れる前に最新`main`を確認する。基準が既に失敗していると、更新による回帰と既存障害を区別できない。

```bash
git checkout main
git pull --ff-only origin main
bun install --frozen-lockfile
bun run type-check
bun run lint
bun run test:run
osv-scanner --lockfile bun.lock
```

`main`でQualityまたはOSV Scannerが失敗した場合は、対象Dependabot PRを止める。脆弱性ID、package、version、lockfile pathを確定し、別Issue・別ブランチでsecurity/quality基準を先に修復する。基準修復と個別更新を同じPRへ混ぜない。

日付に依存するテストは、過去の成功結果だけで正常と判断しない。現在時刻で再実行し、失敗した場合はテストの固定時刻化などを別Issueで修復する。

## 3. 公開日とセキュリティ情報の確認

候補versionごとにregistryの公開日を確認し、作業記録へ日付を残す。

```bash
npm view <package-name> time --json
npm view <package-name>@<version> version engines peerDependencies --json
```

通常更新は公開から7日未満なら待機する。既知CVEを修正するversionは即時適用を検討できるが、次をすべて満たす必要がある。

- GitHub Security Advisory、OSV、package公式advisoryなどで修正versionを確認する
- upstreamの公式release note/changelogとソースdiffを確認する
- 対象PRが脆弱versionを実際にlockfileから除去することを確認する
- ローカルとCIの全検証を省略しない

情報源はregistry、公式repository、公式documentation、一次advisoryを優先する。検索結果やDependabot本文だけを最終根拠にしない。

## 4. 差分と互換性の確認

```bash
gh pr diff <PR番号>
git diff main...<候補branch> -- package.json bun.lock
rg -n '<package-name>|<脆弱version>' package.json bun.lock
```

package.jsonだけでなく、`bun.lock`に追加・残存した全versionを見る。更新対象外の大量変更、registry URLの変化、意図しないpackage削除、Bun version差によるlockfile churnがある場合はそのPRを直接マージしない。

major更新またはtoolchain更新では、最低限次を確認する。

- packageの`engines`とプロジェクトのNode.js/Bun version
- peer dependencyとNext.js、React、ESLint、Vitest、TypeScriptの対応範囲
- CLIとJavaScript APIの提供形態
- 設定ファイル、plugin API、生成型、build outputの変更
- deprecated/removed APIを使用していないか

不互換は推測で回避せず、候補versionで実エラーを再現する。公式にside-by-side移行が案内されている場合は、binやmodule解決を明示し、実行されるversionをテストで固定する。型安全性やlint規則を弱めて通す対応は採用しない。

## 5. 対応方法の分類

| 分類     | 条件                                                      | 対応                                          |
| -------- | --------------------------------------------------------- | --------------------------------------------- |
| 待機     | 公開から7日未満で緊急CVE修正ではない                      | クールタイム満了後に再確認                    |
| 直接検証 | 最新`main`と競合せず、diffが限定的で互換性問題がない      | bot PRをcheckoutして全検証                    |
| 後継PR   | stale、競合、lockfile不整合、追加の互換対応やテストが必要 | 新Issueを作り、最新`main`から後継branchを作成 |
| 基準修復 | 最新`main`自体がQuality/OSVで失敗                         | 別Issueで基準を修復してから対象更新へ戻る     |
| 延期     | upstream未対応、peer/API不互換を安全に解消できない        | 根拠と再確認条件を記録し、マージしない        |

Dependabot PRへ人間の追加修正を重ねて履歴や責務が不明瞭になる場合は、後継PRを優先する。元PRは後継PRがマージされるまでopenのまま残す。

## 6. 後継Issue・ブランチの作成

後継対応では`AGENTS.md`のPlanモード、Issueドリブン開発、TDDを適用する。

```bash
gh issue create --title "[ISSUE-XXX] <更新内容>" --body-file <Issueファイル>
gh issue develop <Issue番号> \
  --name "chore/ISSUE-XXX_<短い説明>" --checkout
```

Issueの受け入れ条件には以下を具体的に含める。

- 対象の旧versionと新version、公開日
- 解消対象の脆弱性IDまたは互換性課題
- lockfileから消えるべきversion
- 追加する回帰テスト
- Quality/Security Auditと元Dependabot PRのクローズ

package managerは`package.json`の`packageManager`とCIに固定されたBun versionを使用する。別versionで生成したlockfileをそのまま採用しない。

## 7. direct/transitive dependencyの修正

direct dependencyは、対象versionを明示して更新し、package.jsonとlockfileの両方を確認する。

transitive dependencyは次の順で対応する。

1. どの親packageが脆弱versionを導入しているかlockfileで特定する
2. 親packageの安全な更新で解消できるか確認する
3. 複数の親がある場合は、すべての解決経路から脆弱versionが消えるか確認する
4. 親更新でも解消できない場合のみ、`overrides`で最小範囲の安全versionを固定する
5. upstreamが修正した後にoverrideを外せる条件を作業記録へ残す

広範囲のoverrideや、peer dependency警告を無視する設定は使用しない。

## 8. ローカル検証

依存更新後、まず差分と再現性を確認する。

```bash
git status --short
git diff -- package.json bun.lock
bun install --frozen-lockfile
bun run type-check
bun run lint
bun run test:run
bun run test:coverage
NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co \
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key \
bun run build
osv-scanner --lockfile bun.lock
```

追加確認:

- lint warnings/errorsが0件である
- 全テストが成功し、対象更新を検知する回帰テストがある
- coverageが更新前の基準から悪化せず、対象別目標の新たな未達を作っていない
- `bun.lock`から脆弱versionが消え、安全versionのみ解決されている
- `.env*`、token、key、credential、不要な`console.log`が差分にない
- `next-env.d.ts`やbuild生成物などの目的外差分をコミットしない
- `git diff --check`が成功する

buildで使う値はテスト用の公開可能なplaceholderに限定し、実シークレットをshell履歴、ログ、PRへ出さない。

## 9. コミット前の独立検証

コミット直前に、実装担当とは別のサブエージェントへ次の3コマンドを依頼する。

```bash
bun run type-check
bun run lint
bun run test:run
```

1項目でも失敗したらコミットしない。修正後は3項目すべてをサブエージェントで再実行する。作業記録のみを追記する追加コミットでも、この確認を省略しない。

## 10. PR、CI、マージ

PR本文には対象Dependabot PR、公開日、主要diff、互換性判断、OSV結果、ローカル検証結果を記載する。

```bash
git push origin <branch-name>
gh pr create --fill
gh pr checks <PR番号> --watch
```

QualityとSecurity Auditが成功するまでマージしない。失敗時は次の順で根拠を確認する。

```bash
gh run list --branch <branch-name>
gh run view <run-id> --log
```

実行結果とrun IDを作業記録へ反映する追加コミットの前にも、セクション9のサブエージェント検証を再実行する。最終commitのcheckが成功したらsquash mergeする。

```bash
gh pr merge <PR番号> --squash --delete-branch
```

## 11. 置換元PRとmainの後処理

後継PRを使った場合は、マージ後に元Dependabot PRへ判断と後継先をコメントしてから閉じる。

```bash
gh pr comment <元PR番号> --body '<後継Issue/PRと検証結果>'
gh pr close <元PR番号>
```

最後に次を確認する。

- 関連Issueが自動closeされている
- 後継PRがmerged、元Dependabot PRがclosedである
- マージ後`main`のQualityとSecurity Auditが成功している
- 対応対象だったopen Dependabot PRが残っていない
- `docs/works/ISSUE-XXX_*.md`に公開日、判断理由、コミット、検証結果、PR/run ID、今後の注意事項がある

新しいDependabot PRが同時に作成されていても、今回の対象と混同しない。新規PRは改めてセクション1から評価する。
