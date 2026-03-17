# KB Academy Training Sessions Foundation

## Purpose
Training sessions represent a trainer-led run of a module for a specific trainee.

## Core Tables
- training_sessions
- training_session_section_progress

## Session Fields
- module_id
- trainee_id
- trainer_id
- session_status
- started_at
- completed_at

## Progress Fields
- session_id
- section_id
- is_completed
- completed_at

## Notes
- sessions save section-by-section progress
- modules can be resumed later
- session completion happens when all required sections are complete
- later phases will add dual PIN sign-off, time logging, and quiz unlock