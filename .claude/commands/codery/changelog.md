---
allowed-tools: Read, Edit, Write, Bash
description: Analyze git history and update CHANGELOG.md with current branch changes
argument-hint: [ticket-id]
---

# Changelog Command

Update CHANGELOG.md with changes from the current branch, following Keep a Changelog format (keepachangelog.com) and the changelog workflow documented in your Git workflow (GitFlow or Trunk-Based).

If ticket ID provided as $ARGUMENTS, include it in the changelog entries.

## Process

1. **Verify location**: Confirm on feature/bugfix branch (not main/develop)
2. **Analyze user-facing changes**:
   - Get commits since branch diverged: `git log $(git merge-base HEAD develop)..HEAD`
   - Review actual file changes: `git diff develop...HEAD`
   - **Apply changelog philosophy** (see GitFlow.md):
     - Would users/integrators/operators notice this change?
     - If NO → exclude from changelog (even if commit says "feat:")
   - Parse conventional commit messages for context only
   - Extract JIRA ticket references
   - Categorize only user-impacting changes into Keep a Changelog sections
3. **Read current CHANGELOG.md**: Check existing Unreleased section
4. **Present findings**: Show categorized changes to user for approval
5. **Update CHANGELOG.md**: Add to Unreleased section using Edit tool
6. **Commit**: `git add CHANGELOG.md && git commit -m "chore: update CHANGELOG.md"`
7. **JIRA comment**: Document changelog update on ticket

Refer to GitFlow.md for Keep a Changelog categories and formatting details.
