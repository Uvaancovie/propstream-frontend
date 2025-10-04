import React, { useEffect, useState } from 'react';
import api, { newsletterAPI } from '../services/api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

export default function RealtorNewsletterPage() {
  const [subs, setSubs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const fetchSubs = async () => {
    setLoading(true);
    try {
      const r = await api.get('/newsletter/subscribers');
      setSubs(r.data.rows || []);
      setTotal(r.data.total || 0);
    } catch (err) {
      console.error('Failed to fetch subscribers', err);
      setSubs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubs(); }, []);

  const send = async () => {
    if (!title || !body) return alert('Title and content required');
    setSending(true);
    try {
      const r = await api.post('/newsletter/send', { title, body });
      alert(`Newsletter sent to ${r.data.recipients} subscribers`);
      setTitle(''); setBody('');
      fetchSubs();
    } catch (err) {
      console.error('Send failed', err);
      alert('Failed to send newsletter');
    } finally { setSending(false); }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8">
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-semibold">Subscribers ({total})</h3>
          {loading ? <p>Loading…</p> : (
            subs.length ? (
              <ul className="mt-3 space-y-2 text-sm">
                {subs.map(s => (
                  <li key={s._id}>{s.clientId?.name || 'Client'} — {s.clientId?.email}</li>
                ))}
              </ul>
            ) : <p className="text-muted-foreground">No subscribers yet.</p>
          )}
        </div>
      </Card>

      <Card>
        <div className="p-4 space-y-3">
          <h3 className="text-lg font-semibold">Compose newsletter</h3>
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea rows={8} placeholder="Write your update…" value={body} onChange={(e) => setBody(e.target.value)} />
          <Button onClick={send} disabled={sending} className="bg-violet-600 hover:bg-violet-700">
            {sending ? 'Sending…' : 'Send to subscribers'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
