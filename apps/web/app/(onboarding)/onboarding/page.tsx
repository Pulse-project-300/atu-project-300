"use client";

import { OnboardingContainer } from "@/components/onboarding/onboarding-container";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  const [status, setStatus] = useState("");

  // Currently not being used as it is being handled in onboarding-container
  async function handleGenerate() {
    setStatus("Generating...");
    try {
      const res = await fetch("/api/plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "demo-user",
          profile: { goal: "muscle gain", experience: "beginner" },
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
    </div>
  );
}
