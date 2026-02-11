"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { Upload, FileUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { importHevyWorkouts } from "@/app/(app)/settings/actions";
import type { ImportWorkoutData, ImportSetData } from "@/app/(app)/settings/actions";

interface HevyRow {
  title: string;
  start_time: string;
  end_time: string;
  description: string;
  exercise_title: string;
  superset_id: string;
  exercise_notes: string;
  set_index: string;
  set_type: string;
  // Hevy exports may use kg or lbs columns depending on user settings
  weight_kg: string;
  weight_lbs: string;
  reps: string;
  distance_km: string;
  distance_miles: string;
  duration_seconds: string;
  rpe: string;
}

interface ParsedPreview {
  workouts: ImportWorkoutData[];
  totalSets: number;
}

function mapSetType(heavyType: string): ImportSetData["set_type"] {
  const lower = heavyType.toLowerCase().trim();
  if (lower === "warmup" || lower === "warm up") return "warmup";
  if (lower === "dropset" || lower === "drop set") return "dropset";
  if (lower === "failure" || lower === "to failure") return "failure";
  return "normal";
}

function parseHevyCsv(rows: HevyRow[]): ParsedPreview {
  // Group rows by workout (unique combo of title + start_time)
  const workoutMap = new Map<string, { row: HevyRow; sets: HevyRow[] }>();

  for (const row of rows) {
    if (!row.title || !row.start_time) continue;
    const key = `${row.title}|||${row.start_time}`;
    if (!workoutMap.has(key)) {
      workoutMap.set(key, { row, sets: [] });
    }
    if (row.exercise_title) {
      workoutMap.get(key)!.sets.push(row);
    }
  }

  const workouts: ImportWorkoutData[] = [];
  let totalSets = 0;

  for (const [, { row, sets }] of workoutMap) {
    const startedAt = new Date(row.start_time).toISOString();
    const endTime = row.end_time ? new Date(row.end_time) : null;
    const completedAt = endTime ? endTime.toISOString() : null;

    const durationSeconds =
      endTime && row.start_time
        ? Math.floor(
            (endTime.getTime() - new Date(row.start_time).getTime()) / 1000
          )
        : null;

    const parsedSets: ImportSetData[] = sets.map((s) => {
      // Support both kg and lbs columns — prefer kg if present
      let weightKg: number | null = null;
      const kgVal = parseFloat(s.weight_kg);
      const lbsVal = parseFloat(s.weight_lbs);
      if (!isNaN(kgVal)) {
        weightKg = Math.round(kgVal * 100) / 100;
      } else if (!isNaN(lbsVal)) {
        weightKg = Math.round((lbsVal / 2.20462) * 100) / 100;
      }

      const reps = parseInt(s.reps);
      const rpe = parseFloat(s.rpe);
      // Hevy uses 0-based set_index, DB requires > 0, so always add 1
      const setIndex = (parseInt(s.set_index) || 0) + 1;

      return {
        exercise_name: s.exercise_title,
        set_index: setIndex,
        weight_kg: weightKg,
        reps: isNaN(reps) ? null : reps,
        rpe: isNaN(rpe) ? null : rpe,
        set_type: mapSetType(s.set_type || "normal"),
      };
    });

    totalSets += parsedSets.length;

    workouts.push({
      name: row.title,
      started_at: startedAt,
      completed_at: completedAt,
      duration_seconds: durationSeconds,
      sets: parsedSets,
    });
  }

  return { workouts, totalSets };
}

export function ImportHevyCard() {
  const [preview, setPreview] = useState<ParsedPreview | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setPreview(null);

    Papa.parse<HevyRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsed = parseHevyCsv(results.data);
          setPreview(parsed);
        } catch {
          toast.error("Failed to parse CSV file");
        }
        setIsParsing(false);
      },
      error: () => {
        toast.error("Failed to read CSV file");
        setIsParsing(false);
      },
    });
  };

  const handleImport = async () => {
    if (!preview) return;
    setIsImporting(true);

    const result = await importHevyWorkouts(preview.workouts);

    if (result.success) {
      toast.success(`Imported ${result.imported} workouts`);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else {
      toast.error(result.error || "Failed to import workouts");
    }

    setIsImporting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import from Hevy
        </CardTitle>
        <CardDescription>
          Import your workout history from a Hevy CSV export file
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="hevy-csv-upload"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isParsing || isImporting}
          >
            {isParsing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileUp className="h-4 w-4 mr-2" />
            )}
            {isParsing ? "Parsing..." : "Choose CSV File"}
          </Button>
        </div>

        {preview && (
          <div className="rounded-lg border p-4 space-y-3">
            <p className="text-sm font-medium">
              Found {preview.workouts.length} workout{preview.workouts.length !== 1 ? "s" : ""} with{" "}
              {preview.totalSets} set{preview.totalSets !== 1 ? "s" : ""}
            </p>
            <Button onClick={handleImport} disabled={isImporting}>
              {isImporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {isImporting ? "Importing..." : "Import Workouts"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
