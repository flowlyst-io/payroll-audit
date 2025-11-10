---
allowed-tools: Task, Bash
description: Validate requirements compliance and code quality for completed work
argument-hint: [ticket-id]
---

# Audit Command

Perform comprehensive audit of completed work on a JIRA ticket by validating both requirements compliance and code quality.

If no ticket ID is provided as $ARGUMENTS, attempt to extract it from the current branch name (e.g., feature/COD-123-description → COD-123).

## Process

1. **Identify the ticket**: Use provided argument or extract from branch name
2. **Launch parallel audits**: Run two subagents simultaneously for efficiency
3. **Aggregate findings**: Combine results from both subagents
4. **Document in JIRA**: Post comprehensive findings as a comment on the ticket

## Subagent Execution

Launch both subagents in parallel using the Task tool:

### Requirements Checker
- **Subagent**: requirements-checker
- **Purpose**: Validate that implementation meets all JIRA ticket requirements
- **Provide**: Ticket ID and instruction to determine what was implemented for this ticket

### Code Reviewer  
- **Subagent**: code-reviewer
- **Purpose**: Review code quality, security, performance, and pattern compliance
- **Provide**: Ticket ID and instruction to determine what was implemented for this ticket

Both subagents will independently:
- Read CLAUDE.md and application-docs.md to understand the project context
- Intelligently determine what changes were made for this ticket based on the git workflow
- Perform their specialized analysis

## Output Format

After both subagents complete, format findings as:

```
[Audit] Comprehensive Review for COD-XXX

## Requirements Compliance
[Requirements checker findings]

## Code Quality Review
[Code reviewer findings]

## Summary
- Requirements status
- Critical issues found
- Key recommendations
```

Post this comprehensive review as a JIRA comment on the ticket and display a summary to the user.