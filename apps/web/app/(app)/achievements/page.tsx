import { AchievementsClient } from "@/components/achievements/achievements-client";

export default function AchievementsPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Achievements</h1>
        <p className="text-muted-foreground">
          Your badges, streaks, and milestones
        </p>
      </div>

      <AchievementsClient />
    </div>
  );
}
