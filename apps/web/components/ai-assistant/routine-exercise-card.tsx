"use client";

import { useState } from "react";
import { MessageSquare, Clock, ChevronDown, X, Plus } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SetData {
  set_index: number;
  target_reps: number | null;
  target_weight_kg: number | null;
}

interface RoutineExercise {
  exercise_name: string;
  exercise_library_id?: string;
  sets_data: SetData[];
  rest_seconds: number;
  order_index: number;
  notes?: string;
}

interface RoutineExerciseCardProps {
  exercise: RoutineExercise;
  onChange: (updated: RoutineExercise) => void;
}

export function RoutineExerciseCard({ exercise, onChange }: RoutineExerciseCardProps) {
  const [showNotes, setShowNotes] = useState(!!exercise.notes);

  const updateField = (fields: Partial<RoutineExercise>) => {
    onChange({ ...exercise, ...fields });
  };

  const updateSet = (setIndex: number, fields: Partial<SetData>) => {
    const updatedSets = exercise.sets_data.map((s) =>
      s.set_index === setIndex ? { ...s, ...fields } : s
    );
    updateField({ sets_data: updatedSets });
  };

  const addSet = () => {
    const nextIndex = exercise.sets_data.length + 1;
    const lastSet = exercise.sets_data[exercise.sets_data.length - 1];
    updateField({
      sets_data: [
        ...exercise.sets_data,
        {
          set_index: nextIndex,
          target_reps: lastSet?.target_reps ?? 10,
          target_weight_kg: lastSet?.target_weight_kg ?? null,
        },
      ],
    });
  };

  const removeSet = (setIndex: number) => {
    if (exercise.sets_data.length <= 1) return;
    const filtered = exercise.sets_data
      .filter((s) => s.set_index !== setIndex)
      .map((s, i) => ({ ...s, set_index: i + 1 }));
    updateField({ sets_data: filtered });
  };

  return (
    <Card className="overflow-hidden border-none shadow-sm ring-1 ring-border/50 bg-card rounded-2xl">
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <CardTitle className="text-sm font-bold flex items-center gap-2 leading-none truncate">
            <span className="text-xs text-muted-foreground font-black">
              {exercise.order_index + 1}.
            </span>
            {exercise.exercise_name}
          </CardTitle>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={cn(
                "flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-colors",
                exercise.notes || showNotes
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <MessageSquare className="h-3 w-3" />
              {exercise.notes ? "Edit Note" : "Add Note"}
            </button>
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">
              <Clock className="h-3 w-3" />
              <select
                value={exercise.rest_seconds}
                onChange={(e) =>
                  updateField({ rest_seconds: parseInt(e.target.value) })
                }
                className="bg-transparent focus:outline-none cursor-pointer appearance-none text-[10px]"
              >
                {[0, 30, 45, 60, 90, 120, 180, 240, 300].map((sec) => (
                  <option key={sec} value={sec}>
                    {sec === 0 ? "No Rest" : `${sec}s Rest`}
                  </option>
                ))}
              </select>
              <ChevronDown className="h-2.5 w-2.5 opacity-50" />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        {showNotes && (
          <div className="mb-3 animate-in fade-in slide-in-from-top-1">
            <textarea
              value={exercise.notes || ""}
              onChange={(e) => updateField({ notes: e.target.value })}
              placeholder="Special instructions or tips..."
              className="w-full text-xs p-3 rounded-xl bg-muted/40 border-none focus:ring-2 focus:ring-primary/20 resize-none min-h-[60px]"
              autoFocus
            />
          </div>
        )}

        <div className="space-y-2">
          <div className="grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 px-0.5">
            <div className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest text-center">
              Set
            </div>
            <div className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest text-center">
              kg
            </div>
            <div className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest text-center">
              Reps
            </div>
            <div className="w-6" />
          </div>

          <div className="flex flex-col gap-1.5">
            {exercise.sets_data.map((set) => (
              <div
                key={set.set_index}
                className="grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 items-center group"
              >
                <div className="flex items-center justify-center">
                  <div className="h-6 w-6 flex items-center justify-center rounded-md font-black text-[10px] bg-muted/60 text-muted-foreground">
                    {set.set_index}
                  </div>
                </div>
                <Input
                  type="number"
                  value={set.target_weight_kg ?? ""}
                  onChange={(e) =>
                    updateSet(set.set_index, {
                      target_weight_kg: e.target.value
                        ? parseFloat(e.target.value)
                        : null,
                    })
                  }
                  placeholder="0"
                  className="h-8 text-center bg-muted/30 border-none font-bold text-xs rounded-lg focus:ring-2 focus:ring-primary/20"
                />
                <Input
                  type="number"
                  value={set.target_reps ?? ""}
                  onChange={(e) =>
                    updateSet(set.set_index, {
                      target_reps: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    })
                  }
                  placeholder="0"
                  className="h-8 text-center bg-muted/30 border-none font-bold text-xs rounded-lg focus:ring-2 focus:ring-primary/20"
                />
                <div className="flex justify-center">
                  <button
                    onClick={() => removeSet(set.set_index)}
                    disabled={exercise.sets_data.length <= 1}
                    className="h-6 w-6 flex items-center justify-center text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 rounded-full transition-all disabled:opacity-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            className="w-full h-7 text-[10px] font-black uppercase tracking-widest rounded-lg bg-muted/40 hover:bg-muted text-muted-foreground hover:text-primary transition-all"
            onClick={addSet}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Set
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
