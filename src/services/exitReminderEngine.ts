import { type ExitTask, type Employee } from "@/data/mockData";
import { toast } from "sonner";

export interface ReminderEmail {
  to: string;
  subject: string;
  employeeName: string;
  employeeId: string;
  department: string;
  taskDescription: string;
  lastWorkingDay: string;
  clearanceLink: string;
  reminderLevel: 1 | 2 | 3;
}

function getHoursElapsed(createdAt: string): number {
  return (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
}

function getReminderLevel(hoursElapsed: number, remindersSent: number): 1 | 2 | 3 | null {
  // For demo: use compressed timescale (seconds instead of hours)
  // In production, thresholds would be 24, 48, 72 hours
  if (hoursElapsed >= 72 && remindersSent < 3) return 3;
  if (hoursElapsed >= 48 && remindersSent < 2) return 2;
  if (hoursElapsed >= 24 && remindersSent < 1) return 1;
  return null;
}

export function generateReminderEmail(
  task: ExitTask,
  employee: Employee,
  reminderLevel: 1 | 2 | 3
): ReminderEmail {
  const levelLabels = { 1: "First", 2: "Second", 3: "Final" };
  return {
    to: `${task.assignedDepartment.toLowerCase()}@realthingks.com`,
    subject: `[${levelLabels[reminderLevel]} Reminder] Pending Clearance Task – ${employee.name} (${employee.employeeId})`,
    employeeName: employee.name,
    employeeId: employee.employeeId,
    department: task.assignedDepartment,
    taskDescription: task.title,
    lastWorkingDay: employee.lastWorkingDay || "TBD",
    clearanceLink: `/exit`,
    reminderLevel,
  };
}

export function checkAndSendReminders(
  tasks: ExitTask[],
  employees: Employee[]
): { updatedTasks: ExitTask[]; remindersSent: ReminderEmail[] } {
  const remindersSentList: ReminderEmail[] = [];
  const employeeMap = new Map(employees.map((e) => [e.id, e]));

  const updatedTasks = tasks.map((task) => {
    if (task.status === "completed") return task;

    const hoursElapsed = getHoursElapsed(task.createdAt);
    const level = getReminderLevel(hoursElapsed, task.remindersSent);

    if (!level) {
      // Still mark as delayed if 48+ hours and not completed
      if (hoursElapsed >= 48 && task.status !== "delayed" && task.status !== "in-progress") {
        return { ...task, status: "delayed" as const };
      }
      return task;
    }

    const employee = employeeMap.get(task.employeeId);
    if (!employee) return task;

    const email = generateReminderEmail(task, employee, level);
    remindersSentList.push(email);

    // Log simulated email
    console.log(
      `📧 [${level === 3 ? "FINAL" : level === 2 ? "SECOND" : "FIRST"} REMINDER] To: ${email.to} | Task: "${task.title}" | Employee: ${employee.name} (${employee.employeeId}) | LWD: ${email.lastWorkingDay}`
    );

    if (level === 3) {
      console.log(`🚨 [HR ADMIN NOTIFIED] Final reminder escalation for task "${task.title}" – ${employee.name}`);
    }

    // Show toast for the reminder
    const levelLabel = level === 3 ? "Final" : level === 2 ? "Second" : "First";
    toast.warning(`${levelLabel} Reminder: "${task.title}" for ${employee.name} is still pending`, {
      description: `Assigned to ${task.assignedDepartment} · LWD: ${email.lastWorkingDay}`,
      duration: 5000,
    });

    return {
      ...task,
      remindersSent: level,
      lastReminderAt: new Date().toISOString(),
      status: (hoursElapsed >= 48 && task.status !== "in-progress" ? "delayed" : task.status) as ExitTask["status"],
    };
  });

  return { updatedTasks, remindersSent: remindersSentList };
}

export function getDelayedTasks(tasks: ExitTask[]): ExitTask[] {
  return tasks.filter((t) => {
    if (t.status === "completed") return false;
    const hoursElapsed = getHoursElapsed(t.createdAt);
    return hoursElapsed >= 48 || t.status === "delayed";
  });
}

export function startReminderPolling(
  getTasks: () => ExitTask[],
  getEmployees: () => Employee[],
  onUpdate: (updatedTasks: ExitTask[]) => void,
  intervalMs = 60000
): () => void {
  const check = () => {
    const tasks = getTasks();
    const employees = getEmployees();
    const { updatedTasks, remindersSent } = checkAndSendReminders(tasks, employees);

    if (remindersSent.length > 0) {
      onUpdate(updatedTasks);
    }
  };

  // Run immediately on start
  check();

  const id = setInterval(check, intervalMs);
  return () => clearInterval(id);
}
