Here you go, Mr Covie — a clean, copy-paste **Markdown spec** for GitHub Copilot to implement **Realtor Newsletters** end-to-end in your stack (Express + Mongoose + Vite/React + shadcn). It plugs into your existing auth (`client` / `realtor`) and Messages UX.

---

# PropNova — Realtor Newsletters (Subscribe → Send → Inbox)

**Goal**

* Clients can **subscribe** to a realtor’s newsletter from **Browse/Property** pages.
* Realtors can **view subscribers** and **send a newsletter**.
* Subscribers **receive newsletters in Messages** (and see a system message on subscribe/unsubscribe).
* Support **unsubscribe**, minimal **rate limiting**, and basic **stats**.

**Stack**: Node/Express, Mongoose, Vite/React, shadcn/ui.
**Auth roles**: `client`, `realtor`.

---

## 1) Backend (Mongoose + Express)

### 1.1 Models

**NewsletterSubscription**

```js
// backend/src/models/NewsletterSubscription.js
const mongoose = require('mongoose');

const NewsletterSubscriptionSchema = new mongoose.Schema(
  {
    realtorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    clientId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status:    { type: String, enum: ['subscribed', 'unsubscribed'], default: 'subscribed' },
    unsubscribedAt: { type: Date }
  },
  { timestamps: true }
);

// prevent duplicates
NewsletterSubscriptionSchema.index({ realtorId: 1, clientId: 1 }, { unique: true });

module.exports = mongoose.model('NewsletterSubscription', NewsletterSubscriptionSchema);
```

**Newsletter**

```js
// backend/src/models/Newsletter.js
const mongoose = require('mongoose');

const NewsletterSchema = new mongoose.Schema(
  {
    realtorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title:     { type: String, required: true, maxlength: 120 },
    body:      { type: String, required: true, maxlength: 8000 },
    attachments: [{ url: String, name: String }],
    sentAt:    { type: Date },
    stats: {
      recipients: { type: Number, default: 0 },
      delivered:  { type: Number, default: 0 },
      opened:     { type: Number, default: 0 }, // optional if you add tracking later
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Newsletter', NewsletterSchema);
```

> Reuse your existing `Message` model. Each newsletter delivery is a `Message` row with `type: 'newsletter'`. Subscribe/unsubscribe create `type: 'system'` confirmations.

### 1.2 Role guards

```js
// backend/src/middleware/roles.js
exports.requireRealtor = (req, res, next) => {
  if (req.user?.role !== 'realtor') return res.status(403).json({ message: 'Realtor only' });
  next();
};
exports.requireClient = (req, res, next) => {
  if (req.user?.role !== 'client') return res.status(403).json({ message: 'Client only' });
  next();
};
```

### 1.3 Routes

Create `backend/src/routes/newsletter.js`, mount at `/newsletter`.

