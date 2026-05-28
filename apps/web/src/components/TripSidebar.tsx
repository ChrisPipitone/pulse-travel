"use client";

import { MemberAvatar } from "@/components/MemberAvatar";
import { KebabMenu } from "@/components/KebabMenu";
import { StopsPanel } from "@/components/StopsPanel";
import { FadeReveal } from "@/components/FadeReveal";
import { fmtDateRange } from "@/lib/date";
import type { Trip, Member, Stop } from "@pulse/types";

const INLINE_CAP = 5;

type Props = {
  trip: Trip;
  tripId: string;
  members: Member[];
  userId: string | undefined;
  isOwner: boolean;
  copied: boolean;
  onEditTrip: () => void;
  onDeleteTrip: () => void;
  onShowDatesModal: () => void;
  onShowSchedulesModal: () => void;
  onShowInviteModal: () => void;
  onCopyInvite: () => void;
  onOpenAddStop: () => void;
  onOpenEditStop: (stop: Stop) => void;
};

export function TripSidebar({
  trip, tripId, members, userId, isOwner, copied,
  onEditTrip, onDeleteTrip, onShowDatesModal, onShowSchedulesModal,
  onShowInviteModal, onCopyInvite, onOpenAddStop, onOpenEditStop,
}: Props) {
  const useModal = members.length > INLINE_CAP;
  const me = members.find((m) => m.id === userId);
  const others = members.filter((m) => m.id !== userId);
  const inlineList = useModal
    ? me ? [me, ...others.slice(0, INLINE_CAP)] : members.slice(0, INLINE_CAP)
    : me ? [me, ...others] : members;

  return (
    <aside className="w-full lg:w-72 lg:shrink-0 flex flex-col gap-6 lg:sticky lg:top-[5rem]">

      {/* Trip identity */}
      <div className="bg-bg-card rounded-[var(--radius-card)] border border-border border-t-2 border-t-accent p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5 min-w-0">
            <h1 className="text-xl font-semibold text-text-primary leading-tight">
              {trip.name}
            </h1>
            <p className="text-sm text-text-muted truncate">{trip.destination}</p>
          </div>
          {isOwner && (
            <KebabMenu
              items={[
                { label: "Edit trip", onClick: onEditTrip },
                { label: "Delete trip", danger: true, onClick: onDeleteTrip },
              ]}
            />
          )}
        </div>

        {trip.start_date && trip.end_date && (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" />
              <path d="M1.5 6h11M4.5 1v3M9.5 1v3" />
            </svg>
            {fmtDateRange(trip.start_date, trip.end_date)}
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-text-muted">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="5" cy="4.5" r="2" />
            <path d="M1.5 12c0-2.21 1.567-4 3.5-4s3.5 1.79 3.5 4" />
            <circle cx="10" cy="4.5" r="2" />
            <path d="M10 8.5c1.2.3 2.5 1.5 2.5 3.5" />
          </svg>
          {members.length} {members.length === 1 ? "person" : "people"}
        </div>
      </div>

      {/* Member schedules */}
      <div className="bg-bg-card rounded-[var(--radius-card)] border border-border p-5 flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-text-subtle uppercase tracking-widest">
          Schedules
        </h2>
        <div className="flex flex-col gap-2">
          {inlineList.map((m) => {
            const isMe = m.id === userId;
            const dateStr = fmtDateRange(m.arrival_date, m.departure_date);
            return (
              <div key={m.id} className="flex items-center gap-2.5">
                <MemberAvatar name={m.name} avatarUrl={m.avatar_url} size="lg" />
                <div className="flex flex-col leading-tight min-w-0 flex-1">
                  <span className="text-xs font-medium text-text-primary">
                    {m.name.split(" ")[0]}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    {dateStr ?? "Full trip"}
                  </span>
                </div>
                {isMe && (
                  <KebabMenu
                    items={[{ label: "Edit dates", onClick: onShowDatesModal }]}
                  />
                )}
              </div>
            );
          })}
        </div>
        {useModal && (
          <FadeReveal
            label={`See all ${members.length} members →`}
            onClick={onShowSchedulesModal}
          />
        )}
      </div>

      {/* Stops */}
      <StopsPanel
        tripId={tripId}
        userId={userId}
        tripOwnerId={trip.created_by ?? undefined}
        onOpenAdd={onOpenAddStop}
        onOpenEdit={onOpenEditStop}
      />

      {/* Invite */}
      <div className="bg-bg-card rounded-[var(--radius-card)] border border-border p-5 flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-text-subtle uppercase tracking-widest">
          Invite
        </h2>
        <button
          onClick={onShowInviteModal}
          className="w-full flex items-center gap-3 rounded-xl border-2 border-dashed border-accent/30 bg-accent/5 hover:bg-accent/10 hover:border-accent/50 transition-colors px-4 py-3 group"
        >
          <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center shrink-0 group-hover:bg-accent/25 transition-colors">
            <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-accent">Invite someone</p>
            <p className="text-xs text-text-muted">Send them an email invite</p>
          </div>
        </button>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-bg text-xs font-mono text-text-subtle px-2.5 py-1.5 rounded-lg border border-border truncate">
            {trip.invite_code}
          </code>
          <button
            onClick={onCopyInvite}
            className="shrink-0 text-xs font-medium text-text-muted hover:text-accent transition-colors px-2.5 py-1.5 rounded-lg border border-border bg-bg hover:border-accent/30"
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      </div>

    </aside>
  );
}
