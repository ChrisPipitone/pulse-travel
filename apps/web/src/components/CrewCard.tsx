"use client";

import type { Activity, Member, Rating, CrewRowData } from "@pulse/types";
import { RATING_BUTTON, RATING_LABELS } from "@pulse/types";
import { AVATAR_PREVIEW_CAP } from "@/lib/constants";
import { MemberAvatar } from "@/components/MemberAvatar";
import { KebabMenu } from "@/components/KebabMenu";

export type { CrewRowData } from "@pulse/types";

export const CHIP_RING: Record<Rating, string> = {
  MUST:  'var(--must-bg)',
  MAYBE: '#B8960A',
  SKIP:  'var(--text-subtle)',
};

export function PinIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 opacity-60"
    >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

export function AvatarChip({
  member,
  isYou = false,
  soft = false,
  rating,
}: {
  member: Member;
  isYou?: boolean;
  soft?: boolean;
  rating?: Rating;
}) {
  const ring = isYou && rating ? CHIP_RING[rating] : undefined;
  return (
    <div
      className={`flex items-center gap-1.5 bg-bg-card border border-border rounded-full pl-1 pr-2.5 py-1 text-xs font-medium text-text-primary ${soft ? "opacity-65" : ""}`}
      style={{
        outline: ring ? `1.5px solid ${ring}` : undefined,
        outlineOffset: ring ? '2px' : undefined,
      }}
    >
      <MemberAvatar name={member.name} avatarUrl={member.avatar_url} size="sm" />
      <span>{isYou ? "You" : member.name.split(" ")[0]}</span>
    </div>
  );
}

export function StatusPill({ rating }: { rating: Rating | null }) {
  if (rating === "MUST")
    return (
      <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full bg-must text-must-text whitespace-nowrap">
        ✓ Going
      </span>
    );
  if (rating === "MAYBE")
    return (
      <span
        className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
        style={{ background: "rgba(255,229,102,.7)", color: "#7A6200" }}
      >
        Maybe
      </span>
    );
  if (rating === "SKIP")
    return (
      <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap bg-border text-text-muted">
        Skipping
      </span>
    );
  return (
    <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap border border-accent text-accent bg-transparent">
      Rate this →
    </span>
  );
}

function AvatarRow({
  mustMembers,
  maybeMembers,
  userId,
}: {
  mustMembers: Member[];
  maybeMembers: Member[];
  userId?: string;
}) {
  const allShown = [...mustMembers, ...maybeMembers].slice(0, AVATAR_PREVIEW_CAP);
  const overflow = mustMembers.length + maybeMembers.length - allShown.length;
  const mustSet = new Set(mustMembers.map((m) => m.id));
  return (
    <div className="flex items-center">
      <div className="flex">
        {allShown.map((m, i) => {
          const isMaybe = !mustSet.has(m.id);
          return (
            <span
              key={m.id}
              title={m.name}
              style={{
                marginLeft: i > 0 ? "-6px" : 0,
                opacity: isMaybe ? 0.6 : 1,
                borderRadius: "9999px",
                display: "inline-flex",
              }}
            >
              <MemberAvatar
                name={m.name}
                avatarUrl={m.avatar_url}
                size="md"
                overlap={i > 0}
              />
            </span>
          );
        })}
      </div>
      {overflow > 0 && (
        <span className="ml-2 text-[10px] font-semibold text-text-muted bg-border rounded-full px-2 py-0.5 whitespace-nowrap">
          +{overflow} more
        </span>
      )}
    </div>
  );
}

function TierBlock({
  mustMembers,
  maybeMembers,
}: {
  mustMembers: Member[];
  maybeMembers: Member[];
}) {
  return (
    <div className="flex flex-col">
      {mustMembers.length > 0 && (
        <div className="flex items-center gap-2 py-0.5">
          <div className="flex">
            {mustMembers.map((m, i) => (
              <MemberAvatar key={m.id} name={m.name} avatarUrl={m.avatar_url} size="md" overlap={i > 0} />
            ))}
          </div>
          <span className="text-xs text-text-muted truncate">
            {mustMembers.map((m) => m.name.split(" ")[0]).join(", ")}
          </span>
        </div>
      )}
      {mustMembers.length > 0 && maybeMembers.length > 0 && (
        <div className="h-px bg-border my-1" />
      )}
      {maybeMembers.length > 0 && (
        <div className="flex items-center gap-2 py-0.5 opacity-60">
          <div className="flex">
            {maybeMembers.map((m, i) => (
              <MemberAvatar key={m.id} name={m.name} avatarUrl={m.avatar_url} size="md" overlap={i > 0} />
            ))}
          </div>
          <span className="text-xs text-text-muted truncate">
            {maybeMembers.map((m) => m.name.split(" ")[0]).join(", ")}
          </span>
        </div>
      )}
    </div>
  );
}

