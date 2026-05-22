"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, useUserTrips, useCreateTrip } from "@pulse/hooks";
import { Button } from "@pulse/ui";
import { CreateTripModal } from "@/components/CreateTripModal";
import { memberPalette } from "@/lib/memberColors";
import type { TripSummary, TripMemberAvatar } from "@pulse/services";

function formatDateRange(start?: string | null, end?: string | null) {
  if (!start && !end) return null;
  const fmt = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  if (start) return `From ${fmt(start)}`;
  return `Until ${fmt(end!)}`;
}

function MemberDots({ count, avatars }: { count: number; avatars: TripMemberAvatar[] }) {
  const shown = Math.min(count, 5);
  const overflow = count - shown;
  return (
    <div className="flex items-center">
      {avatars.slice(0, shown).map((member, i) =>
        member.avatar_url ? (
          <img
            key={member.id}
            src={member.avatar_url}
            alt={member.name}
            style={{ marginLeft: i === 0 ? 0 : -6, zIndex: shown - i }}
            className="relative w-6 h-6 rounded-full object-cover border-2 border-bg-card"
          />
        ) : (
          <span
            key={member.id}
            style={{ marginLeft: i === 0 ? 0 : -6, zIndex: shown - i, backgroundColor: memberPalette(i).bg, color: memberPalette(i).fg }}
            className="relative w-6 h-6 rounded-full border-2 border-bg-card flex items-center justify-center text-[9px] font-semibold"
          >
            {member.name.charAt(0).toUpperCase()}
          </span>
        )
      )}
      {overflow > 0 && (
        <span
          style={{ marginLeft: -6, zIndex: 0 }}
          className="relative w-6 h-6 rounded-full bg-border border-2 border-bg-card flex items-center justify-center text-[9px] font-semibold text-text-subtle"
        >
          +{overflow}
        </span>
      )}
      <span className="ml-2 text-xs text-text-muted">
        {count} {count === 1 ? "person" : "people"}
      </span>
    </div>
  );
}

export default function Home() {
  const { session, loading: sessionLoading } = useSession();
  const { trips, loading: tripsLoading, refresh } = useUserTrips();
  const { createTrip, loading: creating, error: createError } = useCreateTrip();
  const router = useRouter();

  const [showCreate, setShowCreate] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    if (!sessionLoading && !session) router.replace("/login");
  }, [session, sessionLoading, router]);

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener('pulse:trips:changed', handler);
    return () => window.removeEventListener('pulse:trips:changed', handler);
  }, [refresh]);

  async function handleCreate(fields: {
    name: string;
    destination: string;
    start_date: string;
    end_date: string;
  }) {
    const trip = await createTrip({
      name: fields.name,
      destination: fields.destination,
      start_date: fields.start_date || null,
      end_date: fields.end_date || null,
    });
    if (trip) {
      setShowCreate(false);
      refresh();
      router.push(`/trip/${trip.id}`);
    }
  }

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const code = joinCode.trim();
    if (code) router.push(`/join?code=${encodeURIComponent(code)}`);
  }

  if (sessionLoading || !session) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-text-muted text-sm">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg overflow-x-clip">
      <div className="max-w-screen-xl mx-auto px-6 py-10 flex flex-col gap-10">
        {/* Trips section */}
        <section className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary">
                Your trips
              </h1>
              <p className="hidden sm:block text-sm text-text-muted mt-0.5">
                Plan, rate, and explore with your group.
              </p>
            </div>
            <Button size="sm" onClick={() => setShowCreate(true)}>
              + New trip
            </Button>
          </div>

          {tripsLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-bg-card rounded-[var(--radius-card)] border border-border h-36 animate-pulse"
                />
              ))}
            </div>
          )}

          {!tripsLoading && trips.length === 0 && (
            <div className="bg-bg-card rounded-[var(--radius-card)] border border-border px-8 py-16 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-border flex items-center justify-center text-2xl">
                ✈️
              </div>
              <p className="text-sm font-medium text-text-primary">
                No trips yet
              </p>
              <p className="text-xs text-text-muted max-w-xs">
                Create your first trip or join one below with an invite code.
              </p>
              <Button onClick={() => setShowCreate(true)} className="mt-1">
                + New trip
              </Button>
            </div>
          )}

          {!tripsLoading && trips.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trips.map((trip: TripSummary) => {
                const dates = formatDateRange(trip.start_date, trip.end_date);
                const isOwner = trip.created_by === session.user.id;
                return (
                  <button
                    key={trip.id}
                    onClick={() => router.push(`/trip/${trip.id}`)}
                    className="group w-full text-left bg-bg-card rounded-[var(--radius-card)] border border-border p-5 flex flex-col gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-base font-semibold text-text-primary leading-tight truncate">
                        {trip.name}
                      </span>
                      {isOwner && (
                        <span className="shrink-0 text-[10px] font-semibold text-accent bg-accent/10 rounded-full px-2.5 py-1 uppercase tracking-wide">
                          Owner
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-sm font-medium text-text-muted">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-60">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                        <circle cx="12" cy="9" r="2.5"/>
                      </svg>
                      <span className="truncate">{trip.destination}</span>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-1">
                      <MemberDots count={trip.member_count} avatars={trip.member_avatars} />
                      {dates && (
                        <span className="text-xs text-text-muted tabular-nums shrink-0">{dates}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Join section */}
        <section className="max-w-md bg-bg-card border border-border rounded-[var(--radius-card)] p-5 flex flex-col gap-3">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">
              Join a trip
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Enter an invite code to join someone's trip.
            </p>
          </div>
          <form onSubmit={handleJoin} className="flex gap-2">
            <input
              type="text"
              placeholder="Invite code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              maxLength={50}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="flex-1 bg-bg-card border border-border rounded-[var(--radius-card)] px-3 py-2 text-sm text-text-primary placeholder:text-text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent transition-colors"
            />
            <Button type="submit" variant="outline" disabled={!joinCode.trim()}>
              Join
            </Button>
          </form>
        </section>
      </div>

      <CreateTripModal
        open={showCreate}
        loading={creating}
        error={createError}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreate}
      />
    </main>
  );
}
