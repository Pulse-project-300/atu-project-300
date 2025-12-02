import { Router, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import type {Badge, UserBadge, BadgeWithEarnedStatus, AwardBadgeRequest, AwardBadgeResponse,} from "@repo/types";

const router = Router();

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

//get badges
router.get("/", async (req: Request, res: Response) => {
    try {
        const { data: badges, error } = await supabase
        .from("badges")
        .select("*")
        .order("created_at", { ascending: true });

        if (error) throw error;

        res.json({ success: true, badges });
    } catch (error: any) {
        console.error("Error fetching badges:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

//get badges for specific user
router.get("/user/:userId", async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const { data: allBadges, error: badgesError } = await supabase
        .from("badges")
        .select("*")
        .order("created_at", { ascending: true });

        if (badgesError) throw badgesError;

        const { data: earnedBadges, error: earnedError } = await supabase
        .from("user_badges")
        .select("badge_id, awarded_at")
        .eq("user_id", userId);

        if (earnedError) throw earnedError;

        const earnedMap = new Map(
        earnedBadges?.map((ub) => [ub.badge_id, ub.awarded_at]) || []
        );

        const badgesWithStatus: BadgeWithEarnedStatus[] =
        allBadges?.map((badge) => ({
            ...badge,
            earned: earnedMap.has(badge.id),
            earned_at: earnedMap.get(badge.id),
        })) || [];

        res.json({ success: true, badges: badgesWithStatus });
    } catch (error: any) {
        console.error("Error fetching user badges:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});


//give badge to user
router.post("/award", async (req: Request, res: Response) => {
    try {
        const { user_id, badge_code }: AwardBadgeRequest = req.body;

        if (!user_id || !badge_code) {
        return res.status(400).json({
            success: false,
            message: "user_id and badge_code are required",
        });
        }

        const { data: badge, error: badgeError } = await supabase
        .from("badges")
        .select("*")
        .eq("code", badge_code)
        .single();

        if (badgeError || !badge) {
        return res.status(404).json({
            success: false,
            message: `Badge with code "${badge_code}" not found`,
        });
        }

        const { data: existing, error: existingError } = await supabase
        .from("user_badges")
        .select("*")
        .eq("user_id", user_id)
        .eq("badge_id", badge.id)
        .maybeSingle();

        if (existingError) throw existingError;

        if (existing) {
        return res.json({
            success: true,
            message: "Badge already earned",
            badge: existing,
        } as AwardBadgeResponse);
    }

    const { data: newBadge, error: awardError } = await supabase
        .from("user_badges")
        .insert({
            user_id,
            badge_id: badge.id,
        })
        .select()
        .single();

    if (awardError) throw awardError;

    res.json({
        success: true,
        message: `Badge "${badge.name}" awarded!`,
        badge: newBadge,
        } as AwardBadgeResponse);
    } catch (error: any) {
        console.error("Error awarding badge:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

//get badge details
router.get("/:badgeId", async (req: Request, res: Response) => {
    try {
        const { badgeId } = req.params;

        const { data: badge, error } = await supabase
        .from("badges")
        .select("*")
        .eq("id", badgeId)
        .single();

        if (error) throw error;

        if (!badge) {
        return res
            .status(404)
            .json({ success: false, message: "Badge not found" });
        }

        res.json({ success: true, badge });
    } catch (error: any) {
        console.error("Error fetching badge:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;