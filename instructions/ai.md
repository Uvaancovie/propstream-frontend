Mr Covie — here’s a **copy-paste Markdown** playbook to add **Cohere AI chat that persists**, plus **public property browse & share links**, using your **Express + Mongoose + Vite** stack. Realtors will be able to:

* open/save chat sessions,
* ask new questions anytime (history-aware),
* have Cohere read their own properties for context,
* and share a **public property link** clients can view without logging in.

---

# PropNova — Cohere Chat (Saved Sessions) + Public Browse & Share Links

## 0) Install & ENV

```bash
# API
npm i cohere-ai express-rate-limit
```

`.env` (API) — **do not hardcode your key in code**

```bash
COHERE_API_KEY=********************************
APP_PUBLIC_URL=https://www.nova-prop.com
```

`src/lib/cohere.js`

```js
import { CohereClient } from "cohere-ai";
export const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });
```

---

## 1) Mongoose Models

### 1.1 Property (add public slug & text index if you don’t have it yet)

```js
// src/models/Property.js
import mongoose from "mongoose";

function toSlug(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 64);
}

const PropertySchema = new mongoose.Schema({
  ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: String,
  city: String,
  amenities: [String],
  price: { nightly: { type: Number, default: 1000 } },
  photos: [String],
  isPublic: { type: Boolean, default: true },
  publicSlug: { type: String, unique: true, index: true },
  createdAt: { type: Date, default: Date.now }
});

PropertySchema.index({ title: "text", description: "text", city: "text", amenities: "text" });

PropertySchema.pre("save", function(next) {
  if (!this.publicSlug || this.isModified("title")) {
    const base = toSlug(this.title || `prop-${this._id}`);
    this.publicSlug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }
  next();
});

export default mongoose.model("Property", PropertySchema);
```

### 1.2 ChatSession & ChatMessage

```js
// src/models/ChatSession.js
import mongoose from "mongoose";
const ChatSessionSchema = new mongoose.Schema({
  ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // realtor
  title: { type: String, default: "New conversation" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
ChatSessionSchema.index({ ownerUserId: 1, updatedAt: -1 });
export default mongoose.model("ChatSession", ChatSessionSchema);
```

```js
// src/models/ChatMessage.js
import mongoose from "mongoose";
const ChatMessageSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "ChatSession", required: true },
  role: { type: String, enum: ["system","user","assistant"], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
ChatMessageSchema.index({ sessionId: 1, createdAt: 1 });
export default mongoose.model("ChatMessage", ChatMessageSchema);
```

---

## 2) Server Helpers

### 2.1 Build property context for a realtor (cheap RAG)

* Pull **the realtor’s own properties**.
* If there’s a user query, do a quick **\$text** search first; fallback to latest.
* Concatenate top K into a compact context string.

```js
// src/lib/propertyContext.js
import Property from "../models/Property.js";

export async function buildPropertyContext(ownerUserId, userQuery = "", limit = 8) {
  let docs = [];
  if (userQuery?.trim()) {
    docs = await Property.find({
      ownerUserId,
      $text: { $search: userQuery }
    })
      .select("title description city amenities price.nightly")
      .limit(limit)
      .lean();
  }
  if (!docs.length) {
    docs = await Property.find({ ownerUserId })
      .select("title description city amenities price.nightly createdAt")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }
  const lines = docs.map((d, i) =>
    `#${i+1} "${d.title}" — ${d.city || "-"} — R${d?.price?.nightly ?? ""}/night
Amenities: ${(d.amenities||[]).slice(0,8).join(", ")}
Desc: ${(d.description||"").slice(0,280)}`
  );
  return lines.join("\n\n");
}
```

### 2.2 Title auto-namer for sessions (first user message)

```js
// src/lib/nameFromPrompt.js
export function nameFromPrompt(prompt = "") {
  const s = prompt.trim();
  if (!s) return "New conversation";
  const short = s.split(/\s+/).slice(0,6).join(" ");
  return short.replace(/[^\w\s-]/g,"").slice(0,48);
}
```

