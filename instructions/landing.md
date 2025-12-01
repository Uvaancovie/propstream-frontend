# PropNova Landing — Dark “Cosmic Purple” Theme Implementation (Markdown for Copilot)

**Owner:** Mr Covie (Way2Fly Digital)
**Objective:** Convert the existing **Propnova landing** (currently light) into a **dark, space-inspired** theme (black + purple), incorporate the **cosmic copy** below, and keep it **responsive** with **shadcn/ui + Tailwind + framer-motion + lucide-react**.
**Where to apply:** `src/pages/LandingPage.jsx` (your existing canvas file “Propnova Landing Page (vite + Shadcn)”).

---

## 0) Design System — Cosmic Dark

* **Background:** `#0A0A0A` (Deep Space Black)
* **Primary:** `#7C3AED` (Cosmic Purple ≈ Tailwind `violet-600`)
* **Accents:** `#3B82F6` (Electric Blue), `#10B981` (Orbit Green), `#FACC15` (Solar Gold minimal)
* **Text:** White on dark; muted = `text-slate-400/70`
* **Cards:** `bg-[#0B0B0E]` with `border-violet-900/40` or `border-slate-800`
* **Buttons:** primary `bg-violet-600 hover:bg-violet-700`; outline on dark uses `border-slate-700 hover:bg-slate-800/60`

> Tone: **futuristic + professional**. Light motion, soft glows, subtle starfield.

---

## 1) Tailwind & Global CSS

### 1.1 Tailwind dark mode (already set to `class`)

Ensure:

```js
// tailwind.config.js
export default {
  darkMode: ["class"],
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [require("tailwindcss-animate")],
}
```

### 1.2 Starfield utilities (add once)

Create `src/styles/starfield.css`:

```css
/* Subtle layered starfield */
.starfield {
  position: relative;
  isolation: isolate;
}
.starfield::before,
.starfield::after {
  content: "";
  position: absolute;
  inset: -20%;
  z-index: -1;
  background:
    radial-gradient(2px 2px at 20% 30%, rgba(255,255,255,0.6) 50%, transparent 51%) repeat,
    radial-gradient(1px 1px at 70% 60%, rgba(255,255,255,0.4) 50%, transparent 51%) repeat;
  background-size: 180px 180px, 240px 240px;
  animation: drift 60s linear infinite;
  opacity: .45;
  filter: drop-shadow(0 0 6px rgba(124,58,237,0.35));
}
.starfield::after {
  animation-duration: 90s;
  opacity: .25;
}
@keyframes drift {
  from { transform: translate3d(0,0,0); }
  to   { transform: translate3d(-180px,-180px,0); }
}
```

Import it once in your app entry (e.g., `src/main.jsx` or `src/index.css`):

```css
@import "./styles/starfield.css";
```

---

## 2) Global Container → Dark Mode

### 2.1 Wrap the page root with dark background

In `PropnovaLanding()` **replace** the outermost `<div className="min-h-screen bg-white text-slate-900">` with:

```jsx
<div className="min-h-screen bg-[#0A0A0A] text-white starfield">
```

### 2.2 Header (dark)

Replace header classes:

```diff
- <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 border-b">
+ <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-[#0A0A0A]/60 bg-[#0A0A0A]/80 border-b border-slate-800">
```

Logo block:

```diff
- <div className="h-6 w-6 rounded-lg bg-violet-600" />
+ <div className="h-6 w-6 rounded-lg bg-violet-600 shadow-[0_0_20px_rgba(124,58,237,.45)]" />
```

Nav links:

```diff
- className="text-muted-foreground hover:text-foreground"
+ className="text-slate-400 hover:text-white"
```

Buttons:

```diff
- <Button variant="ghost" className="hidden sm:inline-flex" ...
+ <Button variant="ghost" className="hidden sm:inline-flex text-slate-300 hover:text-white hover:bg-slate-800/60" ...
- <Button className="bg-violet-600 hover:bg-violet-700" ...
+ <Button className="bg-violet-600 hover:bg-violet-700 shadow-[0_0_24px_rgba(124,58,237,.35)]" ...
```

---

## 3) Hero Section — Replace Copy & Styling

### 3.1 Imports (add icons)

At top:

```jsx
import { Rocket, CreditCard, Timer, ShieldCheck, Stars as StarsIcon } from "lucide-react";
```

### 3.2 Replace `Hero()` content **entire block** with this JSX

> Uses your exact cosmic copy + chips; stays responsive; includes waitlist.

