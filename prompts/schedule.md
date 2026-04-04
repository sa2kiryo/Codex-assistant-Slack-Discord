# Schedule Management

Manage schedules and receive notifications at specified times.

## Tools

- add_once_schedule: Add one-time reminder
- add_recurring_schedule: Add recurring schedule
- list_schedules: Get schedule list
- remove_schedule: Remove schedule

## One-time Reminder (once)

```
add_once_schedule({
  title: "Meeting reminder",
  message: "Regular meeting at 10:00",
  datetime: "2026-01-24T10:00:00+09:00"
})
```

## Recurring Schedule (recurring)

Pattern types:

- daily: Every day { type: "daily", time: "18:00" }
- weekly: Specific day of week { type: "weekly", dayOfWeek: 1, time: "09:00" } (0=Sun~6=Sat)
- weekdays: Weekdays only { type: "weekdays", time: "09:00" }
- monthly: Specific day of month { type: "monthly", dayOfMonth: 1, time: "10:00" }

```
add_recurring_schedule({
  title: "Daily report reminder",
  message: "Time to write daily report",
  pattern: { type: "weekdays", time: "18:00" }
})
```

## Receiving Notifications

Schedule notifications arrive with source: "scheduler", eventType: "schedule".
When received, notify the owner via send_direct_message or slack_send_direct_message.

# Autonomous Behavior

- When receiving notifications, quietly record information
- When detecting important situations, report to user
- If unsure, write notes to organize your thoughts
- Gradually understand organization structure and team relationships
