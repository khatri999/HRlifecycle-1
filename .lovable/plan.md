

## Plan: Add Clickable Employee Profiles with Edit Capability

### Approach
Use a **dialog-based profile view** (not a new route) to keep changes minimal and avoid touching the router or layout. Clicking any employee row opens a dialog showing their full profile with inline edit capability.

### Files to Create

**1. `src/components/employees/EmployeeProfileDialog.tsx`**
- A `<Dialog>` component receiving an `EmployeeRow | null` and `open`/`onOpenChange` props
- **View mode**: Displays all requested fields in a clean two-column grid layout:
  - Name, Employee ID, Department, Designation, Manager, Joining Date, Date of Birth, Email, Phone, Employment Status, Experience (computed via `computeExperience`)
- **Edit mode**: Toggle via "Edit" button. Editable fields rendered as `<Input>` / `<Select>` components. Non-editable fields (ID, Experience) shown as read-only.
- "Save" button calls a new `useUpdateEmployee` mutation
- "Cancel" returns to view mode without saving

**2. `src/hooks/useEmployees.ts` — add `useUpdateEmployee` hook**
- New mutation using `supabase.from("employees").update(fields).eq("id", id)`
- Invalidates `["employees"]` and `["employee-stats"]` queries on success
- Shows toast on success/error

### Files to Modify

**3. `src/pages/Employees.tsx`**
- Add state: `selectedEmployee` (`EmployeeRow | null`)
- Make each `<tr>` clickable with `onClick={() => setSelectedEmployee(emp)}` and `cursor-pointer`
- Render `<EmployeeProfileDialog>` at bottom of component

### No changes to layout, routing, sidebar, or other modules.

