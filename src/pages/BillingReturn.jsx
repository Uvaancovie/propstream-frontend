import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BillingReturn() {
  const nav = useNavigate();
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    let attempts = 0;
    const t = setInterval(async () => {
      attempts++;
      try {
        const r = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/me/summary`, {
          credentials: 'include',
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken') || ''}` }
        });
        const j = await r.json();
        if (j?.plan?.id && j.plan.id !== 'free' && (j.plan.status === 'active' || j.plan.status === 'trialing')) {
          setStatus('active');
          clearInterval(t);
          setTimeout(() => nav('/profile'), 1000);
        } else if (attempts >= 10) {
          setStatus('failed'); clearInterval(t);
        }
      } catch (e) {
        if (attempts >= 10) { setStatus('failed'); clearInterval(t); }
      }
    }, 2000);
    return () => clearInterval(t);
  }, [nav]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      {status === 'pending' && <p>Processing your subscription…</p>}
      {status === 'active'  && <p className="text-emerald-600">Success! Your plan is active. Redirecting…</p>}
      {status === 'failed'  && <p className="text-red-600">We couldn’t verify the payment. Please refresh or contact support.</p>}
    </div>
  );
}
