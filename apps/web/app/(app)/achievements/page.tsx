"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Flame, Award, Star, Zap, Calendar, Clock } from "lucide-react";

// Dummy achievement data
const ACHIEVEMENTS = [
  {
    id: 1,
    title: "First Workout",
    description: "Complete your first workout session",
    icon: Trophy,
    unlocked: true,
    unlockedDate: "2024-11-15",
    category: "milestone",
    points: 10,
  },
  {
    id: 2,
    title: "Week Warrior",
    description: "Complete 7 consecutive days of workouts",
    icon: Flame,
    unlocked: true,
    unlockedDate: "2024-11-22",
    category: "streak",
    points: 50,
  },
  {
    id: 3,
    title: "Early Bird",
    description: "Complete 5 morning workouts before 8 AM",
    icon: Clock,
    unlocked: true,
    unlockedDate: "2024-11-20",
    category: "special",
    points: 30,
  },
  {
    id: 4,
    title: "Goal Crusher",
    description: "Achieve 10 workout goals",
    icon: Target,
    unlocked: false,
    progress: 7,
    total: 10,
    category: "goal",
    points: 100,
  },
  {
    id: 5,
    title: "Perfect Month",
    description: "Complete all planned workouts in a month",
    icon: Calendar,
    unlocked: false,
    progress: 18,
    total: 30,
    category: "milestone",
    points: 200,
  },
  {
    id: 6,
    title: "Power Player",
    description: "Complete 50 total workouts",
    icon: Zap,
    unlocked: false,
    progress: 23,
    total: 50,
    category: "milestone",
    points: 150,
  },
  {
    id: 7,
    title: "Consistency King",
    description: "Maintain a 30-day workout streak",
    icon: Award,
    unlocked: false,
    progress: 14,
    total: 30,
    category: "streak",
    points: 300,
  },
  {
    id: 8,
    title: "All-Star",
    description: "Earn 1000 achievement points",
    icon: Star,
    unlocked: false,
    progress: 90,
    total: 1000,
    category: "points",
    points: 500,
  },
];

// Dummy stats data
const STATS = {
  totalPoints: 90,
  totalAchievements: ACHIEVEMENTS.length,
  unlockedAchievements: ACHIEVEMENTS.filter((a) => a.unlocked).length,
  currentStreak: 14,
  longestStreak: 14,
};

const getCategoryColor = (category: string) => {
  const colors = {
    milestone: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    streak: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    goal: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    special: "bg-pink-500/10 text-pink-600 border-pink-500/20",
    points: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  };
  return colors[category as keyof typeof colors] || colors.milestone;
};

export default function AchievementsPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Achievements
        </h1>
        <p className="text-muted-foreground">
          Your badges, streaks, and milestones
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 border">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">Total Points</p>
            <p className="text-3xl font-bold text-purple-600">{STATS.totalPoints}</p>
          </div>
        </Card>
        <Card className="p-6 border">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">Unlocked</p>
            <p className="text-3xl font-bold text-pink-600">
              {STATS.unlockedAchievements}/{STATS.totalAchievements}
            </p>
          </div>
        </Card>
        <Card className="p-6 border">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">Current Streak</p>
            <p className="text-3xl font-bold text-orange-600">{STATS.currentStreak} days</p>
          </div>
        </Card>
        <Card className="p-6 border">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">Longest Streak</p>
            <p className="text-3xl font-bold text-blue-600">{STATS.longestStreak} days</p>
          </div>
        </Card>
      </div>

      {/* Achievements Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACHIEVEMENTS.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <Card
                key={achievement.id}
                className={`p-6 border transition-all hover:shadow-lg ${
                  achievement.unlocked
                    ? "border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5"
                    : "opacity-60"
                }`}
              >
                <div className="flex flex-col gap-4">
                  {/* Icon and Badge */}
                  <div className="flex items-start justify-between">
                    <div
                      className={`p-3 rounded-full ${
                        achievement.unlocked
                          ? "bg-gradient-to-br from-purple-500 to-pink-500"
                          : "bg-gray-200 dark:bg-gray-800"
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${
                          achievement.unlocked ? "text-white" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <Badge className={getCategoryColor(achievement.category)}>
                      {achievement.category}
                    </Badge>
                  </div>

                  {/* Title and Description */}
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-lg">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>

                  {/* Progress or Unlock Date */}
                  {achievement.unlocked ? (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Unlocked {achievement.unlockedDate}
                      </span>
                      <span className="font-semibold text-purple-600">
                        +{achievement.points} pts
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">
                          {achievement.progress}/{achievement.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${
                              ((achievement.progress || 0) / (achievement.total || 1)) * 100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground text-right">
                        {achievement.points} pts when unlocked
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
