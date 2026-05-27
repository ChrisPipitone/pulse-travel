"use client";

import { use, useRef, useState } from "react";
import {
  useTripData,
  useSession,
  useAddActivity,
  useActivityActions,
  useUpdateMemberDates,
  useUpdateTrip,
  useDeleteTrip,
  useRemoveMember,
  useStopActions,
} from "@pulse/hooks";
import { useTripStore } from "@pulse/store";
import { ActivityFormModal } from "@/components/ActivityFormModal";
import { FindYourCrew } from "@/components/FindYourCrew";
import { FindYourCrewOverview } from "@/components/FindYourCrewOverview";
import { MemberDatesModal } from "@/components/MemberDatesModal";
import { CreateTripModal } from "@/components/CreateTripModal";
import { MemberSchedulesModal } from "@/components/MemberSchedulesModal";
import { InviteMemberModal } from "@/components/InviteMemberModal";
import { StopsPanel } from "@/components/StopsPanel";
import { StopFormModal } from "@/components/StopFormModal";
import { TripTimeline } from "@/components/TripTimeline";
import { FadeReveal } from "@/components/FadeReveal";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import { MemberAvatar } from "@/components/MemberAvatar";
import { KebabMenu } from "@/components/KebabMenu";
import type { Activity, Stop } from "@pulse/types";

type Tab = "activities" | "timeline" | "crew";

const TAB_LABELS: Record<Tab, { short: string; full: string }> = {
  activities: { short: "Activities", full: "Activities" },
  timeline:   { short: "Timeline",   full: "Timeline" },
  crew:       { short: "Crew",       full: "Find your crew" },
};

function formatDateRange(start: string, end: string) {
  const fmt = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  return `${fmt(start)} – ${fmt(end)}`;
}

function formatMemberDates(
  arrival?: string,
  departure?: string,
): string | null {
  const fmt = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  if (arrival && departure) return `${fmt(arrival)} – ${fmt(departure)}`;
  if (arrival) return `From ${fmt(arrival)}`;
  if (departure) return `Until ${fmt(departure)}`;
  return null;
}

type ModalState =
  | { mode: "closed" }
  | { mode: "add" }
  | { mode: "edit"; activity: Activity };

type StopModalState =
  | { mode: "closed" }
  | { mode: "add" }
  | { mode: "edit"; stop: Stop };

