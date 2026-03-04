"use client";

import { useGlobalAdminData } from "@/hooks/useAdminData";
import { exportToCsv } from "@/lib/csv-export";

function formatDate(d: unknown): string {
  if (!d) return "";
  if (d instanceof Date) return d.toLocaleDateString();
  const seconds = (d as { seconds?: number })?.seconds;
  if (seconds) return new Date(seconds * 1000).toLocaleDateString();
  return String(d);
}

export default function AnalyticsReportsPage() {
  const { allUsers, schools, allCourses, loading, error } = useGlobalAdminData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-[#a855f7]">
          progress_activity
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 flex-col gap-3">
        <span className="material-symbols-outlined text-[48px] text-red-400">error</span>
        <p className="text-red-400 font-semibold">{error}</p>
      </div>
    );
  }

  // Role distribution derived from allUsers
  const roleCounts: Record<string, number> = {};
  for (const u of allUsers) {
    roleCounts[u.role] = (roleCounts[u.role] ?? 0) + 1;
  }
  const roleRows = Object.entries(roleCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([role, count]) => ({
      role,
      count,
      percentage:
        allUsers.length > 0
          ? ((count / allUsers.length) * 100).toFixed(1) + "%"
          : "0%",
    }));

  const exportCards = [
    {
      icon: "group",
      title: "All Users",
      description: "Export all registered users with their roles and school assignments.",
      count: allUsers.length,
      onDownload: () => {
        const rows = allUsers.map((u) => ({
          name: u.displayName,
          email: u.email ?? "",
          role: u.role,
          school: u.schoolId ?? "",
          joined: formatDate(u.createdAt),
        }));
        exportToCsv("users-export", rows, [
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "role", label: "Role" },
          { key: "school", label: "School ID" },
          { key: "joined", label: "Joined Date" },
        ]);
      },
    },
    {
      icon: "domain",
      title: "Schools",
      description: "Export all schools with status, county, and registration details.",
      count: schools.length,
      onDownload: () => {
        const rows = schools.map((s) => ({
          name: s.name,
          status: s.status,
          plan: s.plan,
          location: s.location,
          type: s.type,
          studentCount: s.studentCount ?? 0,
          createdAt: formatDate(s.createdAt),
        }));
        exportToCsv("schools-export", rows, [
          { key: "name", label: "School Name" },
          { key: "status", label: "Status" },
          { key: "plan", label: "Plan" },
          { key: "location", label: "Location / County" },
          { key: "type", label: "Type" },
          { key: "studentCount", label: "Students" },
          { key: "createdAt", label: "Created At" },
        ]);
      },
    },
    {
      icon: "library_books",
      title: "Courses",
      description: "Export all courses with category, difficulty, status, and lesson counts.",
      count: allCourses.length,
      onDownload: () => {
        const rows = allCourses.map((c) => ({
          title: c.title,
          category: c.category ?? "",
          difficulty: c.difficulty ?? "",
          status: c.status ?? "published",
          lessons: c.totalLessons ?? 0,
        }));
        exportToCsv("courses-export", rows, [
          { key: "title", label: "Title" },
          { key: "category", label: "Category" },
          { key: "difficulty", label: "Difficulty" },
          { key: "status", label: "Status" },
          { key: "lessons", label: "Lessons" },
        ]);
      },
    },
    {
      icon: "pie_chart",
      title: "Role Distribution",
      description: "Export a breakdown of user counts by role across the platform.",
      count: roleRows.length,
      onDownload: () => {
        exportToCsv("role-distribution-export", roleRows as unknown as Record<string, unknown>[], [
          { key: "role", label: "Role" },
          { key: "count", label: "Count" },
          { key: "percentage", label: "Percentage" },
        ]);
      },
    },
  ];

  return (
    <div className="min-h-screen bg-(--bg-page)">
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-[rgba(168,85,247,0.1)] px-8 h-16 flex items-center">
        <div>
          <h1 className="text-xl font-bold text-(--text-base)">Reports &amp; Exports</h1>
          <p className="text-slate-400 text-xs mt-0.5">Download platform data as CSV files</p>
        </div>
      </header>

      <div className="px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {exportCards.map((card) => (
            <div
              key={card.title}
              className="bg-(--bg-card) rounded-2xl border border-[rgba(168,85,247,0.08)] p-6 flex flex-col gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-[rgba(168,85,247,0.12)]">
                  <span className="material-symbols-outlined text-[22px] text-[#a855f7]">
                    {card.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-(--text-base) font-bold text-sm">{card.title}</p>
                  <p className="text-[#a855f7] text-xs font-semibold mt-0.5">
                    {card.count} records
                  </p>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed flex-1">{card.description}</p>
              <button
                onClick={card.onDownload}
                disabled={card.count === 0}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold bg-[rgba(168,85,247,0.12)] text-[#a855f7] hover:bg-[rgba(168,85,247,0.22)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                Download CSV
              </button>
            </div>
          ))}
        </div>

        {/* Info note */}
        <div className="mt-8 p-4 bg-[rgba(168,85,247,0.06)] border border-[rgba(168,85,247,0.15)] rounded-xl flex items-start gap-3">
          <span className="material-symbols-outlined text-[#a855f7] text-[20px] shrink-0 mt-0.5">
            info
          </span>
          <p className="text-slate-400 text-sm leading-relaxed">
            All exports include only the data visible to your analytics role. Sensitive fields such as
            passwords and session tokens are never included. Files are generated client-side and are
            not stored on the server.
          </p>
        </div>
      </div>
    </div>
  );
}
