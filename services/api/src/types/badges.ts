//This file contains all TypeScript interfaces and types related to the achievements and badges system.

//badge criteria config
export interface BadgeCriteria {
    type: "workout_count" | "streak" | "morning_workout" | "workout_type";
    target: number;
    workout_type?: "strength" | "cardio" | "yoga" | "flexibility";
}

//badge database record
export interface Badge {
    id: string;
    code: string;
    name: string;
    description: string | null;
    icon: string | null;
    criteria: BadgeCriteria;
    created_at: string;
}

//user badge junction record
export interface UserBadge {
    id: string;
    user_id: string;
    badge_id: string;
    awarded_at: string;
    badge?: Badge;
}

//streak tracking record
export interface Streak {
    id: string;
    user_id: string;
    current_days: number;
    longest_days: number;
    last_active_date: string | null;
    updated_at: string;
}

//badge with earned status for API responses
export interface BadgeWithEarnedStatus extends Badge {
    earned: boolean;
    earned_at?: string;
}

//request body for awarding a badge
export interface AwardBadgeRequest {
    user_id: string;
    badge_code: string;
}

//response format for awarding a badge
export interface AwardBadgeResponse {
    success: boolean;
    badge?: UserBadge;
    message?: string;
    }

//interfaces for badge service
export interface BadgeCheckResult {
    badge: Badge;
    earned: boolean;
    alreadyHad: boolean;
}

export interface WorkoutStats {
    totalWorkouts: number;
    currentStreak: number;
    longestStreak: number;
    morningWorkouts: number;
    strengthWorkouts: number;
    cardioWorkouts: number;
}