```js
// backend/src/routes/newsletter.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const NewsletterSubscription = require('../models/NewsletterSubscription');
const Newsletter = require('../models/Newsletter');
const Message = require('../models/Message'); // your existing messages model
const { requireClient, requireRealtor } = require('../middleware/roles');

const router = express.Router();
const sendLimiter = rateLimit({ windowMs: 15*60*1000, max: 5 }); // 5 sends / 15m per realtor

// POST /newsletter/subscribe  { realtorId }  (client)
router.post('/subscribe', requireClient, async (req, res) => {
  const { realtorId } = req.body;
  if (!realtorId) return res.status(400).json({ message: 'realtorId required' });

  const sub = await NewsletterSubscription.findOneAndUpdate(
    { realtorId, clientId: req.user._id },
    { $set: { status: 'subscribed' }, $unset: { unsubscribedAt: 1 } },
    { new: true, upsert: true }
  );

  await Message.create({
    toUserId: req.user._id,
    fromUserId: realtorId,
    type: 'system',
    subject: 'Subscribed to newsletter',
    body: 'You will now receive updates from this realtor.',
    meta: { kind: 'newsletter_subscribe', realtorId }
  });

  res.json({ ok: true, subscription: sub });
});

// POST /newsletter/unsubscribe  { realtorId }  (client)
router.post('/unsubscribe', requireClient, async (req, res) => {
  const { realtorId } = req.body;
  if (!realtorId) return res.status(400).json({ message: 'realtorId required' });

  const sub = await NewsletterSubscription.findOneAndUpdate(
    { realtorId, clientId: req.user._id },
    { $set: { status: 'unsubscribed', unsubscribedAt: new Date() } },
    { new: true }
  );

  await Message.create({
    toUserId: req.user._id,
    fromUserId: realtorId,
    type: 'system',
    subject: 'Unsubscribed from newsletter',
    body: 'You will no longer receive updates from this realtor.',
    meta: { kind: 'newsletter_unsubscribe', realtorId }
  });

  res.json({ ok: true, subscription: sub });
});

// GET /newsletter/subscribers?page=1&pageSize=20  (realtor)
router.get('/subscribers', requireRealtor, async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const pageSize = Math.min(100, parseInt(req.query.pageSize || '20', 10));

  const [rows, total] = await Promise.all([
    NewsletterSubscription.find({ realtorId: req.user._id, status: 'subscribed' })
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate('clientId', 'name email'),
    NewsletterSubscription.countDocuments({ realtorId: req.user._id, status: 'subscribed' })
  ]);

  res.json({ page, pageSize, total, rows });
});

// POST /newsletter/send  { title, body, attachments? }  (realtor)
router.post('/send', requireRealtor, sendLimiter, async (req, res) => {
  const { title, body, attachments } = req.body;
  if (!title || !body) return res.status(400).json({ message: 'title and body required' });

  const subs = await NewsletterSubscription.find({ realtorId: req.user._id, status: 'subscribed' }).select('clientId');
  const recipients = subs.map(s => s.clientId);

  const newsletter = await Newsletter.create({
    realtorId: req.user._id,
    title, body, attachments, sentAt: new Date(),
    stats: { recipients: recipients.length, delivered: 0, opened: 0 }
  });

  if (recipients.length) {
    const msgs = recipients.map(cid => ({
      toUserId: cid,
      fromUserId: req.user._id,
      type: 'newsletter',
      subject: title,
      body,
      meta: { newsletterId: newsletter._id.toString(), attachments: attachments || [] }
    }));
    await Message.insertMany(msgs);
    await Newsletter.updateOne({ _id: newsletter._id }, { $set: { 'stats.delivered': recipients.length } });
  }

  res.json({ ok: true, newsletterId: newsletter._id, recipients: recipients.length });
});

module.exports = router;
```

**Mount in server**

```js
// backend/src/app.js or server.js
const newsletterRoutes = require('./routes/newsletter');
app.use('/newsletter', newsletterRoutes);
```

---

## 2) Frontend (Vite/React + shadcn)

### 2.1 Subscribe button (client)

```tsx
// frontend/src/components/SubscribeButton.tsx
import { useState } from "react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";

export default function SubscribeButton({
  realtorId,
  isSubscribedInitial = false,
}: { realtorId: string; isSubscribedInitial?: boolean }) {
  const [isSub, setIsSub] = useState(isSubscribedInitial);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      if (!isSub) {
        await api.post("/newsletter/subscribe", { realtorId });
        setIsSub(true);
      } else {
        await api.post("/newsletter/unsubscribe", { realtorId });
        setIsSub(false);
      }
    } catch (err) {
      alert("Please sign in as a client to manage newsletter subscriptions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={toggle} disabled={loading} className={isSub ? "bg-violet-100 text-violet-700 hover:bg-violet-200" : "bg-violet-600 hover:bg-violet-700"}>
      {loading ? "Please wait…" : isSub ? "Unsubscribe" : "Subscribe"}
    </Button>
  );
}
```

**Use on Browse / PropertyDetails**
Add near each listing card or on the property page:

```tsx
// Example inside PropertyDetailsPage card header/footer
<SubscribeButton realtorId={property.realtorId} isSubscribedInitial={property.isSubscribedToOwner} />
```

> Server should populate `isSubscribedToOwner` on the property GET if the current user is a `client` and has an active subscription with the property’s `realtorId`.

