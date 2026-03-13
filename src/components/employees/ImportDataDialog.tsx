import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, AlertTriangle, CheckCircle } from "lucide-react";
import { useBulkInsertEmployees, type EmployeeInsert } from "@/hooks/useEmployees";
import * as XLSX from "xlsx";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ParsedRow {
  data: EmployeeInsert;
  errors: string[];
  rowNum: number;
}

const COLUMN_MAP: Record<string, string> = {
  "employee id": "employee_id", "employee_id": "employee_id", "emp id": "employee_id", "id": "employee_id",
  "employee name": "name", "name": "name", "full name": "name",
  "department": "department", "dept": "department",
  "designation": "designation", "role": "designation", "title": "designation", "position": "designation",
  "manager": "manager", "reporting manager": "manager", "reports to": "manager",
  "joining date": "joining_date", "joining_date": "joining_date", "date of joining": "joining_date", "doj": "joining_date",
  "date of birth": "date_of_birth", "date_of_birth": "date_of_birth", "dob": "date_of_birth",
  "work email": "email", "email": "email", "email address": "email",
  "phone number": "phone", "phone": "phone", "mobile": "phone", "contact": "phone",
  "employment status": "status", "status": "status",
  "employment type": "employment_type", "employment_type": "employment_type", "type": "employment_type",
  "location": "location", "city": "location",
};

const REQUIRED_FIELDS = ["employee_id", "name", "department", "designation", "joining_date"];

function parseDate(val: any): string | null {
  if (!val) return null;
  if (typeof val === "number") {
    // Excel serial date
    const d = XLSX.SSF.parse_date_code(val);
    if (d) return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
  }
  const str = String(val).trim();
  // Try ISO
  const iso = new Date(str);
  if (!isNaN(iso.getTime())) return iso.toISOString().split("T")[0];
  // Try DD/MM/YYYY or DD-MM-YYYY
  const parts = str.split(/[\/\-\.]/);
  if (parts.length === 3) {
    const [a, b, c] = parts;
    if (c.length === 4) return `${c}-${b.padStart(2, "0")}-${a.padStart(2, "0")}`;
  }
  return null;
}

function mapRow(raw: Record<string, any>, colMapping: Record<string, string>): { mapped: Record<string, any>; unmapped: string[] } {
  const mapped: Record<string, any> = {};
  const unmapped: string[] = [];
  for (const [origCol, value] of Object.entries(raw)) {
    const targetField = colMapping[origCol];
    if (targetField) {
      mapped[targetField] = value;
    } else {
      unmapped.push(origCol);
    }
  }
  return { mapped, unmapped };
}

function validateRow(mapped: Record<string, any>, rowNum: number): ParsedRow {
  const errors: string[] = [];
  for (const f of REQUIRED_FIELDS) {
    if (!mapped[f] || String(mapped[f]).trim() === "") {
      errors.push(`Missing ${f.replace(/_/g, " ")}`);
    }
  }
  // Parse dates
  if (mapped.joining_date) {
    const parsed = parseDate(mapped.joining_date);
    if (!parsed) errors.push("Invalid joining date");
    else mapped.joining_date = parsed;
  }
  if (mapped.date_of_birth) {
    const parsed = parseDate(mapped.date_of_birth);
    if (parsed) mapped.date_of_birth = parsed;
    else mapped.date_of_birth = null;
  }

  const statusMap: Record<string, string> = { active: "active", onboarding: "onboarding", "notice period": "notice-period", "notice-period": "notice-period", exited: "exited" };
  const rawStatus = String(mapped.status || "active").toLowerCase().trim();
  mapped.status = statusMap[rawStatus] || "active";

  const initials = mapped.name ? String(mapped.name).split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) : "??";

  const data: EmployeeInsert = {
    employee_id: String(mapped.employee_id || "").trim(),
    name: String(mapped.name || "").trim(),
    department: String(mapped.department || "").trim(),
    designation: String(mapped.designation || "").trim(),
    manager: mapped.manager ? String(mapped.manager).trim() : null,
    joining_date: mapped.joining_date || "",
    date_of_birth: mapped.date_of_birth || null,
    email: mapped.email ? String(mapped.email).trim() : null,
    phone: mapped.phone ? String(mapped.phone).trim() : null,
    status: mapped.status,
    onboarding_status: mapped.status === "onboarding" ? "in-progress" : "not-started",
    onboarding_progress: mapped.status === "onboarding" ? 0 : (mapped.status === "active" ? 100 : 0),
    exit_status: mapped.status === "exited" ? "completed" : "none",
    exit_progress: mapped.status === "exited" ? 100 : 0,
    last_working_day: null,
    avatar: initials,
    location: mapped.location ? String(mapped.location).trim() : null,
    employment_type: mapped.employment_type ? String(mapped.employment_type).trim().toLowerCase() : "full-time",
    exit_date: null,
    exit_interview_notes: null,
    fnf_status: null,
  };

  return { data, errors, rowNum };
}

