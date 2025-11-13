Mr Covie — here’s a tight, token-efficient **implementation brief** you can paste into Claude/Copilot to ship all the fixes fast. It’s split into clear goals with minimal, surgical code diffs.

---

# Nova Prop — UX/Billing/Analytics Fix Pack (Compact Agent Brief)

## Goals

1. **See signups & metrics** (admin dashboard).
2. **Fix CTA contrast** (white buttons unreadable).
3. **Credits & plan upgrades** (newsletter/AI overages → buy/top-up or upgrade).
4. **Browse page has nav** (no dead-end).
5. **Owner/admin parent platform** to monitor new signups.
6. **Bookings require email** + easy signup from property page.
7. **Landing navbar buttons route properly**.
8. **SEO tab shows “Nova Prop”** (not “PropNova”) + brand rename where needed.
9. **When credits exhausted** → show upgrade/top-up CTA that navigates to billing.

---

## 0) Naming & SEO (cheap tokens, big win)

**/src/main.tsx** (or App root): set meta title.

```tsx
// add once on mount
useEffect(() => {
  document.title = "Nova Prop — Unified property ops (SA)";
}, []);
```

Rename brand variable to **Nova Prop** in LandingPage:

```diff
- const brand = { name: "Propnova", primary: "violet", accentHex: "#7C3AED" };
+ const brand = { name: "Nova Prop", primary: "violet", accentHex: "#7C3AED" };
```

Optionally add Helmet:

```tsx
import { Helmet } from "react-helmet";
<Helmet>
  <title>Nova Prop — Unified property ops (SA)</title>
  <meta name="description" content="Listings, calendar, messaging & automations for SA realtors and hosts." />
</Helmet>
```

---

## 1) Fix CTA contrast (white buttons unreadable)

Prefer **secondary**/ghost with border & violet text, or full violet.

In LandingPage hero:

```diff
- <Button size="lg" variant="outline" ...>Book a demo</Button>
+ <Button size="lg" variant="secondary" className="border-violet-200 text-violet-700 hover:text-white hover:bg-violet-700">Book a demo</Button>
```

Globally, update the white CTA utility:

```css
/* tailwind.css */
.btn-contrast { @apply bg-white text-violet-700 border border-violet-200 hover:bg-violet-700 hover:text-white; }
```

---

## 2) Add navbar on Browse Properties (no dead-end)

Wrap **BrowsePropertiesPage** with your `AppLayout` (contains Navbar) or add a local header.

```diff
// routes
<Route 
  path="/browse-properties" 
- element={<BrowsePropertiesPage/>}
/>
+ element={<AppLayout><BrowsePropertiesPage/></AppLayout>}
/>
```

Inside **BrowsePropertiesPage** add a top bar fallback (mobile):

```tsx
<div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b md:hidden">
  <div className="flex items-center justify-between p-2">
    <button onClick={()=>navigate(-1)} className="text-sm text-violet-700">← Back</button>
    <button onClick={()=>navigate('/')} className="text-sm text-violet-700">Home</button>
    <button onClick={()=>navigate('/dashboard')} className="text-sm text-violet-700">Dashboard</button>
  </div>
</div>
```

---

## 3) Property page: easy booking + capture email + signup prompt

In **PropertyDetailsPage**:

* If **not authenticated**, show **email field + “Continue”** → modal to **sign up as client**; prefill email.
* If **authenticated(client)**, show booking form; if **realtor**, show “preview as client”.

```tsx
const { isAuthenticated, user } = useAuth();
const [guestEmail,setGuestEmail]=useState("");

{!isAuthenticated ? (
  <Card className="mt-4">
    <CardHeader><CardTitle>Book this property</CardTitle></CardHeader>
    <CardContent className="space-y-3">
      <Input type="email" placeholder="Your email" value={guestEmail} onChange={e=>setGuestEmail(e.target.value)} required />
      <Button onClick={()=> navigate(`/register?role=client&email=${encodeURIComponent(guestEmail)}&redirect=/property/${id}/book`)}
        className="bg-violet-600 hover:bg-violet-700">Continue to sign up</Button>
    </CardContent>
  </Card>
) : (
  user.role==='client' && <BookNowForm />
)}
```

Also ensure your **BookingPage** requires `email` in payload (even for logged-in—use account email as default).

---

## 4) Newsletter/AI credits: show usage + upgrade/top-up CTA

### 4.1 Usage widget (profile + AI/News pages)

Create **UsageBadge**:

```tsx
// components/UsageBadge.tsx
export default function UsageBadge({used,limit,onUpgrade}:{used:number,limit:number,onUpgrade:()=>void}) {
  const low = used/limit >= 0.8;
  return (
    <div className={`inline-flex items-center gap-2 px-2 py-1 rounded border ${low?'border-amber-300 bg-amber-50':'border-violet-200 bg-violet-50'}`}>
      <span className="text-sm">{used}/{limit} this month</span>
      {low && <Button size="sm" variant="secondary" className="h-7 text-violet-700" onClick={onUpgrade}>Upgrade</Button>}
    </div>
  );
}
```

### 4.2 When exhausted → navigate to billing with intent

In AI/Newsletter submit handlers:

```ts
catch(e:any){
  if(e.response?.status===402){
    toast.error(e.response.data?.message || "Limit reached");
    navigate('/billing?intent=upgrade'); // or ?sku=ai-topup
    return;
  }
  ...
}
```

### 4.3 Buy additional credits (one-off top-up)

