"use client";

import { useState } from "react";
import StudentSidebar from "@/components/StudentSidebar";
import { useAuthContext } from "@/contexts/AuthContext";

type SettingsTab = "personal" | "security" | "integrations" | "notifications";

export default function StudentSettingsPage() {
  const { appUser } = useAuthContext();
  const [activeTab, setActiveTab] = useState<SettingsTab>("personal");
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [saved, setSaved] = useState(false);

  const [notifPrefs, setNotifPrefs] = useState({
    courseUpdates: true,
    badgesEarned: true,
    weeklyDigest: false,
    teacherFeedback: true,
    systemAlerts: true,
  });

  const [gcConnected] = useState(true);
  const [syncGrades, setSyncGrades] = useState(true);
  const [syncMaterials, setSyncMaterials] = useState(true);

  const displayName = appUser?.displayName ?? "";
  const schoolName = ((appUser as unknown) as Record<string, unknown>)?.schoolName as string ?? "";

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const tabs: { key: SettingsTab; icon: string; label: string }[] = [
    { key: "personal", icon: "person", label: "Personal Info" },
    { key: "security", icon: "shield", label: "Security" },
    { key: "integrations", icon: "hub", label: "Integrations" },
    { key: "notifications", icon: "notifications_active", label: "Notifications" },
  ];

  return (
    <div className="flex h-screen bg-[#102022] overflow-hidden">
      <StudentSidebar />
      <main className="ml-60 flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[rgba(16,32,34,0.85)] backdrop-blur-md border-b border-[rgba(19,218,236,0.1)] px-6 py-3">
          <h1 className="text-lg font-bold text-white">Account Settings</h1>
          <p className="text-slate-400 text-xs">Manage your profile, security, and learning integrations</p>
        </header>

        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar Nav */}
            <aside className="lg:col-span-3">
              <nav className="flex flex-col gap-1 sticky top-24">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-l-lg font-medium text-left transition-all ${
                      activeTab === tab.key
                        ? "bg-[rgba(19,218,236,0.1)] text-[#13daec] border-r-2 border-[#13daec]"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-9 space-y-6">

              {/* ── Personal Info ── */}
              {activeTab === "personal" && (
                <section className="bg-[#1a2e30] border border-[#2d4548] rounded-xl p-7">
                  <div className="flex items-center gap-3 mb-7">
                    <div className="p-2 bg-[rgba(19,218,236,0.1)] rounded-lg">
                      <span className="material-symbols-outlined text-[#13daec]">person</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">Personal Information</h3>
                  </div>

                  {/* Avatar */}
                  <div className="flex items-center gap-6 mb-7">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-2xl bg-[rgba(19,218,236,0.15)] flex items-center justify-center border-2 border-[#2d4548] text-[#13daec] text-3xl font-bold">
                        {displayName?.slice(0, 2).toUpperCase() || "ST"}
                      </div>
                      <button className="absolute -bottom-2 -right-2 p-1.5 bg-[#13daec] text-[#102022] rounded-lg shadow-lg hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-sm font-bold">photo_camera</span>
                      </button>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100">Profile Photo</h4>
                      <p className="text-sm text-slate-400">Accepted formats: JPG, PNG. Max size 2MB.</p>
                      <button className="mt-2 text-xs font-bold text-[#13daec] hover:underline">Remove photo</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                      <input
                        className="w-full bg-[#102022] border border-[#2d4548] rounded-lg text-slate-100 px-4 py-2.5 text-sm focus:border-[#13daec] focus:ring-1 focus:ring-[#13daec] outline-none transition-all"
                        defaultValue={displayName}
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">School Name</label>
                      <input
                        className="w-full bg-[#102022] border border-[#2d4548] rounded-lg text-slate-100 px-4 py-2.5 text-sm focus:border-[#13daec] focus:ring-1 focus:ring-[#13daec] outline-none transition-all"
                        defaultValue={schoolName}
                        placeholder="Your school"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
                      <input
                        className="w-full bg-[#102022] border border-[#2d4548] rounded-lg text-slate-400 px-4 py-2.5 text-sm cursor-not-allowed"
                        value={appUser?.email ?? ""}
                        readOnly
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Grade Level</label>
                      <select className="w-full bg-[#102022] border border-[#2d4548] rounded-lg text-slate-100 px-4 py-2.5 text-sm focus:border-[#13daec] outline-none transition-all">
                        {["Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"].map(g => (
                          <option key={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Bio</label>
                      <textarea
                        className="w-full bg-[#102022] border border-[#2d4548] rounded-lg text-slate-100 px-4 py-2.5 text-sm focus:border-[#13daec] focus:ring-1 focus:ring-[#13daec] outline-none transition-all min-h-[100px] resize-none"
                        placeholder="Tell us about your STEM interests..."
                        defaultValue="Aspiring coder and robotics enthusiast. Currently exploring AI and electronics."
                      />
                    </div>
                  </div>

                  <div className="mt-7 flex justify-end">
                    <button
                      onClick={handleSave}
                      className="px-6 py-2.5 bg-[#13daec] text-[#102022] font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                      {saved ? (
                        <><span className="material-symbols-outlined text-sm">check_circle</span>Saved!</>
                      ) : "Save Personal Info"}
                    </button>
                  </div>
                </section>
              )}

              {/* ── Security ── */}
              {activeTab === "security" && (
                <section className="bg-[#1a2e30] border border-[#2d4548] rounded-xl p-7">
                  <div className="flex items-center gap-3 mb-7">
                    <div className="p-2 bg-[rgba(239,68,68,0.1)] rounded-lg">
                      <span className="material-symbols-outlined text-[#ef4444]">shield</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">Security & Authentication</h3>
                  </div>

                  <div className="space-y-5">
                    {/* Password */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-[#102022]/50 rounded-xl border border-[#2d4548] gap-4">
                      <div>
                        <h4 className="font-bold text-slate-100">Password</h4>
                        <p className="text-sm text-slate-400">Last changed 3 months ago</p>
                      </div>
                      <button className="px-4 py-2 bg-[#1a2e30] border border-[#2d4548] text-slate-200 text-sm font-bold rounded-lg hover:border-[rgba(19,218,236,0.5)] transition-colors">
                        Reset Password
                      </button>
                    </div>

                    {/* 2FA */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-[#102022]/50 rounded-xl border border-[#2d4548] gap-4">
                      <div>
                        <h4 className="font-bold text-slate-100">Two-Factor Authentication (2FA)</h4>
                        <p className="text-sm text-slate-400">Add an extra layer of security to your account</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold uppercase ${twoFAEnabled ? "text-[#13daec]" : "text-slate-500"}`}>
                          {twoFAEnabled ? "Enabled" : "Disabled"}
                        </span>
                        <button
                          onClick={() => setTwoFAEnabled(!twoFAEnabled)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${twoFAEnabled ? "bg-[#13daec]" : "bg-slate-700"}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${twoFAEnabled ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                      </div>
                    </div>

                    {/* Active Sessions */}
                    <div className="p-5 bg-[#102022]/50 rounded-xl border border-[#2d4548]">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-slate-100">Active Sessions</h4>
                        <button className="text-xs text-[#ef4444] font-bold hover:underline">Sign out all</button>
                      </div>
                      <div className="space-y-3">
                        {[
                          { device: "Chrome on Windows", location: "Nairobi, KE", current: true },
                          { device: "Safari on iPhone", location: "Nairobi, KE", current: false },
                        ].map((s) => (
                          <div key={s.device} className="flex items-center justify-between py-2 border-b border-[#2d4548] last:border-0">
                            <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-slate-400 text-[20px]">devices</span>
                              <div>
                                <p className="text-sm font-medium text-slate-200">{s.device}</p>
                                <p className="text-xs text-slate-500">{s.location}</p>
                              </div>
                            </div>
                            {s.current
                              ? <span className="px-2 py-0.5 bg-[rgba(19,218,236,0.1)] text-[#13daec] text-[10px] font-bold rounded-full uppercase">Current</span>
                              : <button className="text-xs text-slate-500 hover:text-[#ef4444] transition-colors">Revoke</button>
                            }
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* ── Integrations ── */}
              {activeTab === "integrations" && (
                <section className="bg-[#1a2e30] border border-[#2d4548] rounded-xl p-7">
                  <div className="flex items-center gap-3 mb-7">
                    <div className="p-2 bg-[rgba(19,218,236,0.1)] rounded-lg">
                      <span className="material-symbols-outlined text-[#13daec]">hub</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">LMS Integrations</h3>
                  </div>

                  {/* Google Classroom */}
                  <div className="border border-[#2d4548] bg-[#102022]/50 rounded-xl overflow-hidden">
                    <div className="p-5 flex items-center justify-between border-b border-[#2d4548]">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2">
                          <span className="material-symbols-outlined text-2xl text-blue-600">cast_for_education</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-white">Google Classroom</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`w-2 h-2 rounded-full ${gcConnected ? "bg-emerald-500" : "bg-slate-500"}`} />
                            <p className={`text-xs font-bold uppercase ${gcConnected ? "text-emerald-500" : "text-slate-500"}`}>
                              {gcConnected ? `Connected as ${appUser?.email ?? "student@school.edu"}` : "Not connected"}
                            </p>
                          </div>
                        </div>
                      </div>
                      {gcConnected
                        ? <button className="text-[#ef4444] text-sm font-bold hover:underline">Disconnect</button>
                        : <button className="px-4 py-2 bg-[#13daec] text-[#102022] text-sm font-bold rounded-lg hover:opacity-90 transition-opacity">Connect</button>
                      }
                    </div>

                    {gcConnected && (
                      <div className="p-6 space-y-5">
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sync Options</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {[
                            { label: "Sync Grades", desc: "Pull assignment grades from Google Classroom", state: syncGrades, toggle: () => setSyncGrades(!syncGrades) },
                            { label: "Sync Materials", desc: "Import course materials and assignments", state: syncMaterials, toggle: () => setSyncMaterials(!syncMaterials) },
                          ].map((opt) => (
                            <div key={opt.label} className="flex items-center justify-between p-4 bg-[#1a2e30] rounded-lg">
                              <div>
                                <p className="text-sm font-bold text-slate-100">{opt.label}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
                              </div>
                              <button
                                onClick={opt.toggle}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ml-4 ${opt.state ? "bg-[#13daec]" : "bg-slate-700"}`}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${opt.state ? "translate-x-6" : "translate-x-1"}`} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="pt-3 border-t border-[#2d4548]">
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">info</span>
                            Last synced 14 minutes ago. Sync runs automatically every 6 hours.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* More integrations */}
                  <div className="mt-5 p-5 border border-dashed border-[#2d4548] rounded-xl text-center">
                    <span className="material-symbols-outlined text-3xl text-slate-600 mb-2 block">add_circle</span>
                    <p className="text-sm font-bold text-slate-400">More integrations coming soon</p>
                    <p className="text-xs text-slate-500 mt-1">Canvas, Moodle, and more LMS platforms</p>
                  </div>
                </section>
              )}

              {/* ── Notifications ── */}
              {activeTab === "notifications" && (
                <section className="bg-[#1a2e30] border border-[#2d4548] rounded-xl p-7">
                  <div className="flex items-center gap-3 mb-7">
                    <div className="p-2 bg-[rgba(19,218,236,0.1)] rounded-lg">
                      <span className="material-symbols-outlined text-[#13daec]">notifications_active</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">Notification Preferences</h3>
                  </div>

                  <div className="space-y-4">
                    {(Object.entries(notifPrefs) as [keyof typeof notifPrefs, boolean][]).map(([key, val]) => {
                      const labels: Record<keyof typeof notifPrefs, { label: string; desc: string }> = {
                        courseUpdates: { label: "Course Updates", desc: "When new content is added to your courses" },
                        badgesEarned: { label: "Badge Notifications", desc: "When you earn a new badge or achievement" },
                        weeklyDigest: { label: "Weekly Digest", desc: "A weekly summary of your learning progress" },
                        teacherFeedback: { label: "Teacher Feedback", desc: "When a teacher reviews or grades your work" },
                        systemAlerts: { label: "System Alerts", desc: "Platform maintenance and important announcements" },
                      };
                      return (
                        <div key={key} className="flex items-center justify-between p-4 bg-[#102022]/50 rounded-xl border border-[#2d4548]">
                          <div>
                            <p className="text-sm font-bold text-slate-100">{labels[key].label}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{labels[key].desc}</p>
                          </div>
                          <button
                            onClick={() => setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ml-4 ${val ? "bg-[#13daec]" : "bg-slate-700"}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${val ? "translate-x-6" : "translate-x-1"}`} />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-7 flex justify-end">
                    <button
                      onClick={handleSave}
                      className="px-6 py-2.5 bg-[#13daec] text-[#102022] font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                      {saved ? (
                        <><span className="material-symbols-outlined text-sm">check_circle</span>Saved!</>
                      ) : "Save Preferences"}
                    </button>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
