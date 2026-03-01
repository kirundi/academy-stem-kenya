interface StatCardProps {
  icon: string;
  iconColor?: string;
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}

export default function StatCard({
  icon,
  iconColor = "#13eca4",
  label,
  value,
  change,
  changeType = "positive",
}: StatCardProps) {
  const changeBg =
    changeType === "positive"
      ? "bg-emerald-500/10 text-emerald-400"
      : changeType === "negative"
      ? "bg-red-500/10 text-red-400"
      : "bg-slate-700 text-slate-400";

  return (
    <div className="bg-[#1a2e27] rounded-2xl p-6 border border-[rgba(19,236,164,0.08)] hover:border-[rgba(19,236,164,0.2)] transition-all">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${iconColor}18` }}
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ color: iconColor }}
          >
            {icon}
          </span>
        </div>
        {change && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${changeBg}`}>
            {change}
          </span>
        )}
      </div>
      <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
      <p className="text-white text-3xl font-bold">{value}</p>
    </div>
  );
}
