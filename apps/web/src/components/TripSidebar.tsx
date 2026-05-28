"use client";

import { useMemo } from "react";
import { MemberAvatar } from "@/components/MemberAvatar";
import { KebabMenu } from "@/components/KebabMenu";
import { StopsPanel } from "@/components/StopsPanel";
import { FadeReveal } from "@/components/FadeReveal";
import { fmtDateRange } from "@/lib/date";
import type { Trip, Member, Stop } from "@pulse/types";

const INLINE_CAP = 8;

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
    ? me ? [me, ...others.slice(0, INLINE_CAP - 1)] : members.slice(0, INLINE_CAP)
    : me ? [me, ...others] : members;

  // Helper for timeline bars
  const tripStart = trip.start_date ? new Date(trip.start_date + "T00:00:00").getTime() : null;
  const tripEnd = trip.end_date ? new Date(trip.end_date + "T00:00:00").getTime() : null;
  const tripDuration = (tripStart && tripEnd) ? tripEnd - tripStart : 0;

  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/join?code=${trip.invite_code}`
    : '';
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Join ${trip.name} on Pulse — rate activities and find your crew: ${inviteUrl}`)}`;

  const peakOverlap = useMemo(() => {
    if (!tripStart || !tripEnd || tripDuration <= 0) return null;
    const MS = 86400000;
    const numDays = Math.round(tripDuration / MS) + 1;
    const dayCounts = Array.from({ length: numDays }, (_, i) => {
      const day = tripStart + i * MS;
      return members.filter((m) => {
        const mStart = m.arrival_date ? new Date(m.arrival_date + "T00:00:00").getTime() : tripStart;
        const mEnd = m.departure_date ? new Date(m.departure_date + "T00:00:00").getTime() : tripEnd;
        return day >= mStart && day <= mEnd;
      }).length;
    });
    const maxCount = Math.max(...dayCounts);
    if (maxCount <= 0) return null;
    let bestStart = 0, bestEnd = 0, curStart = -1;
    for (let i = 0; i <= numDays; i++) {
      if (i < numDays && dayCounts[i] === maxCount) {
        if (curStart === -1) curStart = i;
      } else if (curStart !== -1) {
        if (i - 1 - curStart > bestEnd - bestStart) { bestStart = curStart; bestEnd = i - 1; }
        curStart = -1;
      }
    }
    function toStr(ms: number) {
      const d = new Date(ms);
      return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
    }
    return {
      dateRange: fmtDateRange(toStr(tripStart + bestStart * MS), toStr(tripStart + bestEnd * MS)),
      count: maxCount,
      total: members.length,
    };
  }, [tripStart, tripEnd, tripDuration, members]);

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
      <div className="bg-bg-card rounded-[var(--radius-card)] border border-border p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-text-subtle uppercase tracking-widest">
            Schedules
          </h2>
          <span className="text-[10px] text-text-muted font-medium bg-bg px-1.5 py-0.5 rounded">
            {members.length} Total
          </span>
        </div>

        {peakOverlap && peakOverlap.dateRange && (
          <div className="flex items-center gap-1.5 text-[10px] text-text-muted -mt-2 bg-bg rounded-lg px-2.5 py-1.5">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 1v2M6 9v2M1 6h2M9 6h2M2.93 2.93l1.41 1.41M7.66 7.66l1.41 1.41M2.93 9.07l1.41-1.41M7.66 4.34l1.41-1.41" />
            </svg>
            <span>
              Best window:{" "}
              <span className="font-medium text-text-primary">{peakOverlap.dateRange}</span>
              {" · "}{peakOverlap.count}/{peakOverlap.total}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {inlineList.map((m) => {
            const isMe = m.id === userId;
            const dateStr = fmtDateRange(m.arrival_date, m.departure_date);
            const hasDates = !!(m.arrival_date || m.departure_date);

            return (
              <div key={m.id} className="flex items-center gap-2.5">
                <MemberAvatar name={m.name} avatarUrl={m.avatar_url} size="lg" />
                <div className="flex flex-col leading-tight min-w-0 flex-1">
                  <span className="text-xs font-semibold text-text-primary">
                    {m.name.split(" ")[0]} {isMe && <span className="text-text-muted font-normal">(you)</span>}
                  </span>
                  <span className={`text-[10px] ${hasDates ? "text-text-muted" : "text-accent font-medium italic"}`}>
                    {dateStr ?? (isMe ? "+ Add your dates" : "Dates not set")}
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

        {/* Primary: copy link */}
        <button
          onClick={onCopyInvite}
          className="w-full flex items-center justify-center gap-2 bg-accent text-white rounded-xl py-2.5 px-4 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy invite link
            </>
          )}
        </button>

        {/* WhatsApp — mobile only */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 border border-border rounded-xl py-2.5 px-4 text-sm font-medium text-text-primary hover:bg-bg transition-colors"
        >
          <svg className="w-4 h-4 shrink-0" style={{ color: "#25D366" }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12.005 0C5.379 0 0 5.38 0 12.005c0 2.134.557 4.12 1.529 5.842L.057 23.943l6.254-1.638A11.953 11.953 0 0012.005 24C18.625 24 24 18.621 24 12.005 24 5.38 18.625 0 12.005 0zm0 21.818a9.808 9.808 0 01-5.026-1.385l-.36-.214-3.726.977.993-3.634-.235-.374A9.808 9.808 0 012.18 12.005c0-5.42 4.41-9.836 9.825-9.836 5.415 0 9.82 4.416 9.82 9.836 0 5.42-4.405 9.813-9.82 9.813z"/>
          </svg>
          Share via WhatsApp
        </a>

        {/* Tertiary: email invite */}
        <button
          onClick={onShowInviteModal}
          className="text-xs text-center text-text-muted hover:text-text-primary transition-colors"
        >
          Send an email invite →
        </button>
      </div>

    </aside>
  );
}
