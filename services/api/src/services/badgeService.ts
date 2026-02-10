import { supabase } from "../clients/supabaseClient";
import type { Badge, UserBadge, BadgeCriteria } from "../types/badges";

//badge service, handles all badge evaluation and awarding logic
interface BadgeCheckResult {
    badge: Badge;
    earned: boolean;
    alreadyHad: boolean;
}

interface WorkoutStats {
    totalWorkouts: number;
    currentStreak: number;
    longestStreak: number;
    morningWorkouts: number;
    strengthWorkouts: number;
    cardioWorkouts: number;
}

//check and award all applicable badges for a user
export async function checkAndAwardBadges(userId: string): Promise<{
    success: boolean;
    newlyEarnedBadges: Badge[];
    error?: string;
}> {
    try{
        //get all badges
        const { data: allBadges, error: badgesError } = await supabase
            .from("badges")
            .select("*");

        if(badgesError) throw badgesError;
        if(!allBadges || allBadges.length === 0) {
            return { success: true, newlyEarnedBadges: [] }; //no badges to earn
        }

        //get users current badges
        const {data: earnedBadges, error: earnedError } = await supabase
            .from("user_badges")
            .select("badge_id")
            .eq("user_id", userId);

        if(earnedError) throw earnedError;

        const earnedBadgeIds = new Set(earnedBadges?.map(ub => ub.badge_id) || []);

        //get users workout statistics
        const stats = await getUserWorkoutStats(userId);

        //check each badge
        const newlyEarned: Badge[] = [];

        for(const badge of allBadges as Badge[]){
            //skip if user already has badge
            if(earnedBadgeIds.has(badge.id)) {continue;}

            //check if criteria is met
            const earned = await evaluateBadgeCriteria(badge.criteria, stats, userId);

            if(earned){
                //award the badge
                const {error: awardError} = await supabase
                    .from("user_badges")
                    .insert({
                        user_id: userId,
                        badge_id: badge.id,
                    });

                if (!awardError){
                    newlyEarned.push(badge);
                }else{
                    console.error(`Error awarding badge ${badge.code} to user ${userId}:`, awardError);
                }
            }
        }

        return {
            success: true,
            newlyEarnedBadges: newlyEarned,
        };
    } catch (error: any) {
        console.error("Error in checking badges:", error);
        return {
            success: false,
            newlyEarnedBadges: [],
            error: error.message || "Unknown error",
        };
    }
}

