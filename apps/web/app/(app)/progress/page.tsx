"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Dumbbell,
  Target,
  Clock,
  Flame,
  Activity
} from "lucide-react";

// Dummy data for monthly progress
const MONTHLY_DATA = [
  { month: "Jun", workouts: 12, hours: 18.5, calories: 4200 },
  { month: "Jul", workouts: 15, hours: 24.0, calories: 5400 },
  { month: "Aug", workouts: 18, hours: 28.5, calories: 6300 },
  { month: "Sep", workouts: 16, hours: 25.2, calories: 5800 },
  { month: "Oct", workouts: 22, hours: 35.0, calories: 7900 },
  { month: "Nov", workouts: 20, hours: 32.0, calories: 7200 },
];

// Dummy data for body measurements
const BODY_MEASUREMENTS = [
  { date: "Jun 1", weight: 180, bodyFat: 22.5, muscle: 135 },
  { date: "Jul 1", weight: 178, bodyFat: 21.8, muscle: 136 },
  { date: "Aug 1", weight: 176, bodyFat: 21.0, muscle: 137 },
  { date: "Sep 1", weight: 174, bodyFat: 20.2, muscle: 138 },
  { date: "Oct 1", weight: 172, bodyFat: 19.5, muscle: 139 },
  { date: "Nov 1", weight: 170, bodyFat: 18.8, muscle: 140 },
];

// Dummy data for workout categories
const WORKOUT_CATEGORIES = [
  { name: "Strength", count: 45, percentage: 40, color: "from-purple-500 to-purple-600" },
  { name: "Cardio", count: 30, percentage: 27, color: "from-pink-500 to-pink-600" },
  { name: "Flexibility", count: 20, percentage: 18, color: "from-blue-500 to-blue-600" },
  { name: "Sports", count: 17, percentage: 15, color: "from-orange-500 to-orange-600" },
];

// Dummy personal records
const PERSONAL_RECORDS = [
  { exercise: "Bench Press", weight: "225 lbs", date: "Nov 15, 2024", improvement: "+15 lbs" },
  { exercise: "Squat", weight: "315 lbs", date: "Nov 10, 2024", improvement: "+25 lbs" },
  { exercise: "Deadlift", weight: "405 lbs", date: "Nov 8, 2024", improvement: "+35 lbs" },
  { exercise: "5K Run", weight: "22:15", date: "Nov 5, 2024", improvement: "-1:30" },
];

// Current stats
const CURRENT_STATS = {
  totalWorkouts: 112,
  totalHours: 175.5,
  totalCalories: 42800,
  avgPerWeek: 4.3,
  currentStreak: 14,
  longestStreak: 21,
};

// Calculate trends
const weightChange = BODY_MEASUREMENTS[BODY_MEASUREMENTS.length - 1].weight - BODY_MEASUREMENTS[0].weight;
const bodyFatChange = BODY_MEASUREMENTS[BODY_MEASUREMENTS.length - 1].bodyFat - BODY_MEASUREMENTS[0].bodyFat;
const muscleChange = BODY_MEASUREMENTS[BODY_MEASUREMENTS.length - 1].muscle - BODY_MEASUREMENTS[0].muscle;