---

## 3) Chat Routes (create, list, chat, rename, delete)

```js
// src/routes/ai.chat.js
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { cohere } from "../lib/cohere.js";
import { authRequired, requireRole } from "../middleware/authz.js";
import ChatSession from "../models/ChatSession.js";
import ChatMessage from "../models/ChatMessage.js";
import { buildPropertyContext } from "../lib/propertyContext.js";
import { nameFromPrompt } from "../lib/nameFromPrompt.js";

const r = Router();
const limiter = rateLimit({ windowMs: 60_000, max: 30 }); // 30 req/min per IP

r.use(authRequired, requireRole("realtor"), limiter);

/** Create a new chat session (optionally with first user prompt) */
r.post("/sessions", async (req, res) => {
  const { firstMessage = "" } = req.body;
  const session = await ChatSession.create({
    ownerUserId: req.user._id,
    title: nameFromPrompt(firstMessage)
  });
  if (firstMessage) {
    await ChatMessage.create({ sessionId: session._id, role: "user", content: firstMessage });
  }
  return res.json({ sessionId: session._id, title: session.title });
});

/** List sessions */
r.get("/sessions", async (req, res) => {
  const items = await ChatSession.find({ ownerUserId: req.user._id })
    .sort({ updatedAt: -1 })
    .select("_id title updatedAt createdAt")
    .lean();
  res.json({ items });
});

/** Rename session */
r.patch("/sessions/:id", async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  const sess = await ChatSession.findOneAndUpdate(
    { _id: id, ownerUserId: req.user._id },
    { title, updatedAt: new Date() },
    { new: true }
  ).lean();
  if (!sess) return res.status(404).json({ message: "Not found" });
  res.json({ ok: true, session: sess });
});

/** Delete session (and messages) */
r.delete("/sessions/:id", async (req, res) => {
  const { id } = req.params;
  const sess = await ChatSession.findOne({ _id: id, ownerUserId: req.user._id });
  if (!sess) return res.status(404).json({ message: "Not found" });
  await ChatMessage.deleteMany({ sessionId: id });
  await sess.deleteOne();
  res.json({ ok: true });
});

/** Get messages for a session */
r.get("/sessions/:id/messages", async (req, res) => {
  const { id } = req.params;
  const sess = await ChatSession.findOne({ _id: id, ownerUserId: req.user._id }).lean();
  if (!sess) return res.status(404).json({ message: "Not found" });
  const msgs = await ChatMessage.find({ sessionId: id }).sort({ createdAt: 1 }).lean();
  res.json({ messages: msgs });
});

/** Post message -> Cohere reply (history-aware + property context) */
r.post("/sessions/:id/messages", async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const sess = await ChatSession.findOne({ _id: id, ownerUserId: req.user._id });
  if (!sess) return res.status(404).json({ message: "Not found" });

  // save user message
  const userMsg = await ChatMessage.create({ sessionId: id, role: "user", content });
  await ChatSession.updateOne({ _id: id }, { updatedAt: new Date() });

  // build property context (use latest user question for search)
  const context = await buildPropertyContext(req.user._id, content, 8);

  // pull limited recent history (to stay within token budget)
  const recent = await ChatMessage.find({ sessionId: id })
    .sort({ createdAt: -1 })
    .limit(12) // last 12 turns (~24 messages worst case)
    .lean();
  const history = recent.reverse().map(m => ({ role: m.role, content: m.content }));

  const system = `You are PropNova's listing coach for South African rentals.
