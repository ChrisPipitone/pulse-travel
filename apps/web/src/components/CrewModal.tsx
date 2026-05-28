"use client";

import { useState } from "react";
import { useModalEscape } from "@/hooks/useModalEscape";
import type { Rating } from "@pulse/types";
import { RATING_BUTTON, RATING_LABELS } from "@pulse/types";
import { AvatarChip, PinIcon, StatusPill, type CrewRowData } from "@/components/CrewCard";

export function CrewModal({
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
  const { activity, mustMembers, maybeMembers, skipMembers, unratedMembers, myRating } = row;
  const [pendingRating, setPendingRating] = useState<Rating | null>(myRating);

  useModalEscape(onClose);

  function handleRate(r: Rating) {
    const next = pendingRating === r ? null : r;
    setPendingRating(next);
    onRate(r);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="modal-overlay absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="modal-panel relative bg-bg-card rounded-t-[var(--radius-card)] sm:rounded-[var(--radius-card)] border border-border w-full sm:max-w-[600px] max-h-[92vh] sm:max-h-[86vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4 border-b border-border sticky top-0 bg-bg-card z-10">
          <div className="min-w-0 flex-1">
            <p className="text-[17px] font-bold text-text-primary leading-snug">{activity.name}</p>
            {activity.location && (
              <div className="flex items-center gap-1 mt-1 text-xs text-text-muted">
                <PinIcon />
                <span>{activity.location}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0 mt-0.5">
            <StatusPill rating={myRating} />
            <button
              onClick={onClose}
              className="shrink-0 text-text-subtle hover:text-text-primary p-2.5 rounded-lg transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-5 px-6 py-5 flex-1">
          {mustMembers.length > 0 && (
            <div
              className="section-in rounded-xl p-3 flex flex-col gap-2.5"
              style={{ background: "rgba(255,92,53,.05)", border: "1px solid rgba(255,92,53,.15)", animationDelay: "0ms" }}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.08em] text-text-subtle">
                <span className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: "var(--must-bg)" }} />
                Counting on it
              </div>
              <div className="flex flex-wrap gap-1.5">
                {mustMembers.map((m) => (
                  <AvatarChip key={m.id} member={m} isYou={m.id === userId} rating="MUST" />
                ))}
              </div>
            </div>
          )}

          {maybeMembers.length > 0 && (
            <div
              className="section-in rounded-xl p-3 flex flex-col gap-2.5"
              style={{ background: "rgba(0,0,0,.025)", border: "1px solid var(--border)", animationDelay: "40ms" }}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.08em] text-text-subtle">
                <span className="w-[7px] h-[7px] rounded-full shrink-0 border-[1.5px]" style={{ borderColor: "#B8960A", background: "transparent" }} />
                If it works out
              </div>
              <div className="flex flex-wrap gap-1.5">
                {maybeMembers.map((m) => (
                  <AvatarChip key={m.id} member={m} isYou={m.id === userId} soft={m.id !== userId} rating="MAYBE" />
                ))}
              </div>
            </div>
          )}

          {skipMembers.length > 0 && (
            <div
              className="section-in rounded-[10px] flex flex-col divide-y divide-black/5"
              style={{ background: "var(--bg)", animationDelay: "80ms" }}
            >
              <div className="flex items-center gap-2 flex-wrap px-3.5 py-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[.06em] w-12 shrink-0 text-text-subtle">Skipping</span>
                {skipMembers.map((m) => (
                  <AvatarChip key={m.id} member={m} isYou={m.id === userId} soft={m.id !== userId} rating="SKIP" />
                ))}
              </div>
            </div>
          )}

          {unratedMembers.length > 0 && myRating === null && (
            <p className="text-xs text-text-subtle bg-bg rounded-lg px-3 py-2.5 leading-relaxed">
              <strong className="text-text-muted">
                {unratedMembers.map((m) => (m.id === userId ? "You" : m.name.split(" ")[0])).join(", ")}
              </strong>{" "}
              {unratedMembers.length === 1 ? "hasn't" : "haven't"} weighed in yet.
            </p>
          )}
        </div>

        {/* Rating footer */}
        <div className="border-t border-border px-6 py-4 flex flex-col gap-4 shrink-0 sticky bottom-0 bg-bg-card">
          <div key={pendingRating ?? 'null'} className="callout-in">
            {pendingRating === null ? (
              <div className="flex items-center gap-3 bg-bg rounded-xl px-4 py-3">
                <span className="text-[22px] shrink-0">👋</span>
                <div>
                  <p className="text-[13px] font-semibold text-text-primary leading-snug">
                    {mustMembers.length + maybeMembers.length}{' '}people have opinions — what&apos;s yours?
                  </p>
                  <p className="text-[11px] text-text-muted mt-0.5">Rate it and see where you land in the crew.</p>
                </div>
              </div>
            ) : pendingRating === "MUST" ? (
              <div className="flex items-center gap-3 bg-bg rounded-xl px-4 py-3">
                <span className="text-[22px] shrink-0">🤝</span>
                <div>
                  <p className="text-[13px] font-semibold text-text-primary leading-snug">
                    You&apos;re in — {mustMembers.length} confirmed.
                  </p>
                  <p className="text-[11px] text-text-muted mt-0.5">Plan it to lock in dates and finalize your crew.</p>
                </div>
              </div>
            ) : pendingRating === "MAYBE" ? (
              <div className="flex items-center gap-3 bg-bg rounded-xl px-4 py-3">
                <span className="text-[22px] shrink-0">🤔</span>
                <div>
                  <p className="text-[13px] font-semibold text-text-primary leading-snug">
                    You&apos;re flexible — in if the timing or vibe is right.
                  </p>
                  <p className="text-[11px] text-text-muted mt-0.5">Upgrade to Can&apos;t miss if you don&apos;t want to miss it.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-bg rounded-xl px-4 py-3">
                <span className="text-[22px] shrink-0">👋</span>
                <div>
                  <p className="text-[13px] font-semibold text-text-primary leading-snug">
                    You&apos;re out — not your thing.
                  </p>
                  <p className="text-[11px] text-text-muted mt-0.5">Change your rating if you want in.</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold text-text-subtle uppercase tracking-widest">Your Rating</p>
            <div className="grid grid-cols-3 gap-2">
              {(["MUST", "MAYBE", "SKIP"] as Rating[]).map((r) => {
                const active = pendingRating === r;
                return (
                  <button
                    key={r}
                    onClick={() => handleRate(r)}
                    disabled={ratingLoading}
                    className={`min-h-[44px] flex items-center justify-center rounded-xl border text-[11px] font-bold transition-all disabled:opacity-50 ${
                      active ? RATING_BUTTON[r].active : `bg-transparent ${RATING_BUTTON[r].idle} hover:opacity-80`
                    }`}
                  >
                    {RATING_LABELS[r]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