export default function ProgressPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Progress
        </h1>
        <p className="text-muted-foreground">
          Track your fitness journey with metrics and charts
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 border">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">Total Workouts</p>
              <p className="text-3xl font-bold text-purple-600">{CURRENT_STATS.totalWorkouts}</p>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="w-3 h-3" />
                <span>+12 this month</span>
              </div>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-full">
              <Dumbbell className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">Total Hours</p>
              <p className="text-3xl font-bold text-pink-600">{CURRENT_STATS.totalHours}h</p>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="w-3 h-3" />
                <span>+8.5h this month</span>
              </div>
            </div>
            <div className="p-3 bg-pink-500/10 rounded-full">
              <Clock className="w-5 h-5 text-pink-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">Calories Burned</p>
              <p className="text-3xl font-bold text-orange-600">{CURRENT_STATS.totalCalories.toLocaleString()}</p>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="w-3 h-3" />
                <span>+2400 this month</span>
              </div>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-full">
              <Flame className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">Current Streak</p>
              <p className="text-3xl font-bold text-blue-600">{CURRENT_STATS.currentStreak}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Target className="w-3 h-3" />
                <span>Best: {CURRENT_STATS.longestStreak} days</span>
              </div>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-full">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Activity Chart */}
        <Card className="p-6 border">
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Monthly Activity</h3>
            <p className="text-sm text-muted-foreground">Workouts completed per month</p>
          </div>

          <div className="flex items-end justify-between gap-3" style={{ height: '300px' }}>
            {MONTHLY_DATA.map((month, index) => {
              const maxWorkouts = Math.max(...MONTHLY_DATA.map(d => d.workouts));
              const heightInPx = (month.workouts / maxWorkouts) * 270;
              const isCurrentMonth = index === MONTHLY_DATA.length - 1;

              return (
                <div key={month.month} className="group flex-1 flex flex-col items-center gap-3 h-full justify-end">
                  <div className="relative w-full flex flex-col justify-end" style={{ height: '270px' }}>
                    {/* Tooltip */}
                    <div className="absolute -top-20 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                      <div className="bg-gray-900 dark:bg-gray-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-xl">
                        <div className="font-bold text-base">{month.workouts} workouts</div>
                        <div className="text-gray-300 text-xs">{month.hours}h total</div>
                        <div className="text-gray-300 text-xs">{month.calories} cal</div>
                      </div>
                      <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-gray-900 dark:bg-gray-800 rotate-45"></div>
                    </div>

                    {/* Bar */}
                    <div
                      className={`w-full rounded-t-lg transition-all duration-300 cursor-pointer ${
                        isCurrentMonth
                          ? "bg-gradient-to-t from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50"
                          : "bg-gradient-to-t from-purple-500/70 to-pink-500/70 group-hover:from-purple-500 group-hover:to-pink-500 group-hover:shadow-lg group-hover:shadow-purple-500/30"
                      }`}
                      style={{
                        height: `${heightInPx}px`,
                        minHeight: "20px",
                      }}
                    />
                  </div>

                  {/* Month label */}
                  <div className={`text-sm font-medium ${isCurrentMonth ? "text-purple-600" : "text-muted-foreground"}`}>
                    {month.month}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Body Measurements Chart */}
        <Card className="p-6 border">
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Body Composition</h3>
            <p className="text-sm text-muted-foreground">Weight trends over time</p>
          </div>

          <div className="relative" style={{ height: '300px' }}>
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground">
              <span>185</span>
              <span>180</span>
              <span>175</span>
              <span>170</span>
              <span>165</span>
            </div>

            {/* Chart area */}
            <div className="ml-8 h-full flex items-end justify-between gap-2">
              {BODY_MEASUREMENTS.map((measurement, index) => {
                const minWeight = 165;
                const maxWeight = 185;
                const heightPercentage = ((measurement.weight - minWeight) / (maxWeight - minWeight)) * 100;
                const isLatest = index === BODY_MEASUREMENTS.length - 1;

                return (
                  <div key={measurement.date} className="group flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    {/* Tooltip */}
                    <div className="absolute -top-0 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                      <div className="bg-gray-900 dark:bg-gray-800 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-xl">
                        <div className="font-bold">{measurement.weight} lbs</div>
                        <div className="text-gray-300">{measurement.bodyFat}% BF</div>
                        <div className="text-gray-300">{measurement.muscle} lbs muscle</div>
                      </div>
                    </div>

                    {/* Point */}
                    <div className="relative w-full" style={{ height: `${heightPercentage}%` }}>
                      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full transition-all ${
                        isLatest
                          ? "bg-purple-600 ring-4 ring-purple-500/30"
                          : "bg-purple-400 group-hover:bg-purple-600 group-hover:ring-4 group-hover:ring-purple-500/30"
                      }`} />
                    </div>

                    {/* Date label */}
                    <div className="text-xs text-muted-foreground whitespace-nowrap -rotate-45 origin-top-left mt-2">
                      {measurement.date}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trend indicators */}
          <div className="mt-6 pt-4 border-t grid grid-cols-3 gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Weight</span>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-sm">{weightChange > 0 ? '+' : ''}{weightChange} lbs</span>
                {weightChange < 0 ? (
                  <TrendingDown className="w-3 h-3 text-green-600" />
                ) : (
                  <TrendingUp className="w-3 h-3 text-red-600" />
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Body Fat</span>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-sm">{bodyFatChange > 0 ? '+' : ''}{bodyFatChange.toFixed(1)}%</span>
                {bodyFatChange < 0 ? (
                  <TrendingDown className="w-3 h-3 text-green-600" />
                ) : (
                  <TrendingUp className="w-3 h-3 text-red-600" />
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Muscle</span>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-sm">{muscleChange > 0 ? '+' : ''}{muscleChange} lbs</span>
                {muscleChange > 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-600" />
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workout Categories */}
        <Card className="p-6 border">
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Workout Distribution</h3>
            <p className="text-sm text-muted-foreground">Breakdown by category</p>
          </div>

          <div className="space-y-4">
            {WORKOUT_CATEGORIES.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{category.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{category.count} workouts</span>
                    <Badge variant="outline">{category.percentage}%</Badge>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2.5">
                  <div
                    className={`bg-gradient-to-r ${category.color} h-2.5 rounded-full transition-all duration-500`}
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Workouts</span>
              <span className="font-bold text-lg">
                {WORKOUT_CATEGORIES.reduce((sum, cat) => sum + cat.count, 0)}
              </span>
            </div>
          </div>
        </Card>

        {/* Personal Records */}
        <Card className="p-6 border">
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Personal Records</h3>
            <p className="text-sm text-muted-foreground">Your latest achievements</p>
          </div>

          <div className="space-y-4">
            {PERSONAL_RECORDS.map((record, index) => (
              <div
                key={record.exercise}
                className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-purple-500/5 to-pink-500/5 hover:from-purple-500/10 hover:to-pink-500/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full">
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">{record.exercise}</p>
                    <p className="text-xs text-muted-foreground">{record.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-purple-600">{record.weight}</p>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    <span>{record.improvement}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
