import { describe, expect, test } from "bun:test"
import { isDangerousFilePath } from "@/hooks/is-dangerous-file-path"

describe("isDangerousFilePath", () => {
  describe("危険なファイルパスを検出する", () => {
    test("システムディレクトリを検出する", () => {
      expect(isDangerousFilePath("/etc/passwd")).not.toBeNull()
      expect(isDangerousFilePath("/usr/bin/node")).not.toBeNull()
      expect(isDangerousFilePath("/bin/sh")).not.toBeNull()
      expect(isDangerousFilePath("/sbin/init")).not.toBeNull()
      expect(isDangerousFilePath("/boot/vmlinuz")).not.toBeNull()
      expect(isDangerousFilePath("/root/.bashrc")).not.toBeNull()
    })

    test("SSH ディレクトリを検出する", () => {
      expect(isDangerousFilePath("~/.ssh/id_rsa")).not.toBeNull()
      expect(isDangerousFilePath("~/.ssh/authorized_keys")).not.toBeNull()
    })

    test("シェル設定ファイルを検出する", () => {
      expect(isDangerousFilePath("~/.bashrc")).not.toBeNull()
      expect(isDangerousFilePath("~/.zshrc")).not.toBeNull()
      expect(isDangerousFilePath("~/.profile")).not.toBeNull()
    })

    test(".env ファイルを検出する", () => {
      expect(isDangerousFilePath(".env")).not.toBeNull()
      expect(isDangerousFilePath("/path/to/.env")).not.toBeNull()
      expect(isDangerousFilePath("project/.env")).not.toBeNull()
    })

    test("credentials と secret を含むパスを検出する", () => {
      expect(isDangerousFilePath("/path/to/credentials.json")).not.toBeNull()
      expect(isDangerousFilePath("/path/to/secret.key")).not.toBeNull()
      expect(isDangerousFilePath("aws_credentials")).not.toBeNull()
    })
  })

  describe("安全なファイルパスは許可する", () => {
    test("通常のプロジェクトファイルは許可する", () => {
      expect(isDangerousFilePath("/Users/i/project/index.ts")).toBeNull()
      expect(isDangerousFilePath("/Users/i/project/package.json")).toBeNull()
      expect(isDangerousFilePath("./src/main.ts")).toBeNull()
    })

    test("通常の設定ファイルは許可する", () => {
      expect(isDangerousFilePath("tsconfig.json")).toBeNull()
      expect(isDangerousFilePath(".gitignore")).toBeNull()
      expect(isDangerousFilePath("biome.json")).toBeNull()
    })
  })
})
