import type { TripMemberAvatar } from "@pulse/services";

export function MemberDots({ count, avatars }: { count: number; avatars: TripMemberAvatar[] }) {
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
            style={{
              marginLeft: i === 0 ? 0 : -6,
              zIndex: shown - i,
              backgroundColor: "var(--border)",
              color: "var(--text-subtle)",
            }}
            className="relative w-6 h-6 rounded-full border-2 border-bg-card flex items-center justify-center text-[9px] font-semibold"
          >
            {member.name.charAt(0).toUpperCase()}
          </span>
        ),
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
