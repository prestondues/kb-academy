# KB Academy Profile Department Shift Visibility

## Purpose
Adds department and shift structure to user profiles so training visibility, records, matrix views, and future coverage targets can be scoped correctly.

## Changes
- adds `department_id` to profiles
- adds `shift_id` to profiles
- creates `shifts` table
- seeds common shifts

## Intended Visibility Rules
- Admin: all departments and shifts
- Manager: all departments and shifts
- FSQA: all departments and shifts
- People Services / read-only leadership: all departments and shifts
- Supervisor and below: limited to matching department
- future option: matching shift restrictions where appropriate

## Future Expansion
- route-level filtering helpers
- department/shift filters across records and matrix
- coverage target model based on module + department + shift
- user training profile drill-down