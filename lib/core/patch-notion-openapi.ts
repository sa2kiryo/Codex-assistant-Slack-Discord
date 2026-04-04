import fs from "node:fs"
import { createRequire } from "node:module"

type JsonObject = Record<string, unknown>

type OpenApiOperation = {
  requestBody?: {
    content?: {
      [key: string]: {
        schema?: JsonObject
      }
    }
  }
}

function relaxPagePropertiesSchema(operation?: OpenApiOperation): boolean {
  const bodySchema = operation?.requestBody?.content?.["application/json"]?.schema
  if (!bodySchema || typeof bodySchema !== "object") return false

  const bodyProps = (bodySchema as JsonObject).properties as JsonObject | undefined
  if (!bodyProps || typeof bodyProps !== "object") return false

  const propsSchema = bodyProps.properties as JsonObject | undefined
  if (!propsSchema || typeof propsSchema !== "object") return false

  const hasTitleConstraint =
    (propsSchema as JsonObject).properties !== undefined ||
    Array.isArray((propsSchema as JsonObject).required) ||
    (propsSchema as JsonObject).additionalProperties === false

  if (!hasTitleConstraint) return false

  const description = (propsSchema as JsonObject).description

  bodyProps.properties = {
    type: "object",
    ...(typeof description === "string" ? { description } : {}),
    additionalProperties: true,
  }

  return true
}

export function patchNotionOpenApiIfNeeded(): void {
  let specPath: string
  try {
    const require = createRequire(import.meta.url)
    specPath = require.resolve(
      "@notionhq/notion-mcp-server/scripts/notion-openapi.json",
    )
  } catch {
    return
  }

  let raw: string
  try {
    raw = fs.readFileSync(specPath, "utf-8")
  } catch {
    return
  }

  let doc: JsonObject
  try {
    doc = JSON.parse(raw) as JsonObject
  } catch {
    return
  }

  const paths = doc.paths as JsonObject | undefined
  if (!paths) return

  let changed = false

  const postPage = (paths["/v1/pages"] as JsonObject | undefined)?.post as
    | OpenApiOperation
    | undefined
  if (relaxPagePropertiesSchema(postPage)) changed = true

  const patchPage = (paths["/v1/pages/{page_id}"] as JsonObject | undefined)
    ?.patch as OpenApiOperation | undefined
  if (relaxPagePropertiesSchema(patchPage)) changed = true

  if (!changed) return

  try {
    fs.writeFileSync(specPath, JSON.stringify(doc, null, 2), "utf-8")
  } catch {
    return
  }
}
