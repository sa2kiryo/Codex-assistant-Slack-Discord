# codex-assistant-Slack-Discord

**共感型AIキャラクター コミュニケーションシステム**

Codex SDK を基盤とした、人格を持つ自律型AIコミュニケーションBot。
Slack / Discord 上で人間と会話し、相手を覚え、関係性を築き、感情に寄り添いながらサポートする。

> "報告書を生成するマシンではない。たまたまAIである一人の人間。"
> — prompts/base.md


---

## Quick Start

```bash
bun install
cp .env.template .env
cp security.template.json security.json
# .env と security.json を編集
codex login          # ChatGPT OAuth 認証
bun run dev　# 起動コマンド
```

---

### 必須: キャラクター定義

`workspace/system/identity.md` を編集して、キャラクターを定義する:

### 推奨: 行動ルール

`workspace/system/rules.md` に、行動原則やチャンネル別の振る舞いを定義する。

### 推奨: コンテキスト情報

- `workspace/system/channels.md` — チャンネルIDと対応方針のマッピング
- `workspace/system/users.md` — メンバーのID・名前・役割一覧表

### 自動蓄積される記憶

システムが会話を通じて自動的に蓄積するデータ:

| データ | 保存先 | 用途 |
|-------|--------|------|
| オーナーの特徴 | `workspace/system/owner.md` | オーナーへの理解を深める |
| ユーザー別プロフィール | `workspace/{slack,discord}/users/{id}/index.md` | 個人の性格・専門性・関係性 |
| 日次対話ログ | `workspace/{slack,discord}/users/{id}/{date}.md` | 過去のやり取りの参照 |
| チャンネルログ | `workspace/{slack,discord}/channels/{id}/` | チャンネルの文脈理解 |
| ナレッジベース | `workspace/knowledge/` | 組織・技術・プロセスの知識 |


---

## Platform Integration

設定されたトークンに応じて自動的に接続する:

| 条件 | 動作 |
|------|------|
| `SLACK_BOT_TOKEN` + `SLACK_APP_TOKEN` | Slack に接続 (Primary) |
| `DISCORD_BOT_TOKEN` | Discord に接続 (Secondary) |
| どちらも未設定 | CLI のみモード |

### 送信先の優先順位

| シナリオ | 送信先 |
|---------|--------|
| Slack から受信 → 返信 | Slack（同じチャンネル/スレッド） |
| Discord から受信 → 返信 | Discord（同じチャンネル） |
| スケジューラ/起動時の通知 | Slack DM |
| エスカレーション・重要報告 | Slack DM |
| source が不明な場合 | Slack |

---

## MCP & External Services

ツールはすべてMCPプロトコル経由で提供され、拡張が容易な設計。

### 内蔵MCPサーバー

| サーバー | 説明 | 条件 |
|---------|------|------|
| `agent-tools` | コアツール一式（通信・記憶・ファイル・スケジュール） | 常時 |
| `notion` | Notion API連携 | `NOTION_TOKEN` 設定時 |
| `gdrive` | Google Drive連携 | 常時 |

---

## Slack App のセットアップ

### App の作成

