'use client';

import { useState } from 'react';

export default function Onboarding() {
  const [status, setStatus] = useState('');

  async function handleGenerate() {
    setStatus('Generating...');
    try {
      const res = await fetch('/api/plans/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          profile: { goal: 'muscle gain', experience: 'beginner' }
        }),
      });

      const data = await res.json();
      setStatus(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setStatus(err.message);
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Onboarding</h1>
      <button onClick={handleGenerate}>Generate Plan</button>
      <pre>{status}</pre>
    </main>
  );
}
