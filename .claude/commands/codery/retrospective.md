---
allowed-tools: Read, Edit, MultiEdit, TodoWrite, Bash
description: Trigger self-introspective analysis for session review and learning
---

# Retrospective Command

Trigger the 🔬 Self-Introspective Analysis Mode for session review and learning.

Review the current session to identify successes, failures, and learning opportunities. Categorize findings into:

1. **Local Bash commands**: Wrong working directory, missing files, incorrect syntax
2. **JIRA connectivity**: Authentication issues, parameter formatting, API limitations
3. **GitHub operations**: Branch confusion, commit message formatting, merge conflicts
4. **Branching/Navigation**: Wrong branch selected, incorrect file paths assumed
5. **User guidance**: Unclear instructions given, better ways to phrase requests discovered

Document patterns of errors and better paths discovered after initial failures. Focus on actionable improvements rather than just listing errors. Include both what failed initially AND what succeeded after correction.

When reviewing the session:
- Group similar issues together (e.g., all path-related errors)
- Suggest specific improvements to commands, documentation, or workflows
- Create JIRA tickets only for systemic issues, not one-off mistakes
- Use constructive language focused on system improvement

Read the existing .codery/Retrospective.md file and append genuinely new learnings to avoid duplication. Maintain the persistent knowledge format for continuous improvement across sessions.
