# Releasing

Every release follows these steps. The website reads the version from `CHANGELOG.md`, so step 1 is required.

1. In the release PR, add the entry at the top of `CHANGELOG.md`:
   ```
   ## X.Y.Z - YYYY-MM-DD

   ### Added | Changed | Fixed | Removed

   - One line per change.
   ```
2. Merge the PR into `main`.
3. Tag the merge commit and push the tag: `git tag vX.Y.Z && git push origin vX.Y.Z`.
   The `changelog-guard` workflow fails when `CHANGELOG.md` has no `## X.Y.Z - YYYY-MM-DD` heading.
4. Create the GitHub Release for the tag. Copy the notes from the `CHANGELOG.md` entry.
5. Packagist updates from the tag. The website rebuilds on the push to `main` and shows the new changelog.
6. Run the `website` workflow by hand (Actions → website → Run workflow) so the footer shows the new version.

## Deploy

Cloudflare Workers Builds deploys the website. It is not a GitHub workflow.

- It deploys from `main` when a push changes `website/` or `CHANGELOG.md`.
- It builds in `website/` with `npm run build`, then runs `npx wrangler deploy`.
- The Worker is `laravel-access-profiles`. Its settings are in `website/wrangler.jsonc`.
- After a release tag, open the Worker in the Cloudflare dashboard and retry the latest deployment. The footer then shows the new Packagist version.
