import { createDiscordTools } from "@/apps/discord/get-discord-tools"
import { createSlackTools } from "@/apps/slack/get-slack-tools"
import { readUserProfile, writeUserProfile } from "@/tools/memory-tools"
import { safeEdit } from "@/tools/safe-tools/safe-edit"
import { safeGlob } from "@/tools/safe-tools/safe-glob"
import { safeGrep } from "@/tools/safe-tools/safe-grep"
import { safeRead } from "@/tools/safe-tools/safe-read"
import { safeWrite } from "@/tools/safe-tools/safe-write"
import { addOnceSchedule } from "@/tools/schedule-tools/add-once-schedule"
import { addRecurringSchedule } from "@/tools/schedule-tools/add-recurring-schedule"
import { listSchedules } from "@/tools/schedule-tools/list-schedules"
import { removeSchedule } from "@/tools/schedule-tools/remove-schedule"

export function getCoreTools() {
  return [
    ...createDiscordTools(),
    ...createSlackTools(),
    readUserProfile,
    writeUserProfile,
    safeGlob,
    safeGrep,
    safeRead,
    safeWrite,
    safeEdit,
    addOnceSchedule,
    addRecurringSchedule,
    listSchedules,
    removeSchedule,
  ]
}
