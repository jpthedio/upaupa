# Ship-It Pipeline

**From idea to live URL in minutes.**

Artifact → Local → Git → Live

---

## Pick Your Entry Point

Not every idea starts the same way. Choose where to jump in based on how clear your vision is.

### Level 1: Explore — Start in Claude Artifact

**You don't know exactly what you want yet.**

You have a rough idea — "a trip planner", "a dashboard", "a portfolio" — but you're still figuring out the layout, the data, the feel. Artifact lets you iterate visually in seconds without touching a terminal.

```
"I want to build a Boracay itinerary app. Make it look clean with
tabs for timeline, budget, and details. Use shadcn/ui and Tailwind."
```

Iterate until it looks and feels right, then move to Level 2.

**Best for:** New ideas, exploring layouts, visual experiments, vibe checks.

### Level 2: Build — Start in Claude Code

**You know what you want. You have the component (or a clear spec).**

You already have a `.jsx` file from an Artifact, a screenshot to replicate, or a clear picture in your head. Skip prototyping and go straight to a real project.

```
"I have a React component in boracay-itinerary.jsx that uses
shadcn/ui Tabs, Checkbox, and Badge. Create a Vite + React + Tailwind
project. Install, test locally, git init, push to GitHub, deploy to Vercel."
```

**Best for:** Shipping fast, known designs, artifact-to-production, rebuilding something you've seen.

### Level 3: Iterate — Already Live

**Your app is deployed and you need to change or add features.**

The project exists, it's on GitHub, it's on Vercel. You just need to make changes and redeploy.

```
"Add a dark mode toggle to the app. Test locally, then push and redeploy."
```

**Best for:** Feature additions, bug fixes, design tweaks, content updates.

### Quick Reference

| Clarity Level | Entry Point | You Say... |
|---------------|-------------|------------|
| "I have a vague idea" | Claude Artifact | "Build me a [thing] that does [stuff]" |
| "I have a component/design" | Claude Code | "Scaffold this into a project and deploy" |
| "I need to change my live app" | Claude Code | "Update [feature] and redeploy" |

---

## The Full Pipeline

### Phase 1: Prototype in Claude Artifact

**Why this matters:** You're not writing code yet — you're thinking out loud. Artifact gives you a visual sandbox to try layouts, shuffle data around, and feel the UX before committing to a real project. Changing direction here costs you nothing. Changing direction after scaffolding and deploying costs you time.

Build your idea as a **single React component**. Focus on:

- Layout and structure
- Data shape and content
- Interactions and state
- Visual design

**Best practices:**
- Use **shadcn/ui** components (Tabs, Badge, Checkbox, Card, etc.) — they translate 1:1 to a real project
- Use **Tailwind CSS** for styling — no extra setup needed later
- Keep everything in one file — easier to scaffold from

**Output:** A single `.jsx` file (e.g., `my-app.jsx`)

---

### Phase 2: Scaffold with Claude Code

**Why this matters:** An Artifact is a component floating in space. It can't use real npm packages, can't be indexed by Google, can't have a URL you share with people. Scaffolding turns your prototype into a real project — with a build system, proper dependencies, and a structure that can grow.

Drop the `.jsx` file in a project folder, then prompt:

```
Create package.json for a Vite + React + Tailwind project.
Add shadcn/ui components for [tabs/checkbox/badge/etc].
Wire up the artifact as src/App.jsx.
Install, build, and run locally.
```

**What gets created:**

```
project/
├── package.json            # Vite + React + Radix + Tailwind
├── vite.config.js          # @ alias for clean imports
├── tailwind.config.js      # Content paths configured
├── postcss.config.js       # Tailwind + Autoprefixer
├── index.html              # Entry HTML
├── .gitignore              # node_modules, dist, .vercel, .claude
└── src/
    ├── main.jsx            # React DOM entry point
    ├── index.css            # @tailwind directives
    ├── App.jsx              # Your artifact component
    ├── lib/utils.js         # cn() merge helper
    └── components/ui/       # shadcn/ui components (Tabs, Badge, etc.)
```

**Key dependencies:**
- `react` + `react-dom` — UI framework
- `@radix-ui/*` — Accessible primitives (used by shadcn)
- `class-variance-authority` + `clsx` + `tailwind-merge` — Style utilities
- `tailwindcss` + `autoprefixer` + `postcss` — CSS toolchain
- `vite` + `@vitejs/plugin-react` — Build tool

---

### Phase 3: Test Locally

**Why this matters:** Artifacts run in a sandboxed environment. Real browsers are different — fonts load differently, scroll behavior changes, mobile viewports break layouts. Testing locally catches the stuff that worked in the artifact but breaks in the real world. It also verifies your build pipeline works before you ship broken code to production.

