import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddEmployee } from "@/hooks/useEmployees";

const departments = ["Engineering", "Design", "Marketing", "HR", "Finance", "Admin", "IT", "Operations", "Sales"];
const employmentTypes = ["full-time", "part-time", "contract", "intern"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddEmployeeDialog({ open, onOpenChange }: Props) {
  const addEmployee = useAddEmployee();
  const [form, setForm] = useState({
    name: "", employee_id: "", department: "", designation: "", manager: "",
    joining_date: "", date_of_birth: "", email: "", phone: "",
    employment_type: "full-time", location: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.employee_id.trim()) e.employee_id = "Required";
    if (!form.department) e.department = "Required";
    if (!form.designation.trim()) e.designation = "Required";
    if (!form.joining_date) e.joining_date = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const initials = form.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
    await addEmployee.mutateAsync({
      ...form,
      avatar: initials,
      email: form.email || null,
      phone: form.phone || null,
      manager: form.manager || null,
      date_of_birth: form.date_of_birth || null,
      location: form.location || null,
      status: "active",
      onboarding_status: "not-started",
      onboarding_progress: 0,
      exit_status: "none",
      exit_progress: 0,
      last_working_day: null,
      exit_date: null,
      exit_interview_notes: null,
      fnf_status: null,
    });
    setForm({ name: "", employee_id: "", department: "", designation: "", manager: "", joining_date: "", date_of_birth: "", email: "", phone: "", employment_type: "full-time", location: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Employee Name *" error={errors.name}>
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="John Doe" />
          </Field>
          <Field label="Employee ID *" error={errors.employee_id}>
            <Input value={form.employee_id} onChange={(e) => update("employee_id", e.target.value)} placeholder="RT-1001" />
          </Field>
          <Field label="Department *" error={errors.department}>
            <Select value={form.department} onValueChange={(v) => update("department", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Designation *" error={errors.designation}>
            <Input value={form.designation} onChange={(e) => update("designation", e.target.value)} placeholder="Software Engineer" />
          </Field>
          <Field label="Manager">
            <Input value={form.manager} onChange={(e) => update("manager", e.target.value)} placeholder="Manager name" />
          </Field>
          <Field label="Joining Date *" error={errors.joining_date}>
            <Input type="date" value={form.joining_date} onChange={(e) => update("joining_date", e.target.value)} />
          </Field>
          <Field label="Date of Birth">
            <Input type="date" value={form.date_of_birth} onChange={(e) => update("date_of_birth", e.target.value)} />
          </Field>
          <Field label="Work Email">
            <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="email@company.com" />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 9876543210" />
          </Field>
          <Field label="Employment Type">
            <Select value={form.employment_type} onValueChange={(v) => update("employment_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{employmentTypes.map((t) => <SelectItem key={t} value={t}>{t.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Location">
            <Input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="City" />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={addEmployee.isPending}>
            {addEmployee.isPending ? "Adding..." : "Add Employee"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
