---
name: commit-message
description: Read the git diff and write a commit message in the repo's existing style. Use when the user asks for a commit message or runs /commit-message. Only prints the message; never stages, commits, or pushes.
disable-model-invocation: true
allowed-tools: Bash(git diff:*), Bash(git log:*), Bash(git status:*)
---

# Commit message

Write a commit message for the current changes. Do not stage, commit, or push anything; the user does that themselves.

## Context

- Recent commits: !`git log --format=%s -20`
- Staged stat: !`git diff --cached --stat`
- Unstaged stat: !`git diff --stat`

## Steps

1. Use the staged diff (`git diff --cached`) if anything is staged; otherwise use the unstaged diff (`git diff`). Read the actual hunks for anything the stat doesn't explain. Skim large deletions and pure-formatting churn rather than reading them line by line.
2. Find the one main thing the change does. Renames, moves into the flat `Name/index.tsx` layout, CSS tweaks, and formatting churn are usually side effects of that, not separate items.
3. Match the style of the recent commits: one line, all lowercase, no trailing period, no conventional-commit prefix, no body, usually 2–6 words (e.g. `migrate 404 page`, `no internal css`, `fix embed redirector`).
4. Reply with only the message in a code block. No preamble, no summary, no bullet list, no suggestions.
