//badge types for achievements/badges feature
export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  criteria: BadgeCriteria;
  created_at: string;
}

export interface BadgeCriteria {
  type: "workout_count" | "streak" | "morning_workout" | "workout_type";
  target: number;
  workout_type?: "strength" | "cardio" | "yoga" | "flexibility";
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  awarded_at: string;
  badge?: Badge;
}

export interface Streak {
  id: string;
  user_id: string;
  current_days: number;
  longest_days: number;
  last_active_date: string | null;
  updated_at: string;
}

export interface BadgeWithEarnedStatus extends Badge {
  earned: boolean;
  earned_at?: string;
}

export interface AwardBadgeRequest {
  user_id: string;
  badge_code: string;
}

export interface AwardBadgeResponse {
  success: boolean;
  badge?: UserBadge;
  message?: string;
}
//