Got you, Mr Covie. Here’s a clean, copy-paste **Markdown spec** (with code) to wire an **AI Listing Generator** that’s **metered by plan**:

* **Free** → max **8** AI generations / month
* **Growth** → max **15** AI generations / month

It’s designed for **Express + Mongoose + Vite/React**, and will **block server-side** if the cap is exceeded.

---

# 📦 PropNova — AI Listing Generator (Plan-Metered)

## 🎯 What we’re adding

* **/ai/listing/generate** endpoint (Groq call) that returns:

  * **Title** (≤60 chars)
  * **Description** (150–220 words)
  * **Amenities** (6–10 bullets)
  * **SEO keywords** (3)
* **Server-side quota enforcement** per **calendar month**:

  * **free**: 8 calls / month
  * **growth**: 15 calls / month
* **Usage widget** on FE (shows used/limit/renewal)
* Central place to adjust limits in one file

---

## 1) Backend: plan limits & usage models

### 1.1 `models/Plan.ts`

```ts
// backend/src/models/Plan.ts
export const PLAN_LIMITS = {
  free: {
    aiListingGenerations: 8,           // <= enforce here
    propertiesCap: 2,                  // FYI (existing)
  },
  growth: {
    aiListingGenerations: 15,          // <= enforce here
    propertiesCap: 10,
  },
  // add: starter/pro, etc. when needed
} as const;

export type PlanId = keyof typeof PLAN_LIMITS;
```

### 1.2 Extend your Organization / Realtor model

Add monthly counters. If you’re storing plan on `Organization` (recommended), add:

```ts
// backend/src/models/Organization.ts
import mongoose from 'mongoose';

const OrganizationSchema = new mongoose.Schema({
  ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  name: String,

  // Billing / plan
  planId: { type: String, enum: ['free','growth'], default: 'free' },
  subscriptionStatus: { type: String, default: 'inactive' },
  renewsAt: { type: Date }, // next billing or month rollover

  // Usage counters (reset monthly by cron)
  aiListingGenerationsUsedMonth: { type: Number, default: 0 },

  // Optional: convenience
  propertiesCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Organization', OrganizationSchema);
```

### 1.3 AI usage audit (optional but useful)

```ts
// backend/src/models/AiUsage.ts
import mongoose from 'mongoose';

const AiUsageSchema = new mongoose.Schema({
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  feature: { type: String, enum: ['listing_generate'], index: true },
  meta: { type: Object },
  ts: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

export default mongoose.model('AiUsage', AiUsageSchema);
```

---

## 2) Backend: Groq client

```ts
// backend/src/services/groq.ts
import fetch from 'node-fetch';

const GROQ_API_KEY = process.env.GROQ_API_KEY!;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.2-90b-text'; // keep configurable

export async function groqChat(messages: Array<{role:'system'|'user'|'assistant', content:string}>) {
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.4,
      messages
    })
  });
  if (!r.ok) throw new Error(`Groq error ${r.status}`);
  const j = await r.json();
  return j.choices?.[0]?.message?.content ?? '';
}
```

---

## 3) Backend: middleware to enforce plan usage

```ts
// backend/src/middleware/aiListingQuota.ts
import type { Request, Response, NextFunction } from 'express';
import Organization from '../models/Organization';
import { PLAN_LIMITS } from '../models/Plan';

export async function aiListingQuota(req: Request, res: Response, next: NextFunction) {
  // Assume req.orgId is set by your auth layer
  const orgId = (req as any).orgId;
  if (!orgId) return res.status(401).json({ message: 'No organization context' });

  const org = await Organization.findById(orgId);
  if (!org) return res.status(404).json({ message: 'Organization not found' });

  const plan = PLAN_LIMITS[org.planId as keyof typeof PLAN_LIMITS];
  if (!plan) return res.status(400).json({ message: 'Invalid plan' });

  const used = org.aiListingGenerationsUsedMonth || 0;
  const limit = plan.aiListingGenerations;

  if (used >= limit) {
    return res.status(402).json({
      code: 'AI_LISTING_QUOTA_EXCEEDED',
      message: `You have used ${used}/${limit} AI listing generations for this month. Upgrade your plan or wait for your next renewal.`
    });
  }

  // pass org + limit downstream for convenience
  (req as any).org = org;
  (req as any).aiListingLimit = limit;
  next();
}
```

> Add a monthly reset cron that sets `aiListingGenerationsUsedMonth = 0` for all orgs (e.g., at month start or using `renewsAt`).

