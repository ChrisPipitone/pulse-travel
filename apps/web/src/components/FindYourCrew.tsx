"use client";

import { useState, useMemo } from "react";
import { useModalEscape } from "@/hooks/useModalEscape";
import { useTripStore } from "@pulse/store";
import { useSession } from "@pulse/hooks";
import { useRateActivity } from "@pulse/hooks";
import type { Activity, Member, Rating, Stop } from "@pulse/types";
import { MemberAvatar } from "@/components/MemberAvatar";
import { KebabMenu } from "@/components/KebabMenu";

type SortKey = "popular" | "my-recs" | "cant-miss" | "newest" | "by-stop";

const SORT_LABELS: Record<SortKey, string> = {
  popular: "Popular",
  "cant-miss": "Can't Miss",
  "my-recs": "My Recs",
  newest: "Newest",
  "by-stop": "By Stop",
};

// ── Shared types ──────────────────────────────────────────────────────────────

interface CrewRowData {
  activity: Activity;
  mustMembers: Member[];
  wantMembers: Member[];
  maybeMembers: Member[];
  skipMembers: Member[];
  unratedMembers: Member[];
  myRating: Rating | null;
  mustCount: number;
  wantCount: number;
  maybeCount: number;
}

// ── Pin icon ──────────────────────────────────────────────────────────────────