You ONLY use the realtor's own properties as context when relevant.
Return concise, high-utility answers. When crafting a property listing, output:
- Title (<= 60 chars)
- Description (120–220 words, scannable)
- Amenities (bulleted 6–10)
- 3 SEO keywords
Be specific to Durban/KZN when location is provided.`;

  const preface = `Context (realtor's properties):\n${context}\n\nQuestion:`;

  const response = await cohere.chat({
    model: "command-r", // good balance; you can upgrade to command-r-plus
    messages: [
      { role: "system", content: system },
      ...history,
      { role: "user", content: `${preface}\n${content}` }
    ]
  });

  const assistantText = response?.message?.content ?? "I couldn't generate a response.";
  const aiMsg = await ChatMessage.create({ sessionId: id, role: "assistant", content: assistantText });

  // auto-title the session if first message
  if (sess.title === "New conversation") {
    const newTitle = nameFromPrompt(content);
    await ChatSession.updateOne({ _id: id }, { title: newTitle });
  }

  res.json({ message: { _id: aiMsg._id, role: "assistant", content: assistantText } });
});

export default r;
```

Mount:

```js
// src/server.js
import aiChat from "./routes/ai.chat.js";
app.use("/ai/chat", aiChat);
```

---

## 4) Public Browse & Property Details (server)

```js
// src/routes/public.browse.js
import { Router } from "express";
import Property from "../models/Property.js";
const r = Router();

// /public/properties?query=umhlanga&page=1
r.get("/properties", async (req, res) => {
  const { query = "", page = 1 } = req.query;
  const PAGE_SIZE = 24;
  const find = { isPublic: true };
  if (String(query).trim()) Object.assign(find, { $text: { $search: String(query) } });

  const items = await Property.find(find)
    .select("publicSlug title description city amenities price photos createdAt")
    .limit(PAGE_SIZE)
    .sort({ createdAt: -1 })
    .lean();

  res.json({ results: items });
});

// /public/properties/:slug
r.get("/properties/:slug", async (req, res) => {
  const prop = await Property.findOne({ publicSlug: req.params.slug, isPublic: true })
    .select("title description city amenities price photos ownerUserId createdAt")
    .lean();
  if (!prop) return res.status(404).json({ message: "Not found" });
  res.json({ property: prop });
});

export default r;
```

Mount:

```js
// src/server.js
import publicBrowse from "./routes/public.browse.js";
app.use("/public", publicBrowse);
```

---

## 5) Frontend (Vite/React)

### 5.1 Realtor Chat UI (Saved Sessions)

**Route:** `/ai/studio` (realtor-only). Use shadcn/ui for a quick split-pane layout.

```jsx
// src/pages/AIStudio.jsx
import { useEffect, useState } from "react";

