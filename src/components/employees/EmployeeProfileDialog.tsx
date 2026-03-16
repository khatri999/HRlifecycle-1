import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { type EmployeeRow, computeExperience, useUpdateEmployee } from "@/hooks/useEmployees";
import { Pencil } from "lucide-react";

interface Props {
  employee: EmployeeRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const departments = ["Engineering", "Product", "Design", "Marketing", "Sales", "HR", "Finance", "Operations", "Legal", "Admin", "IT"];
const statuses = ["active", "onboarding", "notice-period", "exited"];
const employmentTypes = ["Full-Time", "Part-Time", "Contract", "Intern"];

export function EmployeeProfileDialog({ employee, open, onOpenChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<EmployeeRow>>({});
  const updateEmployee = useUpdateEmployee();

  useEffect(() => {
    if (employee) {
      setForm({ ...employee });
      setEditing(false);
    }
  }, [employee]);

  if (!employee) return null;

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    const { id, created_at, updated_at, ...rest } = form as EmployeeRow;
    await updateEmployee.mutateAsync({ id: employee.id, ...rest });
    setEditing(false);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setForm({ ...employee });
    setEditing(false);
  };

  const experience = computeExperience(form.joining_date || employee.joining_date);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                {employee.avatar || employee.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </div>
              <div>
                <DialogTitle className="text-lg">{employee.name}</DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{employee.designation}</p>
              </div>
            </div>
            {!editing && (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-2">
          <Field label="Employee ID">
            <p className="text-sm font-mono text-foreground">{employee.employee_id}</p>
          </Field>

          <Field label="Employment Status">
            {editing ? (
              <Select value={form.status || ""} onValueChange={(v) => update("status", v)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => <SelectItem key={s} value={s}>{s.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : (
              <StatusBadge status={employee.status as any} />
            )}
          </Field>

          <Field label="Employee Name">
            {editing ? <Input className="h-9" value={form.name || ""} onChange={(e) => update("name", e.target.value)} /> : <p className="text-sm text-foreground">{employee.name}</p>}
          </Field>

          <Field label="Department">
            {editing ? (
              <Select value={form.department || ""} onValueChange={(v) => update("department", v)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : <p className="text-sm text-foreground">{employee.department}</p>}
          </Field>

          <Field label="Designation">
            {editing ? <Input className="h-9" value={form.designation || ""} onChange={(e) => update("designation", e.target.value)} /> : <p className="text-sm text-foreground">{employee.designation}</p>}
          </Field>

          <Field label="Manager">
            {editing ? <Input className="h-9" value={form.manager || ""} onChange={(e) => update("manager", e.target.value)} /> : <p className="text-sm text-foreground">{employee.manager || "—"}</p>}
          </Field>

          <Field label="Joining Date">
            {editing ? <Input className="h-9" type="date" value={form.joining_date || ""} onChange={(e) => update("joining_date", e.target.value)} /> : <p className="text-sm text-foreground">{employee.joining_date}</p>}
          </Field>

          <Field label="Date of Birth">
            {editing ? <Input className="h-9" type="date" value={form.date_of_birth || ""} onChange={(e) => update("date_of_birth", e.target.value)} /> : <p className="text-sm text-foreground">{employee.date_of_birth || "—"}</p>}
          </Field>

          <Field label="Work Email">
            {editing ? <Input className="h-9" type="email" value={form.email || ""} onChange={(e) => update("email", e.target.value)} /> : <p className="text-sm text-foreground">{employee.email || "—"}</p>}
          </Field>

          <Field label="Phone Number">
            {editing ? <Input className="h-9" value={form.phone || ""} onChange={(e) => update("phone", e.target.value)} /> : <p className="text-sm text-foreground">{employee.phone || "—"}</p>}
          </Field>

          <Field label="Employment Type">
            {editing ? (
              <Select value={form.employment_type || ""} onValueChange={(v) => update("employment_type", v)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {employmentTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : <p className="text-sm text-foreground">{employee.employment_type || "—"}</p>}
          </Field>

          <Field label="Experience in RealThingks">
            <p className="text-sm text-foreground">{experience}</p>
          </Field>
        </div>

        {editing && (
          <DialogFooter className="mt-4">
            <Button variant="outline" size="sm" onClick={handleCancel}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={updateEmployee.isPending}>
              {updateEmployee.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
