

## Plan: Add Automatic Reminder System for Exit Clearance Tasks

### Context

The app currently uses **mock data** (not Supabase) for exit tasks. There are no edge functions yet. The `exit_dept_tasks` table exists in Supabase but the app's exit workflow runs entirely off `src/data/mockData.ts`. Since the user said "do not change the UI," this will be a logic-layer addition that works with the existing mock data model client-side, plus a "Delayed" status indicator for tasks pending 48+ hours.

### What Will Be Built

**1. Extend the data model with reminder tracking**

In `src/data/mockData.ts`:
- Add `"delayed"` to `TaskStatus` type
- Add `createdAt` field to `ExitTask` interface (timestamp when task was assigned)
- Add `remindersSent` field to `ExitTask` (count: 0, 1, 2, or 3)
- Add `lastReminderAt` field to `ExitTask` (optional timestamp)
- Update `generateExitTasks()` to populate `createdAt` with current timestamp and `remindersSent: 0`
- Update existing mock `exitTasks` entries with `createdAt` dates matching their creation context

**2. Create a reminder engine service**

New file `src/services/exitReminderEngine.ts`:
- `checkAndSendReminders(tasks: ExitTask[], employees: Employee[])` — iterates all non-completed exit tasks, calculates hours elapsed since `createdAt`, and determines reminder tier (24h = first, 48h = second + mark delayed, 72h = final + notify HR)
- `generateReminderEmail(task, employee, reminderLevel)` — returns a structured reminder object with employee name, ID, department, task description, LWD, and link
- `getDelayedTasks(tasks: ExitTask[])` — returns tasks pending 48+ hours (for dashboard use)
- The engine logs reminders to console and triggers toast notifications (simulating email since there's no email backend yet)
- Exports a `startReminderPolling()` function that runs checks on an interval

**3. Integrate reminder polling into the Exit Management page**

In `src/pages/ExitManagement.tsx`:
- Import and call `startReminderPolling()` via `useEffect` on mount (with cleanup)
- The polling interval checks every 60 seconds (accelerated for demo; represents the 24h schedule)
- When a reminder fires, add a notification to the notification system and show a toast

**4. Add "Delayed" status to StatusBadge**

In `src/components/shared/StatusBadge.tsx`:
- Add `"delayed"` entry to `statusConfig` with a red/orange style (e.g., `bg-destructive/10 text-destructive`)
- Update the `StatusType` union

**5. Mark delayed tasks automatically**

In the reminder engine, when a task has been pending for 48+ hours, update its status to `"delayed"` so the existing task list and clearance tracker show the delayed indicator without any UI structural changes.

**6. Update notification mock data**

Add reminder-type notifications to `src/data/mockData.ts` with type `"deadline-reminder"` to demonstrate the feature with existing mock data (e.g., tasks for Ananya Reddy that are already overdue based on mock dates).

### Technical Details

- **No backend/email integration**: Reminders are simulated client-side. Toast notifications and console logs represent where real emails would be sent. This keeps the feature demonstrable without requiring Supabase edge functions or email setup.
- **Polling uses `setInterval`** with cleanup in `useEffect` return.
- **"Delayed" is a visual status only** — it applies to tasks pending 48+ hours, distinct from "overdue" (past deadline). The reminder engine marks tasks as delayed by mutating the task's status field in the local state.
- **No UI layout changes** — only the new "Delayed" badge color and the automatic toast/notification additions.