export default function AIStudio() {
  const [sessions, setSessions] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  async function loadSessions() {
    const r = await fetch(`${import.meta.env.VITE_API_URL}/ai/chat/sessions`, { credentials: "include" });
    const j = await r.json(); setSessions(j.items || []);
    if (!currentId && j.items?.[0]?._id) setCurrentId(j.items[0]._id);
  }
  async function loadMessages(id) {
    const r = await fetch(`${import.meta.env.VITE_API_URL}/ai/chat/sessions/${id}/messages`, { credentials: "include" });
    const j = await r.json(); setMessages(j.messages || []);
  }
  async function createSession() {
    const r = await fetch(`${import.meta.env.VITE_API_URL}/ai/chat/sessions`, {
      method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({})
    });
    const j = await r.json(); await loadSessions(); setCurrentId(j.sessionId);
  }
  async function sendMessage() {
    if (!input.trim()) return;
    const optimistic = [...messages, { role: "user", content: input }];
    setMessages(optimistic); setInput("");
    const r = await fetch(`${import.meta.env.VITE_API_URL}/ai/chat/sessions/${currentId}/messages`, {
      method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
      body: JSON.stringify({ content: input })
    });
    const j = await r.json();
    setMessages([...optimistic, j.message]);
  }

  useEffect(() => { loadSessions(); }, []);
  useEffect(() => { if (currentId) loadMessages(currentId); }, [currentId]);

  return (
    <div className="h-[calc(100vh-64px)] grid grid-cols-12">
      <aside className="col-span-3 border-r p-3 overflow-y-auto">
        <button className="w-full bg-violet-600 text-white rounded px-3 py-2 mb-3" onClick={createSession}>New chat</button>
        <ul className="space-y-1">
          {sessions.map(s => (
            <li key={s._id}>
              <button onClick={() => setCurrentId(s._id)}
                className={`w-full text-left px-3 py-2 rounded ${currentId===s._id?'bg-violet-100':'hover:bg-slate-100'}`}>
                {s.title}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <main className="col-span-9 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m,i)=>(
            <div key={i} className={`max-w-[80%] p-3 rounded ${m.role==='user'?'ml-auto bg-violet-600 text-white':'bg-slate-100'}`}>
              <pre className="whitespace-pre-wrap text-sm">{m.content}</pre>
            </div>
          ))}
        </div>
        <div className="p-3 border-t flex gap-2">
          <input className="flex-1 border rounded px-3" value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask about your listings, write a better title…" />
          <button className="bg-violet-600 text-white rounded px-4" onClick={sendMessage}>Send</button>
        </div>
      </main>
    </div>
  );
}
```

> Hook this page into your router under a **ProtectedRoute (realtor)**.

### 5.2 Public Browse + Property Details

* **Browse page** (unauth): call `GET /public/properties?query=...` and render a grid.
* **Public details page** (unauth): `GET /public/properties/:slug` and show photos, description, amenities, price, and a **“Book”** button that redirects to login if not a client.

Example share link to show on the realtor dashboard:

```jsx
const shareUrl = `${window.location.origin}/p/${property.publicSlug}`;
<button onClick={() => navigator.clipboard.writeText(shareUrl)} className="px-3 py-2 border rounded">
  Copy share link
</button>
```

Your Vite router can map `/p/:slug` → a `PublicPropertyPage` component that fetches `/public/properties/:slug`.

---

## 6) Cohere-assisted Property Posting UX

On your **AddPropertyPage**:

* Collect raw inputs (bullets, city, beds, baths, highlights).
* Button: **“AI Suggest”** → `POST /ai/properties/assist` → fill `title`, `description`, `amenities`.
* Realtor can edit, then **Save** (your existing POST to create property).
* After save, show **“Share link”** using `publicSlug`.

**Minimal client snippet:**

```jsx
async function aiSuggest() {
  const r = await fetch(`${import.meta.env.VITE_API_URL}/ai/properties/assist`, {
    method: "POST", headers: { "Content-Type":"application/json" }, credentials: "include",
    body: JSON.stringify({ bullets, city, bedrooms, bathrooms, highlights })
  });
  const j = await r.json();
  setTitle(j.title || title);
  setDescription(j.description || description);
  setAmenities(j.amenities || amenities);
}
```

---

## 7) Auth & Roles

* Chat routes require **realtor** role (`authRequired + requireRole('realtor')`).
* Public endpoints (`/public/...`) require no auth.
* Booking routes remain **client-only**.

---

## 8) Guardrails

* **Rate-limit** AI routes (already added: `express-rate-limit`).
* **Trim messages** (store last \~12 turns per request to Cohere).
* **Sanitize** inputs; log errors but avoid leaking keys.
* **Cost control:** show token counts in logs (optional).
* **Privacy:** only load **that realtor’s** properties into context.

---

## 9) Deliverables you now have

* ✅ **Persistent chat** (create/list/rename/delete sessions; history-aware replies).
* ✅ Cohere reads **realtor’s own properties** to improve answers/listings.
* ✅ **AI assist** endpoint for titles/descriptions/amenities.
* ✅ **Public browse** and **public property pages** with **shareable links**.
* ✅ Frontend scaffolding for Chat Studio & public property views.

If you want, I can also generate a shadcn-styled **Chat Studio** UI (sidebar + message bubbles + skeleton loaders) to drop straight into your repo.

# COHERE API KEY = w0oJEu3JpgVV1zJaFlxI0XgxrvNe0oRmwUanM9jS