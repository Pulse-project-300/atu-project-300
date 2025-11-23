import { AIChatWidget } from "@/components/dashboard/ai-chat-widget";

export default function WorkoutsPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Routines</h1>
        <p className="text-muted-foreground">
          Your personalized workout plans and exercise library
        </p>
      </div>

      <div className="p-6 border rounded-lg text-center">
        <p className="text-muted-foreground">
          Workout plans feature coming soon... // Leave generated plan here
        </p>
      </div>

      <AIChatWidget />
    </div>
  );
}