export type ActivityStatus = {
  label: string;
  bg: string;
  color: string;
};

export function activityStatusLabel(
  must: number,
  maybe: number,
  skip: number,
  total: number,
): ActivityStatus | null {
  if (must + maybe + skip < 2) return null;

  if (must >= Math.ceil(total * 0.75) && skip === 0)
    return { label: "Universal Favorite", bg: "rgba(255,92,53,.12)", color: "var(--must-bg)" };

  if (must >= 2 && skip >= 2)
    return { label: "Split Crowd", bg: "rgba(217,119,6,.12)", color: "#B45309" };

  if (must >= Math.ceil(total * 0.5) && skip === 0)
    return { label: "Strong Match", bg: "rgba(22,163,74,.1)", color: "#16A34A" };

  if (maybe >= 2 && maybe > must && skip === 0)
    return { label: "Safe Consensus", bg: "rgba(59,130,246,.1)", color: "#2563EB" };

  if (must >= 1 && skip === 0 && must < Math.ceil(total * 0.5))
    return { label: "Niche Favorite", bg: "rgba(124,58,237,.1)", color: "#7C3AED" };

  return null;
}

function CrewFooter({
  mustCount,
  maybeCount,
  skipCount,
  totalMembers,
}: {
  mustCount: number;
  maybeCount: number;
  skipCount: number;
  totalMembers: number;
}) {
  const status = activityStatusLabel(mustCount, maybeCount, skipCount, totalMembers);
  return (
    <div className="flex flex-col gap-1 pt-2.5 border-t border-border">
      {status && (
        <span
          className="self-start text-[11px] font-semibold px-2.5 py-0.5 rounded-full mb-0.5"
          style={{ background: status.bg, color: status.color }}
        >
          {status.label}
        </span>
      )}
      <div className="flex items-center gap-1.5 flex-wrap">
        {mustCount > 0 && (
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(255,92,53,.1)", color: "var(--must-bg)" }}
          >
            {mustCount} going
          </span>
        )}
        {maybeCount > 0 && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-border text-text-subtle">
            {maybeCount} maybe
          </span>
        )}
      </div>
    </div>
  );
}

export function CrewCard({
  row,
  userId,
  canEdit,
  selected,
  onOpen,
  onEdit,
  onDelete,
}: {
  row: CrewRowData;
  userId?: string;
  canEdit?: boolean;
  selected?: boolean;
  onOpen: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const { activity, mustMembers, maybeMembers, skipMembers, unratedMembers, myRating, mustCount, maybeCount } = row;
  const totalMembers = mustCount + maybeCount + skipMembers.length + unratedMembers.length;

  const stripeColor =
    myRating === "MUST" ? "var(--must-bg)" : myRating === "MAYBE" ? "#FFE566" : "#E8E6E0";
  const cardBg =
    myRating === "MUST"
      ? "linear-gradient(135deg,rgba(255,92,53,.04) 0%,var(--bg-card) 55%)"
      : "var(--bg-card)";

  const isEmpty = mustCount === 0 && maybeCount === 0;

  return (
    <div
      onClick={onOpen}
      className={`rounded-[var(--radius-card)] border overflow-hidden cursor-pointer flex transition-all hover:shadow-md hover:-translate-y-px active:scale-[.998] ${isEmpty ? "opacity-40" : ""} ${selected ? "border-accent/50 shadow-sm" : "border-border"}`}
      style={{ background: cardBg }}
    >
      <div className="w-1 shrink-0" style={{ background: stripeColor }} />
      <div className="flex-1 min-w-0 px-4 py-3.5 flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-bold text-text-primary leading-snug">{activity.name}</p>
            {activity.location && (
              <div className="flex items-center gap-1 mt-0.5 text-[11px] text-text-muted">
                <PinIcon />
                <span className="truncate">{activity.location}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {canEdit && (onEdit || onDelete) && (
              <KebabMenu
                items={[
                  ...(onEdit ? [{ label: "Edit", onClick: onEdit }] : []),
                  ...(onDelete ? [{ label: "Delete", danger: true as const, onClick: onDelete }] : []),
                ]}
              />
            )}
            <StatusPill rating={myRating} />
          </div>
        </div>

        {isEmpty ? (
          <p className="text-xs text-text-subtle">Nobody&apos;s excited yet.</p>
        ) : myRating === "MUST" ? (
          <AvatarRow mustMembers={mustMembers} maybeMembers={maybeMembers} userId={userId} />
        ) : (
          <TierBlock mustMembers={mustMembers} maybeMembers={maybeMembers} />
        )}

        {!isEmpty && (
          <CrewFooter
            mustCount={mustCount}
            maybeCount={maybeCount}
            skipCount={skipMembers.length}
            totalMembers={totalMembers}
          />
        )}
      </div>
    </div>
  );
}
