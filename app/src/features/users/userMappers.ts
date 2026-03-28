import type { UserCardModel, UserRecord } from './types';

export function mapUserToCard(user: UserRecord): UserCardModel {
  return {
    id: user.id,
    fullName: `${user.first_name} ${user.last_name}`.trim(),
    username: user.username,
    employeeId: user.employee_id ?? '—',
    email: user.email ?? '—',
    roleName: user.role?.name ?? '—',
    departmentName: user.department?.name ?? '—',
    shiftName: user.shift?.name ?? '—',
    probationary: Boolean(user.probationary),
    trainerEnabled: Boolean(user.trainer_enabled),
    status: user.is_active ? 'Active' : 'Inactive',
  };
}