---
name: issue
description: Create and publish an English GitHub issue for this repository on requests such as 이슈 작성해 or 이슈 등록해. Prepare only a chat draft when explicitly requested.
---

# Issue workflow

Resolve the repository from the current Git checkout and its origin; read its AGENTS.md. Keep frontend and server issues in their respective repositories unless the user names another target.

Inspect relevant code and search existing issues (including closed issues) with `gh issue list --repo OWNER/REPO --state all --search QUERY`. Follow repository graphify instructions when present. If GitHub access is unavailable, prepare the text locally and explain that publication and duplicate checking are blocked; do not claim the issue was registered.

Use the body of the matching template in `.github/ISSUE_TEMPLATE/bug_report.md` or `feature_request.md`, excluding YAML frontmatter and HTML comments. Write the title and body in English. Use evidence from the request and code; label hypotheses and missing reproduction details. Ask only for missing information that materially changes scope or acceptance criteria.

By default, an issue creation request authorizes immediate GitHub publication without asking for draft approval. If the user explicitly requests only a draft, show the target repository, title, and complete body in chat without posting. Issue creation does not require commits or pushes.

Before publishing, verify the target and check for duplicates. When publishing an earlier draft, refresh that check. Reuse a matching issue rather than create another; do not edit it without authorization. If authentication or duplicate lookup fails, stop publication and explain the blocker. Publish the prepared text using `gh issue create --repo OWNER/REPO --title TITLE --body-file FILE` with a temporary UTF-8 body file. Return the issue URL. After an uncertain create response, check for the created issue before retrying.
