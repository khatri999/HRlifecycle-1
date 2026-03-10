import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { employees, onboardingTasks } from "@/data/mockData";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronRight } from "lucide-react";

const Onboarding = () => {
  const onboardingEmployees = employees.filter(
    (e) => e.status === "onboarding" || e.onboardingStatus === "in-progress"
  );
  const [expandedId, setExpandedId] = useState<string | null>(onboardingEmployees[0]?.id || null);

  const getTasksForEmployee = (empId: string) =>
    onboardingTasks.filter((t) => t.employeeId === empId);

  const categories = ["HR", "IT", "Admin", "Manager", "Employee"] as const;

  return (
    <AppLayout title="Onboarding" subtitle={`${onboardingEmployees.length} employees currently onboarding`}>
      <div className="space-y-4">
        {onboardingEmployees.map((emp) => {
          const tasks = getTasksForEmployee(emp.id);
          const isExpanded = expandedId === emp.id;
          const completedTasks = tasks.filter((t) => t.status === "completed").length;

          return (
            <div key={emp.id} className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
              {/* Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : emp.id)}
                className="w-full flex items-center gap-4 p-5 hover:bg-muted/20 transition-colors"
              >
                <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                  {emp.avatar}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-medium text-foreground">{emp.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {emp.role} · {emp.department} · Joining {emp.joiningDate}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-muted-foreground">{completedTasks}/{tasks.length} tasks</p>
                  </div>
                  <ProgressRing progress={emp.onboardingProgress} />
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Expanded tasks */}
              {isExpanded && tasks.length > 0 && (
                <div className="border-t border-border px-5 pb-5">
                  {categories.map((cat) => {
                    const catTasks = tasks.filter((t) => t.category === cat);
                    if (catTasks.length === 0) return null;
                    return (
                      <div key={cat} className="mt-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          {cat}
                        </p>
                        <div className="space-y-2">
                          {catTasks.map((task) => (
                            <div
                              key={task.id}
                              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                            >
                              {task.status === "completed" ? (
                                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                              ) : task.status === "in-progress" ? (
                                <Clock className="w-4 h-4 text-info shrink-0" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className={cn("text-sm", task.status === "completed" ? "text-muted-foreground line-through" : "text-foreground")}>
                                  {task.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {task.assignedTo} · Due {task.deadline}
                                </p>
                              </div>
                              <StatusBadge status={task.status} />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {isExpanded && tasks.length === 0 && (
                <div className="border-t border-border p-5 text-center text-sm text-muted-foreground">
                  No tasks assigned yet. Onboarding workflow will be generated automatically.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
};

export default Onboarding;
