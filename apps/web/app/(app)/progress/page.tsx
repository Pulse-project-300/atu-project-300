import { AIAssistantFAB } from "@/components/ai-assistant/ai-assistant-fab";

export default function ProgressPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Progress</h1>
        <p className="text-muted-foreground">
          Track your fitness journey with metrics and charts
        </p>
      </div>

      <div className="p-6 border rounded-lg text-center">
        <p className="text-muted-foreground">
          Progress tracking feature coming soon...
        </p>
      </div>

      <AIAssistantFAB />
    </div>
  );
}
