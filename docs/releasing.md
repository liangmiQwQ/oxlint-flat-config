# Release PRs

Pushes to `main` run `uppt/pr`, which computes package versions from conventional commits and updates the pending release PR.

To adjust that release manually, edit a package's `version` on `release/main-pending` and push. The Release workflow refreshes the PR title and package sections from the version changes against the PR's base branch. Existing package notes, the introduction, and contributor sections are preserved. Newly selected packages get a short manual-release note.

Preview the metadata update from the checked-out release branch with an authenticated GitHub CLI:

```sh
npm run release:sync-pr -- --dry-run
```

The sync only edits the PR title and description. Merging the release PR starts publishing. A later push to `main` still lets `uppt/pr` rebuild the release plan and can replace manual version edits, so make final version adjustments after the changes for the release have landed.