---

## 4) Backend: the AI Listing endpoint

```ts
// backend/src/routes/ai.listing.ts
import { Router } from 'express';
import { groqChat } from '../services/groq';
import AiUsage from '../models/AiUsage';
import Organization from '../models/Organization';
import { aiListingQuota } from '../middleware/aiListingQuota';
import { authRequired } from '../middleware/authRequired'; // your existing auth

const router = Router();

/**
 * POST /ai/listing/generate
 * body: { beds, baths, suburb, city, price, amenities: string[] }
 * returns: { title, description, amenities: string[], keywords: string[] }
 */
router.post('/listing/generate', authRequired, aiListingQuota, async (req, res) => {
  const { beds, baths, suburb, city, price, amenities = [] } = req.body || {};
  const org = (req as any).org;
  const user = (req as any).user;

  if (!beds || !baths || !suburb || !city || !price) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const sys = `
You are PropNova's listing coach for South African rentals.
Return valid JSON with keys: title (<= 60 chars), description (150-220 words), amenities (6-10 bullets), keywords (3 items).
Write in neutral South African English. Avoid promises and sensitive claims.
  `.trim();

  const u = `
Create a listing for a ${beds}-bed, ${baths}-bath property in ${suburb}, ${city}, asking price ZAR ${price}.
Amenities: ${Array.isArray(amenities) ? amenities.join(', ') : amenities}.
  `.trim();

  const content = await groqChat([
    { role: 'system', content: sys },
    { role: 'user', content: u }
  ]);

  // Try to parse JSON. If it’s plain text, attempt a best-effort parse.
  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch {
    parsed = { raw: content };
  }

  // Meter usage
  org.aiListingGenerationsUsedMonth = (org.aiListingGenerationsUsedMonth || 0) + 1;
  await org.save();

  await AiUsage.create({
    orgId: org._id,
    userId: user._id,
    feature: 'listing_generate',
    meta: { suburb, city, beds, baths, price }
  });

  return res.json({ ok: true, result: parsed });
});

export default router;
```

### Mount the router

```ts
// backend/src/server.ts
import aiListingRoutes from './routes/ai.listing';
// ...
app.use('/ai', aiListingRoutes);
```

---

## 5) Monthly reset job (simple version)

* Run daily at 02:00; if the month changed since `updatedAt`, reset.

```ts
// backend/src/jobs/resetMonthly.ts
import Organization from '../models/Organization';

export async function resetMonthlyCounters() {
  const orgs = await Organization.find({});
  const now = new Date();
  for (const org of orgs) {
    const last = org.updatedAt || new Date(0);
    if (last.getMonth() !== now.getMonth() || last.getFullYear() !== now.getFullYear()) {
      org.aiListingGenerationsUsedMonth = 0;
      await org.save();
    }
  }
}
```

Hook it with node-cron / Render cron:

```ts
// backend/src/cron.ts
import cron from 'node-cron';
import { resetMonthlyCounters } from './jobs/resetMonthly';

cron.schedule('0 2 * * *', async () => {
  await resetMonthlyCounters();
});
```

---

## 6) Frontend: AI Studio form (Vite/React)

Create a minimal page where realtors can generate listings. Show usage progress.

