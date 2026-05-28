"use client";

const SUGGESTIONS = [
  { name: "Group Dinner", emoji: "🍽️" },
  { name: "City Walk", emoji: "🗺️" },
  { name: "Beach Day", emoji: "🏖️" },
];

const STEPS = ["Add activities", "Invite your group", "You're set"];

export function TripSetupStrip({
  hasActivities,
  hasCrew,
  onAddActivity,
  onInvite,
  onAddSuggestion,
}: {
  hasActivities: boolean;
  hasCrew: boolean;
  onAddActivity: () => void;
  onInvite: () => void;
  onAddSuggestion: (name: string) => void;
}) {
  if (hasActivities && hasCrew) return null;

  const done = [hasActivities, hasCrew, hasActivities && hasCrew];

  return (
    <div className="bg-bg-card rounded-[var(--radius-card)] border border-border p-4 flex flex-col gap-3">
      <p className="text-[10px] font-bold text-text-subtle uppercase tracking-widest">Get started</p>

      {/* Step indicators */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-text-subtle text-[11px]">→</span>}
            <div className={`flex items-center gap-1.5 text-xs font-medium ${done[i] ? "text-text-subtle" : "text-text-primary"}`}>
              <span
                className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                style={done[i]
                  ? { background: "rgba(22,163,74,.12)", color: "#16A34A" }
                  : { background: "rgba(var(--accent-rgb, 255,92,53),.12)", color: "var(--accent)" }}
              >
                {done[i] ? "✓" : i + 1}
              </span>
              <span className={done[i] ? "line-through" : ""}>{label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Suggestions — until first activity added */}
      {!hasActivities && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-text-muted">Start with:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s.name}
              onClick={() => onAddSuggestion(`${s.name} ${s.emoji}`)}
              className="text-xs font-medium px-3 py-1.5 rounded-full border border-border bg-bg hover:border-accent/30 hover:bg-accent/5 transition-colors text-text-primary"
            >
              {s.emoji} {s.name}
            </button>
          ))}
          <button
            onClick={onAddActivity}
            className="text-xs font-medium px-3 py-1.5 rounded-full border border-dashed border-accent/40 text-accent hover:bg-accent/5 transition-colors"
          >
            + Custom
          </button>
        </div>
      )}

      {/* Step 2 CTA — activities done, crew not yet */}
      {hasActivities && !hasCrew && (
        <button
          onClick={onInvite}
          className="self-start text-xs font-semibold px-3 py-1.5 rounded-[var(--radius-btn)] bg-accent text-white hover:opacity-90 transition-opacity"
        >
          Invite your group →
        </button>
      )}
    </div>
  );
}
