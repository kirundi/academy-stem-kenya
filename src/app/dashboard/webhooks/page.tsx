"use client";

import { useState } from "react";

interface Webhook {
  id: string;
  url: string;
  events: string[];
  status: "Active" | "Inactive";
  lastDelivery: string;
  successRate: number;
}

interface Delivery {
  id: string;
  status: "200 OK" | "500 ERR" | "408 Timeout";
  event: string;
  sentTo: string;
  time: string;
}

const INITIAL_WEBHOOKS: Webhook[] = [
  {
    id: "wh1",
    url: "https://api.school-dist1.edu/webhook",
    events: ["Registered", "Error"],
    status: "Active",
    lastDelivery: "2 min ago",
    successRate: 99.2,
  },
  {
    id: "wh2",
    url: "https://hooks.slack.com/services/T01...",
    events: ["Completed"],
    status: "Active",
    lastDelivery: "5 min ago",
    successRate: 100,
  },
  {
    id: "wh3",
    url: "https://internal.stema.io/events",
    events: ["All Events"],
    status: "Inactive",
    lastDelivery: "3 days ago",
    successRate: 87.5,
  },
];

const DELIVERIES: Delivery[] = [
  {
    id: "d1",
    status: "200 OK",
    event: "Course Completed (Event ID: EV-889)",
    sentTo: "hooks.slack.com",
    time: "2 mins ago",
  },
  {
    id: "d2",
    status: "200 OK",
    event: "School Registered (Event ID: EV-888)",
    sentTo: "api.school-dist1.edu",
    time: "4 mins ago",
  },
  {
    id: "d3",
    status: "500 ERR",
    event: "Sync Error (Event ID: EV-887)",
    sentTo: "internal.stema.io",
    time: "6 mins ago",
  },
  {
    id: "d4",
    status: "408 Timeout",
    event: "Teacher Joined (Event ID: EV-886)",
    sentTo: "internal.stema.io",
    time: "9 mins ago",
  },
];

