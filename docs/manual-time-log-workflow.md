# KB Academy Manual Time Log Workflow

## Purpose
Allow training time to be logged manually while ensuring the time is only counted as official after dual signoff.

## Workflow
1. Trainer creates a manual time log
2. Trainer signs with PIN
3. Trainee signs with PIN
4. System posts the official entry into `training_time_entries`
5. Time log status becomes `completed`

## Why This Exists
Manual time logging must be auditable and clearly distinguished from official counted hours until both parties verify the record.

## Tables
- `training_time_logs`
- `training_time_log_signoffs`
- official finalized table: `training_time_entries`

## Current Status Values
- pending
- completed
- voided

## Future Expansion
- supervisor override
- void reason
- edit lock after signoff
- notification prompts for incomplete pending logs