```bash
npm install           # Install dependencies
npm run dev           # Start dev server → localhost:5173
npm run build         # Verify production build succeeds
```

**Check for:**
- No console errors
- All tabs/pages render correctly
- Interactions work (clicks, toggles, state)
- Responsive layout (resize browser)

---

### Phase 4: Git + GitHub

**Why this matters:** The moment your code works, it becomes valuable. Without git, one bad edit and it's gone. Git gives you a save point you can always rewind to. GitHub makes it shareable — you can collaborate, open it on another machine, or connect it to auto-deploy so every push goes live.

**The real question: can I skip this?**

Technically yes. You can `vercel --prod` without git and it'll deploy. But here's the thing — it's almost never truly a one-off:

- "Just a quick demo" → client loves it → now it needs updates
- "Simple landing page" → now you want to tweak the copy next week
- "Personal project" → you want to add features later

Without git, your only option is to re-deploy the whole thing from scratch or pray you didn't break something. With git, you push changes in seconds and can always roll back.

**Rule of thumb:** If you'd be annoyed re-building it from zero, git it.

```bash
git init
git add .
git commit -m "Initial commit: [project description]"
gh repo create username/project-name --public --source=. --push
```

**`.gitignore` should include:**
```
node_modules
dist
.vercel
.claude
*.local
```

**Or prompt Claude Code:**
```
Init git, commit everything, create a GitHub repo, and push.
```

---

### Phase 5: Deploy to Vercel

**Why this matters:** A project on localhost doesn't exist to anyone but you. Deploying gives it a URL — now it's real. You can send it to someone, open it on your phone, share it on social media. Vercel specifically makes this painless: zero config for Vite, free tier handles most projects, global CDN makes it fast everywhere.

**First time (one-time setup):**
```bash
npm i -g vercel
```

**Deploy:**
```bash
vercel --prod
```

Vercel auto-detects Vite, installs deps, builds, and gives you a live URL.

**Auto-deploy (optional but recommended):**
Connect the GitHub repo in Vercel Dashboard → Settings → Git. Every `git push` triggers a new deploy. This is where git really pays off — edit code, push, it's live in 30 seconds.

---

## Pick Your Pipeline

Not every project needs every step. Here are common configurations:

### Full Pipeline — Living Project

**For:** Apps you'll keep updating, share with others, or grow over time.

```
Artifact → Scaffold → Test → Git + GitHub → Vercel (auto-deploy)
```

This is the default. Most projects end up here because ideas keep evolving.

**Examples:** This itinerary app, a portfolio site, a client project, a tool you use regularly.

**Why every step:** You need the prototype flexibility (Artifact), the real build system (Scaffold), confidence it works (Test), version history and rollback safety (Git), and a live URL that auto-updates (Vercel + GitHub).

### Quick Ship — Get It Live Fast

**For:** You know exactly what you're building. No exploration needed.

```
Claude Code (scaffold + build) → Test → Git + GitHub → Vercel
```

Skip the Artifact phase. Go straight to Claude Code with a clear prompt. Still use git because you'll likely tweak it later.

**Examples:** A landing page from a Figma design, rebuilding something you've seen, a known pattern.

### Throwaway Demo — Truly One-Off

**For:** A proof-of-concept you need to show someone once, then never touch again.

```
Scaffold → Test → Vercel (no git)
```

No artifact exploration, no git. Just build it, verify it works, deploy it. Be honest though — if there's even a 20% chance you'll revisit this, add git. It takes 30 seconds and saves you from rebuilding from memory later.

**Examples:** A quick demo for a meeting, a one-time event page, a throwaway prototype.

**Warning:** This is rarer than you think. "I'll never touch this again" is almost always wrong lol.

### Iterate — Already Shipped

**For:** The project is live. You're adding features or fixing things.

```
Edit → Test → Git push → Auto-deploys
```

The pipeline is already set up. Now it's just: make changes, verify locally, push, done. This is where the earlier setup investment pays off — every future change is effortless.

**Examples:** Adding dark mode, updating content, fixing a mobile layout bug, adding a new page.

### Quick Reference

| Pipeline | Steps | When |
|----------|-------|------|
| **Full** | Artifact → Scaffold → Test → Git → Vercel | Most projects (default) |
| **Quick Ship** | Scaffold → Test → Git → Vercel | You know what you want |
| **Throwaway** | Scaffold → Test → Vercel | Truly one-off (rare) |
| **Iterate** | Edit → Test → Push | Already live, making changes |

---

## One-Shot Prompts

Copy-paste based on your entry level.

