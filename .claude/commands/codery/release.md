---
allowed-tools: Read, Edit, Write, Bash
description: Create release branch with versioned changelog following Git Flow
argument-hint: [version]
---

# Release Command

Create a release branch following the Git Flow release workflow documented in your GitFlow documentation. Analyzes changes and suggests semantic version.

## Process

1. **Verify workflow**: Ensure project uses Git Flow (not Trunk-Based)
2. **Switch to develop**:
   - `git checkout develop`
   - `git pull origin develop`
3. **Analyze Unreleased changes**:
   - Read CHANGELOG.md Unreleased section
   - Get commits since last release tag
   - Identify breaking changes, features, fixes
4. **Verify changelog accuracy** (CRITICAL):
   - Compare CHANGELOG.md against actual code diff from last version tag
   - Command: `git diff <last-version-tag>..develop`
   - **Apply user-facing filter** (see GitFlow.md):
     - Remove internal refactors, renames, code cleanup from consideration
     - Ask: "Would users/integrators actually experience these as breaking/new/fixed?"
   - Adjust version recommendation based on **actual user impact**, not just changelog text
5. **Suggest version** (if not provided in $ARGUMENTS):
   - **MAJOR (X.0.0)**: Breaking changes present
   - **MINOR (0.X.0)**: New features added
   - **PATCH (0.0.X)**: Only bug fixes
   - Present suggestion with reasoning
   - Ask user to approve or provide different version
6. **Create release branch**:
   - `git checkout -b release/X.Y.Z`
7. **Version the changelog**:
   - Move Unreleased → `## [X.Y.Z] - YYYY-MM-DD`
   - Keep Unreleased header empty for future changes
   - Commit: `git commit -m "chore: prepare release X.Y.Z"`
8. **Push and guide**:
   - `git push -u origin release/X.Y.Z`
   - Remind: Test in release branch, fix bugs if needed
   - After testing: Create PRs to both main and develop
   - After merge to main: Tag with `git tag vX.Y.Z`

Refer to GitFlow.md for complete release workflow and semantic versioning details.
