import { z } from "zod"

export const patternSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("daily"),
    time: z.string().describe("通知時刻 (HH:mm形式、例: 09:00)"),
  }),
  z.object({
    type: z.literal("weekly"),
    dayOfWeek: z
      .number()
      .min(0)
      .max(6)
      .describe("曜日 (0=日曜, 1=月曜, ..., 6=土曜)"),
    time: z.string().describe("通知時刻 (HH:mm形式)"),
  }),
  z.object({
    type: z.literal("weekdays"),
    time: z.string().describe("通知時刻 (HH:mm形式)"),
  }),
  z.object({
    type: z.literal("monthly"),
    dayOfMonth: z.number().min(1).max(31).describe("日 (1-31)"),
    time: z.string().describe("通知時刻 (HH:mm形式)"),
  }),
])
