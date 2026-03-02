"use client";

import { useState } from "react";

const teachers = [
  {
    name: "Dr. Sarah Jenkins",
    email: "sarah.j@stemimpactcenterkenya.org",
    dept: "Physics",
    deptColor: "#13eca4",
    students: 124,
    classes: 6,
    status: "active",
    invited: false,
  },
  {
    name: "Marcus Thorne",
    email: "m.thorne@stemimpactcenterkenya.org",
    dept: "Robotics",
    deptColor: "#3b82f6",
    students: 88,
    classes: 4,
    status: "active",
    invited: false,
  },
  {
    name: "Elena Rodriguez",
    email: "elena.r@stemimpactcenterkenya.org",
    dept: "Biotech",
    deptColor: "#8b5cf6",
    students: null,
    classes: null,
    status: "invited",
    invited: true,
  },
  {
    name: "Alan Turing Jr.",
    email: "turing@stemimpactcenterkenya.org",
    dept: "Comp Sci",
    deptColor: "#13eca4",
    students: 210,
    classes: 8,
    status: "active",
    invited: false,
  },
  {
    name: "Ms. Wanjiku",
    email: "wanjiku@stemimpactcenterkenya.org",
    dept: "Game Design",
    deptColor: "#ec4899",
    students: 46,
    classes: 2,
    status: "active",
    invited: false,
  },
  {
    name: "Mr. Otieno",
    email: "otieno@stemimpactcenterkenya.org",
    dept: "Green Tech",
    deptColor: "#10b981",
    students: 38,
    classes: 2,
    status: "inactive",
    invited: false,
  },
  {
    name: "Dr. Chen",
    email: "chen@stemimpactcenterkenya.org",
    dept: "Data Sci",
    deptColor: "#f59e0b",
    students: 96,
    classes: 5,
    status: "active",
    invited: false,
  },
  {
    name: "Ms. Achieng",
    email: "achieng@stemimpactcenterkenya.org",
    dept: "Cybersec",
    deptColor: "#06b6d4",
    students: null,
    classes: null,
    status: "invited",
    invited: true,
  },
];

const statusBadge = {
  active: "text-emerald-500",
  inactive: "text-slate-400",
  invited: "text-amber-500",
};
const statusDot = {
  active: "bg-emerald-500",
  inactive: "bg-slate-400",
  invited: "bg-amber-500",
};

