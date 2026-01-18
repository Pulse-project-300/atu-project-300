"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Play,
  Pause,
  Check,
  Timer,
  Dumbbell,
  Calendar,
  Loader2,
  Save,
  CheckCircle2,
} from "lucide-react";
import { getActiveWorkoutPlan } from "@/app/(onboarding)/onboarding/plan-actions";
import { saveWorkoutLog, WorkoutLogData } from "./actions";

interface Exercise {
  name: string;
  sets: number;
  reps: number;
}

interface WorkoutDay {
  day: string;
  workout: Exercise[];
}

interface SetLog {
  setNumber: number;
  weight: string;
  reps: string;
  completed: boolean;
}

interface ExerciseLog {
  exerciseName: string;
  sets: SetLog[];
}

export default function WorkoutsPage() {
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch workout plan on mount
  useEffect(() => {
    async function fetchPlan() {
      try {
        const result = await getActiveWorkoutPlan();
        if (result.plan?.plan_data) {
          setWorkoutPlan(result.plan.plan_data);
        }
      } catch (err) {
        console.error("Error fetching workout plan:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPlan();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setWorkoutTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Initialize exercise logs when starting a workout
  const startWorkout = (day: string) => {
    setSelectedDay(day);
    setWorkoutStarted(true);
    setIsTimerRunning(true);
    setSaveSuccess(false);

    // Find the day's workout
    const dayWorkout = workoutPlan?.days?.find((d: WorkoutDay) => d.day === day);
    if (dayWorkout) {
      // Initialize logs for each exercise
      const logs: ExerciseLog[] = dayWorkout.workout.map((exercise: Exercise) => ({
        exerciseName: exercise.name,
        sets: Array.from({ length: exercise.sets }, (_, i) => ({
          setNumber: i + 1,
          weight: "",
          reps: "",
          completed: false,
        })),
      }));
      setExerciseLogs(logs);
    }
  };

  // Update a specific set's data
  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: "weight" | "reps",
    value: string
  ) => {
    setExerciseLogs((prev) => {
      const newLogs = [...prev];
      newLogs[exerciseIndex].sets[setIndex][field] = value;
      return newLogs;
    });
  };

  // Mark a set as completed
  const toggleSetComplete = (exerciseIndex: number, setIndex: number) => {
    setExerciseLogs((prev) => {
      const newLogs = [...prev];
      newLogs[exerciseIndex].sets[setIndex].completed =
        !newLogs[exerciseIndex].sets[setIndex].completed;
      return newLogs;
    });
  };

  // Save workout session
  const saveWorkout = async () => {
    setIsSaving(true);
    try {
      // Prepare workout log data
      const workoutLog: WorkoutLogData = {
        date: new Date().toISOString(),
        day: selectedDay!,
        duration: workoutTime,
        exercises: exerciseLogs,
      };

      // Save to database via server action
      const result = await saveWorkoutLog(workoutLog);

      if (result.error) {
        console.error("Error saving workout:", result.error);
        alert("Failed to save workout. Please try again.");
        return;
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setWorkoutStarted(false);
        setSelectedDay(null);
        setWorkoutTime(0);
        setIsTimerRunning(false);
        setExerciseLogs([]);
        setSaveSuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Error saving workout:", err);
      alert("Failed to save workout. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel workout
  const cancelWorkout = () => {
    if (confirm("Are you sure you want to cancel this workout? Your progress will be lost.")) {
      setWorkoutStarted(false);
      setSelectedDay(null);
      setWorkoutTime(0);
      setIsTimerRunning(false);
      setExerciseLogs([]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
          <p className="text-muted-foreground">Loading your workout plan...</p>
        </div>
      </div>
    );
  }

  if (!workoutPlan) {
    return (
      <div className="flex-1 w-full flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Workouts
          </h1>
          <p className="text-muted-foreground">
            Your personalized workout routines
          </p>
        </div>

        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <Dumbbell className="h-16 w-16 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold mb-2">No Workout Plan Found</h3>
              <p className="text-muted-foreground">
                Complete the onboarding process to generate your personalized workout plan.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const currentDayWorkout = workoutPlan.days?.find((d: WorkoutDay) => d.day === selectedDay);

  return (
    <div className="flex-1 w-full flex flex-col gap-8 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Workouts
        </h1>
        <p className="text-muted-foreground">
          Your personalized workout routines
        </p>
      </div>

      {!workoutStarted ? (
        <>
          {/* Workout Days Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workoutPlan.days?.map((day: WorkoutDay, index: number) => (
              <Card
                key={index}
                className="p-6 border hover:border-purple-500 transition-all cursor-pointer group"
                onClick={() => startWorkout(day.day)}
              >
                <div className="flex flex-col gap-4">
                  {/* Day Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{day.day}</h3>
                        <p className="text-xs text-muted-foreground">
                          {day.workout.length} exercises
                        </p>
                      </div>
                    </div>
                    <Play className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
                  </div>

                  {/* Exercise List Preview */}
                  <div className="space-y-2">
                    {day.workout.slice(0, 3).map((exercise: Exercise, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="font-medium truncate">{exercise.name}</span>
                        <span className="text-muted-foreground text-xs">
                          {exercise.sets} × {exercise.reps}
                        </span>
                      </div>
                    ))}
                    {day.workout.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{day.workout.length - 3} more...
                      </p>
                    )}
                  </div>

                  {/* Start Button */}
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    Start Workout
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Active Workout Session */}
          <div className="space-y-6">
            {/* Workout Header with Timer */}
            <Card className="p-6 border border-purple-500 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full">
                    <Dumbbell className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedDay} Workout</h2>
                    <p className="text-sm text-muted-foreground">
                      {currentDayWorkout?.workout.length} exercises
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Timer */}
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg">
                    <Timer className="h-5 w-5 text-purple-600" />
                    <span className="text-2xl font-mono font-bold">
                      {formatTime(workoutTime)}
                    </span>
                  </div>

                  {/* Timer Controls */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                  >
                    {isTimerRunning ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Exercise List */}
            <div className="space-y-4">
              {exerciseLogs.map((exerciseLog, exerciseIndex) => {
                const exercise = currentDayWorkout?.workout[exerciseIndex];
                const completedSets = exerciseLog.sets.filter((s) => s.completed).length;

                return (
                  <Card key={exerciseIndex} className="p-6 border">
                    {/* Exercise Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-full">
                          <Dumbbell className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{exercise?.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Target: {exercise?.sets} sets × {exercise?.reps} reps
                          </p>
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        <span className="text-purple-600">{completedSets}</span>
                        <span className="text-muted-foreground">/{exercise?.sets}</span>
                      </div>
                    </div>

                    {/* Sets Table */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-2">
                        <div className="col-span-2">SET</div>
                        <div className="col-span-4">WEIGHT (kg)</div>
                        <div className="col-span-4">REPS</div>
                        <div className="col-span-2">DONE</div>
                      </div>

                      {exerciseLog.sets.map((set, setIndex) => (
                        <div
                          key={setIndex}
                          className={`grid grid-cols-12 gap-2 items-center p-2 rounded-lg transition-all ${
                            set.completed
                              ? "bg-green-500/10 border border-green-500/20"
                              : "bg-slate-50 dark:bg-slate-800/50 border border-transparent"
                          }`}
                        >
                          {/* Set Number */}
                          <div className="col-span-2 font-bold text-center">
                            {set.setNumber}
                          </div>

                          {/* Weight Input */}
                          <div className="col-span-4">
                            <Input
                              type="number"
                              placeholder="0"
                              value={set.weight}
                              onChange={(e) =>
                                updateSet(exerciseIndex, setIndex, "weight", e.target.value)
                              }
                              className="text-center"
                              disabled={set.completed}
                            />
                          </div>

                          {/* Reps Input */}
                          <div className="col-span-4">
                            <Input
                              type="number"
                              placeholder="0"
                              value={set.reps}
                              onChange={(e) =>
                                updateSet(exerciseIndex, setIndex, "reps", e.target.value)
                              }
                              className="text-center"
                              disabled={set.completed}
                            />
                          </div>

                          {/* Complete Button */}
                          <div className="col-span-2 flex justify-center">
                            <Button
                              size="icon"
                              variant={set.completed ? "default" : "outline"}
                              onClick={() => toggleSetComplete(exerciseIndex, setIndex)}
                              className={
                                set.completed
                                  ? "bg-green-600 hover:bg-green-700"
                                  : ""
                              }
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 sticky bottom-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={cancelWorkout}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                onClick={saveWorkout}
                disabled={isSaving || saveSuccess}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Workout
                  </>
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
