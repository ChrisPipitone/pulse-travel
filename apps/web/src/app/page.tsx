"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, useUserTrips, useCreateTrip } from "@pulse/hooks";
import { Button } from "@pulse/ui";
import { CreateTripModal } from "@/components/CreateTripModal";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import type { TripSummary } from "@pulse/services";
import { fmtDateRange } from "@/lib/date";
import { MemberDots } from "@/components/MemberDots";

export default function Home() {
  const { session, loading: sessionLoading } = useSession();
  const { trips, loading: tripsLoading, error: tripsError, refresh } = useUserTrips();
  const { createTrip, loading: creating, error: createError } = useCreateTrip();
  const router = useRouter();

  const [showCreate, setShowCreate] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    if (!sessionLoading && !session) router.replace("/login");
  }, [session, sessionLoading, router]);

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener("pulse:trips:changed", handler);
    return () => window.removeEventListener("pulse:trips:changed", handler);
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
    if (code) handleJoinCode(code);
  }

  function handleJoinCode(raw: string) {
    // Accept both a raw code and a full invite URL — extract the code param if present.
    try {
      const url = new URL(raw)
      const codeParam = url.searchParams.get('code')
      if (codeParam) { router.push(`/join?code=${encodeURIComponent(codeParam)}`); return }
    } catch {}
    router.push(`/join?code=${encodeURIComponent(raw.trim())}`)
  }

  if (sessionLoading || !session) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-text-muted text-sm">Loading…</p>
      </main>
    );
  }

  const hasTrips = !tripsLoading && !tripsError && trips.length > 0

  return (
    <main className="min-h-screen bg-bg overflow-x-clip flex flex-col pb-20">
      {/* Hero section — only for returning users with trips */}
      {hasTrips && (
      <div className="bg-bg-card border-b border-border">
        <div className="max-w-screen-xl mx-auto w-full px-6 py-12 sm:py-20 flex flex-col gap-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-text-primary tracking-tight max-w-2xl leading-[1.1]">
            Coordination confidence for the group trip.
          </h1>
          <p className="text-base sm:text-lg text-text-muted max-w-xl">
            Find out who&apos;s doing what — before the group chat melts down. 
            All your trips in one place.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <Button onClick={() => setShowCreate(true)} className="px-8 shadow-md">
              + Start a new trip
            </Button>
            <div className="hidden sm:block w-px h-8 bg-border mx-2" />
            <form onSubmit={handleJoin} className="flex-1 max-w-xs flex gap-2">
              <input
                type="text"
                placeholder="Join with code or link"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                maxLength={200}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="flex-1 bg-bg border border-border rounded-[var(--radius-card)] px-4 py-2 text-sm text-text-primary placeholder:text-text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 transition-all"
              />
              <Button type="submit" variant="outline" disabled={!joinCode.trim()}>Join</Button>
            </form>
          </div>
        </div>
      </div>
      )}

      {/* Loading skeletons */}
      {tripsLoading && (
        <div className="max-w-screen-xl mx-auto w-full px-6 py-12 flex flex-col gap-10">
          <section className="flex flex-col gap-5">
            <div className="h-7 bg-border/60 rounded w-32 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-bg-card rounded-[var(--radius-card)] border border-border p-5 h-48 animate-pulse" />
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Error */}
      {!tripsLoading && tripsError && (
        <div className="max-w-screen-xl mx-auto w-full px-6 py-12">
          <div className="bg-bg-card rounded-[var(--radius-card)] border border-border px-6 py-5">
            <p className="text-sm text-text-muted">Failed to load trips: {tripsError}</p>
          </div>
        </div>
      )}

      {/* Welcome screen — zero trips */}
      {!tripsLoading && !tripsError && !hasTrips && (
        <WelcomeScreen
          onPlanTrip={() => setShowCreate(true)}
          onJoinTrip={handleJoinCode}
        />
      )}

      {/* Normal home — has trips */}
      {hasTrips && (
        <div className="max-w-screen-xl mx-auto w-full px-6 py-12 flex flex-col gap-12">
          <section className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-text-primary tracking-tight">Your active trips</h2>
              <span className="text-xs font-semibold text-text-subtle uppercase tracking-widest">{trips.length} total</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip: TripSummary) => {
                const dates = fmtDateRange(trip.start_date, trip.end_date);
                const isOwner = trip.created_by === session.user.id;
                const progress = trip.activity_count > 0 ? (trip.my_rated_count / trip.activity_count) * 100 : 0;
                
                return (
                  <button
                    key={trip.id}
                    onClick={() => router.push(`/trip/${trip.id}`)}
                    className="group relative w-full text-left bg-bg-card rounded-[var(--radius-card)] border border-border flex flex-col overflow-hidden hover:shadow-xl hover:border-accent/40 transition-all duration-300"
                  >
                    {/* Visual top bar */}
                    <div className="h-24 bg-bg relative overflow-hidden">
                       <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,var(--accent),transparent)]" />
                       <div className="absolute bottom-3 left-4 flex flex-col">
                         <span className="text-[10px] font-bold text-accent uppercase tracking-widest mb-0.5">Destination</span>
                         <span className="text-sm font-semibold text-text-primary flex items-center gap-1">
                           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-60">
                             <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                           </svg>
                           {trip.destination}
                         </span>
                       </div>
                    </div>

                    <div className="p-5 flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-lg font-bold text-text-primary leading-tight group-hover:text-accent transition-colors">
                          {trip.name}
                        </span>
                        {isOwner && (
                          <span className="shrink-0 text-[10px] font-bold text-accent bg-accent/10 border border-accent/20 rounded-full px-2.5 py-1 uppercase tracking-wide">
                            Owner
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <MemberDots count={trip.member_count} avatars={trip.member_avatars} />
                        <div className="flex flex-col items-end gap-1">
                          {dates && (
                            <span className="text-xs font-medium text-text-muted tabular-nums">{dates}</span>
                          )}
                          {trip.activity_count > 0 && (
                            <div className="flex items-center gap-1.5">
                              <div className="w-16 h-1 bg-border rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-accent transition-all duration-500" 
                                  style={{ width: `${progress}%` }} 
                                />
                              </div>
                              <span className="text-[10px] font-bold text-text-subtle tabular-nums">
                                {trip.my_rated_count}/{trip.activity_count}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Secondary CTA area */}
          <section className="bg-bg-card/50 border border-dashed border-border rounded-[var(--radius-card)] p-8 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-border/40 flex items-center justify-center">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-subtle">
                 <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
               </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">Planning with a new group?</h3>
              <p className="text-sm text-text-muted max-w-sm mt-1">
                Start a fresh trip and invite your friends. No more "where should we eat?" debates.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowCreate(true)}>
              + Start another trip
            </Button>
          </section>
        </div>
      )}

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