export default function TeacherManagementPage() {
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const filtered = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.dept.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#10221c]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.9)] backdrop-blur-md border-b border-[rgba(19,236,164,0.08)] px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[rgba(19,236,164,0.1)] rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-[#13eca4] text-[18px]">school</span>
            </div>
            <span className="text-white font-bold">STEM Academy</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a
              href="/school/admin"
              className="text-slate-400 hover:text-[#13eca4] font-medium transition-colors"
            >
              Dashboard
            </a>
            <span className="text-[#13eca4] font-semibold border-b-2 border-[#13eca4] pb-0.5">
              Staff Management
            </span>
            <a
              href="/dashboard/content"
              className="text-slate-400 hover:text-[#13eca4] font-medium transition-colors"
            >
              Curriculum
            </a>
            <a
              href="/dashboard/users"
              className="text-slate-400 hover:text-[#13eca4] font-medium transition-colors"
            >
              Students
            </a>
            <a
              href="/dashboard/analytics"
              className="text-slate-400 hover:text-[#13eca4] font-medium transition-colors"
            >
              Analytics
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[rgba(255,255,255,0.05)] rounded-lg border border-[rgba(255,255,255,0.08)] px-3 py-1.5">
            <span className="material-symbols-outlined text-slate-400 text-[18px]">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources..."
              className="bg-transparent border-none text-white text-sm placeholder-slate-500 focus:outline-none ml-2 w-40"
            />
          </div>
          <button className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center text-slate-400 hover:text-white">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
          <button className="w-10 h-10 rounded-lg bg-[rgba(255,255,255,0.06)] flex items-center justify-center text-slate-400 hover:text-white">
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-[rgba(19,236,164,0.1)] border border-[rgba(19,236,164,0.3)]" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* Page Title */}
        <section className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[#13eca4] mb-1">
              <span className="material-symbols-outlined text-[16px]">group</span>
              <span className="text-xs font-bold uppercase tracking-wider">Administration</span>
            </div>
            <h1 className="text-white text-4xl font-black leading-tight">Teacher Management</h1>
            <p className="text-slate-400 mt-1 max-w-2xl">
              Manage your educational staff, oversee department performance, and invite new
              educators to the STEM Academy platform.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[rgba(255,255,255,0.1)] text-slate-300 text-sm font-bold hover:bg-[rgba(255,255,255,0.05)] transition-colors">
              <span className="material-symbols-outlined text-[18px]">download</span>Export Report
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#13eca4] text-[#10221c] text-sm font-bold hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined text-[18px]">person_add</span>Invite
              Teachers
            </button>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              label: "Total Teachers",
              value: "42",
              badge: "+3 this month",
              badgeColor: "text-emerald-500",
              icon: "groups",
              iconColor: "#13eca4",
            },
            {
              label: "Active Classes",
              value: "156",
              badge: "Across 8 subjects",
              badgeColor: "text-slate-400",
              icon: "class",
              iconColor: "#13eca4",
            },
            {
              label: "Pending Invites",
              value: "8",
              badge: "Requires follow-up",
              badgeColor: "text-amber-500",
              icon: "mail",
              iconColor: "#f59e0b",
            },
            {
              label: "Staff Attendance",
              value: "98.4%",
              badge: "Excellent",
              badgeColor: "text-emerald-500",
              icon: "verified_user",
              iconColor: "#13eca4",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-[#1a2e27] p-6 rounded-2xl border border-[rgba(19,236,164,0.07)]"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-sm font-medium">{s.label}</span>
                <span
                  className="material-symbols-outlined p-2 rounded-lg bg-[rgba(19,236,164,0.08)] text-[20px]"
                  style={{ color: s.iconColor }}
                >
                  {s.icon}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-white text-3xl font-bold">{s.value}</span>
                <span className={`text-xs font-bold ${s.badgeColor}`}>{s.badge}</span>
              </div>
            </div>
          ))}
        </section>

        {/* Table */}
        <section className="bg-[#1a2e27] rounded-2xl border border-[rgba(19,236,164,0.07)] overflow-hidden">
          <div className="px-6 py-5 border-b border-[rgba(255,255,255,0.06)] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-60">
              <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                  search
                </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email or department…"
                  className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[rgba(19,236,164,0.4)]"
                />
              </div>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] text-slate-400 text-sm hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-colors">
                <span className="material-symbols-outlined text-[18px]">filter_list</span>Filter
              </button>
            </div>
            <span className="text-slate-500 text-sm">
              Showing {filtered.length} of {teachers.length} teachers
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[rgba(255,255,255,0.02)] text-slate-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Teacher Name</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Total Students</th>
                  <th className="px-6 py-4">Active Classes</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.04)] text-sm">
                {filtered.map((t, i) => (
                  <tr key={t.email} className="hover:bg-[rgba(19,236,164,0.02)] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${t.invited ? "border border-dashed border-[rgba(255,255,255,0.15)]" : "bg-[rgba(19,236,164,0.1)] text-[#13eca4]"}`}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {t.invited ? "person" : "person"}
                          </span>
                        </div>
                        <div>
                          <p
                            className={`font-bold ${t.invited ? "text-slate-500 italic" : "text-white"}`}
                          >
                            {t.name}
                          </p>
                          <p className="text-xs text-slate-500">{t.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-tight"
                        style={{ background: `${t.deptColor}15`, color: t.deptColor }}
                      >
                        {t.dept}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-medium">{t.students ?? "--"}</td>
                    <td className="px-6 py-4 text-slate-300 font-medium">{t.classes ?? "--"}</td>
                    <td className="px-6 py-4">
                      <div
                        className={`flex items-center gap-2 ${statusBadge[t.status as keyof typeof statusBadge]}`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${statusDot[t.status as keyof typeof statusDot]} ${t.status === "invited" ? "animate-pulse" : ""}`}
                        />
                        <span className="text-xs font-bold capitalize">{t.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {t.invited ? (
                        <div className="flex items-center justify-end gap-2">
                          <button className="px-3 py-1 bg-[rgba(19,236,164,0.1)] text-[#13eca4] text-xs font-bold rounded-lg hover:bg-[rgba(19,236,164,0.2)] transition-colors">
                            Resend Invite
                          </button>
                          <button className="p-2 hover:bg-[rgba(239,68,68,0.1)] rounded-lg text-slate-400 hover:text-red-400 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">close</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1 relative">
                          <button className="p-2 hover:bg-[rgba(19,236,164,0.08)] rounded-lg text-slate-400 hover:text-[#13eca4] transition-colors">
                            <span className="material-symbols-outlined text-[18px]">
                              visibility
                            </span>
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setOpenMenu(openMenu === i ? null : i)}
                              className="p-2 hover:bg-[rgba(255,255,255,0.06)] rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                more_vert
                              </span>
                            </button>
                            {openMenu === i && (
                              <div className="absolute right-0 top-full mt-1 w-44 bg-[#1a2e27] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl z-20 overflow-hidden">
                                <button className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                                  Edit Profile
                                </button>
                                <button className="w-full text-left px-4 py-2.5 text-sm text-red-400 font-bold hover:bg-[rgba(239,68,68,0.08)] transition-colors">
                                  Revoke Access
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
