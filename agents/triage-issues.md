---
title: Triage issues with an agent
description: 'Check an open issue, then resolve or ignore it with a note using agent tools.'
tags:
  - agents
  - mcp
  - issues
  - playbook
id: triage-issues-with-an-agent
navTitle: Triage issues
type: guide
section: agents
platform: []
feature:
  - issues
loopStage:
  - triage
order: 30
lastReviewed: '2026-10-29'
owner: docs
---

# Triage issues with an agent

**Skills:** Cursor and Grok Bot agents can use `talaria-triage-issue` from the Talaria plugin for guided investigation. This playbook is the detailed how-to that skills reference. See [Agent skills overview](agent-skills.md).

---

Use this after you have a real `projectId` from `get_connection` or `get_projects`. One issue at a time. Include `dashboardUrl` when you tell the human what you changed.

## 1. Find open issues

`search_errors` with `projectId`, `status: open`, and `environment`. Use `development` for a local key and `production` for a live failure.

## 2. Read the issue

`get_error` with `issueId`. The result has the latest instance (stack, release, environment, `lastSeenAt`) and `comments` from earlier notes.

## 3. See whether it is still firing

`search_events` with the same `projectId`, `environment`, and `issueId`. Set `from` to the time of the suspected fix when you have one.

## 4. Decide

- The code no longer contains the failure and events for that `issueId` have stopped: `update_issue_status` with `status: resolved` and a `note` that says what changed.
- The issue is noise: `update_issue_status` with `status: ignored` and a `note` that says why.
- It is still firing, or you have not checked: leave it `open`. `add_issue_comment` with what you found.

`note` and `body` are required for those writes. `update_issue_status` stores the note as a comment. Both tools need `mcp:write` (included in install scopes) and the membership capability to update issue status.

## Status rules

- `open` can become `resolved` or `ignored`.
- `resolved` and `ignored` can only return to `open`. They cannot switch to each other. Reopen with `update_issue_status` and `status: open`.
- A later event with the same fingerprint reopens a resolved issue.
- An ignored issue reopens when that project's reopen-ignored setting is on. The default is on.

Do not resolve a list of issues in one call. There is no bulk status tool.
