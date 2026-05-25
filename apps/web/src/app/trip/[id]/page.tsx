"use client";

import { use, useMemo, useRef, useState } from "react";
import {
  useTripData,
  useSession,
  useAddActivity,
  useActivityActions,
  useRateActivity,
  useUpdateMemberDates,
  useUpdateTrip,
  useDeleteTrip,
  useRemoveMember,
} from "@pulse/hooks";
import { useTripStore } from "@pulse/store";
import { Button } from "@pulse/ui";
import { ActivityFormModal } from "@/components/ActivityFormModal";
import { ActivityDetailModal } from "@/components/ActivityDetailModal";
import { CompatibilityMatrix } from "@/components/CompatibilityMatrix";
import { FindYourCrew } from "@/components/FindYourCrew";
import { FindYourCrewAlt } from "@/components/FindYourCrewAlt";
import { FindYourCrewOverview } from "@/components/FindYourCrewOverview";
import { MemberDatesModal } from "@/components/MemberDatesModal";
import { CreateTripModal } from "@/components/CreateTripModal";
import { MemberSchedulesModal } from "@/components/MemberSchedulesModal";
import { InviteMemberModal } from "@/components/InviteMemberModal";
import { StopsPanel } from "@/components/StopsPanel";
import { FadeReveal } from "@/components/FadeReveal";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import { memberPalette, buildColorMap } from "@/lib/memberColors";
import type { Rating, Activity } from "@pulse/types";
import { RATING_LABELS } from "@pulse/types";

const isDev = process.env.NODE_ENV === "development";

type Tab = "activities" | "crew" | "crew-alt" | "matrix";

const TAB_LABELS: Record<Tab, { short: string; full: string }> = {
  activities: { short: "Activities", full: "Activities" },
  crew:       { short: "Find your crew", full: "Find your crew" },
  "crew-alt": { short: "Crew alt", full: "Crew (alt)" },
  matrix:     { short: "Matrix", full: "Matrix" },
};