Backend add endpoint:

```
POST /billing/ai-topup
body: { pack: "100" | "250" }
→ creates PayFast once-off payment
ITN handler: on success -> org.aiBonusCreditsMonth += N
/me/ai-usage returns: totalRemaining = (plan.aiCredits - used) + aiBonusCreditsMonth
```

On **/billing** add a card:

```tsx
<Card>
  <CardHeader><CardTitle>Need more AI credits?</CardTitle></CardHeader>
  <CardContent className="space-y-3">
    <div className="flex gap-2">
      <Button onClick={()=>api.post('/billing/ai-topup',{pack:"100"}).then(r=>window.location.href=r.data.redirect)} className="bg-violet-600">Buy 100 (R49)</Button>
      <Button onClick={()=>api.post('/billing/ai-topup',{pack:"250"}).then(r=>window.location.href=r.data.redirect)} variant="secondary" className="text-violet-700">Buy 250 (R99)</Button>
    </div>
  </CardContent>
</Card>
```

---

## 5) Make upgrading obvious when limits hit (newsletter & AI)

Centralize a small helper:

```ts
// lib/handleLimitError.ts
export function handleLimitError(e, navigate){
  if(e?.response?.status===402){
    const q = new URLSearchParams({ intent:'upgrade', reason:'limit' }).toString();
    navigate(`/billing?${q}`);
    return true;
  }
  return false;
}
```

Use in AI generate / newsletter send.

---

## 6) Landing navbar: ensure buttons route

In the landing header:

```diff
- <a href="#features">Features</a>
+ <a href="/#features">Features</a>
```

And make sure the app doesn’t swallow anchor routing in Router (allow hash). Alternatively use `onClick={() => document.getElementById('features')?.scrollIntoView({behavior:'smooth'})}`.

---

## 7) Admin/Owner “parent” dashboard (monitor signups & activity)

### 7.1 Backend metrics (cheap & fast)

Add **/admin/metrics** (owner only):

```ts
GET /admin/metrics
→ {
  users: { total, byRole: {realtor, client}, last7d },
  orgs:  { total, byPlan: {free, starter, growth}, last7d },
  properties: { total, last7d },
  bookings: { total, last7d },
  newsletters: { sentThisMonth, subscribersTotal },
  ai: { usedThisMonth, topupsThisMonth }
}
```

Use simple Mongo `countDocuments` and `aggregate` with `$match` on `createdAt > now-7d`.

### 7.2 Frontend admin page

Route `/admin` (owner only). Show 2×3 cards (Totals, Last 7d), and a table “Recent Signups” (name, email, role, date). Add quick filters.

Quick link on navbar visible only to `user.isOwner`.

---

## 8) Add “Upgrade plan” entry points everywhere

* **Profile page**: card “Your Plan: Free / Growth” + `Manage Billing` button → `/billing`.
* **News composer** (realtor): show quota + “Upgrade” button when ≥80%.
* **AI Studio**: usage badge + upgrade CTA when ≥80%.

---

## 9) Newsletter credits purchase (parallel to AI)

Mirror AI top-up:

* Add `newsletterBonusMonth` counter.
* Quota check = `plan.newslettersLimit + newsletterBonusMonth - used`.
* Add “Buy 20 newsletters (R49)” on `/billing`.

---

## 10) Minimal changes in your current landing canvas

* Brand name changed to **Nova Prop**.
* All CTAs use **violet** or **secondary** (no pure white text on white).
* “Start free” → `/signup`, “Buy now” → `/billing`, “Book a demo” → `/demo`.

---

## Tiny code patches (surgical)

**A. Button contrast (landing hero)**

```diff
- <Button size="lg" variant="outline" onClick={()=>...}>Book a demo</Button>
+ <Button size="lg" variant="secondary" className="border-violet-200 text-violet-700 hover:text-white hover:bg-violet-700" onClick={()=>...}>Book a demo</Button>
```

**B. Browse page uses AppLayout**

```diff
<Route 
  path="/browse-properties" 
- element={<BrowsePropertiesPage />}
/>
+ element={<AppLayout><BrowsePropertiesPage /></AppLayout>}
/>
```

**C. Exhausted → upgrade redirect (example)**

```ts
try { ... }
catch(e){ 
  if (handleLimitError(e, navigate)) return;
  toast.error("Something went wrong");
}
```

**D. SEO title**

```tsx
useEffect(()=>{ document.title = "Nova Prop — Unified property ops (SA)"; }, []);
```

---

## Notes on monitoring signups

* If you don’t want to build charts yet, log `User.create` events to a simple `Audit` collection:

  * `{ type:'user_signup', userId, role, ts }`
* The admin page can read last 100 events and render a plain table.

---

## What to tell users when booking (email)

* Add `email` field to the **guest booking form** and also capture from authenticated client profile (prefill). Store on booking doc; send confirmation to that email.

---

## Final acceptance checklist

* **Navbar present** on Browse; easy navigation.
* **Landing CTAs** readable; buttons route.
* **Property page** lets guests enter email and continue to signup → booking.
* **Usage badges** show remaining credits; hitting limit opens **/billing**.
* **Top-ups** possible (AI + Newsletter).
* **Admin dashboard** shows signups/metrics.
* **Tab title** says **Nova Prop**.

If you want, I can also output the exact backend route stubs for **/admin/metrics**, **/billing/ai-topup**, and the Mongoose aggregates—but the above keeps tokens lean and gives you a clear path to ship.
