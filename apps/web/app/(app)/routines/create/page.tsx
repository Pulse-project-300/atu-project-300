"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Plus, Save, X, GripVertical, Search, Dumbbell } from "lucide-react";
import Link from "next/link";
import type { CreateRoutineExerciseInput, ExerciseLibraryItem } from "@/lib/types/workouts";

interface ExerciseEntry extends CreateRoutineExerciseInput {
  id: string; // temporary client-side ID for React keys
}

export default function CreateRoutinePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ExerciseLibraryItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Search exercises from library
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const searchExercises = async () => {
      setIsSearching(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from("new_exercises")
        .select("rowid, name, equipment, category")
        .ilike("name", `%${searchQuery}%`)
        .limit(10);

      console.log("Search query:", searchQuery);
      console.log("Results:", data);
      console.log("Error:", error);

      if (error) {
        console.error("Search error:", error);
      }

      setSearchResults((data || []) as ExerciseLibraryItem[]);
      setIsSearching(false);
    };

    const debounce = setTimeout(searchExercises, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Focus search input when opened
  useEffect(() => {
    if (showExerciseSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showExerciseSearch]);

  const addExerciseFromLibrary = (libraryExercise: ExerciseLibraryItem) => {
    const newExercise: ExerciseEntry = {
      id: crypto.randomUUID(),
      exercise_library_id: libraryExercise.rowid,
      exercise_name: libraryExercise.name || "Unknown Exercise",
      target_sets: 3,
      target_reps: 10,
    };

    setExercises([...exercises, newExercise]);
    setSearchQuery("");
    setSearchResults([]);
    setShowExerciseSearch(false);
  };

  const addCustomExercise = () => {
    if (!searchQuery.trim()) return;

    const newExercise: ExerciseEntry = {
      id: crypto.randomUUID(),
      exercise_name: searchQuery.trim(),
      target_sets: 3,
      target_reps: 10,
    };

    setExercises([...exercises, newExercise]);
    setSearchQuery("");
    setSearchResults([]);
    setShowExerciseSearch(false);
  };

  const updateExercise = (id: string, updates: Partial<ExerciseEntry>) => {
    setExercises(exercises.map(ex =>
      ex.id === id ? { ...ex, ...updates } : ex
    ));
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Routine name is required");
      return;
    }

    if (exercises.length === 0) {
      setError("Add at least one exercise");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in");
        return;
      }

      // Create the routine
      const { data: routine, error: routineError } = await supabase
        .from("routines")
        .insert({
          user_id: user.id,
          name: name.trim(),
        })
        .select()
        .single();

      if (routineError) throw routineError;

      // Create all exercises
      const exercisesToInsert = exercises.map((ex, index) => ({
        routine_id: routine.id,
        exercise_library_id: ex.exercise_library_id || null,
        exercise_name: ex.exercise_name,
        target_sets: ex.target_sets,
        target_reps: ex.target_reps,
        order_index: index,
      }));

      const { error: exercisesError } = await supabase
        .from("routine_exercises")
        .insert(exercisesToInsert);

      if (exercisesError) throw exercisesError;

      router.push("/workouts");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create routine");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/workouts"
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Create Routine</h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isLoading || !name.trim() || exercises.length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4" />
          {isLoading ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Routine Name */}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Routine name (e.g. Push Day)"
        className="px-4 py-3 rounded-lg border bg-background text-lg font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
        disabled={isLoading}
      />

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Exercise List */}
      <div className="flex flex-col gap-3">
        {exercises.map((exercise, index) => (
          <div
            key={exercise.id}
            className="flex items-center gap-3 p-4 rounded-lg border bg-card"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />

            <div className="flex-1">
              <div className="font-medium">{exercise.exercise_name}</div>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">Sets</label>
                  <input
                    type="number"
                    value={exercise.target_sets}
                    onChange={(e) => updateExercise(exercise.id, {
                      target_sets: parseInt(e.target.value) || 1
                    })}
                    min={1}
                    max={20}
                    className="w-16 px-2 py-1 rounded border bg-background text-center text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">Reps</label>
                  <input
                    type="number"
                    value={exercise.target_reps || ""}
                    onChange={(e) => updateExercise(exercise.id, {
                      target_reps: parseInt(e.target.value) || undefined
                    })}
                    min={1}
                    max={100}
                    placeholder="-"
                    className="w-16 px-2 py-1 rounded border bg-background text-center text-sm"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => removeExercise(exercise.id)}
              className="p-2 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {/* Add Exercise Search */}
        {showExerciseSearch ? (
          <div className="rounded-lg border bg-card overflow-hidden">
            {/* Search Input */}
            <div className="flex items-center gap-2 p-3 border-b">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setShowExerciseSearch(false);
                    setSearchQuery("");
                    setSearchResults([]);
                  }
                }}
                placeholder="Search exercises..."
                className="flex-1 bg-transparent focus:outline-none"
              />
              <button
                onClick={() => {
                  setShowExerciseSearch(false);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="p-1 rounded hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search Results */}
            <div className="max-h-64 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  Searching...
                </div>
              ) : searchResults.length > 0 ? (
                <div className="divide-y">
                  {searchResults.map((exercise) => (
                    <button
                      key={exercise.rowid}
                      onClick={() => addExerciseFromLibrary(exercise)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="rounded-lg bg-purple-500/10 p-2">
                        <Dumbbell className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {exercise.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {[exercise.equipment, exercise.category]
                            .filter(Boolean)
                            .join(" • ")}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchQuery.trim() ? (
                <div className="p-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    No exercises found for "{searchQuery}"
                  </p>
                  <button
                    onClick={addCustomExercise}
                    className="w-full flex items-center gap-2 p-3 rounded-lg border border-dashed hover:border-purple-500 hover:bg-purple-50/50 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add "{searchQuery}" as custom exercise
                  </button>
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  Type to search exercises
                </div>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowExerciseSearch(true)}
            className="flex items-center justify-center gap-2 p-4 rounded-lg border border-dashed hover:border-purple-500 hover:bg-purple-50/50 text-muted-foreground hover:text-purple-600 transition-all"
          >
            <Plus className="h-5 w-5" />
            Add Exercise
          </button>
        )}
      </div>
    </div>
  );
}