export default function TripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { loading, error } = useTripData(id);
  const { session } = useSession();
  const trip = useTripStore((s) => s.trip);
  const members = useTripStore((s) => s.members);
  const stops = useTripStore((s) => s.stops);

  const { addActivity, loading: adding, error: addError } = useAddActivity();
  const {
    updateActivity,
    deleteActivity,
    loading: acting,
    error: actError,
  } = useActivityActions();
  const {
    updateDates,
    loading: datesLoading,
    error: datesError,
  } = useUpdateMemberDates();
  const { updateTrip, loading: updating, error: updateError } = useUpdateTrip();
  const { deleteTrip } = useDeleteTrip();
  const { createStop, updateStop, loading: stopLoading, error: stopError } = useStopActions();
  const { removeMember, removingId, error: removeError } = useRemoveMember();
  const router = useRouter();

  const { showToast } = useToast();

  const [modal, setModal] = useState<ModalState>({ mode: "closed" });
  const [stopModal, setStopModal] = useState<StopModalState>({ mode: "closed" });
  const [showDatesModal, setShowDatesModal] = useState(false);
  const [showEditTrip, setShowEditTrip] = useState(false);
  const [showSchedulesModal, setShowSchedulesModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<Tab>("activities");
  const [hiddenActivityIds, setHiddenActivityIds] = useState<Set<string>>(
    new Set(),
  );
  const undoTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const userId = session?.user.id;
  const isOwner = !!userId && trip?.created_by === userId;

  function canEdit(activity: Activity) {
    return isOwner || activity.added_by === userId;
  }

  async function handleAdd(fields: {
    name: string;
    location: string;
    description: string;
    url: string;
    stop_id: string | null;
  }) {
    const ok = await addActivity({
      trip_id: id,
      name: fields.name,
      location: fields.location || null,
      description: fields.description || null,
      url: fields.url || null,
      stop_id: fields.stop_id || null,
      region: null,
      duration_hours: null,
      category_id: null,
    });
    if (ok) {
      setModal({ mode: "closed" });
      showToast("Activity added");
    }
  }

  async function handleEdit(fields: {
    name: string;
    location: string;
    description: string;
    url: string;
    stop_id: string | null;
  }) {
    if (modal.mode !== "edit") return;
    const ok = await updateActivity(modal.activity.id, {
      name: fields.name,
      location: fields.location || null,
      description: fields.description || null,
      url: fields.url || null,
      stop_id: fields.stop_id ?? undefined,
    });
    if (ok) {
      setModal({ mode: "closed" });
      showToast("Activity saved");
    }
  }

  async function handleDelete(activity: Activity) {
    setHiddenActivityIds((prev) => new Set(prev).add(activity.id));
    const timer = setTimeout(async () => {
      undoTimersRef.current.delete(activity.id);
      setHiddenActivityIds((prev) => {
        const s = new Set(prev);
        s.delete(activity.id);
        return s;
      });
      const ok = await deleteActivity(activity.id);
      if (!ok) showToast("Failed to delete — activity restored");
    }, 4000);
    undoTimersRef.current.set(activity.id, timer);
    showToast(
      `"${activity.name}" deleted`,
      () => {
        clearTimeout(undoTimersRef.current.get(activity.id));
        undoTimersRef.current.delete(activity.id);
        setHiddenActivityIds((prev) => {
          const s = new Set(prev);
          s.delete(activity.id);
          return s;
        });
      },
      4000,
    );
  }

  async function handleEditTrip(fields: {
    name: string;
    destination: string;
    start_date: string;
    end_date: string;
  }) {
    const ok = await updateTrip({
      name: fields.name,
      destination: fields.destination,
      start_date: fields.start_date || null,
      end_date: fields.end_date || null,
    });
    if (ok) {
      setShowEditTrip(false);
      showToast("Trip updated");
    }
  }

  async function handleDeleteTrip() {
    const tripId = trip!.id;
    const tripName = trip!.name;
    router.replace("/");
    const timer = setTimeout(async () => {
      undoTimersRef.current.delete("trip");
      await deleteTrip(tripId, () => {});
      window.dispatchEvent(new Event("pulse:trips:changed"));
    }, 5000);
    undoTimersRef.current.set("trip", timer);
    showToast(
      `Trip "${tripName}" deleted`,
      () => {
        clearTimeout(undoTimersRef.current.get("trip"));
        undoTimersRef.current.delete("trip");
        router.push(`/trip/${tripId}`);
      },
      5000,
    );
  }

  async function handleAddStop(fields: { name: string; date_from: string | null; date_to: string | null }) {
    const ok = await createStop(id, fields.name, fields.date_from, fields.date_to);
    if (ok) setStopModal({ mode: "closed" });
  }

  async function handleEditStop(fields: { name: string; date_from: string | null; date_to: string | null }) {
    if (stopModal.mode !== "edit") return;
    const ok = await updateStop(stopModal.stop.id, { name: fields.name, date_from: fields.date_from, date_to: fields.date_to });
    if (ok) setStopModal({ mode: "closed" });
  }

  function handleCopyInvite() {
    const url = `${window.location.origin}/join?code=${trip!.invite_code}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-bg overflow-x-clip">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
            <aside className="w-full lg:w-72 lg:shrink-0 flex flex-col gap-6">
              <div className="bg-bg-card rounded-[var(--radius-card)] border border-border p-5 flex flex-col gap-3 animate-pulse">
                <div className="h-5 bg-border rounded w-3/4" />
                <div className="h-3.5 bg-border rounded w-1/2" />
                <div className="h-3 bg-border rounded w-2/3 mt-1" />
              </div>
              <div className="bg-bg-card rounded-[var(--radius-card)] border border-border p-5 flex flex-col gap-3 animate-pulse">
                <div className="h-4 bg-border rounded w-1/3" />
                <div className="h-3 bg-border rounded w-full" />
                <div className="h-3 bg-border rounded w-4/5" />
                <div className="h-3 bg-border rounded w-3/5" />
              </div>
              <div className="bg-bg-card rounded-[var(--radius-card)] border border-border p-5 flex flex-col gap-3 animate-pulse">
                <div className="h-4 bg-border rounded w-1/4" />
                <div className="h-8 bg-border rounded w-full" />
              </div>
            </aside>
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              <div className="flex gap-2 animate-pulse">
                <div className="h-8 bg-border rounded-lg w-24" />
                <div className="h-8 bg-border rounded-lg w-32" />
              </div>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-bg-card rounded-[var(--radius-card)] border border-border p-4 flex items-center gap-3 animate-pulse"
                >
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="h-4 bg-border rounded w-2/5" />
                    <div className="h-3 bg-border rounded w-1/4" />
                  </div>
                  <div className="flex gap-1.5">
                    <div className="h-6 w-14 bg-border rounded-full" />
                    <div className="h-6 w-14 bg-border rounded-full" />
                    <div className="h-6 w-14 bg-border rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

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
          <aside className="w-full lg:w-72 lg:shrink-0 flex flex-col gap-6 lg:sticky lg:top-[5rem]">
            {/* Trip identity */}
            <div className="bg-bg-card rounded-[var(--radius-card)] border border-border border-t-2 border-t-accent p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <h1 className="text-xl font-semibold text-text-primary leading-tight">
                    {trip.name}
                  </h1>
                  <p className="text-sm text-text-muted truncate">
                    {trip.destination}
                  </p>
                </div>
                {isOwner && (
                  <KebabMenu
                    items={[
                      { label: "Edit trip", onClick: () => setShowEditTrip(true) },
                      { label: "Delete trip", danger: true, onClick: handleDeleteTrip },
                    ]}
                  />
                )}
              </div>

              {trip.start_date && trip.end_date && (
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" />
                    <path d="M1.5 6h11M4.5 1v3M9.5 1v3" />
                  </svg>
                  {formatDateRange(trip.start_date, trip.end_date)}
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-text-muted">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="5" cy="4.5" r="2" />
                  <path d="M1.5 12c0-2.21 1.567-4 3.5-4s3.5 1.79 3.5 4" />
                  <circle cx="10" cy="4.5" r="2" />
                  <path d="M10 8.5c1.2.3 2.5 1.5 2.5 3.5" />
                </svg>
                {members.length} {members.length === 1 ? "person" : "people"}
              </div>
            </div>

            {/* Member schedule */}
            {(() => {
              const INLINE_CAP = 5;
              const useModal = members.length > INLINE_CAP;
              const me = members.find((m) => m.id === userId);
              const others = members.filter((m) => m.id !== userId);
              const inlineList = useModal
                ? me
                  ? [me, ...others.slice(0, INLINE_CAP)]
                  : members.slice(0, INLINE_CAP)
                : me
                  ? [me, ...others]
                  : members;

              return (
                <div className="bg-bg-card rounded-[var(--radius-card)] border border-border p-5 flex flex-col gap-3">
                  <h2 className="text-xs font-semibold text-text-subtle uppercase tracking-widest">
                    Schedules
                  </h2>
                  <div className="flex flex-col gap-2">
                    {inlineList.map((m) => {
                      const isMe = m.id === userId;
                      const dateStr = formatMemberDates(
                        m.arrival_date,
                        m.departure_date,
                      );
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
                              items={[
                                { label: "Edit dates", onClick: () => setShowDatesModal(true) },
                              ]}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {useModal && (
                    <FadeReveal
                      label={`See all ${members.length} members →`}
                      onClick={() => setShowSchedulesModal(true)}
                    />
                  )}
                </div>
              );
            })()}

            {/* Stops */}
            <StopsPanel
              tripId={id}
              userId={userId}
              tripOwnerId={trip.created_by ?? undefined}
              onOpenAdd={() => setStopModal({ mode: "add" })}
              onOpenEdit={(stop) => setStopModal({ mode: "edit", stop })}
            />

            {/* Invite */}
            <div className="bg-bg-card rounded-[var(--radius-card)] border border-border p-5 flex flex-col gap-3">
              <h2 className="text-xs font-semibold text-text-subtle uppercase tracking-widest">
                Invite
              </h2>
              <button
                onClick={() => setShowInviteModal(true)}
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
                  onClick={handleCopyInvite}
                  className="shrink-0 text-xs font-medium text-text-muted hover:text-accent transition-colors px-2.5 py-1.5 rounded-lg border border-border bg-bg hover:border-accent/30"
                >
                  {copied ? "Copied!" : "Copy link"}
                </button>
              </div>
            </div>
          </aside>

          {/* ── Main content ─────────────────────────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">
            {/* Tab bar */}
            <div role="tablist" className="flex border-b border-border">
              {(["activities", "crew", "timeline"] as Tab[]).map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                    tab === t
                      ? "text-text-primary border-accent"
                      : "text-text-muted border-transparent hover:text-text-primary"
                  }`}
                >
                  <span className="sm:hidden">{TAB_LABELS[t].short}</span>
                  <span className="hidden sm:inline">{TAB_LABELS[t].full}</span>
                </button>
              ))}
            </div>

            {/* Activities tab */}
            {tab === "activities" && (
              <FindYourCrew
                onAdd={() => setModal({ mode: "add" })}
                onEdit={(a) => setModal({ mode: "edit", activity: a })}
                onDelete={handleDelete}
                tripOwnerId={trip.created_by ?? undefined}
                hiddenIds={hiddenActivityIds}
              />
            )}

            {/* Timeline tab */}
            {tab === "timeline" && <TripTimeline />}

            {/* Find your crew tab */}
            {tab === "crew" && <FindYourCrewOverview />}

          </div>
        </div>
      </div>

      <MemberSchedulesModal
        open={showSchedulesModal}
        members={members}
        userId={userId}
        onEditDates={() => setShowDatesModal(true)}
        onClose={() => setShowSchedulesModal(false)}
      />

      {showInviteModal && trip && (
        <InviteMemberModal
          tripName={trip.name}
          tripId={trip.id}
          inviteCode={trip.invite_code}
          onClose={() => setShowInviteModal(false)}
        />
      )}

      <CreateTripModal
        open={showEditTrip}
        title="Edit trip"
        initial={{
          name: trip.name,
          destination: trip.destination,
          start_date: trip.start_date ?? "",
          end_date: trip.end_date ?? "",
        }}
        submitLabel="Save"
        loading={updating}
        error={updateError}
        onClose={() => setShowEditTrip(false)}
        onSubmit={handleEditTrip}
        members={members}
        ownerId={trip.created_by ?? undefined}
        onRemoveMember={removeMember}
        removingMemberId={removingId}
        removeError={removeError}
      />

      <StopFormModal
        open={stopModal.mode === "add"}
        title="Add stop"
        submitLabel="Add stop"
        loading={stopLoading}
        error={stopError}
        onClose={() => setStopModal({ mode: "closed" })}
        onSubmit={handleAddStop}
      />

      <StopFormModal
        open={stopModal.mode === "edit"}
        title="Edit stop"
        submitLabel="Save"
        loading={stopLoading}
        error={stopError}
        initial={stopModal.mode === "edit" ? { name: stopModal.stop.name, date_from: stopModal.stop.date_from, date_to: stopModal.stop.date_to } : undefined}
        onClose={() => setStopModal({ mode: "closed" })}
        onSubmit={handleEditStop}
      />

      <ActivityFormModal
        open={modal.mode === "add"}
        title="Add Activity"
        submitLabel="Add"
        stops={stops}
        loading={adding}
        error={addError}
        onClose={() => setModal({ mode: "closed" })}
        onSubmit={handleAdd}
      />

      {(() => {
        const me = members.find((m) => m.id === userId);
        return (
          <MemberDatesModal
            open={showDatesModal}
            tripStart={trip.start_date ?? null}
            tripEnd={trip.end_date ?? null}
            initialArrival={me?.arrival_date ?? null}
            initialDeparture={me?.departure_date ?? null}
            loading={datesLoading}
            error={datesError}
            onClose={() => setShowDatesModal(false)}
            onSubmit={async (arrival, departure) => {
              await updateDates(arrival, departure);
              setShowDatesModal(false);
            }}
          />
        );
      })()}

      <ActivityFormModal
        open={modal.mode === "edit"}
        title="Edit Activity"
        stops={stops}
        initial={
          modal.mode === "edit"
            ? {
                name: modal.activity.name,
                location: modal.activity.location ?? "",
                description: modal.activity.description ?? "",
                url: modal.activity.url ?? "",
                stop_id: modal.activity.stop_id ?? null,
              }
            : undefined
        }
        loading={acting}
        error={actError}
        onClose={() => setModal({ mode: "closed" })}
        onSubmit={handleEdit}
      />
    </main>
  );
}
