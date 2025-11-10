---
allowed-tools: mcp__atlassian__getJiraIssue, mcp__atlassian__getJiraIssueRemoteIssueLinks
description: Check JIRA ticket status and display recent comments
argument-hint: [ticket-id]
---

# Status Command

Fetch and display the current status of a JIRA ticket.

If no ticket ID is provided as $ARGUMENTS, prompt the user to specify which ticket they want to check.

For the specified ticket (e.g., COD-12), retrieve and display:

**Ticket Overview:**
- Title and type (Story, Task, Bug, etc.)
- Current status (To Do, In Progress, In Review, Done)
- Priority level
- Assignee (if any)
- Created and updated timestamps

**Recent Activity Summary:**
Analyze the last 10 comments and provide a concise summary of:
- What has been achieved recently
- Key decisions made
- Current progress status
- Any blockers or issues identified

Group related activities together (e.g., all Scout findings, all Architecture decisions, all Builder implementations) and highlight the most significant developments. Focus on outcomes rather than just listing actions.