```tsx
// frontend/src/pages/AiStudio.tsx
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function AiStudio() {
  const [form, setForm] = useState({ beds:'', baths:'', suburb:'', city:'', price:'', amenities:'' });
  const [result, setResult] = useState<any>(null);
  const [usage, setUsage] = useState<{ used:number; limit:number } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUsage = async () => {
    const r = await api.get('/me/ai-usage'); // implement below
    setUsage(r.data);
  };

  useEffect(() => { fetchUsage(); }, []);

  const onGenerate = async () => {
    setLoading(true);
    try {
      const payload = {
        beds: Number(form.beds),
        baths: Number(form.baths),
        suburb: form.suburb,
        city: form.city,
        price: Number(form.price),
        amenities: form.amenities.split(',').map(s => s.trim()).filter(Boolean),
      };
      const r = await api.post('/ai/listing/generate', payload);
      setResult(r.data.result);
      toast.success('Listing generated');
      fetchUsage(); // refresh usage after success
    } catch (e:any) {
      if (e?.response?.data?.code === 'AI_LISTING_QUOTA_EXCEEDED') {
        toast.error(e.response.data.message);
      } else {
        toast.error('Failed to generate listing');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">AI Listing Generator</h1>
        {usage && (
          <Badge variant="secondary">
            {usage.used}/{usage.limit} this month
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader><CardTitle>Inputs</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <Input placeholder="Beds" value={form.beds} onChange={e=>setForm(f=>({...f, beds:e.target.value}))}/>
          <Input placeholder="Baths" value={form.baths} onChange={e=>setForm(f=>({...f, baths:e.target.value}))}/>
          <Input placeholder="Suburb" value={form.suburb} onChange={e=>setForm(f=>({...f, suburb:e.target.value}))}/>
          <Input placeholder="City" value={form.city} onChange={e=>setForm(f=>({...f, city:e.target.value}))}/>
          <Input placeholder="Price (ZAR)" value={form.price} onChange={e=>setForm(f=>({...f, price:e.target.value}))}/>
          <Textarea placeholder="Amenities (comma separated)" value={form.amenities} onChange={e=>setForm(f=>({...f, amenities:e.target.value}))}/>
          <div className="md:col-span-2">
            <Button className="bg-violet-600 hover:bg-violet-700" onClick={onGenerate} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Listing'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card className="mt-6">
          <CardHeader><CardTitle>Result</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><span className="font-semibold">Title:</span> {result.title || result.raw}</div>
            <div><span className="font-semibold">Description:</span><p className="whitespace-pre-wrap">{result.description || ''}</p></div>
            {Array.isArray(result.amenities) && (
              <div>
                <span className="font-semibold">Amenities:</span>
                <ul className="list-disc pl-6">{result.amenities.map((a:string,i:number)=><li key={i}>{a}</li>)}</ul>
              </div>
            )}
            {Array.isArray(result.keywords) && (
              <div>
                <span className="font-semibold">SEO keywords:</span> {result.keywords.join(', ')}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

### FE usage API (display badge)

Add a tiny endpoint to return `{ used, limit }` for current org:

```ts
// backend/src/routes/me.ts
import { Router } from 'express';
import Organization from '../models/Organization';
import { PLAN_LIMITS } from '../models/Plan';
import { authRequired } from '../middleware/authRequired';

const router = Router();

router.get('/me/ai-usage', authRequired, async (req, res) => {
  const orgId = (req as any).orgId;
  const org = await Organization.findById(orgId);
  if (!org) return res.status(404).json({ message: 'Organization not found' });

  const limit = PLAN_LIMITS[org.planId as keyof typeof PLAN_LIMITS].aiListingGenerations;
  const used = org.aiListingGenerationsUsedMonth || 0;

  res.json({ used, limit, planId: org.planId, renewsAt: org.renewsAt || null });
});

export default router;
```

Mount:

```ts
// backend/src/server.ts
import meRoutes from './routes/me';
app.use('/', meRoutes);
```

---

## 7) Navigation & gating

* Add **“AI Studio”** tile on Realtor **Dashboard** → route `/ai-studio` (protected by role).
* **Guard on FE**: if user is not a realtor, hide entry; if they hit the route, redirect.
* When API returns `402 AI_LISTING_QUOTA_EXCEEDED`, show a toast + CTA to **/billing**.

---

## 8) Security & abuse controls

* Rate-limit `/ai/listing/generate` (e.g., 20/min per org).
* Reject missing/invalid inputs server-side.
* Don’t rely on FE for limits—**the middleware is the source of truth**.

---

## 9) Test cases

* **Free plan** org makes **8** successful calls; **9th** returns **402** with `AI_LISTING_QUOTA_EXCEEDED`.
* **Growth** plan org makes **15** successful calls; **16th** blocked the same way.
* Switching plan from free → growth reflects new limit immediately; counter not reset until month rollover.
* `/me/ai-usage` shows correct numbers after each generate.

---

## 10) Env & config

```
# backend
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.2-90b-text
```

---

## 11) Future hooks (optional)

* Track tokens & rough cost in `AiUsage.meta`.
* Add a **“top-up credits”** SKU later if you want revenue beyond plans.
* Add Cohere/Groq switch via env for experimentation.

---

### TL;DR flow

1. Realtor fills form in **AI Studio** → POST `/ai/listing/generate`.
2. **Middleware** checks plan & monthly counter (`8` for free, `15` for growth).
3. If allowed → call **Groq**, increment counter, return JSON listing.
4. FE shows result + refreshes usage badge; if blocked, show upgrade CTA.

This will give PropNova a crisp, monetizable AI feature with **hard server-side limits** that match your **plan ladder**.
