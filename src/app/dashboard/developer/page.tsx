"use client";

import { useState } from "react";

type DocSection =
  | "getting-started"
  | "authentication"
  | "google-classroom"
  | "webhooks"
  | "rate-limits"
  | "error-codes";
type ActiveTab = "overview" | "endpoints" | "try-it-out" | "changelog";

interface Endpoint {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  description: string;
  params: { name: string; type: string; required: boolean; description: string }[];
  responseExample: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: "GET",
    path: "/api/v2/integrations/google-classroom/sync/:school_id",
    description:
      "Retrieve the current synchronization status for a specific school or district. Returns the timestamp of the last successful sync and any pending tasks.",
    params: [
      {
        name: "school_id",
        type: "string",
        required: true,
        description: "The unique identifier for the school entity.",
      },
      {
        name: "include_logs",
        type: "boolean",
        required: false,
        description: "Whether to include the last 5 sync event logs.",
      },
    ],
    responseExample: `{
  "status": "success",
  "data": {
    "school_id": "SIA-9921-X",
    "last_sync": "2024-01-24T14:30:00Z",
    "sync_progress": 100,
    "active_tasks": [
      {
        "task_id": "tsk_502",
        "type": "roster_update",
        "status": "completed"
      }
    ],
    "errors": []
  }
}`,
  },
  {
    method: "POST",
    path: "/api/v2/integrations/google-classroom/sync/:school_id/trigger",
    description:
      "Manually trigger a full synchronization cycle for the specified school. This will queue a roster sync, grade passback, and assignment pull.",
    params: [
      {
        name: "school_id",
        type: "string",
        required: true,
        description: "The unique identifier for the school entity.",
      },
      {
        name: "sync_type",
        type: "string",
        required: false,
        description: 'One of: "roster", "grades", "assignments", "full". Defaults to "full".',
      },
    ],
    responseExample: `{
  "status": "accepted",
  "data": {
    "job_id": "job_8841-KE",
    "school_id": "SIA-9921-X",
    "sync_type": "full",
    "queued_at": "2024-01-24T15:00:00Z",
    "estimated_duration": "90s"
  }
}`,
  },
  {
    method: "DELETE",
    path: "/api/v2/integrations/google-classroom/:school_id/disconnect",
    description:
      "Disconnect a school's Google Classroom integration. This revokes OAuth tokens and halts all sync jobs. This action is irreversible without re-authorisation.",
    params: [
      {
        name: "school_id",
        type: "string",
        required: true,
        description: "The unique identifier for the school entity.",
      },
      {
        name: "confirm",
        type: "boolean",
        required: true,
        description: 'Must be set to "true" to confirm the destructive action.',
      },
    ],
    responseExample: `{
  "status": "success",
  "message": "Integration disconnected successfully.",
  "data": {
    "school_id": "SIA-9921-X",
    "disconnected_at": "2024-01-24T15:05:00Z"
  }
}`,
  },
];