### 2.2 Realtor Newsletter page (composer + list)

```tsx
// frontend/src/pages/RealtorNewsletterPage.tsx
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function RealtorNewsletterPage() {
  const [subs, setSubs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const fetchSubs = async () => {
    setLoading(true);
    try {
      const r = await api.get("/newsletter/subscribers");
      setSubs(r.data.rows || []);
      setTotal(r.data.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubs(); }, []);

  const send = async () => {
    if (!title || !body) return alert("Title and content required");
    setSending(true);
    try {
      const r = await api.post("/newsletter/send", { title, body });
      alert(`Newsletter sent to ${r.data.recipients} subscribers`);
      setTitle(""); setBody("");
    } catch {
      alert("Failed to send newsletter");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Subscribers ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p>Loading…</p> : (
            subs.length ? (
              <ul className="space-y-2 text-sm">
                {subs.map(s => (
                  <li key={s._id}>{s.clientId?.name || "Client"} — {s.clientId?.email}</li>
                ))}
              </ul>
            ) : <p className="text-muted-foreground">No subscribers yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Compose newsletter</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Title (e.g., New Durban beachfront listing!)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea rows={10} placeholder="Write your update…" value={body} onChange={(e) => setBody(e.target.value)} />
          <Button onClick={send} disabled={sending} className="bg-violet-600 hover:bg-violet-700">
            {sending ? "Sending…" : "Send to subscribers"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Route (protected to realtors)**

```tsx
// in App routes
<Route
  path="/realtor/newsletter"
  element={
    <ProtectedRoute allowedRoles={['realtor']}>
      <AppLayout>
        <RealtorNewsletterPage />
      </AppLayout>
    </ProtectedRoute>
  }
/>
```

### 2.3 Messages — render newsletter items

In `MessagesPage`, extend the renderer:

```tsx
// inside each message row render
{msg.type === 'newsletter' ? (
  <div className="p-3 rounded border bg-violet-50">
    <div className="font-semibold">{msg.subject}</div>
    <div className="text-sm whitespace-pre-wrap">{msg.body}</div>
  </div>
) : msg.type === 'system' ? (
  <div className="p-3 rounded border bg-slate-50 text-slate-800">
    <div className="font-medium">{msg.subject}</div>
    <div className="text-sm">{msg.body}</div>
  </div>
) : null}
```

---

## 3) API changes on Property/Browse endpoints (server)

When returning properties to an authenticated **client**, include:

* `realtorId` (owner of listing)
* `isSubscribedToOwner: boolean` (query `NewsletterSubscription` for `{ realtorId, clientId: req.user._id, status: 'subscribed' }`)

So the `SubscribeButton` can show correct initial state.

---

## 4) Security & Guardrails

* **Role checks** as defined (`requireClient`, `requireRealtor`).
* **Rate limit** newsletter sends: `5 per 15 minutes` per realtor (tune later).
* **Privacy**: realtor can only read subscribers for **their** `realtorId` (implicit via `req.user._id`).
* **Data integrity**: unique index prevents duplicate subscriptions.
* **Unsubscribe**: switch status to `unsubscribed`; do not deliver new newsletters to those records.

---

## 5) Optional Enhancements (future)

* Email broadcast via SendGrid/Mailersend for off-platform delivery.
* Open tracking pixel to increment `stats.opened`.
* Attach images/links (already allowed in schema).
* Schedule send for a future `sentAt`.
* WebSocket push to refresh Messages in real-time.

---

## 6) Manual QA

1. As `client`: on Browse → **Subscribe** → system message drops in inbox; button toggles to **Unsubscribe**.
2. As `realtor`: open `/realtor/newsletter` → see subscriber list (if any) → compose and **Send**.
3. As `client`: open **Messages** → new `newsletter` message appears.
4. **Unsubscribe** → no further newsletters delivered.

---

**Integration note for your Landing Page:** No changes required there; the newsletter system lives in app routes/pages (Browse/Property, Realtor dashboard, Messages). If you want a global CTA, you can add a “Subscribe” button on each property card that renders `SubscribeButton`.

This spec is ready for Copilot to implement directly.
