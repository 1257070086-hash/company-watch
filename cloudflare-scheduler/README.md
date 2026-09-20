# Company Watch Cloudflare Scheduler

This Worker triggers the repository's `Cloud RSS sync` GitHub Actions workflow.

- Schedule: `12,32,52 0-15 * * *` (08:12-23:52 Asia/Shanghai, every 20 minutes)
- Target: `1257070086-hash/company-watch`
- Workflow: `.github/workflows/rss-sync.yml`
- Required encrypted Worker secret: `GITHUB_TOKEN`

The GitHub token should be fine-grained, restricted to the `company-watch`
repository, and grant only `Actions: Read and write` permission. Never commit
the token or place it in `wrangler.jsonc`.

Deploy from this directory with Wrangler, then verify both the Cron trigger in
Cloudflare and a completed GitHub Actions run. A configured schedule alone is
not proof that the workflow executed successfully.
