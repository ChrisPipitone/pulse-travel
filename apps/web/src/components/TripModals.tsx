"use client";

import { ActivityFormModal } from "@/components/ActivityFormModal";
import { MemberDatesModal } from "@/components/MemberDatesModal";
import { CreateTripModal } from "@/components/CreateTripModal";
import { MemberSchedulesModal } from "@/components/MemberSchedulesModal";
import { InviteMemberModal } from "@/components/InviteMemberModal";
import { StopFormModal } from "@/components/StopFormModal";
import { SetDisplayNameModal } from "@/components/SetDisplayNameModal";
import type { Trip, Member, Stop } from "@pulse/types";
import type { useTripActions } from "@/hooks/useTripActions";

interface TripModalsProps {
  actions: ReturnType<typeof useTripActions>;
  trip: Trip;
  members: Member[];
  userId?: string;
  stops: Stop[];
}

export function TripModals({ actions, trip, members, userId, stops }: TripModalsProps) {
  const {
    openModal,
    setOpenModal,
    closeModal,
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
    handleEditTrip,
    handleAddStop,
    handleEditStop,
    handleSaveDates,
  } = actions;

  const me = members.find((m) => m.id === userId);

  return (
    <>
      <MemberSchedulesModal
        open={openModal.kind === "schedules"}
        members={members}
        trip={trip}
        userId={userId}
        onEditDates={() => setOpenModal({ kind: "memberDates" })}
        onClose={closeModal}
      />

      {openModal.kind === "invite" && (
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

      <MemberDatesModal
        open={openModal.kind === "memberDates"}
        tripStart={trip.start_date ?? null}
        tripEnd={trip.end_date ?? null}
        initialArrival={me?.arrival_date ?? null}
        initialDeparture={me?.departure_date ?? null}
        loading={datesLoading}
        error={datesError}
        onClose={closeModal}
        onSubmit={handleSaveDates}
      />

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
    </>
  );
}
