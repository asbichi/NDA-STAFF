# Security Spec

## Data Invariants
1. A cbt_result must have all required fields (studentId, studentName, class, score, total, percentage, date).
2. The date of cbt_result must be the server timestamp.
3. Only admins can create, update, delete students, questions, and scores.
4. Anyone can read questions and scores (required for unauthenticated students to take exams and view reports), but writes are strictly admin-only.

## The "Dirty Dozen" Payloads
1. Create CBT Result with missing fields (Denied)
2. Create CBT Result with extra "Ghost Field" (Denied)
3. Create CBT Result with invalid score type (string instead of number) (Denied)
4. Create CBT Result with spoofed date (Denied)
5. Create Student without being admin (Denied)
6. Update Student without being admin (Denied)
7. Delete Student without being admin (Denied)
8. Create Question without being admin (Denied)
9. Update Question without being admin (Denied)
10. Delete Question without being admin (Denied)
11. Create Score without being admin (Denied)
12. Update Score without being admin (Denied)

