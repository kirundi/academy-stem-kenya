"use client";

import { useState } from "react";
import SchoolAdminSidebar from "@/components/SchoolAdminSidebar";

interface SyncOption {
  key: string;
  label: string;
  sublabel: string;
  desc: string;
  enabled: boolean;
  danger?: boolean;
}

export default function SchoolAdminIntegrationsPage() {
  const [integrationEnabled, setIntegrationEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  const [options, setOptions] = useState<SyncOption[]>([
    {
      key: "rosterSync",
      label: "Roster Synchronization",
      sublabel: '"Allow Teachers to Sync Rosters"',
      desc: "Automatically imports students from Google Classroom into STEM Impact Academy courses when teachers start a new unit.",
      enabled: true,
    },
    {
      key: "gradePassback",
      label: "Grade Passback",
      sublabel: '"Allow Grade Passback to Google"',
      desc: "Scores from STEM assessments will be automatically exported to the teacher's Google Classroom gradebook.",
      enabled: true,
    },
    {
      key: "assignmentAuto",
      label: "Assignment Automation",
      sublabel: '"Allow Automated Assignment Posts"',
      desc: "When a teacher assigns a lab in our platform, a corresponding post is created in Google Classroom automatically.",
      enabled: false,
    },
    {
      key: "restrictDomain",
      label: "Restrict External Domain",
      sublabel: '"Prevent Syncing Non-School Emails"',
      desc: "Only users with your official school domain will be permitted to sync data between platforms.",
      enabled: true,
      danger: true,
    },
  ]);

  const toggleOption = (key: string) => {
    setOptions((prev) => prev.map((o) => (o.key === key ? { ...o, enabled: !o.enabled } : o)));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex h-screen bg-(--bg-page) overflow-hidden">
      <SchoolAdminSidebar />

      <main className="ml-60 flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          {/* Breadcrumb + Title */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-(--text-faint) text-sm">
              <span>Integrations</span>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
              <span className="text-primary">Google Classroom</span>
            </div>
            <h2 className="text-3xl font-black text-(--text-base) tracking-tight">
              Google Classroom Integration
            </h2>
            <p className="text-(--text-muted) max-w-2xl text-sm">
              Connect your school&apos;s Google Workspace for Education to automate roster
              management, grade syncing, and lesson distribution.
            </p>
          </div>

          {/* Integration Card */}
          <section className="bg-(--bg-card) border border-(--border-subtle) rounded-xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-(--border-subtle) flex items-center justify-between bg-[rgba(19,218,236,0.05)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center p-2 shadow-sm border border-slate-200">
                  <span className="material-symbols-outlined text-2xl text-blue-600">
                    cast_for_education
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-(--text-base)">School-Wide Integration</h3>
                  <p className="text-sm text-(--text-muted) leading-none">
                    Status:{" "}
                    <span
                      className={`font-medium ${integrationEnabled ? "text-emerald-500" : "text-(--text-faint)"}`}
                    >
                      {integrationEnabled ? "Active & Synchronized" : "Disabled"}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-(--text-base)">Enable Integration</span>
                <button
                  onClick={() => setIntegrationEnabled(!integrationEnabled)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${integrationEnabled ? "bg-primary" : "bg-slate-700"}`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${integrationEnabled ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>
            </div>

            <div className="p-7 grid grid-cols-1 md:grid-cols-2 gap-7">
              {options.map((opt) => (
                <div key={opt.key} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-bold ${opt.danger ? "text-[#ef4444]" : "text-(--text-base)"}`}>
                      {opt.label}
                    </h4>
                    <button
                      onClick={() => toggleOption(opt.key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ml-2 ${
                        opt.enabled
                          ? opt.danger
                            ? "bg-[#ef4444]"
                            : "bg-[rgba(19,218,236,0.4)]"
                          : "bg-slate-700"
                      } ${opt.danger ? "border border-[rgba(239,68,68,0.3)]" : ""}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                          opt.enabled
                            ? opt.danger
                              ? "translate-x-6 bg-white shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                              : "translate-x-6 bg-primary"
                            : "translate-x-1 bg-slate-300"
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-sm text-(--text-muted) italic">{opt.sublabel}</p>
                  <p className="text-xs text-(--text-faint)">{opt.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Security & Data Privacy */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2 px-2">
              <span className="material-symbols-outlined text-primary">security</span>
              <h3 className="text-xl font-bold text-(--text-base)">Security &amp; Data Privacy</h3>
            </div>
            <div className="bg-(--bg-card)/50 border border-(--border-subtle) rounded-xl p-6">
              <p className="text-sm text-(--text-muted) mb-5">
                STEM Impact Academy follows the Student Data Privacy Consortium (SDPC) standards.
                Below is the list of data shared with Google Classroom:
              </p>
              <div className="space-y-3">
                {[
                  {
                    icon: "check_circle",
                    color: "text-emerald-500",
                    bg: "bg-emerald-500/10",
                    title: "User Identification",
                    desc: "Full Name, School Email Address, and Internal Google UUID are synced for authentication.",
                  },
                  {
                    icon: "check_circle",
                    color: "text-emerald-500",
                    bg: "bg-emerald-500/10",
                    title: "Course Information",
                    desc: "Class names, period numbers, and student enrollment lists are accessed to create platform rosters.",
                  },
                  {
                    icon: "visibility",
                    color: "text-primary",
                    bg: "bg-primary/10",
                    title: "Performance Data",
                    desc: "Assignment titles and numeric scores are shared. No detailed diagnostic data or student notes are exported.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-4 p-3 bg-(--bg-page)/50 rounded-lg border border-(--border-subtle)"
                  >
                    <div
                      className={`w-8 h-8 rounded-full ${item.bg} flex items-center justify-center shrink-0`}
                    >
                      <span className={`material-symbols-outlined ${item.color} text-sm`}>
                        {item.icon}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-(--text-base)">{item.title}</p>
                      <p className="text-xs text-(--text-muted) mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button className="px-4 py-2 text-sm font-medium text-(--text-muted) hover:text-(--text-base) transition-colors">
                  Download Privacy Policy
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-primary text-white font-bold rounded-lg text-sm hover:opacity-90 transition-opacity"
                >
                  {saved ? "✓ Saved!" : "Save Configuration"}
                </button>
              </div>
            </div>
          </section>

          {/* Connected Teachers Table */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">group</span>
              <h3 className="text-xl font-bold text-(--text-base)">Connected Teacher Accounts</h3>
            </div>
            <div className="overflow-hidden rounded-xl border border-(--border-subtle) bg-(--bg-card)">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-(--bg-page)/50 border-b border-(--border-subtle)">
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-(--text-muted)">
                      Teacher
                    </th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-(--text-muted)">
                      Classes Synced
                    </th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-(--text-muted)">
                      Last Sync
                    </th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-(--text-muted) text-right">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {[
                    {
                      name: "Ms. Nguyen",
                      email: "nguyen@school.edu",
                      classes: 4,
                      lastSync: "5 min ago",
                      status: "Active",
                    },
                    {
                      name: "Mr. Okonkwo",
                      email: "okonkwo@school.edu",
                      classes: 3,
                      lastSync: "1 hour ago",
                      status: "Active",
                    },
                    {
                      name: "Dr. Patel",
                      email: "patel@school.edu",
                      classes: 2,
                      lastSync: "Yesterday",
                      status: "Review",
                    },
                  ].map((t) => (
                    <tr
                      key={t.email}
                      className="hover:bg-[rgba(19,218,236,0.04)] transition-colors"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-(--text-base)">{t.name}</p>
                        <p className="text-xs text-(--text-muted)">{t.email}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-(--text-muted)">{t.classes}</td>
                      <td className="px-5 py-4 text-xs text-(--text-muted)">{t.lastSync}</td>
                      <td className="px-5 py-4 text-right">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            t.status === "Active"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Danger Zone */}
          <div className="flex items-center gap-4 p-4 bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.2)] rounded-lg">
            <span className="material-symbols-outlined text-[#ef4444]">warning</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-(--text-base)">Danger Zone</p>
              <p className="text-xs text-(--text-muted)">
                Disabling this integration will disconnect all teacher accounts and clear all
                scheduled sync tasks immediately.
              </p>
            </div>
            <button className="px-4 py-2 border border-[#ef4444] text-[#ef4444] text-xs font-bold rounded-lg hover:bg-[#ef4444] hover:text-(--text-base) transition-all whitespace-nowrap">
              Disconnect All
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
