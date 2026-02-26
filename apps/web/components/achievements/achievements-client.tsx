"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Award, Lock, Trophy, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BadgeWithEarnedStatus {
    id: string;
    code: string;
    name: string;
    description: string | null;
    icon: string | null;
    earned: boolean;
    earned_at?: string;
    criteria: {
        type: string;
        target: number;
        workout_type?: string;
    };
}

    export function AchievementsClient() {
    const [badges, setBadges] = useState<BadgeWithEarnedStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        loadBadges();
    }, []);

    async function loadBadges() {
        try {
        setLoading(true);    

        //get current user
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return;
        }

        setUserId(user.id);

        //fetch badges from api
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/badges/user/${user.id}`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch badges");
        }

        const data = await response.json();
        setBadges(data.badges || []);
        } catch (error: any) {
        console.error("Error loading badges:", error);
        } finally {
        setLoading(false);
        }
    }

    const earnedCount = badges.filter((b) => b.earned).length;
    const totalCount = badges.length;

    if (loading) {
        return (
        <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
        );
    }

    return (
    <div className="space-y-8">
        {/*stats overview*/}
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Badges</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{earnedCount}</div>
                    <p className="text-xs text-muted-foreground">
                    out of {totalCount} available
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completion</CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                    {totalCount > 0 ? Math.round((earnedCount / totalCount) * 100): 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                    {totalCount - earnedCount} badges remaining
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Latest Badge</CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                    {badges.filter((b) => b.earned).length > 0
                        ? badges
                            .filter((b) => b.earned)
                            .sort((a, b) =>
                            (b.earned_at || "").localeCompare(a.earned_at || "")
                            )[0]?.name || "🏆"
                        : "—"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                    {badges.filter((b) => b.earned).length > 0
                        ? new Date(
                            badges
                            .filter((b) => b.earned)
                            .sort((a, b) =>
                                (b.earned_at || "").localeCompare(a.earned_at || "")
                            )[0]?.earned_at || ""
                        ).toLocaleDateString()
                        : "Complete a workout to earn!"}
                    </p>
                </CardContent>
            </Card>
        </div>

        {/*info message*/}
        <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="h-5 w-5 text-blue-600" />
                How To Earn Badges
            </CardTitle>
            <CardDescription>
                Badges are earned automatically as you complete workouts and build streaks!
            </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
            <ul className="list-disc list-inside space-y-1">
                <li>Complete workouts to earn milestone badges</li>
                <li>Build workout streaks for consistency badges</li>
                <li>Try different workout types for specialized badges</li>
                <li>Check back here to track your progress!</li>
            </ul>
        </CardContent>
        </Card>

        {/*all badges grid*/}
        <div>
            <h2 className="text-2xl font-bold mb-4">All Achievements</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {badges.map((badge) => (
                        <Card
                        key={badge.id}
                        className={
                            badge.earned
                            ? "border-green-200 dark:border-green-900 bg-green-50/20 dark:bg-green-950/20"
                            : "opacity-60"
                        }
                        >
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                <div className="text-4xl">{badge.icon}</div>
                                    <div>
                                        <CardTitle className="text-lg">{badge.name}</CardTitle>
                                        <CardDescription className="text-sm">
                                            {badge.description}
                                        </CardDescription>
                                    </div>
                                </div>
                            {!badge.earned && (
                                <Lock className="h-4 w-4 text-muted-foreground" />
                            )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Status</span>
                                <span className={`font-medium ${badge.earned ? "text-green-600 dark:text-green-400" : ""}`}>
                                {badge.earned ? "Completed!" : "Locked"}
                                </span>
                            </div>
                            {badge.earned && badge.earned_at && (
                                <div className="text-xs text-muted-foreground">
                                Earned on{" "}
                                {new Date(badge.earned_at).toLocaleDateString()}
                                </div>
                            )}
                            {!badge.earned && (
                                <div className="text-xs text-muted-foreground">
                                Keep working out to unlock!
                                </div>
                            )}
                            </div>
                        </CardContent>
                        </Card>
                    ))}
                </div>
        </div>
    </div>
    );
}