1. [api.slack.com/apps](https://api.slack.com/apps) にアクセス
2. 「Create New App」>「From scratch」を選択
3. App 名とワークスペースを入力して作成

### Socket Mode の有効化

パブリック URL なしで WebSocket 接続するために必要。

1. 左メニュー「Settings」>「Socket Mode」
2. 「Enable Socket Mode」をオンにする
3. App-Level Token を生成
   - Token Name: 任意（例: `socket-mode`）
   - Scope: `connections:write`
   - 「Generate」で `xapp-...` トークンを取得
4. `.env` の `SLACK_APP_TOKEN` に設定

### Bot Token Scopes の設定

左メニュー「Features」>「OAuth & Permissions」>「Bot Token Scopes」に以下を追加:

| スコープ | 用途 |
|---------|------|
| `app_mentions:read` | メンションの受信 |
| `channels:history` | パブリックチャンネルのメッセージ読み取り |
| `channels:read` | チャンネル情報の取得 |
| `chat:write` | メッセージの送信 |
| `files:read` | 共有ファイル/画像のダウンロード |
| `groups:history` | プライベートチャンネルのメッセージ読み取り |
| `groups:read` | プライベートチャンネル情報の取得 |
| `im:history` | DM のメッセージ読み取り |
| `im:read` | DM 情報の取得 |
| `im:write` | DM の開始 |
| `reactions:read` | リアクションイベントの受信 |
| `reactions:write` | リアクションの追加 |
| `users:read` | ユーザー情報の取得 |

### Event Subscriptions の設定

左メニュー「Features」>「Event Subscriptions」>「Enable Events」をオン。

「Subscribe to bot events」に以下を追加:

| イベント | 用途 |
|---------|------|
| `message.channels` | パブリックチャンネルのメッセージ |
| `message.groups` | プライベートチャンネルのメッセージ |
| `message.im` | DM のメッセージ |
| `app_mention` | Bot へのメンション |
| `reaction_added` | リアクションの追加 |

「Save Changes」で保存。

### ワークスペースにインストール

1. 左メニュー「Settings」>「Install App」
2. 「Install to Workspace」>「Allow」
3. 表示される `xoxb-...` トークンを `.env` の `SLACK_BOT_TOKEN` に設定

### Bot / Owner の ID を取得

Slack でプロフィールを開き「...」>「Copy member ID」で取得。

- Bot の User ID → `.env` の `SLACK_BOT_ID`
- 自分の User ID → `.env` の `SLACK_USER_ID`

### チャンネルに Bot を招待

Bot がメッセージを受信するには、チャンネルへの参加が必要:

```
/invite @ボット名
```

---

## Discord Bot のセットアップ

Discord は併用する場合のみ設定する。

1. [Discord Developer Portal](https://discord.com/developers/applications) でアプリケーションを作成
2. 「Bot」セクションでトークンを取得 → `DISCORD_BOT_TOKEN`
3. 「Privileged Gateway Intents」で以下を有効化:
   - **Message Content Intent**
4. OAuth2 URL Generator で以下のスコープと権限を選択してサーバーに招待
5. Developer Mode を有効にして ID をコピー → `DISCORD_USER_ID`, `DISCORD_BOT_ID`

**推奨 OAuth2 スコープ:**
- `bot`

**推奨 Bot Permissions:**

| 権限 | 用途 |
|------|------|
| View Channels | チャンネルの閲覧 |
| Send Messages | メッセージ送信 |
| Read Message History | メッセージ履歴の取得 |
| Add Reactions | リアクションの付与 |

---

## Configuration

### .env

```env
# Slack (Primary)
SLACK_BOT_TOKEN=xoxb-...
SLACK_APP_TOKEN=xapp-...
SLACK_USER_ID=
SLACK_BOT_ID=
USE_SLACK_API=true
USE_SLACK_MENTION=true

# Discord (Secondary)
DISCORD_BOT_TOKEN=
DISCORD_USER_ID=
DISCORD_BOT_ID=
USE_DISCORD_API=true
USE_DISCORD_MENTION=true

# Other
NOTION_TOKEN=
CODEX_MODEL=gpt-5.4
EMIT_STARTUP_EVENT=true
```

### Codex 認証

このシステムは `@openai/codex-sdk` と `@openai/codex` を使って動作する。

```bash
codex login
```

- `codex login` で ChatGPT OAuth 認証を実行
- 認証情報は通常 `~/.codex/auth.json` に保存される
- API キー認証も使えるが、基本運用は ChatGPT OAuth を想定

### security.json

Bot がアクセスできるファイルパスを制限する:

```json
{
  "allowedBasePaths": ["/path/to/this/repo", "/path/to/this/repo/workspace"]
}
```

---

## Directory Structure

```
lib/
├── apps/
│   ├── discord/         # Discord.js 連携 (WebSocket Gateway)
│   └── slack/           # Slack Bolt 連携 (Socket Mode)
├── cli/                 # CLI インターフェース
├── core/                # 設定、プロンプト生成、MCP サーバー、API クライアント
├── hooks/               # ツール実行フック (安全性チェック、正規化)
├── prompts/             # システムプロンプト構築
├── scheduler/           # スケジュール機能
└── tools/
    ├── safe-tools/      # サンドボックス化されたファイル操作ツール
    ├── discord-tools/   # Discord 送信ツール
    ├── slack-tools/     # Slack 送信ツール
    ├── memory-tools/    # ユーザープロフィール読み書き
    └── schedule-tools/  # スケジュール管理ツール

prompts/                 # 静的プロンプトファイル (ベース、ガイドライン、メンションルール)
workspace/
├── system/              # キャラクター定義とコンテキスト (システムプロンプトに含まれる)
│   ├── identity.md      # 性格、口調、動機
│   ├── rules.md         # 行動ルールとチャンネルポリシー
│   ├── owner.md         # オーナーに関する学習情報
│   ├── structure.md     # サーバー/ワークスペース構成情報
│   ├── channels.md      # チャンネルマッピング
│   ├── users.md         # メンバー一覧
│   └── users/           # ユーザー別詳細ファイル
├── knowledge/           # ナレッジベース (インデックス付き、オンデマンド読み込み)
│   ├── organization/    # 組織に関するナレッジ
│   ├── process/         # プロセスに関するナレッジ
│   └── tech/            # 技術に関するナレッジ
├── discord/             # Discord ログ
│   ├── users/{id}/      # ユーザー別プロフィール + 日次ログ
│   └── channels/{id}/   # チャンネル別インデックス + 日次ログ
└── slack/               # Slack ログ (同構成)
```

---


## License

[PolyForm Personal 1.0.0](LICENSE) — 個人利用のみ許可。商用利用・組織利用は禁止。