function PinIcon() {
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

// ── Avatar chip (with name label) ─────────────────────────────────────────────

function AvatarChip({
  member,
  isYou = false,
  soft = false,
}: {
  member: Member;
  isYou?: boolean;
  soft?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 bg-bg-card border border-border rounded-full pl-1 pr-2.5 py-1 text-xs font-medium text-text-primary ${soft ? "opacity-65" : ""}`}
    >
      <span
        style={
          isYou
            ? { boxShadow: `0 0 0 2px var(--accent), 0 0 0 3.5px var(--bg-card)`, borderRadius: "9999px", display: "inline-flex" }
            : undefined
        }
      >
        <MemberAvatar name={member.name} avatarUrl={member.avatar_url} size="sm" />
      </span>
      <span>{isYou ? "You" : member.name.split(" ")[0]}</span>
    </div>
  );
}

// ── Status pill ───────────────────────────────────────────────────────────────

function StatusPill({ rating }: { rating: Rating | null }) {
  if (rating === "MUST")
    return (
      <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full bg-must text-must-text whitespace-nowrap">
        ✓ Going
      </span>
    );
  if (rating === "WANT")
    return (
      <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full bg-want text-want-text whitespace-nowrap">
        Likely going
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
  return (
    <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap border border-accent text-accent bg-transparent">
      Rate this →
    </span>
  );
}

// ── Inline overlapping avatar row (for MUST state cards) ─────────────────────

function AvatarRow({
  mustMembers,
  wantMembers,
  userId,
}: {
  mustMembers: Member[];
  wantMembers: Member[];
  userId?: string;
}) {
  const allShown = [...mustMembers, ...wantMembers].slice(0, 5);
  const overflow = mustMembers.length + wantMembers.length - allShown.length;
  const mustSet = new Set(mustMembers.map((m) => m.id));
  return (
    <div className="flex items-center">
      <div className="flex">
        {allShown.map((m, i) => {
          const isWant = !mustSet.has(m.id);
          const isYou = m.id === userId;
          return (
            <span
              key={m.id}
              title={m.name}
              style={{
                marginLeft: i > 0 ? "-6px" : 0,
                opacity: isWant ? 0.6 : 1,
                boxShadow: isYou ? "0 0 0 2px var(--accent)" : undefined,
                borderRadius: "9999px",
                display: "inline-flex",
              }}
            >
              <MemberAvatar name={m.name} avatarUrl={m.avatar_url} size="md" overlap={i > 0} />
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

// ── Two-tier crew block (WANT/MAYBE/Unrated states) ───────────────────────────

function TierBlock({
  mustMembers,
  wantMembers,
  maybeMembers,
  userId,
  myRating,
}: {
  mustMembers: Member[];
  wantMembers: Member[];
  maybeMembers: Member[];
  userId?: string;
  myRating: Rating | null;
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

      {mustMembers.length > 0 && wantMembers.length > 0 && (
        <div className="h-px bg-border my-1" />
      )}

      {wantMembers.length > 0 && (
        <div className="flex items-center gap-2 py-0.5 opacity-60">
          <div className="flex">
            {wantMembers.map((m, i) => (
              <MemberAvatar key={m.id} name={m.name} avatarUrl={m.avatar_url} size="md" overlap={i > 0} />
            ))}
          </div>
          <span className="text-xs text-text-muted truncate">
            {wantMembers.map((m) => m.name.split(" ")[0]).join(", ")}
          </span>
        </div>
      )}

      {/* Maybe row — only if user is in maybe, de-emphasized */}
      {maybeMembers.length > 0 &&
        (myRating === "MAYBE" || myRating === null) && (
          <div className="flex items-center gap-2 py-0.5 mt-0.5 opacity-35">
            <div className="w-1.5 h-1.5 rounded-full bg-maybe-text shrink-0" />
            <div className="flex">
              {maybeMembers.slice(0, 3).map((m, i) => (
                <MemberAvatar key={m.id} name={m.name} avatarUrl={m.avatar_url} size="sm" overlap={i > 0} />
              ))}
            </div>
            <span className="text-[10px] text-text-subtle truncate">
              {maybeMembers
                .slice(0, 2)
                .map((m) => (m.id === userId ? "You" : m.name.split(" ")[0]))
                .join(", ")}{" "}
              maybe
            </span>
          </div>
        )}
    </div>
  );
}

// ── Crew count pills ──────────────────────────────────────────────────────────

function CrewFooter({
  mustCount,
  wantCount,
  maybeCount,
}: {
  mustCount: number;
  wantCount: number;
  maybeCount: number;
}) {
  return (
    <div className="flex items-center gap-1.5 pt-2.5 border-t border-border flex-wrap">
      {mustCount > 0 && (
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: "rgba(255,92,53,.1)", color: "var(--must-bg)" }}
        >
          {mustCount} going
        </span>
      )}
      {wantCount > 0 && (
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: "rgba(0,201,167,.1)", color: "var(--want-bg)" }}
        >
          {wantCount} likely
        </span>
      )}
      {maybeCount > 0 && (
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-border text-text-subtle">
          {maybeCount} maybe
        </span>
      )}
    </div>
  );
}

// ── D2 Modal ──────────────────────────────────────────────────────────────────

function CrewModalD2({
  row,
  userId,
  onClose,
  onRate,
  ratingLoading,
}: {
  row: CrewRowData;
  userId?: string;
  onClose: () => void;
  onRate: (r: Rating) => void;
  ratingLoading: boolean;
}) {
  const {
    activity,
    mustMembers,
    wantMembers,
    maybeMembers,
    skipMembers,
    unratedMembers,
    myRating,
  } = row;

  const [pendingRating, setPendingRating] = useState<Rating | null>(myRating);

  useModalEscape(onClose)

  function handleRate(r: Rating) {
    const next = pendingRating === r ? null : r;
    setPendingRating(next);
    onRate(r);
  }

  // What's-next content by rating
  const nextCallout =
    myRating === "MUST"
      ? {
          icon: "🤝",
          head: `You're in — ${mustMembers.length} people confirmed.`,
          sub: "Plan it to lock in dates and finalize your crew.",
        }
      : myRating === "WANT"
        ? {
            icon: "⏳",
            head: "You're in — pending timing.",
            sub: "Plan it to see who makes the final cut.",
          }
        : myRating === "MAYBE"
          ? {
              icon: "🤔",
              head: "You're on the sidelines.",
              sub: "Join the crew if you want in — change your rating to commit.",
            }
          : {
              icon: "👋",
              head: `${mustMembers.length + wantMembers.length} people have opinions — what's yours?`,
              sub: "Rate it and see where you land in the crew.",
            };

  // Members in likely section — mark "you" distinctly
  const likelyLabel =
    myRating === "WANT"
      ? "Likely — including you"
      : "Likely — in unless timing conflicts";

  const showOthers = maybeMembers.length > 0 || skipMembers.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="modal-overlay absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="modal-panel relative bg-bg-card rounded-t-[var(--radius-card)] sm:rounded-[var(--radius-card)] border border-border w-full sm:max-w-[520px] max-h-[92vh] sm:max-h-[86vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-border sticky top-0 bg-bg-card z-10">
          <div className="min-w-0">
            <p className="text-[17px] font-bold text-text-primary leading-snug">
              {activity.name}
            </p>
            {activity.location && (
              <div className="flex items-center gap-1 mt-1 text-xs text-text-muted">
                <PinIcon />
                <span>{activity.location}</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 text-text-subtle hover:text-text-primary p-1 rounded-lg transition-colors mt-1"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-3.5 px-5 py-4 flex-1">
          {/* Definite crew */}
          {mustMembers.length > 0 && (
            <div
              className="rounded-xl p-3 flex flex-col gap-2.5"
              style={{
                background: "rgba(255,92,53,.05)",
                border: "1px solid rgba(255,92,53,.15)",
              }}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.08em] text-text-subtle">
                <span
                  className="w-[7px] h-[7px] rounded-full shrink-0"
                  style={{ background: "var(--must-bg)" }}
                />
                Definite crew
              </div>
              <div className="flex flex-wrap gap-1.5">
                {mustMembers.map((m) => (
                  <AvatarChip
                    key={m.id}
                    member={m}
                    isYou={m.id === userId}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Likely crew */}
          {wantMembers.length > 0 && (
            <div
              className="rounded-xl p-3 flex flex-col gap-2.5"
              style={{
                background: "rgba(0,0,0,.025)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.08em] text-text-subtle">
                <span
                  className="w-[7px] h-[7px] rounded-full shrink-0 border-[1.5px]"
                  style={{
                    borderColor: "var(--want-bg)",
                    background: "transparent",
                  }}
                />
                {likelyLabel}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {wantMembers.map((m) => (
                  <AvatarChip
                    key={m.id}
                    member={m}
                    isYou={m.id === userId}
                    soft={m.id !== userId}
                  />
                ))}
              </div>
            </div>
          )}

          {/* D2 others — maybe + skip in one bg card */}
          {showOthers && (
            <div
              className="rounded-[10px] flex flex-col divide-y divide-black/5"
              style={{ background: "var(--bg)" }}
            >
              {maybeMembers.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap px-3.5 py-1.5">
                  <span
                    className="text-[10px] font-bold uppercase tracking-[.06em] w-12 shrink-0"
                    style={{ color: "#A08000" }}
                  >
                    Maybe
                  </span>
                  {maybeMembers.map((m) => {
                    const isYou = m.id === userId;
                    return (
                      <div
                        key={m.id}
                        className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium text-text-muted"
                        style={{
                          background: "rgba(255,229,102,.22)",
                          border: isYou
                            ? "1.5px solid rgba(255,92,53,.25)"
                            : undefined,
                        }}
                      >
                        <MemberAvatar name={m.name} avatarUrl={m.avatar_url} size="sm" />
                        <span>{isYou ? "You" : m.name.split(" ")[0]}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              {skipMembers.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap px-3.5 py-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[.06em] w-12 shrink-0 text-text-subtle">
                    Skipping
                  </span>
                  {skipMembers.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium text-text-muted opacity-55"
                      style={{ background: "rgba(0,0,0,.03)" }}
                    >
                      <MemberAvatar name={m.name} avatarUrl={m.avatar_url} size="sm" />
                      <span>{m.name.split(" ")[0]}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Unrated note */}
          {unratedMembers.length > 0 && myRating === null && (
            <p className="text-xs text-text-subtle bg-bg rounded-lg px-3 py-2.5 leading-relaxed">
              <strong className="text-text-muted">
                {unratedMembers
                  .map((m) => (m.id === userId ? "You" : m.name.split(" ")[0]))
                  .join(", ")}
              </strong>{" "}
              {unratedMembers.length === 1 ? "hasn't" : "haven't"} weighed in
              yet.
            </p>
          )}

          {/* What's next callout */}
          <div className="flex items-center gap-3 bg-bg rounded-xl px-4 py-3">
            <span className="text-[22px] shrink-0">{nextCallout.icon}</span>
            <div>
              <p className="text-[13px] font-semibold text-text-primary leading-snug">
                {nextCallout.head}
              </p>
              <p className="text-[11px] text-text-muted mt-0.5 leading-snug">
                {nextCallout.sub}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-border px-5 py-4 flex flex-col gap-2.5 shrink-0">
          {myRating === "MAYBE" ? (
            <button
              onClick={() => handleRate("WANT")}
              disabled={ratingLoading}
              className="w-full flex items-center justify-center py-3 px-5 text-[13px] font-semibold rounded-[var(--radius-btn)] border border-accent text-accent bg-transparent hover:bg-accent/5 transition-colors disabled:opacity-50"
            >
              Join the crew →
            </button>
          ) : myRating === null ? (
            <div className="grid grid-cols-4 gap-1.5">
              {(["MUST", "WANT", "MAYBE", "SKIP"] as Rating[]).map((r) => {
                const labels: Record<Rating, string> = {
                  MUST: "Can't miss",
                  WANT: "Want to",
                  MAYBE: "Maybe",
                  SKIP: "Skip",
                };
                const active = pendingRating === r;
                const activeStyles: Record<Rating, string> = {
                  MUST: "bg-must/[.13] border-must text-must",
                  WANT: "bg-want/[.13] border-want text-want",
                  MAYBE: "border-[#B8960A] text-[#7A6200]",
                  SKIP: "bg-skip border-skip-text/50 text-skip-text",
                };
                return (
                  <button
                    key={r}
                    onClick={() => handleRate(r)}
                    disabled={ratingLoading}
                    className={`py-2.5 rounded-xl border text-[11px] font-semibold transition-all disabled:opacity-50 ${
                      active
                        ? `${activeStyles[r]} font-bold`
                        : "border-border text-text-muted hover:border-accent/40 hover:text-text-primary"
                    } ${r === "MAYBE" && active ? "bg-[rgba(255,229,102,.45)]" : ""}`}
                  >
                    {labels[r]}
                  </button>
                );
              })}
            </div>
          ) : (
            <>
              <button className="w-full flex items-center justify-center gap-2 py-3 px-5 text-sm font-semibold rounded-[var(--radius-btn)] bg-accent text-white hover:opacity-90 transition-opacity">
                Plan with your crew
                <span className="text-[9px] font-bold uppercase bg-white/25 text-white px-1.5 py-0.5 rounded-full">
                  Soon
                </span>
              </button>
              {myRating === "MUST" && (
                <button className="w-full flex items-center justify-center gap-2 py-2.5 px-5 text-xs font-medium rounded-[var(--radius-btn)] border border-border text-text-muted hover:border-accent/40 hover:text-accent transition-colors">
                  Nudge unvoted members
                  <span className="text-[9px] font-bold uppercase bg-border text-text-subtle px-1.5 py-0.5 rounded-full">
                    Soon
                  </span>
                </button>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Crew card ─────────────────────────────────────────────────────────────────

function CrewCard({
  row,
  userId,
  canEdit,
  onOpen,
  onEdit,
  onDelete,
}: {
  row: CrewRowData;
  userId?: string;
  canEdit?: boolean;
  onOpen: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const {
    activity,
    mustMembers,
    wantMembers,
    maybeMembers,
    myRating,
    mustCount,
    wantCount,
    maybeCount,
  } = row;

  const stripeColor =
    myRating === "MUST"
      ? "var(--must-bg)"
      : myRating === "WANT"
        ? "var(--want-bg)"
        : myRating === "MAYBE"
          ? "#FFE566"
          : "#E8E6E0";
  const cardBg =
    myRating === "MUST"
      ? "linear-gradient(135deg,rgba(255,92,53,.04) 0%,var(--bg-card) 55%)"
      : myRating === "WANT"
        ? "linear-gradient(135deg,rgba(0,201,167,.04) 0%,var(--bg-card) 55%)"
        : "var(--bg-card)";

  const isEmpty = mustCount === 0 && wantCount === 0;

  return (
    <div
      onClick={onOpen}
      className={`rounded-[var(--radius-card)] border border-border overflow-hidden cursor-pointer flex transition-all hover:shadow-md hover:-translate-y-px active:scale-[.998] ${isEmpty ? "opacity-40" : ""}`}
      style={{ background: cardBg }}
    >
      {/* Left stripe */}
      <div className="w-1 shrink-0" style={{ background: stripeColor }} />

      <div className="flex-1 min-w-0 px-4 py-3.5 flex flex-col gap-2.5">
        {/* Top row: name + (kebab / status pill) */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-bold text-text-primary leading-snug">
              {activity.name}
            </p>
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

        {/* Crew display */}
        {isEmpty ? (
          <p className="text-xs text-text-subtle">Nobody's excited yet.</p>
        ) : myRating === "MUST" ? (
          <AvatarRow
            mustMembers={mustMembers}
            wantMembers={wantMembers}
            userId={userId}
          />
        ) : (
          <TierBlock
            mustMembers={mustMembers}
            wantMembers={wantMembers}
            maybeMembers={maybeMembers}
            userId={userId}
            myRating={myRating}
          />
        )}

        {/* Footer */}
        {!isEmpty && (
          <CrewFooter
            mustCount={mustCount}
            wantCount={wantCount}
            maybeCount={maybeCount}
          />
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function FindYourCrew({
  onAdd,
  onEdit,
  onDelete,
  tripOwnerId,
  hiddenIds,
}: {
  onAdd?: () => void;
  onEdit?: (a: Activity) => void;
  onDelete?: (a: Activity) => void;
  tripOwnerId?: string;
  hiddenIds?: Set<string>;
} = {}) {
  const allActivities = useTripStore((s) => s.activities);
  const members = useTripStore((s) => s.members);
  const ratings = useTripStore((s) => s.ratings);
  const stops = useTripStore((s) => s.stops);
  const { session } = useSession();
  const { rateActivity, loading: ratingLoading } = useRateActivity();

  const activities = hiddenIds?.size
    ? allActivities.filter((a) => !hiddenIds.has(a.id))
    : allActivities;

  const userId = session?.user.id;
  const [openId, setOpenId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("popular");

  function canEditActivity(a: Activity) {
    return userId === tripOwnerId || userId === a.added_by;
  }

  const rows = useMemo((): CrewRowData[] => {
    return activities
      .map((activity) => {
        const actRatings = ratings.filter((r) => r.activity_id === activity.id);
        const ratingMap = new Map(actRatings.map((r) => [r.user_id, r.rating]));
        const mustMembers = members.filter(
          (m) => ratingMap.get(m.id) === "MUST",
        );
        const wantMembers = members.filter(
          (m) => ratingMap.get(m.id) === "WANT",
        );
        const maybeMembers = members.filter(
          (m) => ratingMap.get(m.id) === "MAYBE",
        );
        const skipMembers = members.filter(
          (m) => ratingMap.get(m.id) === "SKIP",
        );
        const ratedIds = new Set(actRatings.map((r) => r.user_id));
        const unratedMembers = members.filter((m) => !ratedIds.has(m.id));
        const myRating = userId ? (ratingMap.get(userId) ?? null) : null;
        return {
          activity,
          mustMembers,
          wantMembers,
          maybeMembers,
          skipMembers,
          unratedMembers,
          myRating,
          mustCount: mustMembers.length,
          wantCount: wantMembers.length,
          maybeCount: maybeMembers.length,
        };
      })
      .sort((a, b) => {
        if (sortKey === "by-stop") {
          return b.mustCount * 3 + b.wantCount - (a.mustCount * 3 + a.wantCount);
        }
        if (sortKey === "my-recs") {
          const aMe = a.activity.added_by === userId ? 0 : 1;
          const bMe = b.activity.added_by === userId ? 0 : 1;
          if (aMe !== bMe) return aMe - bMe;
        }
        if (sortKey === "cant-miss") {
          const TIER: Record<string, number> = { MUST: 0, WANT: 1, MAYBE: 2, SKIP: 3 };
          const av = a.myRating ? (TIER[a.myRating] ?? 4) : 4;
          const bv = b.myRating ? (TIER[b.myRating] ?? 4) : 4;
          if (av !== bv) return av - bv;
        }
        if (sortKey === "newest") {
          return new Date(b.activity.created_at).getTime() - new Date(a.activity.created_at).getTime();
        }
        return b.mustCount * 3 + b.wantCount - (a.mustCount * 3 + a.wantCount);
      });
  }, [activities, members, ratings, userId, sortKey]);

  const sortedStops = useMemo(
    () => [...stops].sort((a, b) => a.position - b.position),
    [stops]
  );

  const openRow = rows.find((r) => r.activity.id === openId) ?? null;

  if (activities.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted">0 activities</p>
          {onAdd && (
            <button
              onClick={onAdd}
              className="text-xs font-semibold px-3 py-1.5 rounded-[var(--radius-btn)] bg-accent text-white hover:opacity-90 transition-opacity"
            >
              + Add activity
            </button>
          )}
        </div>
        <div className="bg-bg-card rounded-[var(--radius-card)] border border-border px-6 py-12 flex flex-col items-center gap-2 text-center">
          <p className="text-sm font-medium text-text-primary">No activities yet</p>
          <p className="text-xs text-text-muted">Add the first one for the group to rate.</p>
        </div>
      </div>
    );
  }

  function renderCards(cardRows: typeof rows) {
    return (
      <div className="flex flex-col gap-2.5">
        {cardRows.map((row) => (
          <CrewCard
            key={row.activity.id}
            row={row}
            userId={userId}
            canEdit={canEditActivity(row.activity)}
            onOpen={() => setOpenId(row.activity.id)}
            onEdit={onEdit ? () => onEdit(row.activity) : undefined}
            onDelete={onDelete ? () => onDelete(row.activity) : undefined}
          />
        ))}
      </div>
    );
  }

  const fmtDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

  function stopDateLabel(stop: Stop) {
    if (stop.date_from && stop.date_to) return `${fmtDate(stop.date_from)} – ${fmtDate(stop.date_to)}`;
    if (stop.date_from) return `From ${fmtDate(stop.date_from)}`;
    if (stop.date_to) return `Until ${fmtDate(stop.date_to)}`;
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        {onAdd ? (
          <button
            onClick={onAdd}
            className="text-xs font-semibold px-3 py-1.5 rounded-[var(--radius-btn)] bg-accent text-white hover:opacity-90 transition-opacity shrink-0"
          >
            + Add activity
          </button>
        ) : <div />}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-text-subtle">Sort:</span>
          <div className="flex items-center gap-0.5 bg-bg-card border border-border rounded-lg p-0.5">
            {(Object.keys(SORT_LABELS) as SortKey[]).filter(k => k !== "by-stop" || stops.length > 0).map((k) => (
              <button
                key={k}
                onClick={() => setSortKey(k)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  sortKey === k
                    ? "bg-accent text-white shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {SORT_LABELS[k]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {sortKey === "by-stop" ? (
        <div className="flex flex-col gap-4">
          {sortedStops.map((stop) => {
            const stopRows = rows.filter((r) => r.activity.stop_id === stop.id);
            if (stopRows.length === 0) return null;
            const dateLabel = stopDateLabel(stop);
            return (
              <div key={stop.id} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-text-primary">{stop.name}</span>
                  {dateLabel && <span className="text-[11px] text-text-muted">{dateLabel}</span>}
                </div>
                {renderCards(stopRows)}
              </div>
            );
          })}
          {(() => {
            const stopIds = new Set(stops.map((s) => s.id));
            const unassigned = rows.filter((r) => !r.activity.stop_id || !stopIds.has(r.activity.stop_id));
            if (unassigned.length === 0) return null;
            return (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-text-muted">Unassigned</span>
                {renderCards(unassigned)}
              </div>
            );
          })()}
        </div>
      ) : (
        renderCards(rows)
      )}

      {openRow && (
        <CrewModalD2
          row={openRow}
          userId={userId}
          onClose={() => setOpenId(null)}
          onRate={(r) => rateActivity(openRow.activity.id, r)}
          ratingLoading={ratingLoading}
        />
      )}
    </>
  );
}
