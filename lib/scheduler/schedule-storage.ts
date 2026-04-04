import * as fs from "node:fs"
import * as path from "node:path"
import type { Schedule, ScheduleData } from "@/scheduler/types"

export class ScheduleStorage {
  private readonly filepath: string

  constructor() {
    const storageDir = path.resolve(import.meta.dirname, "../../storage")
    this.filepath = path.join(storageDir, "schedules.json")
    this.ensureStorageDir(storageDir)
    Object.freeze(this)
  }

  private ensureStorageDir(storageDir: string): void {
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true })
    }
  }

  load(): ScheduleData {
    if (!fs.existsSync(this.filepath)) {
      return { schedules: [] }
    }
    const content = fs.readFileSync(this.filepath, "utf-8")
    return JSON.parse(content)
  }

  save(data: ScheduleData): void {
    fs.writeFileSync(this.filepath, JSON.stringify(data, null, 2), "utf-8")
  }

  add(schedule: Schedule): void {
    const data = this.load()
    const newSchedules = [...data.schedules, schedule]
    this.save({ schedules: newSchedules })
  }

  remove(id: string): boolean {
    const data = this.load()
    const index = data.schedules.findIndex((s) => s.id === id)
    if (index === -1) {
      return false
    }
    const newSchedules = data.schedules.filter((s) => s.id !== id)
    this.save({ schedules: newSchedules })
    return true
  }

  update(id: string, updates: Partial<Schedule>): boolean {
    const data = this.load()
    const index = data.schedules.findIndex((s) => s.id === id)
    if (index === -1) {
      return false
    }
    const newSchedules = data.schedules.map((s) =>
      s.id === id ? ({ ...s, ...updates } as Schedule) : s,
    )
    this.save({ schedules: newSchedules })
    return true
  }
}
