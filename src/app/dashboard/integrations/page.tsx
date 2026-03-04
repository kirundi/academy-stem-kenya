"use client";

import { useState } from "react";

interface School {
  id: string;
  name: string;
  location: string;
  status: "active" | "syncing" | "error" | "inactive";
  syncedStudents: number;
  gradesPassed: number;
}

interface SyncError {
  code: string;
  school: string;
  message: string;
  time: string;
  severity: "error" | "warn";
}

const SCHOOLS: School[] = [
  {
    id: "SIA-9921-X",
    name: "Oakwood STEM High",
    location: "CA, United States",
    status: "active",
    syncedStudents: 1420,
    gradesPassed: 12841,
  },
  {
    id: "SIA-3302-N",
    name: "Northside Academy",
    location: "NY, United States",
    status: "active",
    syncedStudents: 890,
    gradesPassed: 5412,
  },
  {
    id: "SIA-5517-T",
    name: "Horizon Tech School",
    location: "TX, United States",
    status: "syncing",
    syncedStudents: 2105,
    gradesPassed: 18309,
  },
  {
    id: "SIA-8821-K",
    name: "St. Joseph Tech",
    location: "FL, United States",
    status: "error",
    syncedStudents: 634,
    gradesPassed: 3201,
  },
  {
    id: "SIA-1102-W",
    name: "Westview STEM",
    location: "WA, United States",
    status: "active",
    syncedStudents: 1180,
    gradesPassed: 9870,
  },
  {
    id: "SIA-6643-M",
    name: "Maple Ridge Academy",
    location: "OR, United States",
    status: "inactive",
    syncedStudents: 0,
    gradesPassed: 0,
  },
];

const SYNC_ERRORS: SyncError[] = [
  {
    code: "AUTH_EXPIRED",
    school: "Oakwood STEM",
    message: "Refresh token handshake failed after 3 attempts.",
    time: "2m ago",
    severity: "error",
  },
  {
    code: "RATE_LIMIT",
    school: "Northside Academy",
    message: "Grade push throttled by Google Classroom API.",
    time: "14m ago",
    severity: "error",
  },
  {
    code: "TIMEOUT",
    school: "Horizon Tech",
    message: "Sync task timed out during metadata fetch.",
    time: "1h ago",
    severity: "warn",
  },
  {
    code: "ID_MISMATCH",
    school: "St. Joseph Tech",
    message: "Student ID 'STU-9902' not found in Classroom.",
    time: "2h ago",
    severity: "error",
  },
  {
    code: "QUOTA_WARN",
    school: "Westview STEM",
    message: "Approaching daily API quota limit (82%).",
    time: "3h ago",
    severity: "warn",
  },
];

const STATUS_CONFIG = {
  active: { label: "Active", color: "text-emerald-400", dot: "bg-emerald-400", pulse: false },
  syncing: { label: "Syncing...", color: "text-amber-400", dot: "bg-amber-400", pulse: true },
  error: { label: "Error", color: "text-rose-400", dot: "bg-rose-400", pulse: false },
  inactive: { label: "Inactive", color: "text-(--text-faint)", dot: "bg-slate-500", pulse: false },
};

