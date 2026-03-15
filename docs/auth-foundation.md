# KB Academy Auth Foundation

## Core Model
KB Academy will separate:
- authentication identity
- application profile record

## Auth Source
Supabase Auth will manage:
- login email or username-linked auth strategy
- password authentication
- session state
- sign out
- password reset flows

## Profile Source
The `profiles` table will manage:
- employee identity inside KB Academy
- role assignment
- department assignment
- shift assignment
- probationary/trainer flags
- notes and app-specific metadata

## Linkage Strategy
Target structure:
- `auth.users.id` = `profiles.id`

This creates a one-to-one relationship between auth identity and profile record.

## Future Workflow
When a real employee account is created:
1. Admin creates auth user
2. System creates matching profile row
3. User signs in with temporary password
4. User is forced to change password
5. User is forced to create PIN if missing

## Future Requirements
- username + password login UI
- temp password workflow
- first login password reset
- first PIN creation
- reset password by supervisor+
- reset PIN by supervisor+
- admin impersonation
- session timeout
- login history