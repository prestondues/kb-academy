# KB Academy Shift Cleanup and User Form Requirements

## Purpose
Clean up duplicate shift options and improve user creation/editing quality.

## Changes
- only generic shift records remain active in selectors
- department-specific shift rows are hidden from new selection
- user create/edit forms clearly mark required fields
- client-side validation blocks incomplete submissions
- edge function validation returns specific user-facing error messages

## Canonical Shift Model
Shifts are generic:
- 1st Shift
- 2nd Shift
- 3rd Shift

Department is handled separately through `department_id`.

## Result
User profiles use:
- role
- department
- shift

This supports cleaner visibility rules and future module + department + shift coverage targeting.