**Level 1 — Explore (Artifact):**
```
Build me a [describe your idea]. Use React with shadcn/ui components
and Tailwind CSS. Make it interactive with [tabs/toggles/accordions/etc].
```

**Level 2 — Build (Claude Code):**
```
I have a React component in [filename].jsx that uses [list shadcn components].
Create a Vite + React + Tailwind project around it.
Set up package.json, install dependencies, deploy locally and test,
init git, push to GitHub, and deploy to Vercel production.
```

**Level 3 — Iterate (Claude Code):**
```
In my [project-name] repo, [describe the change].
Test locally, commit, push, and redeploy to Vercel.
```

---

## When You Need a Backend

The pipeline above is for frontend-only apps. When your idea needs login, a database, file uploads, or APIs — here's the free/freemium toolkit that works with Claude Code.

### The Recommended Combo

For most projects that need a backend:

```
Next.js  +  Supabase  +  Vercel
```

- **Next.js** replaces Vite — same React, but adds API routes and SSR
- **Supabase** gives you Postgres + Auth + Storage in one dashboard
- **Vercel** you already know — deploys Next.js natively
- All three have generous free tiers
- Claude Code works great with all of them

This covers ~90% of app ideas: login, save data, upload files, send emails, deploy.

### Auth (Login)

| Tool | Free Tier | Best For |
|------|-----------|----------|
| **Supabase Auth** | 50K monthly active users | Full auth — email, Google, GitHub, magic link |
| **Clerk** | 10K monthly active users | Drop-in UI components, looks polished fast |
| **Auth.js (NextAuth)** | Unlimited (open source) | DIY but free forever, works with Next.js |

### Database

| Tool | Free Tier | Best For |
|------|-----------|----------|
| **Supabase** | 500MB Postgres + realtime | Full app database, SQL, row-level security |
| **Vercel Postgres** | 256MB | Small projects already on Vercel |
| **Neon** | 512MB Postgres, serverless | Scales to zero, branching for dev/prod |
| **Upstash Redis** | 10K commands/day | Cache, sessions, rate limiting, fast key-value |

### Storage (Files / Images)

| Tool | Free Tier | Best For |
|------|-----------|----------|
| **Supabase Storage** | 1GB | User uploads, images |
| **Cloudflare R2** | 10GB + no egress fees | Larger files, zero bandwidth cost |
| **Vercel Blob** | 500MB | Quick file storage on Vercel |

### Email

| Tool | Free Tier | Best For |
|------|-----------|----------|
| **Resend** | 3K emails/month | Transactional emails, nice API |
| **Brevo (Sendinblue)** | 300 emails/day | Marketing + transactional |

### Serverless Functions (API)

| Tool | Free Tier | Best For |
|------|-----------|----------|
| **Vercel Functions** | 100GB-hrs/month | API routes in Next.js — already on Vercel |
| **Cloudflare Workers** | 100K requests/day | Edge functions, insanely fast |

### When to Level Up

| You need... | Upgrade to |
|-------------|-----------|
| Backend / API routes | Next.js on Vercel |
| Auth + database | Next.js + Supabase |
| Multiple pages | Add React Router or Next.js |
| SEO / server rendering | Next.js (auto SSR) |
| Mobile app | React Native or Expo |

### Backend One-Shot Prompt

```
Create a Next.js project with Supabase for auth and database.
Set up login with email/password, a protected dashboard page,
and a [describe your data] table. Use shadcn/ui and Tailwind.
Deploy to Vercel.
```

---

## Stack Reference

### Frontend (This Pipeline)

| Layer | Tool | Why |
|-------|------|-----|
| Prototype | Claude Artifact | Instant visual iteration, zero setup |
| Framework | React 18 | Component model, huge ecosystem |
| Build | Vite | Fast HMR, clean config |
| Styling | Tailwind CSS | Utility-first, no CSS files to manage |
| Components | shadcn/ui + Radix | Accessible, composable, beautiful |
| Version Control | Git + GitHub | Rollback safety, collaboration, auto-deploy trigger |
| Hosting | Vercel | Zero-config deploys, free tier, fast global CDN |

### Full-Stack (When You Need Backend)

| Layer | Tool | Why |
|-------|------|-----|
| Framework | Next.js | React + API routes + SSR in one |
| Auth | Supabase Auth or Clerk | Free tier covers most apps |
| Database | Supabase (Postgres) | SQL, realtime, row-level security, free 500MB |
| Storage | Supabase Storage or Cloudflare R2 | File uploads without the headache |
| Email | Resend | Clean API, 3K emails/month free |
| Hosting | Vercel | Auto-deploys Next.js, serverless functions included |
