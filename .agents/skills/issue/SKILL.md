---
name: issue
description: Draft an English GitHub issue for this repository, or publish a previously reviewed draft when explicitly requested. Use for requests such as 이슈 작성해 or 이 초안 등록해 when the draft is an issue.
---

# Issue workflow

Resolve the repository from the current Git checkout and its origin; read its AGENTS.md. Keep frontend and server issues in their respective repositories unless the user names another target.

Inspect relevant code and search existing issues (including closed issues) with `gh issue list --repo OWNER/REPO --state all --search QUERY`. Follow repository graphify instructions when present. If GitHub access is unavailable, continue the local draft and disclose that duplicates could not be checked.

Use the body of the matching template in `.github/ISSUE_TEMPLATE/bug_report.md` or `feature_request.md`, excluding YAML frontmatter and HTML comments. Write the title and body in English. Use evidence from the request and code; label hypotheses and missing reproduction details. Ask only for missing information that materially changes scope or acceptance criteria.

By default, show the target repository, title, and complete body in chat. Do not commit, push, or post while drafting, even if the request says “create an issue.”

When the user explicitly asks to publish/register the reviewed draft, verify the target and search for duplicates again. Reuse a matching issue rather than create another; do not edit it without authorization. If authentication or duplicate lookup fails, stop publication and explain the blocker. Publish the reviewed text using `gh issue create --repo OWNER/REPO --title TITLE --body-file FILE` with a temporary UTF-8 body file. Return the issue URL. After an uncertain create response, check for the created issue before retrying.
