import { useMemo } from "react";
import type { Activity, ActivityRating, Member, CrewRowData, SortKey } from "@pulse/types";

export function useCrewRows({
  activities,
  members,
  ratings,
  userId,
  sortKey,
}: {
  activities: Activity[];
  members: Member[];
  ratings: ActivityRating[];
  userId: string | undefined;
  sortKey: SortKey;
}): CrewRowData[] {
  return useMemo(() => {
    return activities
      .map((activity) => {
        const actRatings = ratings.filter((r) => r.activity_id === activity.id);
        const ratingMap = new Map(actRatings.map((r) => [r.user_id, r.rating]));
        const mustMembers = members.filter((m) => ratingMap.get(m.id) === "MUST");
        const maybeMembers = members.filter((m) => ratingMap.get(m.id) === "MAYBE");
        const skipMembers = members.filter((m) => ratingMap.get(m.id) === "SKIP");
        const ratedIds = new Set(actRatings.map((r) => r.user_id));
        const unratedMembers = members.filter((m) => !ratedIds.has(m.id));
        const myRating = userId ? (ratingMap.get(userId) ?? null) : null;
        return {
          activity,
          mustMembers,
          maybeMembers,
          skipMembers,
          unratedMembers,
          myRating,
          mustCount: mustMembers.length,
          maybeCount: maybeMembers.length,
        };
      })
      .sort((a, b) => {
        if (sortKey === "by-stop") {
          return b.mustCount * 3 + b.maybeCount - (a.mustCount * 3 + a.maybeCount);
        }
        if (sortKey === "my-recs") {
          const aMe = a.activity.added_by === userId ? 0 : 1;
          const bMe = b.activity.added_by === userId ? 0 : 1;
          if (aMe !== bMe) return aMe - bMe;
        }
        if (sortKey === "cant-miss") {
          const TIER: Record<string, number> = { MUST: 0, MAYBE: 1, SKIP: 2 };
          const av = a.myRating ? (TIER[a.myRating] ?? 3) : 3;
          const bv = b.myRating ? (TIER[b.myRating] ?? 3) : 3;
          if (av !== bv) return av - bv;
        }
        if (sortKey === "newest") {
          return (
            new Date(b.activity.created_at).getTime() -
            new Date(a.activity.created_at).getTime()
          );
        }
        return b.mustCount * 3 + b.maybeCount - (a.mustCount * 3 + a.maybeCount);
      });
  }, [activities, members, ratings, userId, sortKey]);
}
