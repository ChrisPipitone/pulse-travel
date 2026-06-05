"use client";

// Sizes: xs=16 sm=20 md=24 lg=28 xl=34 2xl=38 3xl=56
const SIZES = {
  xs:  { dim: "w-4 h-4",           font: "text-[7px]",  label: "text-[8px]"  },
  sm:  { dim: "w-5 h-5",           font: "text-[8px]",  label: "text-[9px]"  },
  md:  { dim: "w-6 h-6",           font: "text-[9px]",  label: "text-[9px]"  },
  lg:  { dim: "w-7 h-7",           font: "text-[10px]", label: "text-[9px]"  },
  xl:  { dim: "w-[34px] h-[34px]", font: "text-[12px]", label: "text-[10px]" },
  "2xl": { dim: "w-[38px] h-[38px]", font: "text-[13px]", label: "text-[11px]" },
  "3xl": { dim: "w-[56px] h-[56px]", font: "text-[18px]", label: "text-[11px]" },
} as const;

interface MemberAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: keyof typeof SIZES;
  /** Show first name as label below the circle */
  withLabel?: boolean;
  /** Faded treatment — for SKIP tier or de-emphasised contexts */
  muted?: boolean;
  /** Negative margin + card-border for overlap stacking */
  overlap?: boolean;
  className?: string;
}

export function MemberAvatar({
  name,
  avatarUrl,
  size = "md",
  withLabel = false,
  muted = false,
  overlap = false,
  className = "",
}: MemberAvatarProps) {
  const { dim, font, label } = SIZES[size];
  const initials = name.trim().split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const overlapStyle = overlap
    ? { marginLeft: "-6px", border: "2px solid var(--bg-card)" }
    : undefined;

  const circle = avatarUrl ? (
    <img
      src={avatarUrl}
      alt={name}
      className={`${dim} rounded-full object-cover shrink-0 ${muted ? "opacity-40" : ""}`}
      style={overlapStyle}
    />
  ) : (
    // No photo → grey fallback; muted fades it further for SKIP tier
    <div
      className={`${dim} ${font} rounded-full flex items-center justify-center font-bold shrink-0 select-none ${muted ? "opacity-50" : ""}`}
      style={{
        backgroundColor: "var(--border)",
        color: "var(--text-subtle)",
        ...overlapStyle,
      }}
    >
      {initials}
    </div>
  );

  if (!withLabel) {
    return className ? (
      <span className={`inline-flex shrink-0 ${className}`}>{circle}</span>
    ) : circle;
  }

  return (
    <div className={`flex flex-col items-center gap-[3px] ${className}`}>
      {circle}
      <span className={`${label} font-medium text-text-subtle leading-none whitespace-nowrap`}>
        {name.split(" ")[0]}
      </span>
    </div>
  );
}