```jsx
function Hero() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      {/* Cosmic gradient aura */}
      <div className="pointer-events-none absolute -inset-x-40 -top-40 -z-10 blur-3xl">
        <div className="mx-auto aspect-[1155/678] w-[36rem] md:w-[80rem]
          bg-gradient-to-tr from-violet-900/30 via-violet-600/20 to-transparent opacity-60"
          style={{ clipPath: "polygon(74% 44%, 100% 61%, 92% 100%, 60% 88%, 30% 100%, 0 76%, 0 29%, 18% 0, 53% 7%, 79% 26%)" }}
        />
      </div>

      <div className="container mx-auto px-4 max-w-6xl grid md:grid-cols-2 gap-10 items-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Badge className="bg-violet-700/70 text-white border border-violet-500/40">Coming Soon</Badge>

          <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
            <span className="text-white">Save lightyears of effort</span>{" "}
            <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              with a unified property hub
            </span>
          </h1>

          <p className="mt-4 text-lg md:text-xl text-slate-300 max-w-xl">
            PropNova aligns your listings, calendar, and messaging—so hosts & agencies work in perfect orbit, not in chaos.
          </p>

          <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-300">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-violet-400" /> Secure
            </span>
            <span className="inline-flex items-center gap-2">
              <Timer className="h-4 w-4 text-violet-400" /> 5-minute launch
            </span>
            <span className="inline-flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-violet-400" /> Payfast ready
            </span>
          </div>

          {/* Waitlist + CTAs */}
          <form
            className="mt-6 flex flex-col sm:flex-row gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              const email = e.currentTarget.querySelector('input[type="email"]').value;
              const url = `${import.meta.env.VITE_API_URL || "https://propstream-api.onrender.com"}/api/waitlist`;
              try {
                const r = await fetch(url, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email, source: "landing" }),
                });
                alert(r.ok
                  ? "You're on the list! Confirmation sent. We’ll ping you again in ~12 days."
                  : "Could not join the waitlist. Try again.");
                if (r.ok) e.currentTarget.reset();
              } catch {
                alert("Network error. Try again.");
              }
            }}
          >
            <Input type="email" required placeholder="Enter your email to join the constellation" className="sm:max-w-xs bg-[#0F0F13] border-slate-700 text-white placeholder:text-slate-500" />
            <div className="flex gap-2">
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700">
                ✨ Join Waitlist
              </Button>
              <Button className="bg-violet-700/40 hover:bg-violet-700/60 border border-violet-700/40" onClick={() => (window.location.href = "/register")}>
                🚀 Start Free Trial
              </Button>
              <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-800/60" onClick={() => (window.location.href = "/demo")}>
                🌠 Book a Demo
              </Button>
            </div>
          </form>

          <p className="mt-2 text-xs text-slate-400">
            Built for South African Property Pros — professional tools designed for local hosts and agencies.
          </p>
        </motion.div>

        {/* Right visual */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <Card className="rounded-3xl bg-[#0B0B0E] border border-violet-900/40 shadow-[0_0_60px_rgba(124,58,237,.15)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <StarsIcon className="text-violet-400" /> Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video w-full rounded-2xl bg-gradient-to-br from-[#0E0E12] to-[#141424] border border-slate-800 p-4">
                {/* skeleton UI */}
                <div className="grid grid-cols-3 gap-3 h-full">
                  <div className="col-span-2 rounded-xl border border-slate-800 bg-[#0F0F13] p-4">
                    <div className="h-6 w-40 rounded bg-violet-900/30" />
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-14 rounded-md border border-slate-800 bg-[#0E0E12]" />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-[#0F0F13] p-4 space-y-2">
                    <div className="h-6 w-24 rounded bg-violet-900/30" />
                    <div className="h-24 rounded-md border border-slate-800 bg-[#0E0E12]" />
                    <div className="h-24 rounded-md border border-slate-800 bg-[#0E0E12]" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
```

---

## 4) “Built for SA” Section (new)

Add below Hero (before Features):

```jsx
function BuiltForSA() {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-[#0A0A0A] to-[#0E0E12]">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="max-w-3xl space-y-3">
          <Badge className="bg-violet-700/70 text-white border border-violet-700/50">South Africa Ready</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold">Built for South African Property Pros</h2>
          <p className="text-slate-300">
            Professional tools designed for local hosts and agencies—simple, modern, and built for growth on Earth and beyond.
          </p>
        </div>
      </div>
    </section>
  );
}
```

Then include `<BuiltForSA />` in the layout.

---

## 5) Features (cosmic copy)

### 5.1 Replace Features header & cards text

* **Dashboard — Unified Command Center**
* **Calendar — Smart Calendar Sync** (Two-way sync, Instant date blocking, Multi-platform alignment)
* **Guest Messaging — Auto Messaging That Lands** (SA-ready templates, Auto scheduled, Multi-language)
* **Automations — Workflows on Autopilot** (Zapier/Make, Custom workflows, Smart notifications)

