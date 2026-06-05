import { useState } from "react";
import { useRouter } from "next/navigation";
import {
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
import { useToast } from "@/components/ToastProvider";
import type { Activity, Stop } from "@pulse/types";
import { UNDO_DURATION_MS, TRIP_DELETE_DELAY_MS } from "@/lib/constants";

export type Tab = "activities" | "timeline" | "crew";

export type OpenModal =
  | { kind: "none" }
  | { kind: "addActivity"; prefill?: { name: string } }
  | { kind: "editActivity"; activity: Activity }
  | { kind: "addStop" }
  | { kind: "editStop"; stop: Stop }
  | { kind: "editTrip" }
  | { kind: "memberDates" }
  | { kind: "schedules" }
  | { kind: "invite" };

type ActivityFields = {
  name: string;
  location: string;
  description: string;
  url: string;
  stop_id: string | null;
};

type TripFields = {
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
};

type StopFields = { name: string; date_from: string | null; date_to: string | null };

export function useTripActions(id: string) {
  const trip = useTripStore((s) => s.trip);

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
  const [hiddenActivityIds, setHiddenActivityIds] = useState<Set<string>>(new Set());

  async function handleAdd(fields: ActivityFields) {
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

  async function handleEdit(fields: ActivityFields) {
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

  function unhide(activityId: string) {
    setHiddenActivityIds((prev) => { const s = new Set(prev); s.delete(activityId); return s });
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

  async function handleEditTrip(fields: TripFields) {
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

  async function handleAddStop(fields: StopFields) {
    const ok = await createStop(id, fields.name, fields.date_from, fields.date_to);
    if (ok) closeModal();
  }

  async function handleEditStop(fields: StopFields) {
    if (openModal.kind !== "editStop") return;
    const ok = await updateStop(openModal.stop.id, { name: fields.name, date_from: fields.date_from, date_to: fields.date_to });
    if (ok) closeModal();
  }

  async function handleSaveDates(arrival: string | null, departure: string | null) {
    await updateDates(arrival, departure);
    closeModal();
  }

  function handleCopyInvite() {
    const url = `${window.location.origin}/join?code=${trip!.invite_code}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return {
    openModal,
    setOpenModal,
    closeModal,
    copied,
    hiddenActivityIds,
    adding,
    addError,
    acting,
    actError,
    datesLoading,
    datesError,
    updating,
    updateError,
    stopLoading,
    stopError,
    removeMember,
    removingId,
    removeError,
    handleAdd,
    handleEdit,
    handleDelete,
    handleEditTrip,
    handleDeleteTrip,
    handleAddStop,
    handleEditStop,
    handleSaveDates,
    handleCopyInvite,
  };
}
