"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStudentData } from "@/hooks/useStudentData";
import { useCollection } from "@/hooks/useFirestore";
import { where } from "firebase/firestore";
import type { Course } from "@/lib/types";

const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  graded: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  pending: { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400" },
  draft: { bg: "bg-slate-700", text: "text-slate-400", dot: "bg-slate-500" },
};

const statusLabels: Record<string, string> = {
  graded: "Graded",
  pending: "Under Review",
  draft: "Draft",
};

const courseIcons: Record<string, { icon: string; color: string }> = {
  Circuitry: { icon: "bolt", color: "#f59e0b" },
  "Game Design": { icon: "sports_esports", color: "#8b5cf6" },
  Coding: { icon: "code", color: "#13eca4" },
  "Web Literacy": { icon: "language", color: "#3b82f6" },
  Cybersecurity: { icon: "security", color: "#ec4899" },
  Robotics: { icon: "precision_manufacturing", color: "#06b6d4" },
  "Green Tech": { icon: "eco", color: "#10b981" },
};
const defaultCourseIcon = { icon: "science", color: "#13eca4" };

function formatDate(date: Date | { toDate?: () => Date } | null | undefined): string | null {
  if (!date) return null;
  const d =
    typeof (date as { toDate?: () => Date }).toDate === "function"
      ? (date as { toDate: () => Date }).toDate()
      : (date as Date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function PortfolioPage() {
  const { submissions, loading: studentLoading } = useStudentData();

  // Get unique courseIds from submissions
  const courseIds = useMemo(
    () => [...new Set(submissions.map((s) => s.courseId).filter(Boolean))],
    [submissions]
  );

  // Fetch course docs to get course titles and categories
  const { data: courses, loading: coursesLoading } = useCollection<Course>(
    "courses",
    courseIds.length > 0 ? [where("__name__", "in", courseIds.slice(0, 10))] : [],
    courseIds.length > 0
  );

  const loading = studentLoading || coursesLoading;

  // Build a map of courseId -> course data
  const courseMap = useMemo(() => {
    const map: Record<string, Course & { id: string }> = {};
    for (const c of courses) {
      map[c.id] = c;
    }
    return map;
  }, [courses]);

  // Build project list from submissions
  const projects = useMemo(() => {
    return submissions.map((sub) => {
      const course = courseMap[sub.courseId];
      const category = course?.category ?? "STEM";
      const iconData = courseIcons[category] ?? defaultCourseIcon;
      return {
        id: sub.id,
        title: sub.content
          ? sub.content.slice(0, 60) + (sub.content.length > 60 ? "..." : "")
          : `${course?.title ?? "Course"} Submission`,
        course: course?.title ?? "Course",
        description: sub.content || "No description provided.",
        status: sub.status,
        grade: sub.grade,
        score: sub.score,
        submittedAt: formatDate(sub.submittedAt),
        color: iconData.color,
        icon: iconData.icon,
        category,
      };
    });
  }, [submissions, courseMap]);

  const [filter, setFilter] = useState("All Projects");

  const filteredProjects = useMemo(() => {
    if (filter === "Graded") return projects.filter((p) => p.status === "graded");
    if (filter === "Under Review") return projects.filter((p) => p.status === "pending");
    if (filter === "Drafts") return projects.filter((p) => p.status === "draft");
    return projects;
  }, [projects, filter]);

  // Compute stats
  const totalSubmitted = projects.length;
  const gradedCount = projects.filter((p) => p.status === "graded").length;
  const avgScore =
    gradedCount > 0
      ? Math.round(
          projects
            .filter((p) => p.status === "graded" && p.score !== null)
            .reduce((sum, p) => sum + (p.score ?? 0), 0) / gradedCount
        )
      : 0;
  const underReviewCount = projects.filter((p) => p.status === "pending").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#13eca4]">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#10221c]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(19,236,164,0.08)] px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">My Portfolio</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            {totalSubmitted} total projects &middot; {gradedCount} graded
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#13eca4] text-[#10221c] font-bold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-[rgba(19,236,164,0.2)]">
          <span className="material-symbols-outlined text-[18px]">share</span>
          Share Portfolio
        </button>
      </header>

      <div className="px-8 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          {[
            {
              icon: "science",
              color: "#13eca4",
              label: "Projects Submitted",
              value: String(totalSubmitted),
            },
            { icon: "check_circle", color: "#10b981", label: "Graded", value: String(gradedCount) },
            {
              icon: "star",
              color: "#f59e0b",
              label: "Average Score",
              value: gradedCount > 0 ? `${avgScore}%` : "--",
            },
            {
              icon: "pending",
              color: "#3b82f6",
              label: "Under Review",
              value: String(underReviewCount),
            },
          ].map(({ icon, color, label, value }) => (
            <div
              key={label}
              className="bg-[#1a2e27] rounded-2xl p-5 border border-[rgba(19,236,164,0.08)]"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${color}18` }}
              >
                <span className="material-symbols-outlined text-[22px]" style={{ color }}>
                  {icon}
                </span>
              </div>
              <p className="text-slate-400 text-xs font-medium mb-1">{label}</p>
              <p className="text-white font-bold text-2xl">{value}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3 mb-6">
          {["All Projects", "Graded", "Under Review", "Drafts"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                filter === f
                  ? "bg-[#13eca4] text-[#10221c]"
                  : "bg-[rgba(255,255,255,0.05)] text-slate-400 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredProjects.map((project) => {
              const statusStyle = statusStyles[project.status] ?? statusStyles.draft;
              const statusLabel = statusLabels[project.status] ?? project.status;
              return (
                <div
                  key={project.id}
                  className="group bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.08)] hover:border-[rgba(19,236,164,0.25)] hover:shadow-xl hover:shadow-[rgba(19,236,164,0.05)] transition-all overflow-hidden flex flex-col"
                >
                  {/* Color header */}
                  <div
                    className="h-2 w-full"
                    style={{ background: `linear-gradient(90deg, ${project.color}, transparent)` }}
                  />

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${project.color}18` }}
                      >
                        <span
                          className="material-symbols-outlined text-[22px]"
                          style={{ color: project.color }}
                        >
                          {project.icon}
                        </span>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                        {statusLabel}
                      </span>
                    </div>

                    <h3 className="text-white font-bold text-base mb-1 group-hover:text-[#13eca4] transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-[#13eca4] text-xs font-semibold mb-2">{project.course}</p>
                    <p className="text-slate-400 text-sm leading-relaxed flex-1 mb-4">
                      {project.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <span className="text-xs px-2 py-0.5 rounded bg-[rgba(255,255,255,0.06)] text-slate-400">
                        {project.category}
                      </span>
                    </div>

                    {/* Grade & actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-[rgba(255,255,255,0.06)]">
                      <div className="flex items-center gap-2">
                        {project.grade ? (
                          <>
                            <span
                              className="text-2xl font-black"
                              style={{
                                color: project.score && project.score >= 90 ? "#13eca4" : "#f59e0b",
                              }}
                            >
                              {project.grade}
                            </span>
                            <span className="text-slate-500 text-sm">{project.score}%</span>
                          </>
                        ) : project.submittedAt ? (
                          <span className="text-xs text-slate-500">
                            Submitted {project.submittedAt}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">Not yet submitted</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/school/student/project/${project.id}`}
                          className="p-2 rounded-lg bg-[rgba(255,255,255,0.06)] text-slate-400 hover:text-white hover:bg-[rgba(255,255,255,0.1)] transition-all"
                          title="View project"
                        >
                          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                        </Link>
                        {project.status === "graded" && (
                          <Link
                            href={`/school/student/project/${project.id}/feedback`}
                            className="p-2 rounded-lg bg-[rgba(19,236,164,0.1)] text-[#13eca4] hover:bg-[rgba(19,236,164,0.2)] transition-all"
                            title="View feedback"
                          >
                            <span className="material-symbols-outlined text-[18px]">feedback</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-[48px] text-slate-600 mb-3 block">
              grid_view
            </span>
            <p className="text-slate-400 text-sm">
              No submissions yet. Complete course lessons and submit your work!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
