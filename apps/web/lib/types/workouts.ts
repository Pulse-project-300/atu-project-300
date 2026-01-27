// Database Types for Workout Tracking

export interface Routine {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoutineExercise {
  id: string;
  routine_id: string;
  exercise_library_id: string | null;
  exercise_name: string;
  target_sets: number;
  target_reps: number | null;
  target_weight_kg: number | null;
  rest_seconds: number;
  order_index: number;
  notes: string | null;
}

export interface Workout {
  id: string;
  user_id: string;
  routine_id: string | null;
  name: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  notes: string | null;
  created_at: string;
}

export interface WorkoutSet {
  id: string;
  workout_id: string;
  exercise_library_id: string | null;
  exercise_name: string;
  set_index: number;
  weight_kg: number | null;
  reps: number | null;
  completed: boolean;
  rpe: number | null;
  set_type: 'warmup' | 'normal' | 'dropset' | 'failure';
  completed_at: string | null;
}

export interface ExerciseLibraryItem {
  rowid: string;
  name: string | null;
  force: string | null;
  level: string | null;
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[] | null;
  secondaryMuscles: string[] | null;
  instructions: string[] | null;
  category: string | null;
  images: string[] | null;
  id: string | null;
}

// Composite Types (with relations)

export interface RoutineWithExercises extends Routine {
  routine_exercises: RoutineExercise[];
}

export interface WorkoutWithSets extends Workout {
  workout_sets: WorkoutSet[];
  routine?: Routine | null;
}


export interface CreateRoutineInput {
  name: string;
  description?: string;
}

export interface CreateRoutineExerciseInput {
  exercise_library_id?: string;
  exercise_name: string;
  target_sets: number;
  target_reps?: number;
  target_weight_kg?: number;
  rest_seconds?: number;
  notes?: string;
}

export interface StartWorkoutInput {
  routine_id?: string;
  name: string;
}

export interface UpdateSetInput {
  weight_kg?: number;
  reps?: number;
  completed?: boolean;
  rpe?: number;
  set_type?: WorkoutSet['set_type'];
}

// UI State Types
export interface ActiveWorkoutState {
  workout: Workout;
  sets: WorkoutSet[];
  elapsedSeconds: number;
}

export interface ExerciseGroup {
  exercise_name: string;
  exercise_library_id: string | null;
  sets: WorkoutSet[];
}
