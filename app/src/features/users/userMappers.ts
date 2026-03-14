export type UserCardModel = {
  id: string;
  fullName: string;
  username: string;
  employeeId: string;
  role: string;
  homeDepartment: string;
  shift: string;
  status: 'Active' | 'Inactive';
  probationary: boolean;
  trainerEnabled: boolean;
  email?: string | null;
  hireDate?: string | null;
  birthday?: string | null;
  firstName: string;
  lastName: string;
};

export type RawProfile = {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  employee_id: string;
  email?: string | null;
  hire_date?: string | null;
  birthday?: string | null;
  probationary?: boolean | null;
  trainer_enabled?: boolean | null;
  is_active?: boolean | null;
  role?: { name?: string | null } | null;
  department?: { name?: string | null } | null;
  shift?: { name?: string | null } | null;
};

export function mapProfileToUserCard(profile: RawProfile): UserCardModel {
  return {
    id: profile.id,
    fullName: `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim(),
    username: profile.username ?? '',
    employeeId: profile.employee_id ?? '',
    role: profile.role?.name ?? '—',
    homeDepartment: profile.department?.name ?? '—',
    shift: profile.shift?.name ?? '—',
    status: profile.is_active ? 'Active' : 'Inactive',
    probationary: Boolean(profile.probationary),
    trainerEnabled: Boolean(profile.trainer_enabled),
    email: profile.email ?? null,
    hireDate: profile.hire_date ?? null,
    birthday: profile.birthday ?? null,
    firstName: profile.first_name ?? '',
    lastName: profile.last_name ?? '',
  };
}