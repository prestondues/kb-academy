# KB Academy Training Quiz Attempts

## Purpose
Store trainee quiz attempt history, answers, scores, and pass/fail results.

## Tables

### training_quiz_attempts
Stores the overall quiz attempt record:
- quiz
- module
- trainee
- started time
- submitted time
- score percent
- passed
- status

### training_quiz_attempt_answers
Stores one answer per question for an attempt:
- question
- selected option
- free text answer if needed
- correctness result

## Status Values
- in_progress
- submitted

## Future Usage
This supports:
- quiz runner
- attempt history
- pass/fail reporting
- certification gating when quizzes are required