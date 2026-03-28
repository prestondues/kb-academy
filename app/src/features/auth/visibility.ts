import type { CurrentProfile } from './profileSession';

function normalize(value?: string | null) {
  return (value ?? '').trim().toLowerCase();
}

export function canViewAllDepartments(profile: CurrentProfile | null): boolean {
  const roleName = normalize(profile?.role?.name);

  if (!roleName) return false;

  return (
    roleName.includes('admin') ||
    roleName.includes('manager') ||
    roleName.includes('fsqa') ||
    roleName.includes('qa') ||
    roleName.includes('people services') ||
    roleName.includes('human resources') ||
    roleName.includes('hr') ||
    roleName.includes('read only') ||
    roleName.includes('leadership')
  );
}

export function getVisibleDepartmentName(profile: CurrentProfile | null): string | null {
  if (!profile) return null;
  if (canViewAllDepartments(profile)) return null;
  return profile.department?.name ?? null;
}