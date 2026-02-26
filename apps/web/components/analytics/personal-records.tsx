"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import {
  getPersonalRecords,
  type PersonalRecord,
} from "@/app/(app)/analytics/actions";

export function PersonalRecords() {
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPersonalRecords()
      .then(setRecords)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Personal Records</h3>
          <p className="text-sm text-muted-foreground">
            Your heaviest lift per exercise
          </p>
        </div>
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="h-4 w-32 bg-muted-foreground/10 rounded" />
              <div className="h-4 w-20 bg-muted-foreground/10 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-full bg-primary p-2">
          <Trophy className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Personal Records</h3>
          <p className="text-sm text-muted-foreground">
            Your heaviest lift per exercise
          </p>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            No records yet
          </p>
          <p className="text-xs text-muted-foreground">
            Complete sets with weight to track your PRs
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="pb-3 font-medium">Exercise</th>
                <th className="pb-3 font-medium text-right">Weight</th>
                <th className="pb-3 font-medium text-right">Reps</th>
                <th className="pb-3 font-medium text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr
                  key={record.exerciseName}
                  className="border-b last:border-0"
                >
                  <td className="py-3 font-medium">{record.exerciseName}</td>
                  <td className="py-3 text-right">{record.weight}kg</td>
                  <td className="py-3 text-right">{record.reps}</td>
                  <td className="py-3 text-right text-muted-foreground">
                    {record.date
                      ? new Date(record.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
