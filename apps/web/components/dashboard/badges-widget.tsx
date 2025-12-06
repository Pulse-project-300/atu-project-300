"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, ChevronRight, Award } from "lucide-react";

interface BadgeWithEarnedStatus {
    id: string;
    code: string;
    name: string;
    icon: string | null;
    earned: boolean;
    earned_at?: string;
}

export function BadgesWidget() {
    const [badges, setBadges] = useState<BadgeWithEarnedStatus[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        loadBadges();
    }, []);

    async function loadBadges() {
        try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/badges/user/${user.id}`
        );

        if (response.ok) {
            const data = await response.json();
            setBadges(data.badges || []);
        }
        } catch (error) {
        console.error("Error loading badges:", error);
        } finally {
        setLoading(false);
        }
    }

    const earnedBadges = badges
        .filter((b) => b.earned)
        .sort((a, b) => (b.earned_at || "").localeCompare(a.earned_at || ""))
        .slice(0, 3);

    const earnedCount = badges.filter((b) => b.earned).length;
    const totalCount = badges.length;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-purple-600" />
                        Achievements
                    </CardTitle>
                    <CardDescription>
                        {earnedCount} of {totalCount} badges earned
                    </CardDescription>
                </div>
                <Link href="/achievements">
                    <Button variant="ghost" size="sm">
                        View All
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                {loading ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
                ) : earnedBadges.length > 0 ? (
                <div className="space-y-3">
                    {earnedBadges.map((badge) => (
                    <div
                        key={badge.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                        <div className="text-2xl">{badge.icon}</div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                                {badge.name}
                        </div>
                            <div className="text-xs text-muted-foreground">
                                {badge.earned_at &&
                                new Date(badge.earned_at).toLocaleDateString()}
                            </div>
                        </div>
                        <Award className="h-4 w-4 text-green-600" />
                    </div>
                    ))}
                </div>
                ) : (
                <div className="text-center py-6">
                    <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">
                    Complete workouts to earn your first badge!
                    </p>
                    <Link href="/achievements">
                        <Button variant="outline" size="sm" className="mt-3">
                            View Achievements
                        </Button>
                    </Link>
                </div>
                )}
            </CardContent>
        </Card>
    );
}