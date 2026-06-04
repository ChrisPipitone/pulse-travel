"use client";

import { use, useState, useEffect } from "react";
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
  useUndoAction,
} from "@pulse/hooks";
import { useTripStore } from "@pulse/store";
import { ActivityFormModal } from "@/components/ActivityFormModal";
import { FindYourCrew } from "@/components/FindYourCrew";
import { FindYourCrewOverview } from "@/components/FindYourCrewOverview";
import { MemberDatesModal } from "@/components/MemberDatesModal";
import { CreateTripModal } from "@/components/CreateTripModal";
import { MemberSchedulesModal } from "@/components/MemberSchedulesModal";
import { InviteMemberModal } from "@/components/InviteMemberModal";
import { StopFormModal } from "@/components/StopFormModal";
import { TripTimeline } from "@/components/TripTimeline";
import { TripSidebar } from "@/components/TripSidebar";
import { TripLoadingSkeleton } from "@/components/TripLoadingSkeleton";
import { SetDisplayNameModal } from "@/components/SetDisplayNameModal";
import { TripSetupStrip } from "@/components/TripSetupStrip";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import type { Activity, Stop } from "@pulse/types";
import { UNDO_DURATION_MS, TRIP_DELETE_DELAY_MS } from "@/lib/constants";

type Tab = "activities" | "timeline" | "crew";

const TAB_LABELS: Record<Tab, { short: string; full: string; sub: string }> = {
  activities: { short: "Rate",     full: "Rate",           sub: "What do you want to do?" },
  crew:       { short: "Crew",     full: "Find Your Crew", sub: "Who are you going with?" },
  timeline:   { short: "Timeline", full: "Timeline",       sub: "When and where?"          },
};

