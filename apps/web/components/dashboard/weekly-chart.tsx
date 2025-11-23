"use client";

export function WeeklyChart() {
  // Mock data for the week - TODO: Replace with actual user data
  const weekData = [
    { day: "Mon", hours: 0, workouts: 0 },
    { day: "Tue", hours: 0, workouts: 0 },
    { day: "Wed", hours: 0, workouts: 0 },
    { day: "Thu", hours: 0, workouts: 0 },
    { day: "Fri", hours: 0, workouts: 0 },
    { day: "Sat", hours: 0, workouts: 0 },
    { day: "Sun", hours: 0, workouts: 0 },
  ];

  const maxHours = Math.max(...weekData.map((d) => d.hours), 1); // At least 1 to prevent division by zero

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">This Week's Activity</h3>
        <p className="text-sm text-muted-foreground">
          Hours spent working out this week
        </p>
      </div>

      <div className="flex items-end justify-between gap-2 h-48">
        {weekData.map((day, index) => {
          const heightPercentage = (day.hours / maxHours) * 100;
          const isToday = false; // TODO: Calculate if this is today

          return (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
              {/* Bar */}
              <div className="w-full flex flex-col justify-end h-full">
                <div
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    isToday
                      ? "bg-gradient-to-t from-purple-500 to-pink-500"
                      : "bg-gradient-to-t from-purple-500/70 to-pink-500/70 hover:from-purple-500 hover:to-pink-500"
                  }`}
                  style={{
                    height: `${heightPercentage}%`,
                    minHeight: day.hours > 0 ? "8px" : "0px",
                  }}
                >
                  {/* Tooltip on hover */}
                  <div className="opacity-0 hover:opacity-100 transition-opacity">
                    <div className="relative">
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {day.hours}h
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Day label */}
              <div
                className={`text-xs font-medium ${
                  isToday
                    ? "text-purple-600"
                    : "text-muted-foreground"
                }`}
              >
                {day.day}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
          <span className="text-muted-foreground">Workout Hours</span>
        </div>
      </div>
    </div>
  );
}
