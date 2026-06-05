"use client";

import { use, useEffect, useState } from "react";
import { useTripData, useSession } from "@pulse/hooks";
import { useTripStore } from "@pulse/store";
import { FindYourCrew } from "@/components/FindYourCrew";
import { FindYourCrewOverview } from "@/components/FindYourCrewOverview";
import { TripTimeline } from "@/components/TripTimeline";
import { TripSidebar } from "@/components/TripSidebar";
import { TripLoadingSkeleton } from "@/components/TripLoadingSkeleton";
import { TripSetupStrip } from "@/components/TripSetupStrip";
import { TripModals } from "@/components/TripModals";
import { useTripActions, type Tab } from "@/hooks/useTripActions";

const TAB_LABELS: Record<Tab, { short: string; full: string; sub: string }> = {
  activities: { short: "Rate",     full: "Rate",           sub: "What do you want to do?" },
  crew:       { short: "Crew",     full: "Find Your Crew", sub: "Who are you going with?" },
  timeline:   { short: "Timeline", full: "Timeline",       sub: "When and where?"          },
};

export default function TripPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ newMember?: string }>;
}) {
  const { id } = use(params);
  const { newMember } = use(searchParams);
  const { loading, error } = useTripData(id);
  const { session } = useSession();
  const trip = useTripStore((s) => s.trip);
  const members = useTripStore((s) => s.members);
  const activities = useTripStore((s) => s.activities);
  const stops = useTripStore((s) => s.stops);

  const actions = useTripActions(id);
  const { setOpenModal, copied, hiddenActivityIds } = actions;

  const [tab, setTab] = useState<Tab>("activities");

  // Reset scroll on entry — router.push from a scrolled Home doesn't reliably
  // reset scroll when the initial paint (loading skeleton) is shorter than the
  // prior scroll position. New-member flow scrolls to first unrated itself.
  useEffect(() => {
    if (newMember !== "1") window.scrollTo(0, 0);
  }, [newMember]);

  const userId = session?.user.id;
  const isOwner = !!userId && trip?.created_by === userId;

  if (loading) return <TripLoadingSkeleton />;

  if (error || !trip) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-text-muted text-sm">{error ?? "Trip not found"}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg overflow-x-clip">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
          {/* ── Sidebar ─────────────────────────────────────────── */}
          <TripSidebar
            trip={trip}
            tripId={id}
            members={members}
            userId={userId}
            isOwner={isOwner}
            copied={copied}
            onEditTrip={() => setOpenModal({ kind: "editTrip" })}
            onDeleteTrip={actions.handleDeleteTrip}
            onShowDatesModal={() => setOpenModal({ kind: "memberDates" })}
            onShowSchedulesModal={() => setOpenModal({ kind: "schedules" })}
            onShowInviteModal={() => setOpenModal({ kind: "invite" })}
            onCopyInvite={actions.handleCopyInvite}
            onOpenAddStop={() => setOpenModal({ kind: "addStop" })}
            onOpenEditStop={(stop) => setOpenModal({ kind: "editStop", stop })}
          />

          {/* ── Main content ─────────────────────────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">
            {/* Creator setup strip */}
            {isOwner && (
              <TripSetupStrip
                hasActivities={activities.length > 0}
                hasCrew={members.length > 1}
                onAddActivity={() => setOpenModal({ kind: "addActivity" })}
                onInvite={() => setOpenModal({ kind: "invite" })}
                onAddSuggestion={(name) => setOpenModal({ kind: "addActivity", prefill: { name } })}
              />
            )}

            {/* Tab bar */}
            <div role="tablist" className="flex border-b border-border">
              {(["activities", "crew", "timeline"] as Tab[]).map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px flex flex-col items-start gap-0.5 ${
                    tab === t
                      ? "text-text-primary border-accent"
                      : "text-text-muted border-transparent hover:text-text-primary"
                  }`}
                >
                  <span className="sm:hidden">{TAB_LABELS[t].short}</span>
                  <span className="hidden sm:inline">{TAB_LABELS[t].full}</span>
                  <span className="hidden sm:block text-[10px] font-normal text-text-subtle leading-none">
                    {TAB_LABELS[t].sub}
                  </span>
                </button>
              ))}
            </div>

            {/* Activities tab */}
            {tab === "activities" && (
              <FindYourCrew
                onAdd={() => setOpenModal({ kind: "addActivity" })}
                onEdit={(a) => setOpenModal({ kind: "editActivity", activity: a })}
                onDelete={actions.handleDelete}
                tripOwnerId={trip.created_by ?? undefined}
                hiddenIds={hiddenActivityIds}
                autoOpenFirstUnrated={newMember === "1"}
                onSwitchToCrewTab={() => setTab("crew")}
              />
            )}

            {/* Timeline tab */}
            {tab === "timeline" && (
              <TripTimeline />
            )}

            {/* Find your crew tab */}
            {tab === "crew" && (
              <FindYourCrewOverview />
            )}

          </div>
        </div>
      </div>

      <TripModals
        actions={actions}
        trip={trip}
        members={members}
        userId={userId}
        stops={stops}
      />
    </main>
  );
}
