export type UserRole =
  | 'Admin'
  | 'Manager'
  | 'Supervisor'
  | 'Team Lead'
  | 'Operator'
  | 'Trainer'
  | 'Team Member'
  | 'FSQA'
  | 'People Services';

export type Department =
  | 'Packaging'
  | 'Baking'
  | 'FSQA'
  | 'People Services';

export type Shift =
  | 'Packaging 1st Shift'
  | 'Baking 1st Shift'
  | 'Baking 3rd Shift';

export type UserStatus = 'Active' | 'Inactive';

export type AppUser = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  role: UserRole;
  homeDepartment: Department;
  shift: Shift;
  status: UserStatus;
  employeeId: string;
  hireDate: string;
  birthday: string;
  probationary: boolean;
  trainerEnabled: boolean;
  email?: string;
};