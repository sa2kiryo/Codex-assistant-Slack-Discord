import type { EventEmitter } from "node:events"
import * as readline from "node:readline"
import type { MessageEvent } from "@/types"

export function createCli(
  messageEmitter: EventEmitter<{ message: [MessageEvent] }>,
) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
  })

  function log(text: string) {
    readline.clearLine(process.stdout, 0)
    readline.cursorTo(process.stdout, 0)
    console.log(text)
    rl.prompt(true)
  }

  rl.on("line", (input) => {
    if (input === "exit" || input === "quit") {
      rl.close()
      process.exit(0)
    }

    const event: MessageEvent = {
      source: "cli",
      channel: "cli",
      text: input,
      user: "user",
      threadTs: Date.now().toString(),
      timestamp: new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }),
    }

    messageEmitter.emit("message", event)
    rl.prompt()
  })

  return { rl, log }
}
