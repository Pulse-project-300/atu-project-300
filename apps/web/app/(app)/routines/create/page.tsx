"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Plus,
  Search,
  Dumbbell,
  Clock,
  MessageSquare,
  MoreVertical,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { createRoutine, searchExercises } from "@/app/(app)/routines/actions";
import type { ExerciseLibraryItem, SetInput } from "@/lib/types/routines";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ExerciseEntry {
  id: string;
  exercise_library_id?: string;
  exercise_name: string;
  sets: SetInput[];
  notes: string;
  rest_seconds: number;
  showNotes: boolean;
}

export default function CreateRoutinePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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
      notes: "",
      rest_seconds: 60,
      showNotes: false,
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
      notes: "",
      rest_seconds: 60,
      showNotes: false,
    };

    setExercises([...exercises, newExercise]);
    setSearchQuery("");
    setSearchResults([]);
    setShowExerciseSearch(false);
  };

  const addSetToExercise = (exerciseId: string) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.id === exerciseId) {
          const lastSet = ex.sets[ex.sets.length - 1];
          return {
            ...ex,
            sets: [
              ...ex.sets,
              {
                id: crypto.randomUUID(),
                weight_kg: lastSet?.weight_kg ?? null,
                reps: lastSet?.reps ?? null,
              },
            ],
          };
        }
        return ex;
      }),
    );
  };

  const removeSetFromExercise = (exerciseId: string, setId: string) => {
    setExercises(
      exercises.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, sets: ex.sets.filter((s) => s.id !== setId) }
          : ex,
      ),
    );
  };

  const updateSet = (
    exerciseId: string,
    setId: string,
    updates: Partial<SetInput>,
  ) => {
    setExercises(
      exercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((s) =>
                s.id === setId ? { ...s, ...updates } : s,
              ),
            }
          : ex,
      ),
    );
  };

  const updateExercise = (exerciseId: string, updates: Partial<ExerciseEntry>) => {
    setExercises(
      exercises.map((ex) => (ex.id === exerciseId ? { ...ex, ...updates } : ex)),
    );
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter((ex) => ex.id !== id));
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

    const exercisesForApi = exercises.map((ex) => ({
      exercise_library_id: ex.exercise_library_id,
      exercise_name: ex.exercise_name,
      target_sets: ex.sets.length,
      target_reps: ex.sets[0]?.reps ?? undefined,
      target_weight_kg: ex.sets[0]?.weight_kg ?? undefined,
      rest_seconds: ex.rest_seconds,
      notes: ex.notes,
    }));

    const result = await createRoutine(
      name.trim(),
      exercisesForApi,
      description.trim(),
    );

    if (result.success) {
      router.push("/routines");
    } else {
      setError(result.error || "Failed to create routine");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col max-w-2xl mx-auto pb-20 bg-background min-h-screen">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-1">
            <Link href="/routines">
              <Button variant="ghost" size="icon" className="rounded-full">
                <X className="h-6 w-6" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold tracking-tight">New Routine</h1>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !name.trim() || exercises.length === 0}
            variant="default"
            className="rounded-full px-6 font-bold"
          >
            {isLoading ? "Saving..." : "Finish"}
          </Button>
        </div>
      </div>

      <div className="px-4 py-6 flex flex-col gap-8">
        {/* Routine Title & Description */}
        <div className="flex flex-col gap-1 px-1">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Routine Title"
            className="text-4xl font-black bg-transparent border-none focus:outline-none placeholder:text-muted-foreground/20 selection:bg-brand/20"
            disabled={isLoading}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Routine description..."
            rows={1}
            className="text-base bg-transparent border-none focus:outline-none resize-none placeholder:text-muted-foreground/40 text-muted-foreground/80 leading-relaxed"
            disabled={isLoading}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <X className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Exercises */}
        <div className="flex flex-col gap-6">
          {exercises.map((exercise) => (
            <Card key={exercise.id} className="overflow-hidden border-none shadow-sm ring-1 ring-border/50 bg-card rounded-2xl">
              <CardHeader className="p-5 flex flex-row items-start justify-between space-y-0 pb-3">
                <div className="flex flex-col gap-2 flex-1">
                  <CardTitle className="text-xl font-bold flex items-center gap-2 leading-none">
                    {exercise.exercise_name}
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() =>
                        updateExercise(exercise.id, {
                          showNotes: !exercise.showNotes,
                        })
                      }
                      className={cn(
                        "flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors",
                        exercise.notes || exercise.showNotes
                          ? "text-brand"
                          : "text-muted-foreground hover:text-brand",
                      )}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      {exercise.notes ? "Edit Note" : "Add Note"}
                    </button>
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-brand transition-colors">
                      <Clock className="h-3.5 w-3.5" />
                      <select
                        value={exercise.rest_seconds}
                        onChange={(e) =>
                          updateExercise(exercise.id, {
                            rest_seconds: parseInt(e.target.value),
                          })
                        }
                        className="bg-transparent focus:outline-none cursor-pointer appearance-none"
                      >
                        {[0, 30, 45, 60, 90, 120, 180, 240, 300].map((sec) => (
                          <option key={sec} value={sec}>
                            {sec === 0 ? "No Rest" : `${sec}s Rest`}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full -mr-2">
                      <MoreVertical className="h-5 w-5 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive font-bold p-3 cursor-pointer"
                      onClick={() => removeExercise(exercise.id)}
                    >
                      <X className="h-4 w-4 mr-3" />
                      Remove Exercise
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>

              <CardContent className="p-5 pt-0">
                {exercise.showNotes && (
                  <div className="mb-5 animate-in fade-in slide-in-from-top-1">
                    <textarea
                      value={exercise.notes}
                      onChange={(e) =>
                        updateExercise(exercise.id, { notes: e.target.value })
                      }
                      placeholder="Special instructions or tips..."
                      className="w-full text-sm p-4 rounded-xl bg-muted/40 border-none focus:ring-2 focus:ring-brand/20 resize-none min-h-[80px]"
                      autoFocus
                    />
                  </div>
                )}

                {/* Sets Table */}
                <div className="space-y-4">
                  <div className="grid grid-cols-[3.5rem_1fr_1fr_3.5rem] gap-3 px-1">
                    <div className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-widest text-center">Set</div>
                    <div className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-widest text-center">Weight kg</div>
                    <div className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-widest text-center">Reps</div>
                    <div className="w-9"></div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {exercise.sets.map((set, setIndex) => (
                      <div
                        key={set.id}
                        className="grid grid-cols-[3.5rem_1fr_1fr_3.5rem] gap-3 items-center group animate-in fade-in slide-in-from-left-2"
                      >
                        <div className="flex items-center justify-center">
                          <div className="h-7 w-9 flex items-center justify-center rounded-lg font-black text-xs bg-muted/60 text-muted-foreground group-hover:bg-brand/10 group-hover:text-brand transition-colors">
                            {setIndex + 1}
                          </div>
                        </div>
                        <Input
                          type="number"
                          value={set.weight_kg ?? ""}
                          onChange={(e) =>
                            updateSet(exercise.id, set.id, {
                              weight_kg: e.target.value ? parseFloat(e.target.value) : null,
                            })
                          }
                          placeholder="0"
                          className="h-11 text-center bg-muted/30 border-none font-black text-base rounded-xl focus:ring-2 focus:ring-brand/20"
                        />
                        <Input
                          type="number"
                          value={set.reps ?? ""}
                          onChange={(e) =>
                            updateSet(exercise.id, set.id, {
                              reps: e.target.value ? parseInt(e.target.value) : null,
                            })
                          }
                          placeholder="0"
                          className="h-11 text-center bg-muted/30 border-none font-black text-base rounded-xl focus:ring-2 focus:ring-brand/20"
                        />
                        <div className="flex justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSetFromExercise(exercise.id, set.id)}
                            disabled={exercise.sets.length <= 1}
                            className="h-9 w-9 text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 rounded-full transition-all"
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="secondary"
                    className="w-full h-11 text-sm font-black uppercase tracking-widest rounded-xl bg-muted/40 hover:bg-muted text-muted-foreground hover:text-brand transition-all mt-2"
                    onClick={() => addSetToExercise(exercise.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Set
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {/* Add Exercise */}
          <div className="mt-4 flex flex-col gap-4">
            {showExerciseSearch ? (
              <Card className="border-2 border-dashed border-border/50 bg-background rounded-3xl overflow-hidden shadow-none">
                <div className="p-4 border-b bg-background/50">
                  <div className="flex items-center gap-3">
                    <Search className="h-5 w-5 text-muted-foreground" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search 200+ exercises..."
                      className="flex-1 bg-transparent border-none focus:outline-none text-lg font-bold placeholder:text-muted-foreground/40"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                      onClick={() => setShowExerciseSearch(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {isSearching ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground font-bold italic">
                      <div className="h-8 w-8 border-4 border-border border-t-brand rounded-full animate-spin" />
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="divide-y divide-border/30">
                      {searchResults.map((exercise) => (
                        <button
                          key={exercise.rowid}
                          onClick={() => addExerciseFromLibrary(exercise)}
                          className="w-full flex items-center gap-4 p-5 hover:bg-muted transition-all text-left group"
                        >
                          <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center shrink-0 group-hover:bg-brand/10 group-hover:scale-110 transition-all">
                            <Dumbbell className="h-6 w-6 text-muted-foreground group-hover:text-brand" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-black text-base uppercase tracking-tight group-hover:text-brand transition-colors">
                              {exercise.name}
                            </div>
                            <div className="text-xs font-black text-muted-foreground/60 uppercase tracking-widest mt-0.5">
                              {[exercise.equipment, exercise.category]
                                .filter(Boolean)
                                .join(" • ")}
                            </div>
                          </div>
                          <Plus className="h-6 w-6 text-muted-foreground/20 group-hover:text-brand transition-colors" />
                        </button>
                      ))}
                    </div>
                  ) : searchQuery.trim() ? (
                    <div className="p-10 text-center">
                      <p className="font-bold text-muted-foreground mb-6 italic">No results found for "{searchQuery}"</p>
                      <Button
                        variant="outline"
                        onClick={addCustomExercise}
                        className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest border-2"
                      >
                        Add Custom Exercise
                      </Button>
                    </div>
                  ) : (
                    <div className="p-16 text-center">
                      <div className="h-16 w-16 bg-muted/40 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <Search className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                      <p className="text-muted-foreground font-bold italic">Start typing to find the perfect exercise</p>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                <Button
                  onClick={() => setShowExerciseSearch(true)}
                  className="w-full h-12 rounded-2xl bg-brand hover:bg-brand/90 text-white font-black text-xl shadow-xl shadow-brand/10 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <Plus className="h-7 w-7 stroke-[3px]" />
                  Add Exercise
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full h-12 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 font-bold transition-all border-2 border-dashed border-muted-foreground/10"
                  onClick={() => {
                    if (confirm("Are you sure? This will discard all changes to this routine.")) {
                      router.push("/routines");
                    }
                  }}
                >
                  Cancel Routine
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
