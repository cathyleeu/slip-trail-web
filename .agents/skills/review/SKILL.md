---
name: review
description: Review a specified GitHub PR or current local changes for actionable defects and report findings in English. Use for PR 리뷰해 or review current changes; does not implement fixes or post comments by default.
---

# Review workflow

Resolve the target repository and PR from the user's URL/number, or review local changes when no PR is specified. Read the applicable AGENTS.md Code Review Rules. For a PR, inspect its base/head, diff, relevant surrounding code, and checks using gh. Attach the requested PR to the chat with attach_artifact when available. If remote access fails, do not claim to have reviewed an unavailable PR; report what is missing.

For local work, inspect the intended committed diff against its base plus staged/unstaged changes and relevant untracked files. Follow graphify instructions when present. Check callers and data flow before asserting a defect. Run relevant available checks without modifying source files.

Write findings in English, ordered by severity (P0 critical, P1 high, P2 normal, P3 low). Each finding must identify a concrete introduced defect, file and line, triggering condition, and impact. Use repository-specific review rules; avoid style-only feedback, speculative concerns, and unrelated pre-existing bugs. State explicitly when no actionable findings are found, and disclose validation gaps.

Report in chat by default. Do not edit code, commit, push, or post to GitHub. Only post findings when the user explicitly requests GitHub comments/review; verify the current PR head and avoid duplicating existing comments. Use a temporary UTF-8 body file for gh publication. Do not approve, merge, or request changes unless explicitly asked.
