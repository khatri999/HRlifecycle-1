import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Search, Plus, Upload } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEmployees, computeExperience } from "@/hooks/useEmployees";
import { AddEmployeeDialog } from "@/components/employees/AddEmployeeDialog";
import { ImportDataDialog } from "@/components/employees/ImportDataDialog";
import { ExportDataDropdown } from "@/components/employees/ExportDataDropdown";

const Employees = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const { data: employees = [], isLoading } = useEmployees();

  const filtered = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.employee_id.toLowerCase().includes(search.toLowerCase()) ||
      emp.department.toLowerCase().includes(search.toLowerCase()) ||
      (emp.manager || "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || emp.status === filter;
    return matchesSearch && matchesFilter;
  });

  const filters = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "onboarding", label: "Onboarding" },
    { value: "notice-period", label: "Notice Period" },
    { value: "exited", label: "Exited" },
  ];

  return (
    <AppLayout title="Employee Directory" subtitle={`${employees.length} employees`}>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, ID, department, manager..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Employee
          </Button>
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
            <Upload className="w-4 h-4 mr-1.5" /> Import
          </Button>
          <ExportDataDropdown />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              filter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Employee</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">ID</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Department</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Manager</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Joining Date</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Experience</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground text-sm">Loading...</td>
                </tr>
              ) : (
                filtered.map((emp) => (
                  <tr key={emp.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                          {emp.avatar || emp.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{emp.name}</p>
                          <p className="text-xs text-muted-foreground">{emp.designation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{emp.employee_id}</td>
                    <td className="py-3 px-4 text-muted-foreground">{emp.department}</td>
                    <td className="py-3 px-4 text-muted-foreground">{emp.manager || "—"}</td>
                    <td className="py-3 px-4 text-muted-foreground">{emp.joining_date}</td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">{computeExperience(emp.joining_date)}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={emp.status as any} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">No employees found.</div>
        )}
      </div>

      <AddEmployeeDialog open={addOpen} onOpenChange={setAddOpen} />
      <ImportDataDialog open={importOpen} onOpenChange={setImportOpen} />
    </AppLayout>
  );
};

export default Employees;
