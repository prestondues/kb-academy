# KB Academy Optional User Email and Internal Auth Email

## Purpose
Support username-based login for users who do not have real email addresses.

## Model
- real contact email is optional
- Supabase auth still receives an internally generated email
- username remains the employee-facing login credential

## Rules
- all users must have username + password
- contact email is optional
- internal auth email is generated from username
- leadership users may optionally have a real contact email stored in profiles

## Result
Floor users do not need real company email addresses to use KB Academy.