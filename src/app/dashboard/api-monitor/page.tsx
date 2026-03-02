"use client";

import { useState } from "react";

const USAGE_BY_SCHOOL = [
  {
    school: "Jefferson Science Magnet",
    requests: "242,501",
    integrations: ["G-Classroom", "Canvas"],
    status: "Optimal",
  },
  {
    school: "Oakwood STEM Collegiate",
    requests: "189,420",
    integrations: ["Clever"],
    status: "Optimal",
  },
  {
    school: "North Valley Academy",
    requests: "156,002",
    integrations: ["G-Classroom", "Internal"],
    status: "Throttled",
  },
  {
    school: "Impact Prep Charter",
    requests: "98,750",
    integrations: ["G-Classroom"],
    status: "Optimal",
  },
  {
    school: "Riverside STEM School",
    requests: "87,314",
    integrations: ["Canvas"],
    status: "Degraded",
  },
  {
    school: "East Bay Academy",
    requests: "71,200",
    integrations: ["Clever", "G-Classroom"],
    status: "Optimal",
  },
];

const METRIC_CARDS = [
  {
    label: "Total API Calls (24h)",
    value: "1.2M",
    trend: "+12.4%",
    trendUp: true,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    icon: "trending_up",
  },
  {
    label: "Avg Response Time",
    value: "42ms",
    trend: "-5.2%",
    trendUp: true,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    icon: "arrow_downward",
  },
  {
    label: "Success Rate",
    value: "99.9%",
    valueColor: "text-[#13daec]",
    trend: "-0.1%",
    trendUp: false,
    color: "text-[#ef4444]",
    bg: "bg-[rgba(239,68,68,0.1)]",
    icon: "warning",
  },
  {
    label: "Webhook Deliveries",
    value: "856k",
    trend: "Active",
    trendUp: true,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    icon: "check_circle",
  },
];

