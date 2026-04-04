import type { ImageAttachment } from "@/types"

const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
])

const MAX_FILE_SIZE = 5 * 1024 * 1024

type MediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp"

function detectMediaType(buffer: ArrayBuffer): MediaType | null {
  const bytes = new Uint8Array(buffer)
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "image/png"
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg"
  }
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return "image/gif"
  }
  if (bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return "image/webp"
  }
  return null
}

export async function downloadSlackFile(
  url: string,
  name: string,
  mimetype: string,
  botToken: string,
): Promise<ImageAttachment | null> {
  if (!SUPPORTED_IMAGE_TYPES.has(mimetype)) {
    return null
  }

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${botToken}`,
      },
    })
    if (!response.ok) {
      console.error(`Failed to download Slack file ${name}: ${response.status}`)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
      console.error(`Slack file ${name} exceeds size limit (${arrayBuffer.byteLength} bytes)`)
      return null
    }

    const actualMediaType = detectMediaType(arrayBuffer)
    if (!actualMediaType) {
      console.error(`Failed to detect image type for ${name}`)
      return null
    }

    const base64 = Buffer.from(arrayBuffer).toString("base64")

    return {
      name,
      contentType: actualMediaType,
      base64,
      mediaType: actualMediaType,
    }
  } catch (error) {
    console.error(`Failed to download Slack file ${name}:`, error)
    return null
  }
}
