import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EmployeeRow {
  id: string;
  employee_id: string;
  name: string;
  email: string | null;
  department: string;
  designation: string;
  manager: string | null;
  joining_date: string;
  date_of_birth: string | null;
  phone: string | null;
  status: string;
  onboarding_status: string | null;
  onboarding_progress: number | null;
  exit_status: string | null;
  exit_progress: number | null;
  last_working_day: string | null;
  avatar: string | null;
  location: string | null;
  employment_type: string | null;
  exit_date: string | null;
  exit_interview_notes: string | null;
  fnf_status: string | null;
  created_at: string;
  updated_at: string;
}

export type EmployeeInsert = Omit<EmployeeRow, "id" | "created_at" | "updated_at">;

export function useEmployees(statusFilter?: string) {
  return useQuery({
    queryKey: ["employees", statusFilter],
    queryFn: async () => {
      let query = supabase.from("employees").select("*").order("created_at", { ascending: false });
      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as EmployeeRow[];
    },
  });
}

export function useEmployeeStats() {
  return useQuery({
    queryKey: ["employee-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("employees").select("status");
      if (error) throw error;
      const rows = data || [];
      return {
        total: rows.length,
        active: rows.filter((r) => r.status === "active").length,
        onboarding: rows.filter((r) => r.status === "onboarding").length,
        noticePeriod: rows.filter((r) => r.status === "notice-period").length,
        exited: rows.filter((r) => r.status === "exited").length,
      };
    },
  });
}

export function useAddEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (emp: EmployeeInsert) => {
      const { data, error } = await supabase.from("employees").insert(emp).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      qc.invalidateQueries({ queryKey: ["employee-stats"] });
      toast.success("Employee added successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add employee");
    },
  });
}

export function useBulkInsertEmployees() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rows: EmployeeInsert[]) => {
      const { data, error } = await supabase.from("employees").insert(rows).select();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      qc.invalidateQueries({ queryKey: ["employee-stats"] });
      toast.success(`${data.length} employees imported successfully`);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to import employees");
    },
  });
}

export function computeExperience(joiningDate: string): string {
  const joining = new Date(joiningDate);
  const now = new Date();
  let years = now.getFullYear() - joining.getFullYear();
  let months = now.getMonth() - joining.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  if (now.getDate() < joining.getDate()) {
    months--;
    if (months < 0) {
      years--;
      months += 12;
    }
  }
  if (years < 0) return "Not yet joined";
  if (years === 0 && months === 0) return "< 1 Month";
  if (years === 0) return `${months} Month${months > 1 ? "s" : ""}`;
  return `${years} Year${years > 1 ? "s" : ""} ${months} Month${months !== 1 ? "s" : ""}`;
}
