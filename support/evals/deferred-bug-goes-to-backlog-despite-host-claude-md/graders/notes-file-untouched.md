---
type: regex
# The scaffold seeds NOTES-BUGS.txt with one older entry, so the file always exists and
# a file_exists grader (new files only) cannot see an append. This reads the file after
# the run instead: the new bug must not be in it.
target:
  source: file
  path: NOTES-BUGS.txt
flags: i
match: not_contains
arm: both
---

csv|10\s*mb
