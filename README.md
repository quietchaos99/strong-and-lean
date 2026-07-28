# Strong & Lean

Installable, phone-first workout journal for Vicki's three-session program.

## iPhone installation

Open the GitHub Pages URL in Safari, tap **Share**, then **Add to Home Screen**.

Workout entries save immediately in local browser storage. Use **Export JSON** for a manual backup.

## Secure daily GitHub backup

The app never contains a GitHub token. `worker/` is a Cloudflare Worker that receives the journal and writes `journal/YYYY-MM-DD.json` through GitHub's API.

1. Create a Cloudflare Worker from the `worker/` directory (`npx wrangler deploy`).
2. In `worker/wrangler.toml`, replace `YOUR_GITHUB_USERNAME`.
3. Create a fine-grained GitHub token scoped only to this repository with **Contents: Read and write**.
4. Store secrets (never commit them):
   - `npx wrangler secret put GITHUB_TOKEN`
   - `npx wrangler secret put APP_BACKUP_KEY`
   - optionally set `ALLOWED_ORIGIN` to the exact Pages origin.
5. Deploy, then enter the Worker URL and the same app backup key in the app's **Backup settings**.

Because iOS does not reliably wake a closed PWA in the background, backup runs on the first app open each day, on workout save, and when **Backup now** is tapped.
