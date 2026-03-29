# KB Academy Modern Quiz Builder

## Purpose
Modernize the quiz builder so it feels like a structured content builder instead of a raw database form.

## Improvements
- hidden sort order fields
- drag-and-drop question ordering
- modal-based question creation and editing
- question type support:
  - multiple choice
  - true / false
  - scaled
- cleaner question cards with previews

## Question Type Rules

### Multiple Choice
- custom answer options
- one or more can be marked correct

### True / False
- fixed answers:
  - True
  - False
- one correct answer selected

### Scaled
- scale minimum
- scale maximum
- one correct scale point selected

## UX Direction
Main page:
- quiz settings
- question list
- add question button

Question modal:
- question type
- question text
- answer builder area based on type