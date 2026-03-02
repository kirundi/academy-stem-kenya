"use client";

import { useState } from "react";
import Link from "next/link";
import TeacherSidebar from "@/components/TeacherSidebar";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTeacherData } from "@/hooks/useTeacherData";

type SettingsTab = "account" | "school" | "integrations" | "notifications" | "security";

interface ClassroomSync {
  id: string;
  stemClass: string;
  gcClass: string;
  syncGrades: boolean;
  syncMaterials: boolean;
  lastSynced: string;
}

export default function TeacherSettingsPage() {
  const { appUser } = useAuthContext();
  const { classrooms } = useTeacherData();
  const [activeTab, setActiveTab] = useState<SettingsTab>("integrations");
  const [autoSync, setAutoSync] = useState(true);
  const [saved, setSaved] = useState(false);

  const [classroomSyncs, setClassroomSyncs] = useState<ClassroomSync[]>([
    {
      id: "1",
      stemClass: "Intro to Robotics 101",
      gcClass: "Robotics - Period 4 (Fall 2024)",
      syncGrades: true,
      syncMaterials: true,
      lastSynced: "14 minutes ago",
    },
    {
      id: "2",
      stemClass: "Advanced Bio-Engineering",
      gcClass: "AP Biology Section B",
      syncGrades: true,
      syncMaterials: false,
      lastSynced: "1 hour ago",
    },
    ...classrooms.slice(0, 3).map((c, i) => ({
      id: c.id,
      stemClass: c.name,
      gcClass: `${c.name} - GC Sync`,
      syncGrades: true,
      syncMaterials: i % 2 === 0,
      lastSynced: "2 hours ago",
    })),
  ]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggleSync = (id: string, field: "syncGrades" | "syncMaterials") => {
    setClassroomSyncs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: !s[field] } : s))
    );
  };

  const handleForceSync = (id: string) => {
    setClassroomSyncs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, lastSynced: "just now" } : s))
    );
  };

  const tabs: { key: SettingsTab; icon: string; label: string }[] = [
    { key: "account", icon: "person", label: "Account" },
    { key: "school", icon: "school", label: "School Profile" },
    { key: "integrations", icon: "sync", label: "Integrations & Sync" },
    { key: "notifications", icon: "notifications", label: "Notifications" },
    { key: "security", icon: "shield", label: "Security" },
  ];

  return (
    <div className="flex h-screen bg-[#10221c] overflow-hidden">
      <TeacherSidebar />

      <main className="ml-60 flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.85)] backdrop-blur-md border-b border-[rgba(19,236,164,0.08)] px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">Settings</h1>
            <p className="text-slate-400 text-xs">Manage your classroom environment</p>
          </div>
        </header>

        <div className="flex-1 flex flex-col md:flex-row max-w-5xl mx-auto w-full px-4 py-8 gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-56 flex flex-col gap-4 shrink-0">
            <div>
              <h2 className="text-white text-xl font-bold">Settings</h2>
              <p className="text-slate-400 text-sm mt-0.5">Manage your classroom environment</p>
            </div>
            <nav className="flex flex-col gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                    activeTab === tab.key
                      ? "bg-[rgba(19,236,164,0.1)] text-[#13eca4]"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span className="material-symbols-outlined">{tab.icon}</span>
                  <span className="font-medium text-sm">{tab.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main */}
          <section className="flex-1 flex flex-col gap-7">
            {/* Integrations & Sync */}
            {activeTab === "integrations" && (
              <>
                <div>
                  <h2 className="text-white text-2xl font-black tracking-tight">Integrations &amp; Sync</h2>
                  <p className="text-slate-400 text-sm mt-1">Manage your Google Classroom connections and automated data mapping.</p>
                </div>

                {/* Google Classroom Card */}
                <div className="bg-[#1a2e31] rounded-xl border border-slate-800 overflow-hidden shadow-sm">
                  <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center text-[#13eca4]">
                        <span className="material-symbols-outlined text-4xl">cloud_sync</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Primary LMS</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase">Connected</span>
                        </div>
                        <h3 className="text-white text-xl font-bold">Google Classroom</h3>
                        <p className="text-slate-400 text-sm">Last synced: 14 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-300">Auto-sync Rosters</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={autoSync} onChange={() => setAutoSync(!autoSync)} />
                          <div className={`w-11 h-6 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all ${autoSync ? "bg-[#13eca4] after:translate-x-full" : "bg-slate-700"}`} />
                        </label>
                      </div>
                      <button className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined text-sm">link_off</span>
                        Disconnect
                      </button>
                    </div>
                  </div>
                  <div className="h-1 w-full bg-[#13eca4]/20">
                    <div className="h-full bg-[#13eca4] w-full" />
                  </div>
                </div>

                {/* Active Classroom Syncs */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white text-lg font-bold">Active Classroom Syncs</h3>
                    <button className="text-[#13eca4] text-sm font-bold flex items-center gap-1 hover:underline">
                      <span className="material-symbols-outlined text-sm">add_circle</span>
                      Add New Connection
                    </button>
                  </div>

                  <div className="flex flex-col gap-3">
                    {classroomSyncs.map((sync) => (
                      <div key={sync.id} className="bg-[#1a2e31] p-4 rounded-xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs text-slate-400 font-medium">STEM Academy Class</span>
                            <span className="text-white font-bold text-sm truncate">{sync.stemClass}</span>
                          </div>
                          <span className="material-symbols-outlined text-slate-400 shrink-0">arrow_right_alt</span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs text-slate-400 font-medium">Google Classroom</span>
                            <span className="text-white font-bold text-sm truncate">{sync.gcClass}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={sync.syncGrades}
                              onChange={() => toggleSync(sync.id, "syncGrades")}
                              className="rounded border-slate-700 text-[#13eca4] focus:ring-[#13eca4] bg-transparent w-4 h-4 accent-[#13eca4]"
                            />
                            <span className="text-sm text-slate-300">Grades</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={sync.syncMaterials}
                              onChange={() => toggleSync(sync.id, "syncMaterials")}
                              className="rounded border-slate-700 text-[#13eca4] focus:ring-[#13eca4] bg-transparent w-4 h-4 accent-[#13eca4]"
                            />
                            <span className="text-sm text-slate-300">Materials</span>
                          </label>
                          <div className="hidden sm:block h-6 w-px bg-slate-700" />
                          <button
                            onClick={() => handleForceSync(sync.id)}
                            className="bg-[#13eca4] hover:bg-[#0dd494] text-[#10221c] px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">sync</span>
                            Force Sync Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data Mapping */}
                <div className="bg-[#1a2e31] rounded-xl border border-slate-800 p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="material-symbols-outlined text-[#13eca4]">schema</span>
                    <h3 className="text-white font-bold text-lg">Automatic Data Field Mapping</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      { gcField: "Student Email", stemField: "User Account Lookup", status: "Mapped" },
                      { gcField: "Assignment Score", stemField: "Submission Grade", status: "Mapped" },
                      { gcField: "Course Work Title", stemField: "Lesson / Activity Name", status: "Mapped" },
                      { gcField: "Student Name", stemField: "Display Name", status: "Review" },
                    ].map((row) => (
                      <div key={row.gcField} className="flex items-center justify-between p-3 bg-[#102022]/50 rounded-lg">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-slate-400 text-xs font-medium w-36 truncate">{row.gcField}</span>
                          <span className="material-symbols-outlined text-slate-600 text-sm">arrow_right_alt</span>
                          <span className="text-slate-300 text-xs font-medium truncate">{row.stemField}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          row.status === "Mapped" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-400"
                        }`}>{row.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Account Tab */}
            {activeTab === "account" && (
              <div className="bg-[#1a2e31] rounded-xl border border-slate-800 p-7">
                <h3 className="text-xl font-bold text-white mb-6">Account Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                    <input className="w-full bg-[#102022] border border-slate-700 rounded-lg text-slate-100 px-4 py-2.5 text-sm focus:border-[#13eca4] outline-none" defaultValue={appUser?.displayName ?? ""} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
                    <input className="w-full bg-[#102022] border border-slate-700 rounded-lg text-slate-400 px-4 py-2.5 text-sm cursor-not-allowed" value={appUser?.email ?? ""} readOnly />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button onClick={handleSave} className="px-6 py-2.5 bg-[#13eca4] text-[#10221c] font-bold rounded-lg hover:opacity-90 transition-opacity">
                    {saved ? "Saved!" : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="bg-[#1a2e31] rounded-xl border border-slate-800 p-7">
                <h3 className="text-xl font-bold text-white mb-6">Security Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#102022]/50 rounded-xl border border-slate-700">
                    <div>
                      <p className="font-bold text-slate-100">Password</p>
                      <p className="text-sm text-slate-400">Last changed 3 months ago</p>
                    </div>
                    <button className="px-4 py-2 bg-[#1a2e31] border border-slate-700 text-slate-200 text-sm font-bold rounded-lg hover:border-[rgba(19,236,164,0.5)] transition-colors">Reset Password</button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="bg-[#1a2e31] rounded-xl border border-slate-800 p-7">
                <h3 className="text-xl font-bold text-white mb-6">Notification Preferences</h3>
                <div className="space-y-4">
                  {[
                    { label: "New submissions", desc: "When students submit assignments" },
                    { label: "Sync status", desc: "Google Classroom sync notifications" },
                    { label: "Platform updates", desc: "New features and announcements" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-4 bg-[#102022]/50 rounded-xl border border-slate-700">
                      <div>
                        <p className="font-bold text-slate-100 text-sm">{item.label}</p>
                        <p className="text-xs text-slate-400">{item.desc}</p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#13eca4]">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* School Profile Tab */}
            {activeTab === "school" && (
              <div className="bg-[#1a2e31] rounded-xl border border-slate-800 p-7">
                <h3 className="text-xl font-bold text-white mb-6">School Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">School Name</label>
                    <input className="w-full bg-[#102022] border border-slate-700 rounded-lg text-slate-100 px-4 py-2.5 text-sm focus:border-[#13eca4] outline-none" placeholder="Your school name" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Department</label>
                    <input className="w-full bg-[#102022] border border-slate-700 rounded-lg text-slate-100 px-4 py-2.5 text-sm focus:border-[#13eca4] outline-none" defaultValue={((appUser as unknown) as Record<string, unknown>)?.department as string ?? ""} />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button onClick={handleSave} className="px-6 py-2.5 bg-[#13eca4] text-[#10221c] font-bold rounded-lg hover:opacity-90 transition-opacity">
                    {saved ? "Saved!" : "Save Changes"}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
