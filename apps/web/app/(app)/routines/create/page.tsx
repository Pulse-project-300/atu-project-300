"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Save, X, Search, Dumbbell, Minus } from "lucide-react";
import Link from "next/link";
import { createRoutine, searchExercises } from "@/app/(app)/routines/actions";
import type { ExerciseLibraryItem, SetInput } from "@/lib/types/routines";

interface ExerciseEntry {
  id: string;
  exercise_library_id?: string;
  exercise_name: string;
  sets: SetInput[];
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

    const doSearch = async () => {
      setIsSearching(true);
      const results = await searchExercises(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    };

    const debounce = setTimeout(doSearch, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Focus search input when opened
  useEffect(() => {
    if (showExerciseSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showExerciseSearch]);

  const createDefaultSets = (count: number = 3): SetInput[] => {
    return Array.from({ length: count }, () => ({
      id: crypto.randomUUID(),
      weight_kg: null,
      reps: null,
    }));
  };

  const addExerciseFromLibrary = (libraryExercise: ExerciseLibraryItem) => {
    const newExercise: ExerciseEntry = {
      id: crypto.randomUUID(),
      exercise_library_id: libraryExercise.rowid,
      exercise_name: libraryExercise.name || "Unknown Exercise",
      sets: createDefaultSets(3),
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
      sets: createDefaultSets(3),
    };

    setExercises([...exercises, newExercise]);
    setSearchQuery("");
    setSearchResults([]);
    setShowExerciseSearch(false);
  };

  const addSetToExercise = (exerciseId: string) => {
    setExercises(exercises.map(ex =>
      ex.id === exerciseId
        ? { ...ex, sets: [...ex.sets, { id: crypto.randomUUID(), weight_kg: null, reps: null }] }
        : ex
    ));
  };

  const removeSetFromExercise = (exerciseId: string, setId: string) => {
    setExercises(exercises.map(ex =>
      ex.id === exerciseId
        ? { ...ex, sets: ex.sets.filter(s => s.id !== setId) }
        : ex
    ));
  };

  const updateSet = (exerciseId: string, setId: string, updates: Partial<SetInput>) => {
    setExercises(exercises.map(ex =>
      ex.id === exerciseId
        ? {
            ...ex,
            sets: ex.sets.map(s =>
              s.id === setId ? { ...s, ...updates } : s
            ),
          }
        : ex
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

    // Check that all exercises have at least one set
    const exerciseWithNoSets = exercises.find(ex => ex.sets.length === 0);
    if (exerciseWithNoSets) {
      setError(`"${exerciseWithNoSets.exercise_name}" needs at least one set`);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Transform to the format expected by createRoutine
    const exercisesForApi = exercises.map(ex => ({
      exercise_library_id: ex.exercise_library_id,
      exercise_name: ex.exercise_name,
      target_sets: ex.sets.length,
      // Use the first set's values as defaults (or average them)
      target_reps: ex.sets[0]?.reps ?? undefined,
      target_weight_kg: ex.sets[0]?.weight_kg ?? undefined,
      sets: ex.sets, // Pass the full sets array
    }));

    const result = await createRoutine(name.trim(), exercisesForApi);

    if (result.success) {
      router.push("/routines");
    } else {
      setError(result.error || "Failed to create routine");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/routines"
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
      <div className="flex flex-col gap-4">
        {exercises.map((exercise) => (
          <div
            key={exercise.id}
            className="rounded-lg border bg-card overflow-hidden"
          >
            {/* Exercise Header */}
            <div className="flex items-center justify-between p-4 border-b bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-2">
                  <Dumbbell className="h-4 w-4 text-purple-600" />
                </div>
                <span className="font-medium">{exercise.exercise_name}</span>
              </div>
              <button
                onClick={() => removeExercise(exercise.id)}
                className="p-2 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                title="Remove exercise"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Sets Table */}
            <div className="p-4">
              {/* Header Row */}
              <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-3 mb-2 px-1">
                <div className="w-8 text-xs font-medium text-muted-foreground text-center">Set</div>
                <div className="text-xs font-medium text-muted-foreground">Weight (kg)</div>
                <div className="text-xs font-medium text-muted-foreground">Reps</div>
                <div className="w-8"></div>
              </div>

              {/* Set Rows */}
              <div className="flex flex-col gap-2">
                {exercise.sets.map((set, setIndex) => (
                  <div
                    key={set.id}
                    className="grid grid-cols-[auto_1fr_1fr_auto] gap-3 items-center"
                  >
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                      {setIndex + 1}
                    </div>
                    <input
                      type="number"
                      value={set.weight_kg ?? ""}
                      onChange={(e) => updateSet(exercise.id, set.id, {
                        weight_kg: e.target.value ? parseFloat(e.target.value) : null
                      })}
                      placeholder="0"
                      min={0}
                      step={0.5}
                      className="px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                      type="number"
                      value={set.reps ?? ""}
                      onChange={(e) => updateSet(exercise.id, set.id, {
                        reps: e.target.value ? parseInt(e.target.value) : null
                      })}
                      placeholder="0"
                      min={1}
                      max={100}
                      className="px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={() => removeSetFromExercise(exercise.id, set.id)}
                      disabled={exercise.sets.length <= 1}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                      title="Remove set"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Set Button */}
              <button
                onClick={() => addSetToExercise(exercise.id)}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed hover:border-purple-500 hover:bg-purple-50/50 text-sm text-muted-foreground hover:text-purple-600 transition-all"
              >
                <Plus className="h-4 w-4" />
                Add Set
              </button>
            </div>
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
