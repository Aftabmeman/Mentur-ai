
# Discate | Elite Academic Mentorship

Discate is an advanced academic mentorship platform that leverages AI to generate personalized assessments and provide deep evaluation of student work.

## 🚀 Critical Deployment Fixes (Read First)

### 1. Fix Email Verification 404
If verification links point to an old URL, you **MUST** update the Firebase Console:
- Go to **Firebase Console** -> **Authentication** -> **Templates** -> **Email Verification**.
- Edit the template and set the **Action URL** to: `https://discate.com/auth/action`
- Add `discate.com` to **Authorized Domains** in the Authentication settings tab.

### 2. GitHub & Sync
Follow these exact commands to sync your lockfile and push your code. This is required for stable Cloudflare/Render builds.

```bash
# Sync Lockfile Locally
npm install --legacy-peer-deps

# Push to GitHub
git add .
git commit -m "Fix: Verification handler polished and sitemap cleaned"
git push origin main
```

## Core Features
- **Node.js Runtime**: Optimized for stability across Render and Cloudflare.
- **Sequential Assessment Wizard**: 4-step process to generate MCQs, Flashcards, and Essays.
- **Scholar Report Card**: Animated Score Circle with deep metrics (Grammar, Depth, Relevancy).
- **Regional Mix Support**: Mentorship in 10 language styles (Hinglish, Marathish, etc.) with an energetic "Baval" tone.
