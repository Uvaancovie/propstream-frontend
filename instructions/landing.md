# Propnova Landing Page — Full Implementation Guide (Markdown)

> **Owner:** Mr Covie (Way2Fly Digital)
> **Goal:** Ship a high-converting **purple & white** landing page for **Propnova** with **“Coming soon”** messaging, professional **images/icons**, and **responsive** layout using **Vite + React + Tailwind + shadcn/ui + framer-motion + lucide-react**.
> **Status:** Page component is ready (see `src/pages/LandingPage.jsx`, already created in canvas). This doc is the single source of truth to wire, style, and deploy.

---

## 1) Tech Stack & Key Files

* **Frontend:** Vite + React (JSX)
* **UI:** TailwindCSS, **shadcn/ui**, **lucide-react** icons, **framer-motion**
* **Routing:** `react-router-dom`
* **Primary file:** `src/pages/LandingPage.jsx` (component name: `PropnovaLanding`)
* **Uses:** shadcn components (`Button`, `Card`, `Badge`, `Input`, `Tabs`, `Accordion`, `Separator`)

**Sections on the page**

* Hero (**Coming soon** badge + waitlist form + dual CTAs)
* Trustbar (eco logos/labels)
* Visual Gallery (professional imagery)
* Feature Cards (Unified Calendar, Messaging, Automations)
* ROI Calculator (time & Rand savings)
* Pricing (Starter/Growth/Agency)
* FAQ
* Footer

---

## 2) Prerequisites & Installs

```bash
# UI libs
npm i lucide-react framer-motion

# shadcn/ui (if not initialized yet)
npx shadcn@latest init
npx shadcn@latest add button card badge input tabs accordion separator

# tailwindcss (if not already installed)
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**`tailwind.config.js`**

```js
export default {
  darkMode: ["class"],
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [require("tailwindcss-animate")],
};
```

**Vite alias** (so `@/components/ui/*` works):

```js
// vite.config.js
import path from "path";
export default {
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
};
```

**Global CSS**: ensure Tailwind directives exist in `src/index.css` (or equivalent):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 3) File Placement & Routing

* **Place** the landing component at: `src/pages/LandingPage.jsx` (already done).
* **Ensure** your router points `/` to `LandingPage`. Your current `App.jsx` already does:

```jsx
<Route
  path="/"
  element={
    <PublicRoute>
      <LandingPage />
    </PublicRoute>
  }
/>
```

> **Note:** The landing should **not** wrap in `AppLayout` (no double header). It already includes its own sticky header.

---

## 4) Brand, Theme & Imagery

* **Primary color:** Tailwind **violet** scale (e.g., `bg-violet-600 hover:bg-violet-700`)
* **Backgrounds:** white base with subtle gradients (`from-violet-50 to-white`) and soft borders (`border-violet-100`)
* **Typography:** default system stack; consider Inter later
* **Icons:** **lucide-react** (e.g., `ShieldCheck`, `Clock3`, `Wallet`, `Sparkles`, etc.)
* **Images:** In `VisualGallery`, Unsplash placeholders are included — **replace** with branded images or listing photos

  * Recommended: **WebP/AVIF**, 1600px width, `loading="lazy"` (already handled by DOM priority)

---

## 5) “Coming Soon” + Waitlist

### 5.1 Current Behavior

* Hero shows **“Coming soon”** badge and a waitlist form.
* The form currently **redirects to `/waitlist`**. You can:

  * **Option A (quick):** Keep redirect and capture email on a dedicated page.
  * **Option B (recommended):** POST directly to backend `/api/waitlist` (Neon + Resend setup from earlier doc).

### 5.2 Hook the Form to API (Option B)

Update the form handler in `LandingPage.jsx` hero:

```jsx
<form
  className="mt-4 flex flex-col sm:flex-row gap-2"
  onSubmit={async (e) => {
    e.preventDefault();
    const email = e.currentTarget.querySelector('input[type="email"]').value;
    const name = ""; // add a name field if you like
    const url = `${import.meta.env.VITE_API_URL || "https://propstream-api.onrender.com"}/api/waitlist`;
    const r = await fetch(url, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ email, name, source: "landing" })
    });
    if (r.ok) {
      alert("You're on the list! Check your inbox for a confirmation email. We’ll ping you again in ~12 days.");
      e.currentTarget.reset();
    } else {
      alert("Could not join the waitlist. Try again.");
    }
  }}
>
  <Input type="email" required placeholder="Enter your email for early access" className="sm:max-w-xs" />
  <Button type="submit" className="bg-violet-600 hover:bg-violet-700">Join the waitlist</Button>
</form>
```

**Frontend env (Vercel):**

```
VITE_API_URL=https://propstream-api.onrender.com
```

**Backend (Render) env (from earlier guide):**

```
DATABASE_URL=postgres://...neon...sslmode=require
RESEND_API_KEY=...
FROM_EMAIL="Propnova <noreply@propnova.app>"
CRON_SECRET=some-long-random-string
```

> Cron hits `POST /api/waitlist/dispatch` daily (with `x-cron-key: CRON_SECRET`) to send the **“we’re live”** email exactly **12 days** after signup.

---

## 6) CTA Wiring

* **Start free trial** → `/signup` (or `/register` in your app)
* **Book a demo** → `/demo` (redirect to `/contact` or external Calendly)
* **Pricing “Buy now”** → `/billing` (protected route)
* **Sign in** → `/login`

Adjust the `window.location.href` in CTA buttons to match your actual routes.

---

## 7) Performance, SEO & Accessibility

### 7.1 Performance

* LCP target: **< 2.5s** mobile.
* Avoid heavy hero images; current hero uses **illustrative skeleton UI**, which is lightweight.
* Use `loading="lazy"` for gallery `<img>` (add if not present).
* Consider preloading critical fonts if you add them.

### 7.2 SEO

Add a head manager or static index `<head>` tags:

```html
<title>Propnova — Unified Property Ops (Coming Soon)</title>
<meta name="description" content="Save hours each week with a unified hub for listings, calendar, and guest messaging. Join the waitlist for early access." />
<meta property="og:title" content="Propnova — Unified Property Ops (Coming Soon)"/>
<meta property="og:description" content="Unified calendar, messaging templates, and automations for hosts and lean agencies."/>
<meta property="og:type" content="website"/>
<meta property="og:url" content="https://propstream-frontend.vercel.app/"/>
<meta property="og:image" content="https://yourcdn/og-propnova.png"/>
<link rel="canonical" href="https://propstream-frontend.vercel.app/"/>
```

### 7.3 Accessibility

* Every image needs `alt` text (already included).
* Buttons have visible labels; icons are decorative only.
* Heading order: h1 in hero, h2 for sections; avoid skipping levels.

---

## 8) Styling Notes (Purple/White System)

* Primary CTA: `bg-violet-600 hover:bg-violet-700`
* Highlights: `bg-violet-100`, `text-violet-700`
* Cards: `border-violet-100 bg-white rounded-2xl`
* Section BGs: `bg-gradient-to-b from-white to-violet-50` or vice-versa

Optional CSS helpers (`src/styles/brand.css`):

```css
:root { --brand: 124 58 237; } /* violet-600 */
.btn-brand { @apply bg-violet-600 hover:bg-violet-700 text-white; }
.card-brand { @apply border border-violet-100 bg-white rounded-2xl; }
```

---

## 9) Copy & Content (what it communicates)

* **Hero headline:** “Save hours each week with a unified property ops hub.”
* **Subhead:** “Propnova unifies listings, calendar, and messaging—so Durban hosts & small agencies work smarter, not harder.”
* **Trust chips:** Secure • 5-minute setup • Payfast/Stripe ready
* **Value:** Unified iCal (no double bookings), templated guest comms, Make/Zapier automations
* **Pricing:** Free trial (14 days), Growth (R199), Agency (Custom)
* **FAQ:** Sets expectations on channel posting (partner reality) and confirms Payfast + trial

> Tweak copy for your SA market: add 1–2 host testimonials with **specific time saved** (e.g., “\~4.5h/week”).

---

## 10) QA Checklist (Ship-Ready)

* [ ] Page renders on **mobile, tablet, desktop** without overflow.
* [ ] **Hero CTAs** point to real routes/permalinks.
* [ ] Waitlist form successfully **submits** (either redirect or API POST).
* [ ] **Pricing** “Buy now” → `/billing` works behind auth.
* [ ] Lighthouse: **Performance ≥ 90**, **A11y ≥ 95**, **SEO ≥ 90**.
* [ ] OG tags produce a good preview on WhatsApp/X/LinkedIn.
* [ ] No console errors; images load fast on 3G.

---

## 11) Deploy (Vercel)

* **Environment vars (Frontend):**

  * `VITE_API_URL=https://propstream-api.onrender.com`
