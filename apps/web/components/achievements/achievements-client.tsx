"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge, Award, Lock, Trophy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

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
    const [awarding, setAwarding] = useState<string | null>(null);
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
            toast.error("Please sign in to view achievements");
            return;
        }

        setUserId(user.id);

        //fetch badges
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
        toast.error("Failed to load achievements");
        } finally {
        setLoading(false);
        }
    }

    async function awardBadge(badgeCode: string) {
        if (!userId) {
        toast.error("Please sign in to earn badges");
        return;
        }

        try {
        setAwarding(badgeCode);

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/badges/award`,
            {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: userId,
                badge_code: badgeCode,
            }),
            }
        );

        const data = await response.json();

        if (data.success) {
            toast.success(data.message || "Badge earned!");
            await loadBadges();
        } else {
            toast.error(data.message || "Failed to award badge");
        }
        } catch (error: any) {
        console.error("Error awarding badge:", error);
        toast.error("Failed to award badge");
        } finally {
        setAwarding(null);
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
        {/*stats*/}
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
                <Badge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                {totalCount > 0
                    ? Math.round((earnedCount / totalCount) * 100)
                    : 0}
                %
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
                        )[0]?.icon || "🏆"
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
                    : "No badges yet"}
                </p>
            </CardContent>
            </Card>
        </div>

        {/*testing panel*/}
        <Card className="border-primary/10 bg-primary/[0.02]">
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Demo Testing Panel
            </CardTitle>
            <CardDescription>
                Click buttons below to simulate earning badges (for prototype demo)
            </CardDescription>
            </CardHeader>
            <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {badges.map((badge) => (
                <Button
                    key={badge.code}
                    variant={badge.earned ? "secondary" : "default"}
                    className="h-auto flex-col gap-1 py-3"
                    onClick={() => awardBadge(badge.code)}
                    disabled={badge.earned || awarding === badge.code}
                >
                    {awarding === badge.code ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                    <>
                        <span className="text-2xl">{badge.icon}</span>
                        <span className="text-xs font-medium">{badge.name}</span>
                    </>
                    )}
                </Button>
                ))}
            </div>
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
                    ? "border-green-200 dark:border-green-900"
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
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                        {badge.earned ? "Completed!" : "Locked"}
                        </span>
                    </div>
                    {badge.earned && badge.earned_at && (
                        <div className="text-xs text-muted-foreground">
                        Earned on{" "}
                        {new Date(badge.earned_at).toLocaleDateString()}
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