export function ImportDataDialog({ open, onOpenChange }: Props) {
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [step, setStep] = useState<"upload" | "preview">("upload");
  const fileRef = useRef<HTMLInputElement>(null);
  const bulkInsert = useBulkInsertEmployees();

  const reset = () => {
    setParsedRows([]);
    setFileName("");
    setStep("upload");
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });

      if (json.length === 0) return;

      // Build column mapping from header names
      const headers = Object.keys(json[0]);
      const colMapping: Record<string, string> = {};
      for (const h of headers) {
        const normalized = h.toLowerCase().trim();
        if (COLUMN_MAP[normalized]) {
          colMapping[h] = COLUMN_MAP[normalized];
        }
      }

      const rows = json.map((raw, i) => {
        const { mapped } = mapRow(raw, colMapping);
        return validateRow(mapped, i + 2); // +2 for 1-indexed + header row
      });

      setParsedRows(rows);
      setStep("preview");
    };
    reader.readAsArrayBuffer(file);
  };

  const validRows = parsedRows.filter((r) => r.errors.length === 0);
  const errorRows = parsedRows.filter((r) => r.errors.length > 0);

  const handleImport = async () => {
    if (validRows.length === 0) return;
    await bulkInsert.mutateAsync(validRows.map((r) => r.data));
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Employee Data</DialogTitle>
          <DialogDescription>Upload a CSV or Excel file. Columns are auto-mapped to employee fields.</DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-7 h-7 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground text-center">Supported formats: .csv, .xlsx</p>
            <p className="text-xs text-muted-foreground text-center max-w-sm">
              Required columns: Employee ID, Name, Department, Designation, Joining Date
            </p>
            <Button onClick={() => fileRef.current?.click()}>Choose File</Button>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFile} />
          </div>
        )}

        {step === "preview" && (
          <>
            <div className="flex items-center gap-4 text-sm mb-2">
              <span className="text-muted-foreground">File: <strong className="text-foreground">{fileName}</strong></span>
              <span className="flex items-center gap-1 text-success"><CheckCircle className="w-3.5 h-3.5" /> {validRows.length} valid</span>
              {errorRows.length > 0 && <span className="flex items-center gap-1 text-destructive"><AlertTriangle className="w-3.5 h-3.5" /> {errorRows.length} errors</span>}
            </div>

            <div className="border border-border rounded-lg overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="py-2 px-3 text-left text-muted-foreground font-medium">Row</th>
                    <th className="py-2 px-3 text-left text-muted-foreground font-medium">Employee ID</th>
                    <th className="py-2 px-3 text-left text-muted-foreground font-medium">Name</th>
                    <th className="py-2 px-3 text-left text-muted-foreground font-medium">Department</th>
                    <th className="py-2 px-3 text-left text-muted-foreground font-medium">Designation</th>
                    <th className="py-2 px-3 text-left text-muted-foreground font-medium">Joining Date</th>
                    <th className="py-2 px-3 text-left text-muted-foreground font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map((row, i) => (
                    <tr key={i} className={row.errors.length > 0 ? "bg-destructive/5" : "hover:bg-muted/20"}>
                      <td className="py-2 px-3 font-mono">{row.rowNum}</td>
                      <td className="py-2 px-3">{row.data.employee_id}</td>
                      <td className="py-2 px-3">{row.data.name}</td>
                      <td className="py-2 px-3">{row.data.department}</td>
                      <td className="py-2 px-3">{row.data.designation}</td>
                      <td className="py-2 px-3">{row.data.joining_date}</td>
                      <td className="py-2 px-3">
                        {row.errors.length > 0 ? (
                          <span className="text-destructive">{row.errors.join(", ")}</span>
                        ) : (
                          <span className="text-success">Valid</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={reset}>Upload Different File</Button>
              <Button onClick={handleImport} disabled={validRows.length === 0 || bulkInsert.isPending}>
                {bulkInsert.isPending ? "Importing..." : `Import ${validRows.length} Employee${validRows.length > 1 ? "s" : ""}`}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