* **Build command:** `npm run build`
* **Output dir:** `dist`
* **Preview → Production** once passes QA.

---

## 12) Optional Enhancements (Next Iteration)

* **Sticky Mobile CTA** (bottom bar): “Start free” + “Join waitlist”.
* **Launch Countdown** under hero (12-day timer).
* **Privacy page** + cookie banner if analytics tags added.
* **Testimonials** (with avatars), **Logos** (partners/hosts).
* **Blog/Guides** for SEO long-tail (“How to sync Airbnb & Booking.com calendars” etc.).

---

## 13) Troubleshooting

* `@/components/ui/...` not found → ensure **Vite alias** is configured & shadcn components installed.
* Styles not applied → check Tailwind `content` globs include `./src/**/*.{js,jsx}`.
* Icons missing → `npm i lucide-react` and correct imports.
* Animations stutter → reduce `framer-motion` durations to `0.3–0.4s`.

---

## 14) Commit Template

```
feat(landing): add Propnova coming-soon page w/ purple theme, gallery, ROI, pricing, FAQ

- shadcn/ui: button, card, badge, input, tabs, accordion, separator
- animations via framer-motion
- lucide-react icons across features & trust elements
- responsive grids (mobile-first)
- waitlist form (ready to POST to /api/waitlist)
- SEO placeholders (title/description/OG)
```

---

### Final Notes

* The **full landing page component** is already prepared in `src/pages/LandingPage.jsx` (see canvas).
* Tie the **waitlist** to your **Neon + Resend** backend when ready (12-day automation already documented).
* Keep the **purple & white** aesthetic strict; avoid mixed palettes to maintain brand consistency.

**Mr Covie**, this page is built to convert: short copy, strong CTAs, trust signals, and a hard ROI pitch. Push, test, iterate.
