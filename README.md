# ThoughtOut

ThoughtOut is a server-rendered Next.js event and artist platform with Supabase authentication and Razorpay payments.

## Requirements

- Node.js 22.13 or newer (Node.js 22 is used in CI)
- pnpm 11.25.0
- A Supabase project and Razorpay account

## Local development

1. Copy `.env.example` to `.env.local` and fill in the Supabase and Razorpay values.
2. Install the locked dependencies with `pnpm install --frozen-lockfile`.
3. Apply `schema.sql` to the Supabase project.
4. Run `pnpm dev` and open the local URL printed by Next.js.

Run `pnpm lint`, `pnpm typecheck`, and `pnpm build` before opening a pull request.

## Vercel deployment

Import this repository into Vercel and keep the detected Next.js framework and default build settings. Vercel deploys the server-rendered app and its Route Handlers; GitHub Pages is not used. Configure these environment variables for each Vercel environment that needs them:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only; never expose it with a `NEXT_PUBLIC_` prefix)
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET` (server only)

Set the Supabase Auth site URL and allowed redirect URLs to your Vercel production domain and any preview domains you use. Configure Razorpay with production credentials only when ready to accept live payments. GitHub Actions runs the lint, TypeScript, and production build checks; connect the repository to Vercel to create preview and production deployments.