Update your existing `Features()` section:

```diff
- kicker="Why Propnova"
- title="One hub. Less admin. More bookings."
- subtitle="Hosts and lean agencies save time with a modern workflow that actually fits how you work."
+ kicker="Features at a glance"
+ title="Turn property chaos into effortless orbit"
+ subtitle="One mission control for dashboard, calendar sync, guest comms, and automations."

// Replace/extend cards to 4 columns (md:grid-cols-2 lg:grid-cols-4)
```

Example one card:

```jsx
<FeatureCard
  icon={CalendarCheck2}
  title="Smart Calendar Sync"
  desc="Prevent double bookings across Airbnb, Booking.com, and VRBO."
  bullets={["Two-way sync","Instant date blocking","Multi-platform alignment"]}
/>
```

For Messaging:

```jsx
<FeatureCard
  icon={Send}
  title="Auto Messaging That Lands"
  desc="Effortless check-ins, house rules and follow-ups—always on time."
  bullets={["SA-ready templates","Auto-scheduled messages","Multi-language support"]}
/>
```

For Automations:

```jsx
<FeatureCard
  icon={PlugZap}
  title="Workflows on Autopilot"
  desc="Let PropNova handle the repetitive ops while you scale."
  bullets={["Zapier & Make integration","Custom cosmic workflows","Smart notifications"]}
/>
```

Style cards dark:

```diff
- <Card className="h-full border-violet-100">
+ <Card className="h-full bg-[#0B0B0E] border border-violet-900/40">
```

Inner text:

```diff
- className="space-y-3 text-muted-foreground"
+ className="space-y-3 text-slate-300"
```

Icon chip:

```diff
- bg-violet-100 text-violet-700
+ bg-violet-900/30
```

---

## 6) Visual Gallery → Dark

In `VisualGallery()`, change wrappers:

```diff
- <section className="py-14 md:py-20">
+ <section className="py-14 md:py-20 bg-gradient-to-b from-[#0E0E12] to-[#0A0A0A]">

- <div className="group relative overflow-hidden rounded-2xl border border-violet-100 bg-white">
+ <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0B0B0E]">
```

Add `loading="lazy"` to `<img>`.

---

## 7) Time Savings (new section)

Add after Features (or replace ROI calculator subtitle to reinforce numbers):

```jsx
function TimeSavings() {
  return (
    <section className="py-14 md:py-20 bg-[#0A0A0A]">
      <div className="container max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold">Reclaim Your Orbit of Time</h2>
          <p className="mt-3 text-slate-300">
            With PropNova, hosts typically save <b>5 hours every week</b>—that’s <b>20 hours per month</b>.
          </p>
          <ul className="mt-4 space-y-2 text-slate-300">
            <li>⏳ Half a full work week back every month</li>
            <li>💰 R2,000+ in monthly time value for most SA hosts</li>
            <li>✨ More capacity to grow, or more life on Earth 🌍</li>
          </ul>
        </div>
        <Card className="bg-[#0B0B0E] border border-slate-800">
          <CardHeader><CardTitle>What could you do with 20 extra hours?</CardTitle></CardHeader>
          <CardContent className="text-slate-300 space-y-2">
            <p>• Welcome more guests</p>
            <p>• Grow your property portfolio</p>
            <p>• Step out of the grind and recharge</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
```

Then include `<TimeSavings />` before Pricing (you can keep ROI Calculator as well, styled dark like cards).

---

## 8) Pricing → Dark

Change section bg and cards:

```diff
- <section className="py-14 md:py-20 bg-gradient-to-b from-violet-50 to-white">
+ <section className="py-14 md:py-20 bg-gradient-to-b from-[#0A0A0A] to-[#0E0E12]">

- <Card className="border-violet-100">
+ <Card className="bg-[#0B0B0E] border border-slate-800">
```

Highlight Growth plan:

```diff
- <Card className="border-violet-600 shadow-lg ring-1 ring-violet-100 relative">
+ <Card className="bg-gradient-to-b from-[#0B0B0E] to-[#121225] border-violet-800 shadow-[0_0_60px_rgba(124,58,237,.15)] relative">
```

---

## 9) FAQ → Dark & Copy

Keep your existing questions; add cosmic phrasing to answers if desired. Change section wrapper:

```diff
- <section className="py-14 md:py-20">
+ <section className="py-14 md:py-20 bg-[#0A0A0A]">
```

Accordion is fine; ensure text is `text-slate-300`.

---

## 10) Replace Any Remaining Light Classes