const CHANGELOG = [
  {
    version: "v2.4.0",
    date: "Jan 24, 2024",
    changes: [
      "Added `sync_type` parameter to trigger endpoint",
      "Rate limit headers now included in all responses",
      "Deprecated `legacy_sync` flag removed",
    ],
  },
  {
    version: "v2.3.1",
    date: "Dec 10, 2023",
    changes: [
      "Fixed race condition in roster update tasks",
      "Improved error messages for 404 responses",
      "Added `estimated_duration` to trigger response",
    ],
  },
  {
    version: "v2.3.0",
    date: "Nov 1, 2023",
    changes: [
      "Introduced Google Classroom Sync API",
      "OAuth 2.0 PKCE flow for school-level auth",
      "Webhook delivery now supports retry with exponential backoff",
    ],
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-emerald-500 text-background-dark",
  POST: "bg-[#13daec] text-background-dark",
  PUT: "bg-amber-500 text-background-dark",
  DELETE: "bg-rose-500 text-white",
  PATCH: "bg-violet-500 text-white",
};

export default function DeveloperPortalPage() {
  const [activeSection, setActiveSection] = useState<DocSection>("google-classroom");
  const [activeTab, setActiveTab] = useState<ActiveTab>("endpoints");
  const [tryItSchoolId, setTryItSchoolId] = useState("SIA-9921-X");
  const [tryItAuth, setTryItAuth] = useState("Bearer eyJhbGciOiJIUzI1NiI...");
  const [tryItOutput, setTryItOutput] = useState<string | null>(null);
  const [tryItLoading, setTryItLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSendRequest = () => {
    if (!tryItSchoolId) return;
    setTryItLoading(true);
    setTryItOutput(null);
    setTimeout(() => {
      setTryItOutput(ENDPOINTS[0].responseExample);
      setTryItLoading(false);
    }, 1200);
  };

  const navItems: { section: DocSection; label: string; icon: string; group?: string }[] = [
    {
      section: "getting-started",
      label: "Getting Started",
      icon: "rocket_launch",
      group: "Guides",
    },
    { section: "authentication", label: "Authentication", icon: "vpn_key" },
    {
      section: "google-classroom",
      label: "Google Classroom Sync",
      icon: "sync_alt",
      group: "Integrations",
    },
    { section: "webhooks", label: "Webhooks", icon: "webhook" },
    { section: "rate-limits", label: "Rate Limits", icon: "speed", group: "Reference" },
    { section: "error-codes", label: "Error Codes", icon: "error" },
  ];

  return (
    <div className="min-h-screen bg-[#102022] flex flex-col">
      {/* Page Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#2d4548] bg-[#102022]">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#13daec]">code</span>
          <h1 className="text-white font-bold text-base">Developer Portal</h1>
          <span className="px-2 py-0.5 bg-[#13daec]/10 text-[#13daec] text-[10px] font-bold rounded uppercase tracking-wider">
            API v2.4.0
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              search
            </span>
            <input
              className="bg-[#1a2e30] border border-[#2d4548] rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#13daec] w-56"
              placeholder="Search docs..."
            />
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 bg-[#1a2e30] border border-[#2d4548] text-slate-300 rounded-lg text-sm hover:border-[#13daec] transition-all"
          >
            <span className="material-symbols-outlined text-base">description</span>
            GitHub
          </a>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Docs Navigation */}
        <aside className="w-64 border-r border-[#2d4548] bg-[#102022] flex flex-col overflow-y-auto shrink-0">
          <div className="p-5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-slate-100 text-sm font-semibold">API Documentation</p>
                <p className="text-slate-500 text-xs font-mono">v2.4.0-stable</p>
              </div>
              <span className="px-2 py-1 rounded bg-[#13daec]/10 text-[#13daec] text-[10px] font-bold uppercase tracking-wider">
                Public
              </span>
            </div>

            <nav className="space-y-0.5">
              {navItems.map((item, i) => {
                const showGroup = item.group && (i === 0 || navItems[i - 1].group !== item.group);
                return (
                  <div key={item.section}>
                    {showGroup && (
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest px-3 mb-1 mt-5">
                        {item.group}
                      </p>
                    )}
                    <button
                      onClick={() => setActiveSection(item.section)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left group ${
                        activeSection === item.section
                          ? "bg-[#13daec]/10 text-[#13daec] border border-[#13daec]/20"
                          : "text-slate-400 hover:bg-[#1a2e30] hover:text-slate-100"
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-xl ${activeSection !== item.section ? "group-hover:text-[#13daec]" : ""}`}
                      >
                        {item.icon}
                      </span>
                      <span
                        className={`text-sm ${activeSection === item.section ? "font-bold" : "font-medium"}`}
                      >
                        {item.label}
                      </span>
                    </button>
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto p-5 border-t border-[#2d4548]">
            <button className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-[#1a2e30] text-slate-100 text-sm font-bold rounded-lg hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined text-lg">code</span>
              API Reference
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#102022] p-8">
          <div className="max-w-5xl mx-auto">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
              <button onClick={() => {}} className="hover:text-[#13daec]">
                Developer Portal
              </button>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <button className="hover:text-[#13daec]">Documentation</button>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-slate-100">Google Classroom Sync</span>
            </nav>

            {/* Hero */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-10 border-b border-[#2d4548]">
              <div className="space-y-3">
                <h1 className="text-white text-4xl font-extrabold tracking-tight">
                  Google Classroom Sync API
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
                  The Sync API allows schools to automate the synchronization of rosters,
                  assignments, and grades between STEM Impact Academy and Google Classroom.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                    Stable
                  </span>
                  <span className="text-slate-500 text-xs">Last updated Jan 24, 2024</span>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#1a2e30] border border-[#2d4548] text-slate-100 rounded-lg hover:border-[#13daec] transition-all text-sm font-bold shrink-0">
                <span className="material-symbols-outlined text-lg">description</span>
                View on GitHub
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#2d4548] mb-10">
              {(["overview", "endpoints", "try-it-out", "changelog"] as ActiveTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 font-bold text-sm capitalize transition-colors border-b-2 ${
                    activeTab === tab
                      ? "text-[#13daec] border-[#13daec]"
                      : "text-slate-500 hover:text-slate-300 border-transparent"
                  }`}
                >
                  {tab === "try-it-out" ? "Try it Out" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab: Overview */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      icon: "sync_alt",
                      label: "Roster Sync",
                      desc: "Automatically sync student and teacher rosters from Google Classroom to STEM Academy on a configurable schedule.",
                    },
                    {
                      icon: "grade",
                      label: "Grade Passback",
                      desc: "Push assignment scores from STEM Academy back to Google Classroom gradebooks in real-time.",
                    },
                    {
                      icon: "assignment",
                      label: "Assignment Pull",
                      desc: "Import assignments and coursework from connected Google Classroom courses into the platform.",
                    },
                  ].map(({ icon, label, desc }) => (
                    <div
                      key={label}
                      className="p-5 rounded-xl bg-[#1a2e30] border border-[#2d4548]"
                    >
                      <span className="material-symbols-outlined text-[#13daec] text-3xl mb-3 block">
                        {icon}
                      </span>
                      <h3 className="text-white font-bold mb-2">{label}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                    </div>
                  ))}
                </div>
                <div className="p-6 rounded-xl bg-[#1a2e30] border border-[#2d4548]">
                  <h3 className="text-white font-bold mb-3">Base URL</h3>
                  <div className="flex items-center gap-3 bg-[#102022] rounded-lg p-3 font-mono text-sm text-[#13daec]">
                    <span>https://api.stemimpactacademy.org/api/v2</span>
                    <button
                      onClick={() => handleCopy("https://api.stemimpactacademy.org/api/v2", "base")}
                      className="ml-auto text-slate-500 hover:text-[#13daec]"
                    >
                      <span className="material-symbols-outlined text-base">
                        {copied === "base" ? "check" : "content_copy"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Endpoints */}
            {activeTab === "endpoints" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left: Docs */}
                <div className="lg:col-span-7 space-y-12">
                  {ENDPOINTS.map((endpoint, i) => (
                    <section key={i}>
                      <h3 className="text-white text-xl font-bold mb-3">
                        {endpoint.method === "GET"
                          ? "Fetch Sync Status"
                          : endpoint.method === "POST"
                            ? "Trigger Manual Sync"
                            : "Disconnect Integration"}
                      </h3>
                      <p className="text-slate-400 mb-5 leading-relaxed text-sm">
                        {endpoint.description}
                      </p>

                      {/* Endpoint Tag */}
                      <div className="flex items-center gap-3 bg-[#1a2e30] p-3 rounded-lg border border-[#2d4548] mb-5">
                        <span
                          className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${METHOD_COLORS[endpoint.method]}`}
                        >
                          {endpoint.method}
                        </span>
                        <code className="text-[#13daec] font-mono text-sm break-all">
                          {endpoint.path}
                        </code>
                        <button
                          onClick={() => handleCopy(endpoint.path, `path-${i}`)}
                          className="ml-auto text-slate-500 hover:text-[#13daec] shrink-0"
                        >
                          <span className="material-symbols-outlined text-base">
                            {copied === `path-${i}` ? "check" : "content_copy"}
                          </span>
                        </button>
                      </div>

                      {/* Params Table */}
                      <h4 className="text-slate-100 text-xs font-bold uppercase tracking-widest mb-3">
                        Parameters
                      </h4>
                      <div className="overflow-hidden rounded-xl border border-[#2d4548]">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-[#1a2e30]/50 text-slate-400 border-b border-[#2d4548]">
                            <tr>
                              <th className="px-4 py-3 font-semibold">Parameter</th>
                              <th className="px-4 py-3 font-semibold">Type</th>
                              <th className="px-4 py-3 font-semibold">Required</th>
                              <th className="px-4 py-3 font-semibold">Description</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#2d4548]">
                            {endpoint.params.map((p) => (
                              <tr key={p.name}>
                                <td className="px-4 py-3 text-[#13daec] font-mono">{p.name}</td>
                                <td className="px-4 py-3 text-slate-500">{p.type}</td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`text-xs font-bold px-2 py-0.5 rounded ${p.required ? "bg-rose-500/10 text-rose-400" : "bg-slate-700 text-slate-400"}`}
                                  >
                                    {p.required ? "required" : "optional"}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-slate-400">{p.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Status Codes */}
                      {i === 0 && (
                        <>
                          <h4 className="text-slate-100 text-xs font-bold uppercase tracking-widest mt-6 mb-3">
                            Response Status Codes
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                              {
                                code: "200",
                                label: "OK",
                                desc: "Successful request. Sync status object returned.",
                                color: "emerald",
                              },
                              {
                                code: "401",
                                label: "Unauthorized",
                                desc: "API key is missing or invalid.",
                                color: "amber",
                              },
                              {
                                code: "404",
                                label: "Not Found",
                                desc: "The specified school_id does not exist.",
                                color: "rose",
                              },
                              {
                                code: "429",
                                label: "Too Many Requests",
                                desc: "Rate limit exceeded for this endpoint.",
                                color: "rose",
                              },
                            ].map(({ code, label, desc, color }) => (
                              <div
                                key={code}
                                className={`p-4 rounded-lg bg-${color}-500/5 border border-${color}-500/20 flex gap-4`}
                              >
                                <span className={`text-${color}-500 font-bold font-mono`}>
                                  {code}
                                </span>
                                <div>
                                  <p className="text-slate-200 text-sm font-bold">{label}</p>
                                  <p className="text-slate-500 text-xs">{desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </section>
                  ))}
                </div>

                {/* Right: Code Samples */}
                <div className="lg:col-span-5 space-y-6">
                  {ENDPOINTS.map((endpoint, i) => (
                    <div
                      key={i}
                      className="rounded-xl overflow-hidden bg-[#0a1516] border border-[#2d4548] shadow-2xl"
                    >
                      <div className="flex items-center justify-between px-4 py-3 bg-[#1a2e30] border-b border-[#2d4548]">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          JSON Response Example
                        </span>
                        <button
                          onClick={() => handleCopy(endpoint.responseExample, `resp-${i}`)}
                          className="text-slate-500 hover:text-[#13daec] transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">
                            {copied === `resp-${i}` ? "check" : "content_copy"}
                          </span>
                        </button>
                      </div>
                      <div className="p-5 overflow-x-auto">
                        <pre className="text-sm font-mono leading-relaxed text-slate-300 whitespace-pre-wrap">
                          {endpoint.responseExample}
                        </pre>
                      </div>
                    </div>
                  ))}

                  {/* Support Card */}
                  <div className="p-5 rounded-xl bg-[#1a2e30] border border-[#2d4548] flex items-center gap-4">
                    <div className="size-12 rounded-full bg-[#13daec]/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#13daec] text-2xl">
                        support_agent
                      </span>
                    </div>
                    <div>
                      <h5 className="text-white text-sm font-bold">Need help integrating?</h5>
                      <p className="text-slate-500 text-xs">
                        Contact our specialized developer support team for dedicated assistance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Try it Out */}
            {activeTab === "try-it-out" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div className="p-5 rounded-xl bg-[#1a2e30] border border-[#2d4548]">
                    <h3 className="text-white font-bold mb-1">Fetch Sync Status</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-2 py-0.5 bg-emerald-500 text-background-dark text-[10px] font-bold rounded uppercase">
                        GET
                      </span>
                      <code className="text-[#13daec] font-mono text-xs">
                        /api/v2/integrations/google-classroom/sync/:school_id
                      </code>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase mb-1.5">
                          school_id *
                        </label>
                        <input
                          type="text"
                          value={tryItSchoolId}
                          onChange={(e) => setTryItSchoolId(e.target.value)}
                          className="w-full bg-[#102022] border border-[#2d4548] rounded-lg px-4 py-2 text-slate-100 text-sm focus:border-[#13daec] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase mb-1.5">
                          Authorization Header
                        </label>
                        <input
                          type="password"
                          value={tryItAuth}
                          onChange={(e) => setTryItAuth(e.target.value)}
                          className="w-full bg-[#102022] border border-[#2d4548] rounded-lg px-4 py-2 text-slate-100 text-sm focus:border-[#13daec] focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={handleSendRequest}
                        disabled={tryItLoading || !tryItSchoolId}
                        className="w-full h-10 bg-[#13daec] text-[#102022] font-bold text-sm rounded-lg hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {tryItLoading ? (
                          <>
                            <span className="material-symbols-outlined text-lg animate-spin">
                              progress_activity
                            </span>
                            Sending...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-lg">play_circle</span>
                            Send Request
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl overflow-hidden border border-[#13daec]/30 bg-[#13daec]/5">
                  <div className="p-4 border-b border-[#13daec]/20 flex items-center justify-between bg-[#13daec]/10">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#13daec]">terminal</span>
                      <h4 className="text-[#13daec] font-bold text-sm uppercase tracking-widest">
                        Console Output
                      </h4>
                    </div>
                    {tryItOutput && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        HTTP 200
                      </span>
                    )}
                  </div>
                  <div className="p-5 min-h-70">
                    {tryItOutput ? (
                      <pre className="text-sm font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {tryItOutput}
                      </pre>
                    ) : tryItLoading ? (
                      <div className="flex items-center justify-center h-48 gap-2 text-slate-500">
                        <span className="material-symbols-outlined animate-spin">
                          progress_activity
                        </span>
                        <span className="text-sm">Awaiting response...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-48">
                        <p className="text-slate-500 text-sm italic">Waiting for request...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Changelog */}
            {activeTab === "changelog" && (
              <div className="space-y-6">
                {CHANGELOG.map((entry) => (
                  <div
                    key={entry.version}
                    className="p-6 rounded-xl bg-[#1a2e30] border border-[#2d4548]"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-[#13daec]/10 text-[#13daec] text-sm font-bold rounded-lg border border-[#13daec]/20">
                          {entry.version}
                        </span>
                        <span className="text-slate-500 text-sm">{entry.date}</span>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {entry.changes.map((change, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                          <span className="material-symbols-outlined text-[#13daec] text-base mt-0.5">
                            check_circle
                          </span>
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Footer Navigation */}
            <div className="mt-20 pt-10 border-t border-[#2d4548] flex justify-between items-center pb-8">
              <button className="group flex flex-col items-start gap-1 max-w-50">
                <span className="text-slate-500 text-xs font-bold uppercase">Previous</span>
                <div className="flex items-center gap-2 text-slate-400 group-hover:text-[#13daec] transition-colors">
                  <span className="material-symbols-outlined">arrow_back</span>
                  <span className="font-bold">Authentication</span>
                </div>
              </button>
              <button className="group flex flex-col items-end gap-1 max-w-50 text-right">
                <span className="text-slate-500 text-xs font-bold uppercase">Next</span>
                <div className="flex items-center gap-2 text-slate-400 group-hover:text-[#13daec] transition-colors">
                  <span className="font-bold">Webhooks</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </div>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