const ratingColor: Record<Rating, string> = {
  MUST:  "bg-must  text-must-text",
  WANT:  "bg-want  text-want-text",
  MAYBE: "bg-maybe text-maybe-text",
  SKIP:  "bg-skip  text-skip-text",
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
  | { mode: "view"; activity: Activity }
  | { mode: "edit"; activity: Activity };

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
  const colorMap = useMemo(() => buildColorMap(members), [members]);
  const activities = useTripStore((s) => s.activities);
  const ratings = useTripStore((s) => s.ratings);
  const stops = useTripStore((s) => s.stops);

  const { addActivity, loading: adding, error: addError } = useAddActivity();
  const {
    updateActivity,
    deleteActivity,
    loading: acting,
    error: actError,
  } = useActivityActions();
  const { rateActivity, loading: rating } = useRateActivity();
  const {
    updateDates,
    loading: datesLoading,
    error: datesError,
  } = useUpdateMemberDates();
  const { updateTrip, loading: updating, error: updateError } = useUpdateTrip();
  const { deleteTrip, loading: deleting } = useDeleteTrip();
  const { removeMember, removingId, error: removeError } = useRemoveMember();
  const router = useRouter();

  const { showToast } = useToast();

  const [modal, setModal] = useState<ModalState>({ mode: "closed" });
  const [showDatesModal, setShowDatesModal] = useState(false);
  const [showEditTrip, setShowEditTrip] = useState(false);
  const [showSchedulesModal, setShowSchedulesModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<Tab>("crew");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const pendingDeleteRef = useRef<string | null>(null);
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hiddenActivityIds, setHiddenActivityIds] = useState<Set<string>>(
    new Set(),
  );
  const undoTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  function requestDelete(key: string, ms = 3000) {
    if (pendingDeleteRef.current === key) {
      clearTimeout(deleteTimerRef.current!);
      pendingDeleteRef.current = null;
      setPendingDeleteId(null);
      return true;
    }
    clearTimeout(deleteTimerRef.current!);
    pendingDeleteRef.current = key;
    setPendingDeleteId(key);
    deleteTimerRef.current = setTimeout(() => {
      pendingDeleteRef.current = null;
      setPendingDeleteId(null);
    }, ms);
    return false;
  }

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
    if (!requestDelete(activity.id, 3000)) return;
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
    if (!requestDelete("trip", 5000)) return;
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
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => setShowEditTrip(true)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg transition-colors"
                      title="Edit trip"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9.5 1.5l3 3-8 8H1.5v-3l8-8z" />
                      </svg>
                    </button>
                    <button
                      onClick={handleDeleteTrip}
                      disabled={deleting}
                      className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${pendingDeleteId === "trip" ? "text-red-500 bg-red-500/10" : "text-text-muted hover:text-red-500 hover:bg-bg"}`}
                      title={
                        pendingDeleteId === "trip"
                          ? "Tap again to confirm delete"
                          : "Delete trip"
                      }
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1.5 3.5h11M4.5 3.5V2.5a1 1 0 011-1h3a1 1 0 011 1v1M5.5 6.5v4M8.5 6.5v4M2.5 3.5l.75 8.25a1 1 0 001 .75h5.5a1 1 0 001-.75L11.5 3.5" />
                      </svg>
                    </button>
                  </div>
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
                          {m.avatar_url ? (
                            <img
                              src={m.avatar_url}
                              alt={m.name}
                              className="w-7 h-7 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <span
                              className="w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs shrink-0"
                              style={{
                                backgroundColor: memberPalette(
                                  colorMap.get(m.id) ?? 0,
                                ).bg,
                                color: memberPalette(colorMap.get(m.id) ?? 0)
                                  .fg,
                              }}
                            >
                              {m.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                          <div className="flex flex-col leading-tight min-w-0 flex-1">
                            <span className="text-xs font-medium text-text-primary">
                              {m.name.split(" ")[0]}
                            </span>
                            <span className="text-[11px] text-text-muted">
                              {dateStr ?? "Full trip"}
                            </span>
                          </div>
                          {isMe && (
                            <button
                              onClick={() => setShowDatesModal(true)}
                              className="p-1 text-text-muted hover:text-text-primary transition-colors shrink-0"
                              title="Edit my dates"
                            >
                              <svg
                                width="11"
                                height="11"
                                viewBox="0 0 14 14"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M9.5 1.5l3 3-8 8H1.5v-3l8-8z" />
                              </svg>
                            </button>
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
            <StopsPanel tripId={id} userId={userId} tripOwnerId={trip.created_by} />

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
            <div className="flex border-b border-border">
              {(["activities", "crew", ...(isDev ? ["crew-alt" as Tab] : []), "matrix"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                    tab === t
                      ? "text-text-primary border-accent"
                      : "text-text-muted border-transparent hover:text-text-primary"
                  } ${t === "crew-alt" ? "opacity-60" : ""}`}
                >
                  <span className="sm:hidden">{TAB_LABELS[t].short}</span>
                  <span className="hidden sm:inline">{TAB_LABELS[t].full}</span>
                </button>
              ))}
            </div>

            {/* Activities tab */}
            {tab === "activities" &&
              (() => {
                const visibleActivities = activities.filter(
                  (a) => !hiddenActivityIds.has(a.id),
                );

                // Group by stop when stops exist; flat list otherwise.
                type Group = { stopId: string | null; label: string | null; dateFrom: string | null; dateTo: string | null; acts: typeof visibleActivities }
                const groups: Group[] = stops.length > 0
                  ? [
                      ...stops.map((s) => ({
                        stopId: s.id,
                        label: s.name,
                        dateFrom: s.date_from ?? null,
                        dateTo: s.date_to ?? null,
                        acts: visibleActivities.filter((a) => a.stop_id === s.id),
                      })),
                      {
                        stopId: null,
                        label: 'Unassigned',
                        dateFrom: null,
                        dateTo: null,
                        acts: visibleActivities.filter((a) => !a.stop_id),
                      },
                    ].filter((g) => g.stopId === null || g.acts.length > 0)
                  : [{ stopId: null, label: null, dateFrom: null, dateTo: null, acts: visibleActivities }]

                return (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-text-muted">
                        {visibleActivities.length}{" "}
                        {visibleActivities.length === 1
                          ? "activity"
                          : "activities"}
                      </p>
                      <Button
                        size="sm"
                        onClick={() => setModal({ mode: "add" })}
                      >
                        + Add activity
                      </Button>
                    </div>

                    <div className="flex flex-col gap-5">
                      {visibleActivities.length === 0 && (
                        <div className="bg-bg-card rounded-[var(--radius-card)] border border-border px-6 py-12 flex flex-col items-center gap-2 text-center">
                          <p className="text-sm font-medium text-text-primary">
                            No activities yet
                          </p>
                          <p className="text-xs text-text-muted">
                            Add the first one for the group to rate.
                          </p>
                        </div>
                      )}
                      {groups.map((group) => (
                        <div key={group.stopId ?? '__unassigned'} className="flex flex-col gap-2">
                          {group.label && (
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-accent/60 shrink-0" />
                              <span className="text-xs font-semibold text-text-subtle uppercase tracking-widest">
                                {group.label}
                              </span>
                              {(group.dateFrom || group.dateTo) && (() => {
                                const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                const label = group.dateFrom && group.dateTo
                                  ? `${fmt(group.dateFrom)} – ${fmt(group.dateTo)}`
                                  : group.dateFrom ? `From ${fmt(group.dateFrom)}`
                                  : `Until ${fmt(group.dateTo!)}`
                                return <span className="text-[10px] font-medium text-accent">{label}</span>
                              })()}
                            </div>
                          )}
                          {group.acts.map((activity) => {
                        const activityRatings = ratings.filter(
                          (r) => r.activity_id === activity.id,
                        );
                        const myRating = activityRatings.find(
                          (r) => r.user_id === session?.user.id,
                        );
                        const editable = canEdit(activity);

                        const ratedIds = new Set(
                          activityRatings.map((r) => r.user_id),
                        );
                        const raters = members.filter((m) =>
                          ratedIds.has(m.id),
                        );
                        const ratersCapped = raters.slice(0, 4);
                        const ratersOverflow = raters.length - 4;
                        const suggester = members.find(
                          (m) => m.id === activity.added_by,
                        );

                        return (
                          <div
                            key={activity.id}
                            className="bg-bg-card rounded-[var(--radius-card)] border border-border px-4 py-3 flex items-start gap-3 cursor-pointer hover:shadow-sm hover:-translate-y-0.5 transition-all duration-150"
                            onClick={() => setModal({ mode: "view", activity })}
                          >
                            <div className="flex-1 min-w-0 flex flex-col gap-1">
                              {/* Line 1: name + my rating */}
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-text-primary truncate">
                                  {activity.name}
                                </p>
                                {myRating ? (
                                  <span
                                    className={`text-xs font-semibold px-2 py-0.5 rounded-[var(--radius-badge)] shrink-0 ${ratingColor[myRating.rating]}`}
                                  >
                                    {RATING_LABELS[myRating.rating]}
                                  </span>
                                ) : (
                                  <span className="text-[11px] px-2 py-0.5 rounded-[var(--radius-badge)] bg-accent/8 border border-accent/20 text-accent shrink-0">
                                    Rate
                                  </span>
                                )}
                              </div>

                              {/* Line 2: location with pin */}
                              {activity.location && (
                                <div className="flex items-center gap-1 text-xs font-medium text-text-muted">
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
                                  <span className="truncate">
                                    {activity.location}
                                  </span>
                                </div>
                              )}

                              {/* Line 3: suggested by + who rated */}
                              <div className="flex items-center justify-between gap-2 mt-0.5">
                                {suggester ? (
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    {suggester.avatar_url ? (
                                      <img
                                        src={suggester.avatar_url}
                                        alt={suggester.name}
                                        className="w-5 h-5 rounded-full object-cover shrink-0"
                                      />
                                    ) : (
                                      <div
                                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                                        style={{
                                          backgroundColor: memberPalette(
                                            colorMap.get(suggester.id) ?? 0,
                                          ).bg,
                                          color: memberPalette(
                                            colorMap.get(suggester.id) ?? 0,
                                          ).fg,
                                        }}
                                      >
                                        {suggester.name.charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                    <span className="text-[11px] text-text-subtle truncate">
                                      {suggester.name.split(" ")[0]}
                                    </span>
                                  </div>
                                ) : (
                                  <div />
                                )}

                                {raters.length > 0 ? (
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <div className="flex">
                                      {ratersCapped.map((m, i) =>
                                        m.avatar_url ? (
                                          <img
                                            key={m.id}
                                            src={m.avatar_url}
                                            alt={m.name}
                                            className="w-5 h-5 rounded-full object-cover"
                                            style={{
                                              marginLeft: i > 0 ? "-5px" : 0,
                                              border:
                                                "2px solid var(--bg-card)",
                                            }}
                                          />
                                        ) : (
                                          <div
                                            key={m.id}
                                            className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold"
                                            style={{
                                              marginLeft: i > 0 ? "-5px" : 0,
                                              border:
                                                "2px solid var(--bg-card)",
                                              backgroundColor: memberPalette(
                                                colorMap.get(m.id) ?? 0,
                                              ).bg,
                                              color: memberPalette(
                                                colorMap.get(m.id) ?? 0,
                                              ).fg,
                                            }}
                                          >
                                            {m.name.charAt(0).toUpperCase()}
                                          </div>
                                        ),
                                      )}
                                      {ratersOverflow > 0 && (
                                        <div
                                          className="w-5 h-5 rounded-full bg-border flex items-center justify-center text-[8px] font-bold text-text-muted"
                                          style={{
                                            marginLeft: "-5px",
                                            border: "2px solid var(--bg-card)",
                                          }}
                                        >
                                          +{ratersOverflow}
                                        </div>
                                      )}
                                    </div>
                                    <span className="text-[11px] text-text-subtle">
                                      {raters.length} rated
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-text-subtle shrink-0">
                                    no ratings yet
                                  </span>
                                )}
                              </div>
                            </div>

                            {editable && (
                              <div
                                className="flex flex-col gap-0.5 shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() =>
                                    setModal({ mode: "edit", activity })
                                  }
                                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg transition-colors"
                                  aria-label="Edit activity"
                                >
                                  <svg
                                    width="13"
                                    height="13"
                                    viewBox="0 0 14 14"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M9.5 1.5l3 3-8 8H1.5v-3l8-8z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDelete(activity)}
                                  disabled={acting}
                                  className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${pendingDeleteId === activity.id ? "text-red-500 bg-red-500/10" : "text-text-muted hover:text-red-500 hover:bg-bg"}`}
                                  aria-label={
                                    pendingDeleteId === activity.id
                                      ? "Confirm delete activity"
                                      : "Delete activity"
                                  }
                                >
                                  <svg
                                    width="13"
                                    height="13"
                                    viewBox="0 0 14 14"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M1.5 3.5h11M4.5 3.5V2.5a1 1 0 011-1h3a1 1 0 011 1v1M5.5 6.5v4M8.5 6.5v4M2.5 3.5l.75 8.25a1 1 0 001 .75h5.5a1 1 0 001-.75L11.5 3.5" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}

            {/* Find your crew tab (D2 — primary) */}
            {tab === "crew" && <FindYourCrewOverview />}

            {/* Crew alt tab (B2 — dev only) */}
            {tab === "crew-alt" && isDev && <FindYourCrewAlt />}

            {/* Matrix tab — other compatibility views */}
            {tab === "matrix" && <CompatibilityMatrix />}
          </div>
        </div>
      </div>

      <MemberSchedulesModal
        open={showSchedulesModal}
        members={members}
        colorMap={colorMap}
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

      <ActivityDetailModal
        open={modal.mode === "view"}
        activity={modal.mode === "view" ? modal.activity : null}
        members={members}
        activityRatings={ratings}
        myRating={
          modal.mode === "view"
            ? (ratings.find(
                (r) =>
                  r.activity_id === modal.activity.id && r.user_id === userId,
              )?.rating ?? null)
            : null
        }
        ratingLoading={rating}
        onRate={(r) =>
          modal.mode === "view" && rateActivity(modal.activity.id, r)
        }
        canEdit={modal.mode === "view" ? canEdit(modal.activity) : false}
        onClose={() => setModal({ mode: "closed" })}
        onEdit={() =>
          modal.mode === "view" &&
          setModal({ mode: "edit", activity: modal.activity })
        }
      />

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
        ownerId={trip.created_by}
        onRemoveMember={removeMember}
        removingMemberId={removingId}
        removeError={removeError}
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
