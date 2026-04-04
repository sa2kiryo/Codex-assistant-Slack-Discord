import * as fs from "node:fs/promises"
import * as path from "node:path"
import type { Input } from "@openai/codex-sdk"
import type { ImageAttachment, MessageEvent } from "@/types"

function isImageAttachment(file: unknown): file is ImageAttachment {
  return (
    typeof file === "object" &&
    file !== null &&
    "base64" in file &&
    "mediaType" in file
  )
}

async function writeImageAttachment(
  image: ImageAttachment,
  event: MessageEvent,
  index: number,
): Promise<string> {
  const baseDir = path.join(
    process.env.AGENT_DATA_DIR ?? path.join(process.cwd(), "workspace"),
    ".codex-input-images",
  )
  await fs.mkdir(baseDir, { recursive: true })

  const extension = image.mediaType.split("/")[1] ?? "bin"
  const filename = [
    event.source,
    event.timestamp.replaceAll(":", "-"),
    event.threadTs || "no-thread",
    index,
  ].join("_")

  const filePath = path.join(baseDir, `${filename}.${extension}`)
  await fs.writeFile(filePath, Buffer.from(image.base64, "base64"))
  return filePath
}

export async function buildCodexInput(event: MessageEvent): Promise<Input> {
  const images = (event.files ?? []).filter(isImageAttachment)

  if (images.length === 0) {
    return JSON.stringify(event, null, 2)
  }

  const eventWithoutImageData = {
    ...event,
    files: event.files?.map((file) => {
      if (isImageAttachment(file)) {
        return { name: file.name, contentType: file.contentType }
      }
      return file
    }),
  }

  const input: Input = [
    {
      type: "text",
      text: JSON.stringify(eventWithoutImageData, null, 2),
    },
  ]

  for (const [index, image] of images.entries()) {
    input.push({
      type: "local_image",
      path: await writeImageAttachment(image, event, index),
    })
  }

  return input
}
