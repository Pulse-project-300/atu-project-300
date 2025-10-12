'use client';

import { OnboardingContainer } from "@/components/onboarding/onboarding-container";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
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
    <div>
      <OnboardingContainer />

      {/* Backend Testing Section */}
      <div className="container max-w-4xl mx-auto py-8 px-4 mt-8 border-t">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Backend Setup Test</h2>
          <Button onClick={handleGenerate}>Test Generate Plan API</Button>
          {status && (
            <pre className="p-4 bg-secondary rounded-lg overflow-auto text-sm">
              {status}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
