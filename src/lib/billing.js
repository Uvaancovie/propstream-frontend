export async function startCheckout(planId) {
  const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
  const token = localStorage.getItem('authToken');
  const res = await fetch(`${API}/billing/checkout/${planId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    credentials: 'include'
  });

  if (!res.ok) {
    // Try to extract JSON error, fall back to plain text
    const contentType = res.headers.get('content-type') || '';
    let errMsg = 'Checkout failed';
    try {
      if (contentType.includes('application/json')) {
        const j = await res.json();
        errMsg = j?.message || JSON.stringify(j);
      } else {
        errMsg = await res.text();
      }
    } catch (e) {
      // ignore parse errors
    }
    throw new Error(errMsg);
  }

  const contentType = res.headers.get('content-type') || '';
  let html = '';
  if (contentType.includes('application/json')) {
    // subscribe endpoint may return { redirectHtml: '<form...>' }
    const j = await res.json();
    html = j?.redirectHtml || j?.html || '';
  } else {
    html = await res.text();
  }

  // If no HTML was returned, navigate to the billing return page to let
  // the backend /me/summary poll detect activation (fallback).
  if (!html) {
    window.location.href = '/billing/return';
    return;
  }

  // replace current window content with PayFast auto-post HTML
  const w = window.open('', '_self');
  w.document.open();
  w.document.write(html);
  w.document.close();
}
