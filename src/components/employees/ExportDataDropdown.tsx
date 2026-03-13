import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { computeExperience } from "@/hooks/useEmployees";
import { toast } from "sonner";
import * as XLSX from "xlsx";

type ExportFilter = "all" | "active" | "onboarding" | "notice-period" | "exited";
type ExportFormat = "csv" | "xlsx";

async function fetchEmployees(filter: ExportFilter) {
  let query = supabase.from("employees").select("*").order("name");
  if (filter !== "all") query = query.eq("status", filter);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

function formatForExport(rows: any[]) {
  return rows.map((r) => ({
    "Employee ID": r.employee_id,
    "Name": r.name,
    "Email": r.email || "",
    "Department": r.department,
    "Designation": r.designation,
    "Manager": r.manager || "",
    "Joining Date": r.joining_date,
    "Date of Birth": r.date_of_birth || "",
    "Phone": r.phone || "",
    "Status": r.status,
    "Employment Type": r.employment_type || "",
    "Location": r.location || "",
    "Experience": computeExperience(r.joining_date),
    "Last Working Day": r.last_working_day || "",
    "Exit Date": r.exit_date || "",
    "F&F Status": r.fnf_status || "",
  }));
}

function downloadFile(data: any[], format: ExportFormat, filterLabel: string) {
  const formatted = formatForExport(data);
  const ws = XLSX.utils.json_to_sheet(formatted);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Employees");

  const fileName = `employees_${filterLabel}_${new Date().toISOString().split("T")[0]}`;
  if (format === "csv") {
    XLSX.writeFile(wb, `${fileName}.csv`, { bookType: "csv" });
  } else {
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }
}

export function ExportDataDropdown() {
  const [loading, setLoading] = useState(false);

  const handleExport = async (filter: ExportFilter, format: ExportFormat) => {
    setLoading(true);
    try {
      const data = await fetchEmployees(filter);
      if (data.length === 0) {
        toast.info("No data to export");
        return;
      }
      downloadFile(data, format, filter);
      toast.success(`Exported ${data.length} employees`);
    } catch (err: any) {
      toast.error(err.message || "Export failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading}>
          <Download className="w-4 h-4 mr-1.5" />
          {loading ? "Exporting..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Export as Excel</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleExport("all", "xlsx")}>All Employees</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("active", "xlsx")}>Active Employees</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("notice-period", "xlsx")}>Notice Period</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("exited", "xlsx")}>Exited Employees</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Export as CSV</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleExport("all", "csv")}>All Employees</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("active", "csv")}>Active Employees</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("notice-period", "csv")}>Notice Period</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("exited", "csv")}>Exited Employees</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