export default function IntegrationsPage() {
  const [clientId, setClientId] = useState("827361928374-jk28h1h29...apps.googleusercontent.com");
  const [showSecret, setShowSecret] = useState(false);
  const [clientSecret, setClientSecret] = useState("GOCSPX-4b9Zm2T8hKs92PlsM");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [killSwitchModal, setKillSwitchModal] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"system" | "cloud" | "logs" | "security">(
    "system"
  );

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const filteredSchools =
    filterStatus === "all" ? SCHOOLS : SCHOOLS.filter((s) => s.status === filterStatus);

  const navItems = [
    { section: "system" as const, label: "System Control", icon: "dashboard_customize" },
    { section: "cloud" as const, label: "Google Cloud", icon: "cloud_sync" },
    { section: "logs" as const, label: "API Logs", icon: "history_edu" },
    { section: "security" as const, label: "Security Policies", icon: "admin_panel_settings" },
  ];

  return (
    <div className="min-h-screen bg-(--bg-page)">
      {/* Live Feed Badge */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div className="px-4 py-2 bg-(--bg-card)/90 backdrop-blur border border-primary/20 rounded-full flex items-center gap-2 shadow-2xl">
          <span className="size-2 rounded-full bg-primary animate-pulse"></span>
          <span className="text-[10px] font-bold text-(--text-muted) tracking-wider uppercase">
            Live System Feed Active
          </span>
        </div>
      </div>

      {/* Kill Switch Modal */}
      {killSwitchModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-(--bg-card) border border-rose-500/30 rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-rose-400 text-3xl">dangerous</span>
              <h3 className="text-(--text-base) font-black text-xl">Global Kill Switch</h3>
            </div>
            <p className="text-(--text-muted) mb-6 leading-relaxed">
              This will immediately halt{" "}
              <strong className="text-(--text-base)">all active sync jobs</strong> across every school in
              the system. OAuth sessions will be suspended. This action affects{" "}
              <strong className="text-rose-400">142 active schools</strong>.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setKillSwitchModal(false)}
                className="flex-1 py-2 px-4 bg-(--bg-page) border border-(--border) text-(--text-muted) rounded-lg text-sm font-bold hover:bg-(--bg-elevated) transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setKillSwitchModal(false)}
                className="flex-1 py-2 px-4 bg-rose-500 text-white rounded-lg text-sm font-bold hover:bg-rose-600 transition-colors"
              >
                Confirm Kill Switch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Toast */}
      {savedToast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg shadow-lg">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span className="text-sm font-bold">Global settings saved successfully.</span>
        </div>
      )}

      <div className="flex gap-6 px-8 py-8">
        {/* Sidebar */}
        <aside className="w-60 flex flex-col gap-1 shrink-0">
          {navItems.map((item) => (
            <button
              key={item.section}
              onClick={() => setActiveSection(item.section)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                activeSection === item.section
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-(--text-muted) hover:bg-(--bg-card)"
              }`}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              <p
                className={`text-sm ${activeSection === item.section ? "font-semibold" : "font-medium"}`}
              >
                {item.label}
              </p>
            </button>
          ))}

          {/* Quick Stats */}
          <div className="mt-8 px-3">
            <p className="text-[10px] uppercase tracking-widest text-(--text-faint) font-bold mb-4">
              Quick Stats
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-(--text-muted)">Sync Status</span>
                <span className="text-xs text-emerald-400 font-bold">Stable</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-(--text-muted)">Schools Active</span>
                <span className="text-xs text-primary font-bold">142</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-(--text-muted)">Today&apos;s Syncs</span>
                <span className="text-xs text-primary font-bold">1,204</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-(--text-muted)">Error Rate</span>
                <span className="text-xs text-amber-400 font-bold">0.4%</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-end gap-4">
            <div>
              <h1 className="text-(--text-base) text-3xl font-black tracking-tight">
                System Integrations Control
              </h1>
              <p className="text-(--text-muted) text-sm mt-1">
                Manage global API keys and monitor cross-platform school synchronization.
              </p>
            </div>
            <button
              onClick={() => setKillSwitchModal(true)}
              className="flex items-center justify-center rounded-lg h-11 px-6 bg-rose-500/10 border border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-sm font-bold gap-2"
            >
              <span className="material-symbols-outlined text-lg">dangerous</span>
              Global Kill Switch
            </button>
          </div>

          {/* API Config Panel */}
          <section className="bg-(--bg-card)/40 border border-(--border) rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary">
                settings_input_component
              </span>
              <h2 className="text-(--text-base) text-lg font-bold">Google Cloud API Configuration</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-(--text-muted) text-xs font-semibold uppercase tracking-wider">
                  Client ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full rounded-lg bg-(--bg-card) border border-(--border) text-(--text-base) focus:ring-[#13daec] focus:border-primary h-12 px-4 font-mono text-sm pr-10 focus:outline-none"
                  />
                  <button
                    onClick={() => handleCopy(clientId, "clientId")}
                    className="absolute right-3 top-3 text-(--text-faint) hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {copiedField === "clientId" ? "check" : "content_copy"}
                    </span>
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-(--text-muted) text-xs font-semibold uppercase tracking-wider">
                  Client Secret Key
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? "text" : "password"}
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    className="w-full rounded-lg bg-(--bg-card) border border-(--border) text-(--text-base) focus:ring-[#13daec] focus:border-primary h-12 px-4 font-mono text-sm pr-10 focus:outline-none"
                  />
                  <button
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-3 text-(--text-faint) hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showSecret ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Environments */}
            <div className="mt-6 flex items-center gap-3">
              {["Production", "Staging", "Development"].map((env, i) => (
                <button
                  key={env}
                  className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${
                    i === 0
                      ? "bg-primary text-white border-primary"
                      : "border-(--border) text-(--text-muted) hover:border-primary hover:text-primary"
                  }`}
                >
                  {env}
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button className="px-4 py-2 text-sm font-medium text-(--text-muted) hover:text-(--text-base) transition-colors">
                Discard Changes
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-primary text-white font-bold rounded-lg text-sm hover:brightness-110 transition-all"
              >
                Save Global Settings
              </button>
            </div>
          </section>

          {/* Integrated Schools Table */}
          <section className="bg-(--bg-card)/40 border border-(--border) rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-(--border) flex flex-wrap justify-between items-center gap-3 bg-(--bg-card)/20">
              <h2 className="text-(--text-base) text-lg font-bold">Integrated Schools</h2>
              <div className="flex items-center gap-3">
                {/* Filter Tabs */}
                <div className="flex items-center gap-1 bg-(--bg-page) rounded-lg p-1">
                  {[
                    { val: "all", label: "All" },
                    { val: "active", label: "Active" },
                    { val: "syncing", label: "Syncing" },
                    { val: "error", label: "Errors" },
                  ].map(({ val, label }) => (
                    <button
                      key={val}
                      onClick={() => setFilterStatus(val)}
                      className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                        filterStatus === val
                          ? "bg-primary text-white"
                          : "text-(--text-muted) hover:text-(--text-base)"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary font-bold">
                  12 New Syncs Today
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] uppercase tracking-widest text-(--text-faint) font-bold border-b border-(--border)/50">
                  <tr>
                    <th className="px-6 py-3">School Name</th>
                    <th className="px-6 py-3">Integration Status</th>
                    <th className="px-6 py-3">Synced Students</th>
                    <th className="px-6 py-3">Grades Passed</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2d4548]/50">
                  {filteredSchools.map((school) => {
                    const cfg = STATUS_CONFIG[school.status];
                    return (
                      <tr key={school.id} className="hover:bg-primary/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-(--text-base)">{school.name}</span>
                            <span className="text-xs text-(--text-faint)">{school.location}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-bold ${cfg.color}`}
                          >
                            <span
                              className={`size-2 rounded-full ${cfg.dot} ${cfg.pulse ? "animate-pulse" : ""}`}
                            ></span>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-(--text-muted)">
                          {school.syncedStudents > 0 ? school.syncedStudents.toLocaleString() : "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-(--text-muted)">
                          {school.gradesPassed > 0 ? school.gradesPassed.toLocaleString() : "—"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 rounded hover:bg-primary/10 text-(--text-faint) hover:text-primary transition-colors">
                              <span className="material-symbols-outlined text-lg">sync</span>
                            </button>
                            <button className="p-1.5 rounded hover:bg-primary/10 text-(--text-faint) hover:text-primary transition-colors">
                              <span className="material-symbols-outlined text-lg">settings</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right Sidebar: Health Monitor */}
        <aside className="w-72 shrink-0 flex flex-col gap-5">
          {/* Real-time Status */}
          <div className="bg-(--bg-card) border border-(--border) rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-(--text-base) font-bold text-sm uppercase tracking-wider">
              Health Monitor
            </h3>

            <div className="flex items-center justify-between p-4 bg-(--bg-page)/50 rounded-xl border border-emerald-500/20">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-400">cloud_done</span>
                <div>
                  <p className="text-xs font-bold text-(--text-base)">API Gateway</p>
                  <p className="text-[10px] text-emerald-400">Connected</p>
                </div>
              </div>
              <div className="h-2 w-16 bg-emerald-400/20 rounded-full overflow-hidden">
                <div className="h-full w-4/5 bg-emerald-400 rounded-full"></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Latency", value: "24ms", highlight: true },
                { label: "Uptime", value: "99.9%", highlight: true },
                { label: "Throughput", value: "1.2k/s", highlight: false },
                { label: "Error Rate", value: "0.4%", highlight: false },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="p-3 bg-(--bg-page) border border-(--border) rounded-xl">
                  <p className="text-[10px] text-(--text-faint) font-bold">{label}</p>
                  <p
                    className={`text-lg font-black ${highlight ? "text-primary" : "text-amber-400"}`}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Mini progress bars */}
            <div className="space-y-2">
              {[
                { label: "Sync Queue", pct: 23 },
                { label: "API Quota Used", pct: 67 },
              ].map(({ label, pct }) => (
                <div key={label}>
                  <div className="flex justify-between text-[10px] text-(--text-faint) mb-1">
                    <span>{label}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-(--bg-page) rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pct > 80 ? "bg-rose-500" : pct > 60 ? "bg-amber-400" : "bg-primary"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sync Error Logs */}
          <div className="bg-(--bg-card)/40 border border-(--border) rounded-2xl flex flex-col overflow-hidden flex-1">
            <div className="px-5 py-4 border-b border-(--border) flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-400 text-lg">warning</span>
              <h3 className="text-(--text-base) font-bold text-sm uppercase tracking-wider">
                Recent Errors
              </h3>
            </div>
            <div className="overflow-y-auto p-4 space-y-3 max-h-72">
              {SYNC_ERRORS.map((err, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-r-lg border-l-2 ${
                    err.severity === "error"
                      ? "bg-rose-500/5 border-rose-500"
                      : "bg-(--bg-elevated)/30 border-slate-600"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span
                      className={`text-[10px] font-black ${err.severity === "error" ? "text-rose-400" : "text-(--text-muted)"}`}
                    >
                      {err.code}
                    </span>
                    <span className="text-[10px] text-(--text-faint)">{err.time}</span>
                  </div>
                  <p className="text-[11px] text-(--text-muted) font-medium">
                    <span className="text-(--text-muted) font-bold">{err.school}:</span> {err.message}
                  </p>
                </div>
              ))}
            </div>
            <button className="w-full py-3 bg-(--bg-card) border-t border-(--border) text-xs font-bold text-primary hover:bg-primary/10 transition-colors uppercase tracking-widest">
              View All Logs
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