//get workout statistics for a user
async function getUserWorkoutStats(userId:string): Promise<WorkoutStats> {
    
    //get total completed workouts
    const { count: totalWorkouts } = await supabase
        .from("workouts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "completed");

    //get streak data
    const { data: streakData } = await supabase
        .from("streaks")
        .select("current_days, longest_days")
        .eq("user_id", userId)
        .single();

  //get morning workouts (workouts completed before 12pm)
    const { data: allWorkouts } = await supabase
        .from("workouts")
        .select("completed_at")
        .eq("user_id", userId)
        .eq("status", "completed")
        .not("completed_at", "is", null);

    let morningWorkouts = 0;
    if (allWorkouts) {
        morningWorkouts = allWorkouts.filter(w => {
        if (!w.completed_at) return false;
        const hour = new Date(w.completed_at).getHours();
        return hour < 12;
        }).length;
    }

    //get strength and cardio workouts
    const { data: workoutSets } = await supabase
    .from("workout_sets")
    .select("exercise_name, workout_id")
    .in(
        "workout_id",
        (await supabase
            .from("workouts")
            .select("id")
            .eq("user_id", userId)
            .eq("status", "completed")
            .then(({ data }) => data?.map(w => w.id) || []))
        );

    let strengthWorkouts = 0;
    let cardioWorkouts = 0;

    if (workoutSets) {
        const workoutTypes = new Map<string, "strength" | "cardio" | "unknown">();

        for (const set of workoutSets) {
        const name = set.exercise_name.toLowerCase();
        const workoutId = set.workout_id;

        if (!workoutTypes.has(workoutId)) {
            //determine workout type based on exercise names
            if (
            name.includes("squat") ||
            name.includes("deadlift") ||
            name.includes("bench") ||
            name.includes("press") ||
            name.includes("row") ||
            name.includes("curl") ||
            name.includes("pull")
            ) {
            workoutTypes.set(workoutId, "strength");
            } else if (
            name.includes("run") ||
            name.includes("bike") ||
            name.includes("cycle") ||
            name.includes("cardio") ||
            name.includes("treadmill")
            ) {
            workoutTypes.set(workoutId, "cardio");
            }
        }
        }

        strengthWorkouts = Array.from(workoutTypes.values()).filter(t => t === "strength").length;
        cardioWorkouts = Array.from(workoutTypes.values()).filter(t => t === "cardio").length;
    }

    return {
        totalWorkouts: totalWorkouts || 0,
        currentStreak: streakData?.current_days || 0,
        longestStreak: streakData?.longest_days || 0,
        morningWorkouts,
        strengthWorkouts,
        cardioWorkouts,
    };
}


//evaluate if a badges criteria is met
async function evaluateBadgeCriteria(
    criteria: BadgeCriteria,
    stats: WorkoutStats,
    userId: string
): Promise<boolean> {
    switch (criteria.type) {
        case "workout_count":
        return stats.totalWorkouts >= criteria.target;

        case "streak":
        return stats.currentStreak >= criteria.target || stats.longestStreak >= criteria.target;

        case "morning_workout":
        return stats.morningWorkouts >= criteria.target;

        case "workout_type":
        if (criteria.workout_type === "strength") {
            return stats.strengthWorkouts >= criteria.target;
        } else if (criteria.workout_type === "cardio") {
            return stats.cardioWorkouts >= criteria.target;
        }
        return false;

        default:
        console.warn(`Unknown badge criteria type: ${(criteria as any).type}`);
        return false;
    }
}


//update users workout streak. should be called daily or after each workout
export async function updateUserStreak(userId: string): Promise<void> {
    try {
        //get the users last workout
        const { data: lastWorkout } = await supabase
        .from("workouts")
        .select("completed_at")
        .eq("user_id", userId)
        .eq("status", "completed")
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(1)
        .single();

        if (!lastWorkout || !lastWorkout.completed_at) {
        return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastWorkoutDate = new Date(lastWorkout.completed_at);
        lastWorkoutDate.setHours(0, 0, 0, 0);

        //get or create streak record
        const { data: existingStreak } = await supabase
        .from("streaks")
        .select("*")
        .eq("user_id", userId)
        .single();

        if (!existingStreak) {

        //create new streak
        await supabase.from("streaks").insert({
            user_id: userId,
            current_days: 1,
            longest_days: 1,
            last_active_date: today.toISOString().split("T")[0],
        });
        return;
        }

        const lastActiveDate = existingStreak.last_active_date
        ? new Date(existingStreak.last_active_date)
        : null;

        if (!lastActiveDate) {

        //no previous date, start fresh
        await supabase
            .from("streaks")
            .update({
            current_days: 1,
            longest_days: Math.max(1, existingStreak.longest_days),
            last_active_date: today.toISOString().split("T")[0],
            })
            .eq("user_id", userId);
        return;
        }

        lastActiveDate.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor(
        (today.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff === 0) {

        //same day, no update needed
        return;
        } else if (daysDiff === 1) {

        //consecutive day, increment streak
        const newStreak = existingStreak.current_days + 1;
        await supabase
            .from("streaks")
            .update({
            current_days: newStreak,
            longest_days: Math.max(newStreak, existingStreak.longest_days),
            last_active_date: today.toISOString().split("T")[0],
            })
            .eq("user_id", userId);
        } else {

        //streak broken, reset to 1
        await supabase
            .from("streaks")
            .update({
            current_days: 1,
            longest_days: existingStreak.longest_days, //keep the longest
            last_active_date: today.toISOString().split("T")[0],
            })
            .eq("user_id", userId);
        }
    } catch (error) {
        console.error("Error updating streak:", error);
    }
}