# KB Academy Identity Schema Notes

## Purpose
This schema establishes the identity, access, and organizational foundation for KB Academy.

## Tables
- departments
- shifts
- roles
- permissions
- role_permissions
- profiles
- profile_department_assignments
- user_permission_overrides

## Notes
- profiles are kept separate from auth for flexibility
- roles are base templates
- permissions are granular
- role_permissions maps base access
- user_permission_overrides handles one-off exceptions
- profile_department_assignments supports cross-department access
- home_department_id on profiles supports default operational logic
- trainer_enabled exists as a profile-level toggle in addition to role structure

## Next likely schema phases
- authentication linkage
- training modules
- training assignments
- training progress
- certification attempts
- time entries
- announcements
- place charts
- audit logs