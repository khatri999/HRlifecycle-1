import { AppLayout } from "@/components/layout/AppLayout";
import { MetricCard } from "@/components/shared/MetricCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { employees, dashboardStats, onboardingTasks, exitTasks } from "@/data/mockData";
import {
  Users, UserPlus, Clock, AlertCircle, CheckCircle2, LogOut, CalendarDays, ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const onboardingEmployees = employees.filter((e) => e.status === "onboarding");
  const noticePeriodEmployees = employees.filter((e) => e.status === "notice-period");
  const pendingTasks = [...onboardingTasks, ...exitTasks].filter((t) => t.status === "pending");

  return (
    <AppLayout title="Dashboard" subtitle="Welcome back! Here's your HR overview.">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Total Employees"
          value={dashboardStats.totalEmployees}
          icon={Users}
          subtitle={`${dashboardStats.activeEmployees} active`}
        />
        <MetricCard
          title="Onboarding"
          value={dashboardStats.onboarding}
          icon={UserPlus}
          subtitle="New joiners this month"
          iconClassName="bg-info/10 text-info"
        />
        <MetricCard
          title="Notice Period"
          value={dashboardStats.noticePeriod}
          icon={Clock}
          subtitle="Serving notice"
          iconClassName="bg-warning/10 text-warning"
        />
        <MetricCard
          title="Pending Approvals"
          value={dashboardStats.pendingApprovals}
          icon={AlertCircle}
          subtitle="Require your action"
          iconClassName="bg-destructive/10 text-destructive"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Onboarding Progress */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-foreground">Onboarding Progress</h2>
            <Link to="/onboarding" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-4">
            {onboardingEmployees.map((emp) => (
              <div key={emp.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                  {emp.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{emp.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {emp.role} · Joining {emp.joiningDate}
                  </p>
                </div>
                <ProgressRing progress={emp.onboardingProgress} />
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
          <h2 className="font-display font-semibold text-foreground mb-5">Upcoming</h2>
          <div className="space-y-3">
            {onboardingEmployees.map((emp) => (
              <div key={emp.id} className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 border border-accent">
                <CalendarDays className="w-4 h-4 text-accent-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">{emp.name}</p>
                  <p className="text-xs text-muted-foreground">Joining {emp.joiningDate}</p>
                </div>
              </div>
            ))}
            {noticePeriodEmployees.map((emp) => (
              <div key={emp.id} className="flex items-start gap-3 p-3 rounded-lg bg-warning/5 border border-warning/20">
                <LogOut className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">{emp.name}</p>
                  <p className="text-xs text-muted-foreground">LWD {emp.lastWorkingDay}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Tasks */}
      <div className="mt-6 bg-card rounded-xl border border-border p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-semibold text-foreground">Pending Tasks</h2>
          <Link to="/tasks" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2.5 px-3 text-muted-foreground font-medium">Task</th>
                <th className="text-left py-2.5 px-3 text-muted-foreground font-medium">Assigned To</th>
                <th className="text-left py-2.5 px-3 text-muted-foreground font-medium">Department</th>
                <th className="text-left py-2.5 px-3 text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {pendingTasks.slice(0, 5).map((task) => (
                <tr key={task.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-3 font-medium text-foreground">{task.title}</td>
                  <td className="py-3 px-3 text-muted-foreground">{task.assignedTo}</td>
                  <td className="py-3 px-3 text-muted-foreground">{task.assignedDepartment}</td>
                  <td className="py-3 px-3"><StatusBadge status={task.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
