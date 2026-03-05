"use client";

interface BadgeCardProps {
  name: string;
  description: string;
  icon: string;
  color?: string;
  earned?: boolean;
  earnedDate?: string;
  xpValue?: number;
  rarity?: "common" | "rare" | "epic" | "legendary";
}

const rarityColors = {
  common: { border: "#64748b", glow: "#64748b" },
  rare: { border: "#3b82f6", glow: "#3b82f6" },
  epic: { border: "#a855f7", glow: "#a855f7" },
  legendary: { border: "#f59e0b", glow: "#f59e0b" },
};

export default function BadgeCard({
  name,
  description,
  icon,
  color = "#2dd4bf",
  earned = false,
  earnedDate,
  xpValue = 50,
  rarity = "common",
}: BadgeCardProps) {
  const { border, glow } = rarityColors[rarity];

  return (
    <div
      className={`relative rounded-2xl p-5 bg-(--bg-card) border transition-all duration-300 flex flex-col items-center text-center group ${
        earned ? "hover:shadow-lg" : "opacity-50 grayscale"
      }`}
      style={{
        borderColor: earned ? `${border}40` : "var(--border)",
        boxShadow: earned ? `0 0 0 0 ${glow}00` : "none",
      }}
      onMouseEnter={(e) => {
        if (earned) {
          (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${glow}30`;
          (e.currentTarget as HTMLElement).style.borderColor = `${border}60`;
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "";
        (e.currentTarget as HTMLElement).style.borderColor = earned ? `${border}40` : "var(--border)";
      }}
    >
      {/* Rarity indicator */}
      <div
        className="absolute top-3 right-3 text-[10px] font-bold px-1.5 py-0.5 rounded"
        style={{ background: `${border}20`, color: border }}
      >
        {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
      </div>

      {/* Badge icon */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mt-2"
        style={{ background: `${color}18` }}
      >
        <span className="material-symbols-outlined text-[36px]" style={{ color }}>
          {icon}
        </span>
      </div>

      <h3 className="text-(--text-base) font-bold text-sm mb-1">{name}</h3>
      <p className="text-(--text-muted) text-xs leading-relaxed mb-3">{description}</p>

      <div className="flex items-center gap-3 w-full justify-center">
        <span
          className="text-xs font-bold px-2 py-0.5 rounded"
          style={{ background: "rgba(45,212,191,0.1)", color: "var(--primary-green)" }}
        >
          +{xpValue} XP
        </span>
        {earned && earnedDate && <span className="text-xs text-(--text-faint)">{earnedDate}</span>}
      </div>

      {!earned && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-(--bg-sidebar)/60">
          <span className="material-symbols-outlined text-(--text-faint)">lock</span>
        </div>
      )}
    </div>
  );
}