const EVENTS = [
  "School Registered",
  "Teacher Joined",
  "Course Completed",
  "Sync Error",
  "User Deleted",
  "API Limit Warning",
  "Submission Graded",
  "Badge Awarded",
];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>(INITIAL_WEBHOOKS);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newContentType, setNewContentType] = useState("application/json");
  const [newSecret, setNewSecret] = useState("");
  const [selectedNewEvents, setSelectedNewEvents] = useState<string[]>([
    "School Registered",
    "Course Completed",
    "Sync Error",
  ]);
  const [deliveries, setDeliveries] = useState<Delivery[]>(DELIVERIES);

  const toggleNewEvent = (ev: string) => {
    setSelectedNewEvents((prev) =>
      prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev]
    );
  };

  const toggleWebhookStatus = (id: string) => {
    setWebhooks((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, status: w.status === "Active" ? "Inactive" : "Active" } : w
      )
    );
  };

  const deleteWebhook = (id: string) => {
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
  };

  const handleCreate = () => {
    if (!newUrl) return;
    const newWh: Webhook = {
      id: `wh${Date.now()}`,
      url: newUrl,
      events: selectedNewEvents,
      status: "Active",
      lastDelivery: "Never",
      successRate: 0,
    };
    setWebhooks((prev) => [newWh, ...prev]);
    setNewUrl("");
    setNewSecret("");
    setShowNewForm(false);
  };

  const redeliverEvent = (id: string) => {
    setDeliveries((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "200 OK", time: "just now" } : d))
    );
  };

  return (
    <div className="p-6 space-y-8 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-wrap justify-between items-end gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-3xl font-black text-slate-100 tracking-tight">
            Webhooks Configuration
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Manage global real-time system event notifications across all school districts.
          </p>
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="flex items-center gap-2 bg-[#13daec] hover:bg-[#13daec]/90 text-slate-900 px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg shadow-[rgba(19,218,236,0.2)]"
        >
          <span className="material-symbols-outlined">{showNewForm ? "close" : "add"}</span>
          {showNewForm ? "Cancel" : "Create New Webhook"}
        </button>
      </div>

      {/* New Webhook Form */}
      {showNewForm && (
        <section className="bg-[#1a2e31] rounded-xl border border-slate-800 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-800 bg-slate-800/30 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#13daec]">edit_note</span>
            <h3 className="text-white font-bold">New Webhook Details</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-7">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Payload URL
                </label>
                <input
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://api.yourdomain.com/webhook"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg text-sm px-4 py-2.5 text-slate-100 focus:ring-[#13daec] focus:border-[#13daec] outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Content Type
                  </label>
                  <select
                    value={newContentType}
                    onChange={(e) => setNewContentType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg text-sm px-3 py-2.5 text-slate-100 focus:ring-[#13daec] outline-none transition-all"
                  >
                    <option>application/json</option>
                    <option>application/xml</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Secret
                  </label>
                  <input
                    type="password"
                    value={newSecret}
                    onChange={(e) => setNewSecret(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg text-sm px-4 py-2.5 text-slate-100 focus:ring-[#13daec] focus:border-[#13daec] outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Select Events to Subscribe
              </label>
              <div className="grid grid-cols-2 gap-y-3">
                {EVENTS.map((ev) => (
                  <label key={ev} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedNewEvents.includes(ev)}
                      onChange={() => toggleNewEvent(ev)}
                      className="rounded border-slate-700 bg-slate-800 text-[#13daec] focus:ring-[#13daec] w-4 h-4 accent-[#13daec]"
                    />
                    <span className="text-sm text-slate-300 group-hover:text-[#13daec] transition-colors">
                      {ev}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="px-6 pb-5 flex justify-end gap-3">
            <button
              onClick={() => setShowNewForm(false)}
              className="px-5 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-6 py-2.5 bg-[#13daec] text-[#102022] font-bold rounded-lg text-sm hover:opacity-90 transition-opacity"
            >
              Create Webhook
            </button>
          </div>
        </section>
      )}

      {/* Active Webhooks Table */}
      <section className="space-y-4">
        <h3 className="text-white text-xl font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-[#13daec]">lan</span>
          Active Webhooks
          <span className="ml-2 px-2 py-0.5 bg-[rgba(19,218,236,0.1)] text-[#13daec] text-xs font-bold rounded-full">
            {webhooks.filter((w) => w.status === "Active").length}
          </span>
        </h3>
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#1a2e31] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-700">
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Endpoint URL
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Events
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Last Delivery
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
                    Success Rate
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
                    Status
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {webhooks.map((wh) => (
                  <tr key={wh.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-slate-100 font-mono">{wh.url}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {wh.events.map((ev) => (
                          <span
                            key={ev}
                            className="bg-[rgba(19,218,236,0.1)] text-[#13daec] text-[10px] font-bold px-2 py-0.5 rounded uppercase"
                          >
                            {ev}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400">{wh.lastDelivery}</td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`text-sm font-bold ${wh.successRate >= 95 ? "text-emerald-400" : wh.successRate >= 80 ? "text-amber-400" : "text-[#ef4444]"}`}
                      >
                        {wh.successRate > 0 ? `${wh.successRate}%` : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${wh.status === "Active" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-slate-500/10 text-slate-500 border border-slate-500/20"}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${wh.status === "Active" ? "bg-emerald-500" : "bg-slate-500"}`}
                        />
                        {wh.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleWebhookStatus(wh.id)}
                          title={wh.status === "Active" ? "Disable" : "Enable"}
                          className="text-slate-400 hover:text-[#13daec] transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {wh.status === "Active" ? "toggle_on" : "toggle_off"}
                          </span>
                        </button>
                        <button className="text-slate-400 hover:text-[#13daec] transition-colors">
                          <span className="material-symbols-outlined text-[20px]">settings</span>
                        </button>
                        <button
                          onClick={() => deleteWebhook(wh.id)}
                          title="Delete"
                          className="text-slate-400 hover:text-[#ef4444] transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Recent Deliveries Log */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white text-xl font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[#13daec]">history</span>
            Recent Deliveries
          </h3>
          <button
            onClick={() => setDeliveries([])}
            className="text-xs font-bold text-[#13daec] hover:underline"
          >
            Clear Logs
          </button>
        </div>
        <div className="bg-[#1a2e31] rounded-xl border border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 space-y-3">
            {deliveries.length === 0 ? (
              <p className="text-center text-slate-500 py-6 text-sm">No recent deliveries</p>
            ) : (
              deliveries.map((d) => (
                <div
                  key={d.id}
                  className={`flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border-l-4 ${d.status === "200 OK" ? "border-emerald-500" : d.status === "500 ERR" ? "border-[#ef4444]" : "border-amber-400"}`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded ${d.status === "200 OK" ? "text-emerald-500 bg-emerald-500/10" : d.status === "500 ERR" ? "text-[#ef4444] bg-[rgba(239,68,68,0.1)]" : "text-amber-400 bg-amber-400/10"}`}
                    >
                      {d.status}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-100">{d.event}</span>
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">
                        Sent to: {d.sentTo} · {d.time}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => redeliverEvent(d.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-[#13daec] hover:text-slate-900 text-slate-300 rounded text-xs font-bold transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    Redeliver
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
