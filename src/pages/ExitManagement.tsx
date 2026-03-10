import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { employees, exitTasks } from "@/data/mockData";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronRight, FileText } from "lucide-react";

const ExitManagement = () => {
  const exitEmployees = employees.filter(
    (e) => e.status === "notice-period" || e.exitStatus !== "none"
  );
  const [expandedId, setExpandedId] = useState<string | null>(exitEmployees[0]?.id || null);

  const getTasksForEmployee = (empId: string) =>
    exitTasks.filter((t) => t.employeeId === empId);

  const categories = ["Manager", "IT", "Admin", "Finance", "HR"] as const;

  const exitSteps = [
    "Resignation Submitted",
    "Manager Approval",
    "HR Acknowledgement",
    "Exit Checklist",
    "Department Clearance",
    "Exit Interview",
    "Final Settlement",
    "Relieving Letter",
  ];

  const getStepProgress = (emp: typeof exitEmployees[0]) => {
    if (emp.exitStatus === "resignation-submitted") return 1;
    if (emp.exitStatus === "notice-period") return 3;
    if (emp.exitStatus === "clearance") return 5;
    if (emp.exitStatus === "completed") return 8;
    return 0;
  };

  return (
    <AppLayout title="Exit Management" subtitle={`${exitEmployees.length} employees in exit process`}>
      <div className="space-y-4">
        {exitEmployees.map((emp) => {
          const tasks = getTasksForEmployee(emp.id);
          const isExpanded = expandedId === emp.id;
          const stepProgress = getStepProgress(emp);

          return (
            <div key={emp.id} className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
              <button
                onClick={() => setExpandedId(isExpanded ? null : emp.id)}
                className="w-full flex items-center gap-4 p-5 hover:bg-muted/20 transition-colors"
              >
                <div className="w-11 h-11 rounded-full bg-warning/10 text-warning flex items-center justify-center text-sm font-semibold shrink-0">
                  {emp.avatar}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-medium text-foreground">{emp.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {emp.role} · {emp.department} · LWD: {emp.lastWorkingDay || "TBD"}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={emp.exitStatus} />
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border px-5 pb-5">
                  {/* Exit Progress Steps */}
                  <div className="mt-4 mb-6">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Exit Progress</p>
                    <div className="flex items-center gap-1 overflow-x-auto pb-2">
                      {exitSteps.map((step, i) => (
                        <div key={step} className="flex items-center shrink-0">
                          <div className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium",
                            i < stepProgress ? "bg-success/10 text-success" : i === stepProgress ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                          )}>
                            {i < stepProgress ? <CheckCircle2 className="w-3 h-3" /> : <span className="w-3 h-3 rounded-full border border-current flex items-center justify-center text-[8px]">{i + 1}</span>}
                            <span className="hidden lg:inline">{step}</span>
                          </div>
                          {i < exitSteps.length - 1 && <div className={cn("w-4 h-px mx-0.5", i < stepProgress ? "bg-success" : "bg-border")} />}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Clearance Tasks */}
                  {tasks.length > 0 && (
                    <>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Clearance Tasks</p>
                      {categories.map((cat) => {
                        const catTasks = tasks.filter((t) => t.category === cat);
                        if (catTasks.length === 0) return null;
                        return (
                          <div key={cat} className="mt-3">
                            <p className="text-xs font-medium text-muted-foreground mb-1.5">{cat}</p>
                            <div className="space-y-2">
                              {catTasks.map((task) => (
                                <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
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
                                    <p className="text-xs text-muted-foreground">{task.assignedTo}</p>
                                  </div>
                                  <StatusBadge status={task.status} />
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
};

export default ExitManagement;
