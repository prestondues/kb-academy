export type UserRecord = {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  employee_id?: string | null;
  email?: string | null;
  probationary?: boolean | null;
  trainer_enabled?: boolean | null;
  is_active: boolean;
  must_change_password?: boolean | null;
  must_create_pin?: boolean | null;
  pin_reset_required?: boolean | null;
  role_id?: string | null;
  department_id?: string | null;
  shift_id?: string | null;
  role?: {
    id?: string | null;
    name?: string | null;
  } | null;
  department?: {
    id?: string | null;
    name?: string | null;
  } | null;
  shift?: {
    id?: string | null;
    name?: string | null;
  } | null;
};

export type UserCardModel = {
  id: string;
  fullName: string;
  username: string;
  employeeId: string;
  email: string;
  roleName: string;
  departmentName: string;
  shiftName: string;
  probationary: boolean;
  trainerEnabled: boolean;
  status: 'Active' | 'Inactive';
};

export type LookupOption = {
  id: string;
  name: string;
};