Search & replace common classes:

* `bg-white` → `bg-[#0B0B0E]`
* `text-slate-900` → `text-white`
* `text-muted-foreground` → `text-slate-400`
* `border-violet-100` → `border-slate-800` or `border-violet-900/40`
* Section backgrounds using `from-white/to-violet-50` → `from-[#0A0A0A]/to-[#0E0E12]`

---

## 11) Branding & Fonts

Add Google Fonts (optional):

```html
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Poppins:wght@700;800&display=swap" rel="stylesheet" />
```

Set headings to **Poppins** in CSS:

```css
.h-font { font-family: Poppins, ui-sans-serif, system-ui, -apple-system, Segoe UI, Inter, Roboto, sans-serif; }
```

Then add `className="h-font"` to major headings.

---

## 12) SEO & OG (Dark Preview)

Add head tags (via your index.html or a head manager):

```html
<title>PropNova — Unified Property Ops (Coming Soon)</title>
<meta name="description" content="Save lightyears of effort with a unified hub for listings, calendar, and guest messaging. Join the constellation." />
<meta property="og:title" content="PropNova — Unified Property Ops (Coming Soon)"/>
<meta property="og:description" content="Smart calendar sync, auto messaging, and automations. Built for SA hosts and agencies."/>
<meta property="og:image" content="https://yourcdn/og-propnova-dark.png"/>
<meta property="og:type" content="website"/>
<meta property="og:url" content="https://propstream-frontend.vercel.app/"/>
```

---

## 13) CTA Routing (ensure no dead ends)

* **Join Waitlist** → posts to `/api/waitlist` (Neon + email confirmation + day 12 email)
* **Start Free Trial** → `/register`
* **Book a Demo** → `/demo` (redirect to `/contact` or Calendly)
* **Buy Now (Pricing)** → `/billing`

---

## 14) QA Checklist

* [ ] All sections render on **mobile / tablet / desktop** with no overflows.
* [ ] Contrast: text meets WCAG on dark (use `text-slate-300/white`).
* [ ] Hero chips/icons visible and aligned.
* [ ] Waitlist POST works; success alert shows.
* [ ] Performance: hero paints quickly (no heavy images above the fold).
* [ ] OG preview shows dark artwork.

---

## 15) Cosmic Copy (source of truth)

Use these lines verbatim in respective sections:

**Hero (headline + subhead + chips + CTAs):**

* “Save lightyears of effort with a unified property hub”
* “PropNova aligns your listings, calendar, and messaging—so hosts & agencies work in perfect orbit, not in chaos.”
* Chips: 🔒 Secure • ⚡ 5-minute launch • 💳 Payfast ready
* Form placeholder: “Enter your email to join the constellation”
* CTAs: ✨ Join Waitlist | 🚀 Start Free Trial | 🌠 Book a Demo

**Built for SA:**

* “Professional tools designed for local hosts and agencies—simple, modern, and built for growth on Earth and beyond.”

**Features:**

* **Unified Command Center** (Dashboard)
* **Smart Calendar Sync** (Two-way sync, Instant date blocking, Multi-platform alignment)
* **Auto Messaging That Lands** (SA-ready templates, Auto-scheduled messages, Multi-language support)
* **Workflows on Autopilot** (Zapier & Make integration, Custom cosmic workflows, Smart notifications)

**Time Savings:**

* “With PropNova, hosts typically save 5 hours every week—that’s 20 hours per month… over R24,000/year in time value.”

**Pricing:**

* ✨ **Starter (Solo Explorer)** – Free 14-day trial, Up to 2 properties, Basic sync & templates, Email support
* 🚀 **Growth (Expanding Orbit)** – R199/month, Up to 10 properties, Advanced automations, Analytics & reports, Priority support
* 🌌 **Enterprise (Galactic Leader)** – R399/month, Unlimited properties, White-label options, Dedicated support

**FAQs (keep + adapt):**

* Calendar sync like gravity; Payfast included; setup in 5 minutes; after trial choose Growth or free tier.

---

## 16) Final Integration

In `PropnovaLanding` render order (dark):

```jsx
<Hero />
<Trustbar />            {/* convert to dark: border-slate-800, text-slate-400 */}
<BuiltForSA />
<VisualGallery />
<Features />
<TimeSavings />
<ROICalculator />       {/* style cards dark as above (optional) */}
<Pricing />
<FAQ />
<Footer />              {/* border-slate-800, text-slate-400 */}
```

---

**Done.** Feed this markdown to Copilot. It will guide the precise refactors (class swaps, new sections, copy injection) so **PropNova** ships as a **dark, cosmic, purple-forward** landing that looks elite and converts.
