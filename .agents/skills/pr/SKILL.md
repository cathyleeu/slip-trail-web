---
name: pr
description: Create and publish an English pull request ready for review from current repository changes. Use for 현재 변경으로 PR 작성해 or PR 등록해; prepare only a chat draft when explicitly requested. Not for code review.
---

# Pull request workflow

Read the current repository's AGENTS.md and `.github/pull_request_template.md`. Resolve origin, base branch, current branch, status, committed changes against the base, and staged/unstaged/untracked changes. Do not assume the base is main. Distinguish this task's changes from pre-existing work; ask if the intended inclusion is ambiguous.

Search existing PRs for the head branch using `gh pr list --repo OWNER/REPO --state all --head BRANCH`. Run the repository's documented validation commands, inspect failures, and report actual outcomes. If remote access fails, prepare the text locally and explain that publication is blocked and the base or duplicate check is unverified.

Prepare the target repository, base/head, English title, and complete English body using the PR template headings. Reference only verified issue numbers. Summarize the final diff and why it matters; distinguish existing failures and unrun checks from passing checks. A PR creation request authorizes necessary task-scoped branch creation, commits, push, and GitHub publication without a separate draft approval. If the user explicitly requests only a chat draft, show it and do not change branches, commit, push, or post.

For a PR creation or publication request:

- Recheck status, diff, base, and existing PRs. Keep the body aligned with the final intended diff. Ask only if a material scope ambiguity remains.
- Use an existing suitable `codex/` branch or create one from the intended work. Preserve unrelated changes and commits. Never push main or the repository's default branch, force-push, or stage unrelated files.
- Commit only the intended task changes if needed, with a present-tense message explaining why. Push the intended branch and create a PR ready for review with explicit `--repo`, `--base`, `--head`, `--title`, and `--body-file` arguments to `gh pr create`, omitting `--draft` unless the user explicitly requests a Draft PR. Write the prepared body to a temporary UTF-8 file.
- Reuse an existing open PR instead of creating a duplicate; ask before changing its content unless already requested. Do not reuse a closed or merged PR branch for unrelated work.
- If authentication or duplicate lookup fails, stop publication. After an uncertain create response, check whether the PR exists before retrying.
- Return the PR URL and attach it to the Codex chat using attach_artifact when available. Report CI/review status as pending until observed. Never merge automatically. Do not change an existing Draft PR to ready unless the user requests that transition; the ready-for-review default applies to newly created PRs. Do not select reviewers or post review-request comments unless requested.