type OpenModal =
  | { kind: "none" }
  | { kind: "addActivity"; prefill?: { name: string } }
  | { kind: "editActivity"; activity: Activity }
  | { kind: "addStop" }
  | { kind: "editStop"; stop: Stop }
  | { kind: "editTrip" }
  | { kind: "memberDates" }
  | { kind: "schedules" }
  | { kind: "invite" };

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
  const { schedule: scheduleUndo } = useUndoAction();

  const [openModal, setOpenModal] = useState<OpenModal>({ kind: "none" });
  const closeModal = () => setOpenModal({ kind: "none" });
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<Tab>("activities");

  // Reset scroll on entry — router.push from a scrolled Home doesn't reliably
  // reset scroll when the initial paint (loading skeleton) is shorter than the
  // prior scroll position. New-member flow scrolls to first unrated itself.
  useEffect(() => {
    if (newMember !== "1") window.scrollTo(0, 0);
  }, [newMember]);
  const [hiddenActivityIds, setHiddenActivityIds] = useState<Set<string>>(new Set());

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
      closeModal();
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
    if (openModal.kind !== "editActivity") return;
    const ok = await updateActivity(openModal.activity.id, {
      name: fields.name,
      location: fields.location || null,
      description: fields.description || null,
      url: fields.url || null,
      stop_id: fields.stop_id ?? undefined,
    });
    if (ok) {
      closeModal();
      showToast("Activity saved");
    }
  }

  function unhide(id: string) {
    setHiddenActivityIds((prev) => { const s = new Set(prev); s.delete(id); return s });
  }

  async function handleDelete(activity: Activity) {
    setHiddenActivityIds((prev) => new Set(prev).add(activity.id));
    const cancel = scheduleUndo(activity.id, async () => {
      unhide(activity.id);
      const ok = await deleteActivity(activity.id);
      if (!ok) showToast("Failed to delete — activity restored");
    });
    showToast(`"${activity.name}" deleted`, () => { cancel(); unhide(activity.id); }, UNDO_DURATION_MS);
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
      closeModal();
      showToast("Trip updated");
    }
  }

  async function handleDeleteTrip() {
    const tripId = trip!.id;
    const tripName = trip!.name;
    router.replace("/");
    const cancel = scheduleUndo("trip", async () => {
      await deleteTrip(tripId, () => {});
      window.dispatchEvent(new Event("pulse:trips:changed"));
    }, TRIP_DELETE_DELAY_MS);
    showToast(`Trip "${tripName}" deleted`, () => { cancel(); router.push(`/trip/${tripId}`); }, TRIP_DELETE_DELAY_MS);
  }

  async function handleAddStop(fields: { name: string; date_from: string | null; date_to: string | null }) {
    const ok = await createStop(id, fields.name, fields.date_from, fields.date_to);
    if (ok) closeModal();
  }

  async function handleEditStop(fields: { name: string; date_from: string | null; date_to: string | null }) {
    if (openModal.kind !== "editStop") return;
    const ok = await updateStop(openModal.stop.id, { name: fields.name, date_from: fields.date_from, date_to: fields.date_to });
    if (ok) closeModal();
  }

  function handleCopyInvite() {
    const url = `${window.location.origin}/join?code=${trip!.invite_code}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

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
            onDeleteTrip={handleDeleteTrip}
            onShowDatesModal={() => setOpenModal({ kind: "memberDates" })}
            onShowSchedulesModal={() => setOpenModal({ kind: "schedules" })}
            onShowInviteModal={() => setOpenModal({ kind: "invite" })}
            onCopyInvite={handleCopyInvite}
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
              <div className="section-in">
                <FindYourCrew
                  onAdd={() => setOpenModal({ kind: "addActivity" })}
                  onEdit={(a) => setOpenModal({ kind: "editActivity", activity: a })}
                  onDelete={handleDelete}
                  tripOwnerId={trip.created_by ?? undefined}
                  hiddenIds={hiddenActivityIds}
                  autoOpenFirstUnrated={newMember === "1"}
                  onSwitchToCrewTab={() => setTab("crew")}
                />
              </div>
            )}

            {/* Timeline tab */}
            {tab === "timeline" && (
              <div className="section-in">
                <TripTimeline />
              </div>
            )}

            {/* Find your crew tab */}
            {tab === "crew" && (
              <div className="section-in">
                <FindYourCrewOverview />
              </div>
            )}

          </div>
        </div>
      </div>

      <MemberSchedulesModal
        open={openModal.kind === "schedules"}
        members={members}
        trip={trip}
        userId={userId}
        onEditDates={() => setOpenModal({ kind: "memberDates" })}
        onClose={closeModal}
      />

      {openModal.kind === "invite" && trip && (
        <InviteMemberModal
          tripName={trip.name}
          tripId={trip.id}
          inviteCode={trip.invite_code}
          onClose={closeModal}
        />
      )}

      <CreateTripModal
        open={openModal.kind === "editTrip"}
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
        onClose={closeModal}
        onSubmit={handleEditTrip}
        members={members}
        ownerId={trip.created_by ?? undefined}
        onRemoveMember={removeMember}
        removingMemberId={removingId}
        removeError={removeError}
      />

      <StopFormModal
        open={openModal.kind === "addStop"}
        title="Add stop"
        submitLabel="Add stop"
        loading={stopLoading}
        error={stopError}
        onClose={closeModal}
        onSubmit={handleAddStop}
      />

      <StopFormModal
        open={openModal.kind === "editStop"}
        title="Edit stop"
        submitLabel="Save"
        loading={stopLoading}
        error={stopError}
        initial={openModal.kind === "editStop" ? { name: openModal.stop.name, date_from: openModal.stop.date_from, date_to: openModal.stop.date_to } : undefined}
        onClose={closeModal}
        onSubmit={handleEditStop}
      />

      <ActivityFormModal
        open={openModal.kind === "addActivity"}
        title="Add Activity"
        submitLabel="Add"
        stops={stops}
        loading={adding}
        error={addError}
        onClose={closeModal}
        onSubmit={handleAdd}
        initial={openModal.kind === "addActivity" && openModal.prefill
          ? { name: openModal.prefill.name }
          : undefined}
      />

      {(() => {
        const me = members.find((m) => m.id === userId);
        return (
          <MemberDatesModal
            open={openModal.kind === "memberDates"}
            tripStart={trip.start_date ?? null}
            tripEnd={trip.end_date ?? null}
            initialArrival={me?.arrival_date ?? null}
            initialDeparture={me?.departure_date ?? null}
            loading={datesLoading}
            error={datesError}
            onClose={closeModal}
            onSubmit={async (arrival, departure) => {
              await updateDates(arrival, departure);
              closeModal();
            }}
          />
        );
      })()}

      <ActivityFormModal
        open={openModal.kind === "editActivity"}
        title="Edit Activity"
        stops={stops}
        initial={
          openModal.kind === "editActivity"
            ? {
                name: openModal.activity.name,
                location: openModal.activity.location ?? "",
                description: openModal.activity.description ?? "",
                url: openModal.activity.url ?? "",
                stop_id: openModal.activity.stop_id ?? null,
              }
            : undefined
        }
        loading={acting}
        error={actError}
        onClose={closeModal}
        onSubmit={handleEdit}
      />

      <SetDisplayNameModal />
    </main>
  );
}