export default function ApiMonitorPage() {
  const [timeRange, setTimeRange] = useState("24h");

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-100">
          Global API Usage &amp; Monitoring
        </h1>
        <p className="text-slate-400 mt-1">
          Real-time throughput and system health across 1,240 integrated schools.
        </p>
      </div>

      {/* Time range pills */}
      <div className="flex items-center gap-2">
        {["1h", "24h", "7d", "30d"].map((r) => (
          <button
            key={r}
            onClick={() => setTimeRange(r)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${timeRange === r ? "bg-[#13daec] text-[#102022]" : "bg-[#1a2e31] text-slate-400 hover:text-white border border-[rgba(19,218,236,0.1)]"}`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {METRIC_CARDS.map((m) => (
          <div
            key={m.label}
            className="bg-[#1a2e31] border border-[rgba(19,218,236,0.1)] rounded-xl p-5 hover:border-[rgba(19,218,236,0.3)] transition-all"
          >
            <p className="text-slate-400 text-sm font-medium">{m.label}</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className={`text-3xl font-bold ${m.valueColor ?? "text-slate-100"}`}>
                {m.value}
              </h3>
              <span
                className={`text-sm font-bold flex items-center ${m.color} ${m.bg} px-2 py-0.5 rounded-full`}
              >
                <span className="material-symbols-outlined text-sm mr-1">{m.icon}</span>
                {m.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts + Side panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-[#1a2e31] border border-[rgba(19,218,236,0.1)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-100">API Requests per Hour</h3>
              <p className="text-sm text-slate-400">Aggregated traffic across primary endpoints</p>
            </div>
            <div className="flex gap-4">
              {[
                { color: "bg-[#13daec]", label: "Classroom Sync" },
                { color: "bg-slate-400", label: "Internal Auth" },
                { color: "bg-[#ef4444]", label: "Errors" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${l.color}`} />
                  <span className="text-xs text-slate-300">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SVG Chart */}
          <div className="relative h-64 w-full">
            <svg className="w-full h-full" viewBox="0 0 1000 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#13daec" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#13daec" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="areaGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#64748b" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#64748b" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              {[0, 50, 100, 150, 200].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="1000"
                  y2={y}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                />
              ))}
              {/* Area fill – main */}
              <path
                d="M0,150 Q100,80 200,120 T400,60 T600,100 T800,40 T1000,90 L1000,200 L0,200 Z"
                fill="url(#areaGrad)"
              />
              {/* Main line */}
              <path
                d="M0,150 Q100,80 200,120 T400,60 T600,100 T800,40 T1000,90"
                fill="none"
                stroke="#13daec"
                strokeWidth="3"
              />
              {/* Secondary line */}
              <path
                d="M0,180 Q100,160 200,170 T400,145 T600,155 T800,135 T1000,150"
                fill="none"
                stroke="#64748b"
                strokeWidth="2"
                strokeDasharray="5 3"
              />
              {/* Error spikes */}
              <circle cx="400" cy="60" r="4" fill="#ef4444" />
              <path d="M390,70 L400,60 L410,75" fill="none" stroke="#ef4444" strokeWidth="2" />
              <circle cx="800" cy="40" r="4" fill="#ef4444" />
              <path d="M790,50 L800,40 L810,52" fill="none" stroke="#ef4444" strokeWidth="2" />
            </svg>
            <div className="flex justify-between mt-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              {["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:59"].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col gap-5">
          {/* Rate Limit */}
          <div className="bg-[#1a2e31] border border-[rgba(19,218,236,0.1)] rounded-xl p-6">
            <h3 className="text-lg font-bold text-slate-100 mb-5">Rate Limit Status</h3>
            <div className="space-y-5">
              {[
                { label: "Throughput Capacity", value: "72%", pct: 72, color: "bg-[#13daec]" },
                { label: "Queue Depth", value: "12ms wait", pct: 24, color: "bg-emerald-400" },
                {
                  label: "Active Connections",
                  value: "4.2k / 10k",
                  pct: 42,
                  color: "bg-[#13daec]/50",
                },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm text-slate-400">{row.label}</span>
                    <span className="text-sm font-bold text-slate-100">{row.value}</span>
                  </div>
                  <div className="w-full bg-[#102022] h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`${row.color} h-full rounded-full`}
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-7 pt-5 border-t border-[rgba(19,218,236,0.1)]">
              <button className="w-full py-3 bg-[#13daec] text-[#102022] font-bold rounded-lg text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                <span className="material-symbols-outlined text-xl">settings_input_component</span>
                Adjust Scale Thresholds
              </button>
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.2)] rounded-xl p-5">
            <div className="flex items-center gap-3 text-[#ef4444] mb-4">
              <span className="material-symbols-outlined">error</span>
              <h3 className="font-bold">System Alerts</h3>
            </div>
            <ul className="space-y-3">
              <li className="text-xs text-slate-300 bg-[#102022]/50 p-2 rounded border-l-2 border-[#ef4444]">
                <strong>12:42</strong> Google Auth latency spike detected in Region US-East.
              </li>
              <li className="text-xs text-slate-300 bg-[#102022]/50 p-2 rounded border-l-2 border-[#13daec]">
                <strong>11:15</strong> Webhook retry logic auto-resolved for 12 endpoints.
              </li>
              <li className="text-xs text-slate-300 bg-[#102022]/50 p-2 rounded border-l-2 border-slate-500">
                <strong>09:30</strong> Scheduled maintenance window completed successfully.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Usage by School Table */}
      <div className="bg-[#1a2e31] border border-[rgba(19,218,236,0.1)] rounded-xl overflow-hidden">
        <div className="p-5 border-b border-[rgba(19,218,236,0.1)] flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100">Usage by School</h3>
            <p className="text-sm text-slate-400">Top schools by API request volume (24h)</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-[#102022] border border-[rgba(19,218,236,0.2)] px-4 py-2 rounded-lg text-xs font-bold text-slate-300 flex items-center gap-2 hover:bg-[rgba(19,218,236,0.1)] transition-colors">
              <span className="material-symbols-outlined text-sm">download</span>Export CSV
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#102022]/30 text-slate-500 uppercase text-[10px] tracking-widest font-bold">
              <tr>
                <th className="px-6 py-4">School Name</th>
                <th className="px-6 py-4">API Requests (24h)</th>
                <th className="px-6 py-4">Integrations</th>
                <th className="px-6 py-4">Health Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(19,218,236,0.05)]">
              {USAGE_BY_SCHOOL.map((row) => (
                <tr key={row.school} className="hover:bg-[rgba(19,218,236,0.04)] transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-slate-200">{row.school}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{row.requests}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {row.integrations.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-[#1a2e31] border border-[rgba(19,218,236,0.2)] rounded text-[10px] text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium ${
                        row.status === "Optimal"
                          ? "bg-emerald-400/10 text-emerald-400"
                          : row.status === "Throttled"
                            ? "bg-[rgba(239,68,68,0.1)] text-[#ef4444]"
                            : "bg-amber-400/10 text-amber-400"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          row.status === "Optimal"
                            ? "bg-emerald-400"
                            : row.status === "Throttled"
                              ? "bg-[#ef4444] animate-pulse"
                              : "bg-amber-400"
                        }`}
                      />
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button className="text-[#13daec] hover:underline font-medium">
                      View Logs
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
