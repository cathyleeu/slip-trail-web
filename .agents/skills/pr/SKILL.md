---
name: pr
description: Draft an English pull request from the current repository changes, or publish a reviewed draft on explicit request. Use for 현재 변경으로 PR 작성해 and registration of a PR draft; not for code review.
---

# Pull request workflow

Read the current repository's AGENTS.md and `.github/pull_request_template.md`. Resolve origin, base branch, current branch, status, committed changes against the base, and staged/unstaged/untracked changes. Do not assume the base is main. Distinguish this task's changes from pre-existing work; ask if the intended inclusion is ambiguous.

Search existing PRs for the head branch using `gh pr list --repo OWNER/REPO --state all --head BRANCH`. Run the repository's documented validation commands, inspect failures, and report actual outcomes. If remote access fails, continue a local draft but disclose that the base or duplicate check is unverified.

Show the target repository, base/head, English title, and complete English body using the PR template headings. Reference only verified issue numbers. Summarize the final diff and why it matters; distinguish existing failures and unrun checks from passing checks. Drafting does not authorize commits, branch changes, pushes, or GitHub posts.

Only after an explicit request to publish/register the reviewed draft:

- Recheck status, diff, base, and existing PRs. If the intended diff materially changed, show the revised draft before publication.
- Use an existing suitable `codex/` branch or create one from the intended work. Preserve unrelated changes and commits. Never push main or the repository's default branch, force-push, or stage unrelated files.
- Commit only the reviewed task changes if needed, with a present-tense message explaining why. Push the intended branch and create a Draft PR with explicit `--repo`, `--base`, `--head`, `--draft`, `--title`, and `--body-file` arguments to `gh pr create`. Write the exact reviewed body to a temporary UTF-8 file.
- Reuse an existing open PR instead of creating a duplicate; ask before changing its content unless already requested. Do not reuse a closed or merged PR branch for unrelated work.
- If authentication or duplicate lookup fails, stop publication. After an uncertain create response, check whether the PR exists before retrying.
- Return the PR URL and attach it to the Codex chat using attach_artifact when available. Report CI/review status as pending until observed. Never merge automatically or mark a Draft ready without a request.
