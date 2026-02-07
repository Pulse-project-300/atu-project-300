"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type {
  ActiveWorkoutState,
  WorkoutContextState,
  WorkoutContextActions,
  RestTimerState,
  UpdateSetInput,
  WorkoutSet,
  ExerciseGroup,
} from "@/lib/types/routines";
import {
  startWorkout as startWorkoutAction,
  getActiveWorkout,
  updateWorkoutSet,
  addSetToWorkout,
  completeWorkout as completeWorkoutAction,
  cancelWorkout as cancelWorkoutAction,
  deleteWorkoutSet,
} from "@/app/(app)/workouts/actions";

const STORAGE_KEY = "pulse_active_workout";

interface WorkoutContextValue extends WorkoutContextState, WorkoutContextActions {
  exerciseGroups: ExerciseGroup[];
  deleteSet: (setId: string) => Promise<void>;
}

const WorkoutContext = createContext<WorkoutContextValue | null>(null);

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
}

// Helper to check if workout context is available (for components that might render outside provider)
export function useWorkoutOptional() {
  return useContext(WorkoutContext);
}

interface WorkoutProviderProps {
  children: ReactNode;
}

export function WorkoutProvider({ children }: WorkoutProviderProps) {
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutState | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [restTimer, setRestTimer] = useState<RestTimerState | null>(null);
  
  // Timer refs
  const elapsedTimerRef = useRef<NodeJS.Timeout | null>(null);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Group sets by exercise for display
  const exerciseGroups: ExerciseGroup[] = activeWorkout
    ? groupSetsByExercise(activeWorkout.sets)
    : [];

  // Elapsed time timer
  useEffect(() => {
    if (activeWorkout) {
      elapsedTimerRef.current = setInterval(() => {
        setActiveWorkout((prev) => {
          if (!prev) return null;
          const newElapsed = prev.elapsedSeconds + 1;
          // Save to localStorage periodically (every 10 seconds)
          if (newElapsed % 10 === 0) {
            saveToLocalStorage({ ...prev, elapsedSeconds: newElapsed });
          }
          return { ...prev, elapsedSeconds: newElapsed };
        });
      }, 1000);
    }

    return () => {
      if (elapsedTimerRef.current) {
        clearInterval(elapsedTimerRef.current);
      }
    };
  }, [activeWorkout?.workout.id]);

  // Rest timer countdown
  useEffect(() => {
    if (restTimer?.isActive && restTimer.remainingSeconds > 0) {
      restTimerRef.current = setInterval(() => {
        setRestTimer((prev) => {
          if (!prev || prev.remainingSeconds <= 1) {
            return null; // Timer complete
          }
          return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
        });
      }, 1000);
    }

    return () => {
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
      }
    };
  }, [restTimer?.isActive, restTimer?.remainingSeconds]);

  // Restore from localStorage on mount
  useEffect(() => {
    const restoreWorkout = async () => {
      try {
        // First try to get active workout from server
        const serverWorkout = await getActiveWorkout();
        
        if (serverWorkout) {
          // Calculate elapsed time from started_at
          const startedAt = new Date(serverWorkout.started_at);
          const elapsedSeconds = Math.floor((Date.now() - startedAt.getTime()) / 1000);
          
          setActiveWorkout({
            workout: serverWorkout,
            sets: serverWorkout.workout_sets || [],
            elapsedSeconds,
          });
          
          // Check localStorage for expanded state, default to minimized (show the floating bar)
          let shouldExpand = false;
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              if (parsed.workoutId === serverWorkout.id) {
                shouldExpand = parsed.isExpanded ?? false;
              }
            } catch {
              // Ignore parse errors
            }
          }
          setIsExpanded(shouldExpand);
        } else {
          // No active workout on server, clear localStorage
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (error) {
        console.error("Failed to restore workout:", error);
      }
    };

    restoreWorkout();
  }, []);

  // Save state to localStorage
  const saveToLocalStorage = useCallback((state: ActiveWorkoutState) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          workoutId: state.workout.id,
          elapsedSeconds: state.elapsedSeconds,
          isExpanded,
        })
      );
    } catch {
      // Ignore storage errors
    }
  }, [isExpanded]);

  // Clear localStorage
  const clearLocalStorage = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Start a new workout
  const startWorkout = useCallback(async (routineId: string) => {
    setIsLoading(true);
    try {
      const result = await startWorkoutAction(routineId);
      
      if (result.success && result.workout) {
        const newState: ActiveWorkoutState = {
          workout: result.workout,
          sets: result.workout.workout_sets || [],
          elapsedSeconds: 0,
        };
        setActiveWorkout(newState);
        setIsExpanded(true);
        saveToLocalStorage(newState);
        
        // If there's a warning/error even though workout was created, throw it
        // so the UI can display it
        if (result.error) {
          throw new Error(result.error);
        }
      } else {
        // If there's an error about existing workout, try to restore it
        if (result.error?.includes("already have an active workout")) {
          const existingWorkout = await getActiveWorkout();
          if (existingWorkout) {
            const startedAt = new Date(existingWorkout.started_at);
            const elapsedSeconds = Math.floor((Date.now() - startedAt.getTime()) / 1000);
            const restoredState: ActiveWorkoutState = {
              workout: existingWorkout,
              sets: existingWorkout.workout_sets || [],
              elapsedSeconds,
            };
            setActiveWorkout(restoredState);
            setIsExpanded(true);
            saveToLocalStorage(restoredState);
            return; // Successfully restored, don't throw
          }
        }
        throw new Error(result.error || "Failed to start workout");
      }
    } finally {
      setIsLoading(false);
    }
  }, [saveToLocalStorage]);

  // Update a set
  const updateSet = useCallback(async (setId: string, data: UpdateSetInput) => {
    const result = await updateWorkoutSet(setId, data);
    
    if (result.success && result.set) {
      setActiveWorkout((prev) => {
        if (!prev) return null;
        const newSets = prev.sets.map((s) =>
          s.id === setId ? result.set! : s
        );
        return { ...prev, sets: newSets };
      });
    }
  }, []);

  // Complete a set (shorthand for updateSet with completed: true)
  const completeSet = useCallback(async (
    setId: string, 
    weight_kg?: number, 
    reps?: number
  ) => {
    const data: UpdateSetInput = { completed: true };
    if (weight_kg !== undefined) data.weight_kg = weight_kg;
    if (reps !== undefined) data.reps = reps;
    
    await updateSet(setId, data);
  }, [updateSet]);

  // Add a new set
  const addSet = useCallback(async (
    exerciseName: string, 
    exerciseLibraryId?: string | null
  ) => {
    if (!activeWorkout) return;
    
    const result = await addSetToWorkout(
      activeWorkout.workout.id,
      exerciseName,
      exerciseLibraryId
    );
    
    if (result.success && result.set) {
      setActiveWorkout((prev) => {
        if (!prev) return null;
        return { ...prev, sets: [...prev.sets, result.set!] };
      });
    }
  }, [activeWorkout]);

  // Delete a set
  const deleteSet = useCallback(async (setId: string) => {
    const result = await deleteWorkoutSet(setId);
    
    if (result.success) {
      setActiveWorkout((prev) => {
        if (!prev) return null;
        return { ...prev, sets: prev.sets.filter((s) => s.id !== setId) };
      });
    }
  }, []);

  // Finish workout
  const finishWorkout = useCallback(async () => {
    if (!activeWorkout) return;
    
    setIsLoading(true);
    try {
      const result = await completeWorkoutAction(activeWorkout.workout.id);
      
      if (result.success) {
        setActiveWorkout(null);
        setIsExpanded(false);
        setRestTimer(null);
        clearLocalStorage();
      } else {
        throw new Error(result.error || "Failed to complete workout");
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkout, clearLocalStorage]);

  // Cancel workout
  const cancelWorkout = useCallback(async () => {
    if (!activeWorkout) return;
    
    setIsLoading(true);
    try {
      const result = await cancelWorkoutAction(activeWorkout.workout.id);
      
      if (result.success) {
        setActiveWorkout(null);
        setIsExpanded(false);
        setRestTimer(null);
        clearLocalStorage();
      } else {
        throw new Error(result.error || "Failed to cancel workout");
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkout, clearLocalStorage]);

  // Toggle expanded state
  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const expand = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const minimize = useCallback(() => {
    setIsExpanded(false);
  }, []);

  // Rest timer controls
  const startRestTimer = useCallback((seconds: number, exerciseName: string) => {
    setRestTimer({
      isActive: true,
      remainingSeconds: seconds,
      totalSeconds: seconds,
      exerciseName,
    });
  }, []);

  const skipRestTimer = useCallback(() => {
    setRestTimer(null);
  }, []);

  const value: WorkoutContextValue = {
    activeWorkout,
    isExpanded,
    isLoading,
    restTimer,
    exerciseGroups,
    startWorkout,
    completeSet,
    updateSet,
    addSet,
    deleteSet,
    finishWorkout,
    cancelWorkout,
    toggleExpanded,
    expand,
    minimize,
    startRestTimer,
    skipRestTimer,
  };

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
}

// Helper function to group sets by exercise
function groupSetsByExercise(sets: WorkoutSet[]): ExerciseGroup[] {
  const groups: Map<string, ExerciseGroup> = new Map();
  
  // Sort sets by their original order (based on when they were created)
  const sortedSets = [...sets].sort((a, b) => {
    // First sort by exercise order (assuming sets for the same exercise were created together)
    // Then by set_index within each exercise
    const aKey = `${a.exercise_name}-${a.set_index}`;
    const bKey = `${b.exercise_name}-${b.set_index}`;
    return aKey.localeCompare(bKey);
  });

  // Track the order of first appearance
  const orderMap: Map<string, number> = new Map();
  let orderIndex = 0;

  for (const set of sortedSets) {
    const key = set.exercise_name;
    
    if (!groups.has(key)) {
      orderMap.set(key, orderIndex++);
      groups.set(key, {
        exercise_name: set.exercise_name,
        exercise_library_id: set.exercise_library_id,
        sets: [],
        order_index: orderMap.get(key)!,
      });
    }
    
    groups.get(key)!.sets.push(set);
  }

  // Sort sets within each group by set_index
  for (const group of groups.values()) {
    group.sets.sort((a, b) => a.set_index - b.set_index);
  }

  // Return groups sorted by their order of first appearance
  return Array.from(groups.values()).sort((a, b) => a.order_index - b.order_index);
}
