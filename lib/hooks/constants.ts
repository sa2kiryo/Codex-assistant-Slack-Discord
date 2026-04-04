import { Config } from "@/core/config"

export const allowedBasePaths: readonly string[] = new Config().allowedBasePaths

export const dangerousPatterns: readonly RegExp[] = [
  // ファイルシステム破壊
  /rm\s+(-[rf]+\s+)*[/~]/,
  /rm\s+-rf/,
  /mkfs/,
  /dd\s+if=.*of=\/dev/,
  // システムファイル変更
  />\s*\/etc\//,
  /chmod\s+777/,
  /chown\s+root/,
  // 認証情報・機密ファイル
  /cat.*\.ssh/,
  /cat.*\.env/,
  /cat.*password/i,
  /cat.*credentials/i,
  /cat.*secret/i,
  // Git 危険操作
  /git\s+push.*--force/,
  /git\s+reset\s+--hard/,
  /git\s+clean\s+-fd/,
  // ネットワーク経由のスクリプト実行
  /curl.*\|\s*(ba)?sh/,
  /wget.*\|\s*(ba)?sh/,
  // プロセス操作
  /kill\s+-9\s+1\b/,
  /killall/,
  // パッケージマネージャの危険操作
  /npm\s+publish/,
  /pip\s+install.*--break-system/,
]

export const dangerousFilePaths: readonly RegExp[] = [
  /^\/etc\//,
  /^\/usr\//,
  /^\/bin\//,
  /^\/sbin\//,
  /^\/boot\//,
  /^\/root\//,
  /^~\/\.ssh\//,
  /^~\/\.bashrc$/,
  /^~\/\.zshrc$/,
  /^~\/\.profile$/,
  /\.env$/,
  /credentials/i,
  /secret/i,
]

export const pathPattern = /\/[\w./-]+/g
