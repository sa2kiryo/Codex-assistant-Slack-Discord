import { Codex } from "@openai/codex-sdk"

const codex = new Codex()
const thread = codex.startThread({
  model: "gpt-5.4",
  sandboxMode: "read-only",
  approvalPolicy: "never",
  workingDirectory: process.cwd(),
})

const turn = await thread.run("利用可能なツールの名前を箇条書きで一覧しなさい。")
console.log(turn.finalResponse)
