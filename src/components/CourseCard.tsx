import Link from "next/link";
import Image from "next/image";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryColor?: string;
  progress?: number;
  image?: string;
  totalLessons?: number;
  completedLessons?: number;
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  href?: string;
  completed?: boolean;
  locked?: boolean;
  grade?: string;
}

const categoryColors: Record<string, string> = {
  Circuitry: "#f59e0b",
  "Game Design": "#8b5cf6",
  "Web Literacy": "#3b82f6",
  Coding: "#2dd4bf",
  "Green Tech": "#10b981",
  Robotics: "#06b6d4",
  "3D Design": "#f97316",
  Cybersecurity: "#ec4899",
  "UI/UX": "#a855f7",
  Creative: "#f97316",
  Security: "#8b5cf6",
  "Advanced STEM": "#ef4444",
};

export default function CourseCard({
  id,
  title,
  description,
  category,
  progress = 0,
  image,
  totalLessons,
  completedLessons,
  difficulty = "Beginner",
  href,
  completed = false,
  locked = false,
  grade,
}: CourseCardProps) {
  const color = categoryColors[category] || "#2dd4bf";
  const linkHref = href || `/school/student/lesson/${id}`;
  const completedColor = "#00f5d4";

  return (
    <div
      className={`group bg-(--bg-card) border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col relative ${
        locked
          ? "border-(--border-subtle) opacity-75 hover:opacity-100"
          : completed
            ? "border-[rgba(0,245,212,0.2)] hover:border-[rgba(0,245,212,0.4)] hover:shadow-xl hover:shadow-[rgba(0,245,212,0.06)]"
            : "border-(--border-subtle) hover:border-[rgba(45,212,191,0.3)] hover:shadow-xl hover:shadow-[rgba(45,212,191,0.06)]"
      }`}
    >
      {/* Completed / Locked overlay badge */}
      {completed && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-[#00f5d4] text-[#0a1a18] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide">
          <span
            className="material-symbols-outlined text-[12px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          Completed
        </div>
      )}
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-(--bg-sidebar)/60 rounded-2xl">
          <div className="text-center">
            <span className="material-symbols-outlined text-(--text-faint) text-[40px] block mb-2">
              lock
            </span>
            <p className="text-(--text-faint) text-xs font-semibold">Complete Prerequisites</p>
          </div>
        </div>
      )}

      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-(--bg-sidebar)">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${color}20, ${color}08)` }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 56, color: `${color}60` }}
            >
              auto_stories
            </span>
          </div>
        )}
        {completed && (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${completedColor}15, transparent)` }}
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
        <span
          className="absolute bottom-3 left-3 text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider text-white"
          style={{
            background: completed ? completedColor : color,
            color: completed ? "#0a1a18" : "white",
          }}
        >
          {category}
        </span>
        <span className="absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded bg-black/60 text-(--text-base)">
          {difficulty}
        </span>
        {completed && grade && (
          <span
            className="absolute bottom-3 right-3 text-base font-black px-2 py-0.5 rounded"
            style={{ color: completedColor, background: "rgba(0,0,0,0.5)" }}
          >
            {grade}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <h3
          className={`text-lg font-bold mb-2 leading-snug transition-colors ${completed ? "text-[#00f5d4]" : "text-(--text-base) group-hover:text-(--primary-green)"}`}
        >
          {title}
        </h3>
        <p className="text-(--text-muted) text-sm leading-relaxed mb-5 flex-1">{description}</p>

        {/* Progress */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-(--text-faint)">
              {completedLessons !== undefined && totalLessons !== undefined
                ? `${completedLessons}/${totalLessons} lessons`
                : "Progress"}
            </span>
            <span
              className="text-xs font-bold"
              style={{ color: completed ? completedColor : progress > 0 ? "#2dd4bf" : "#64748b" }}
            >
              {progress}%
            </span>
          </div>
          <div className="h-1.5 bg-(--border) rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progress}%`,
                background: completed
                  ? `linear-gradient(90deg, ${completedColor}, #2dd4bf)`
                  : `linear-gradient(90deg, #2dd4bf, #14b8a6)`,
              }}
            />
          </div>
        </div>

        {locked ? (
          <button
            disabled
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-(--bg-elevated) text-(--text-faint) font-bold rounded-xl text-sm cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">lock</span>
            Complete Prerequisites
          </button>
        ) : completed ? (
          <Link
            href={linkHref}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 font-bold rounded-xl text-sm hover:opacity-90 transition-opacity shadow-lg"
            style={{
              background: completedColor,
              color: "#0a1a18",
              boxShadow: `0 4px 15px ${completedColor}30`,
            }}
          >
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              visibility
            </span>
            Review Project
          </Link>
        ) : (
          <Link
            href={linkHref}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-(--primary-green) text-[#10221c] font-bold rounded-xl text-sm hover:opacity-90 transition-opacity shadow-lg shadow-[rgba(45,212,191,0.2)] group/btn"
          >
            {progress > 0 ? (
              <>
                Continue Learning
                <span className="material-symbols-outlined text-[18px] group-hover/btn:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </>
            ) : (
              <>
                Start Course
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              </>
            )}
          </Link>
        )}
      </div>
    </div>
  );
}
