"use client";

import { useState } from "react";
import Link from "next/link";

const PRIMARY = "#13eca4";

const teamMembers = [
  {
    id: "leo",
    name: "Leo Chen",
    initials: "LC",
    status: "editing",
    statusLabel: "Currently Editing Step 4",
    timeAgo: "Active 12 min ago",
    color: PRIMARY,
    online: true,
  },
  {
    id: "sarah",
    name: "Sarah Miller",
    initials: "SM",
    status: "viewing",
    statusLabel: "Viewing Step 4",
    timeAgo: "Active 5 min ago",
    color: "#94a3b8",
    online: true,
  },
  {
    id: "you",
    name: "You",
    initials: "YO",
    status: "active",
    statusLabel: "Active",
    timeAgo: "Just joined",
    color: "#60a5fa",
    online: true,
  },
  {
    id: "marcus",
    name: "Marcus Wright",
    initials: "MW",
    status: "offline",
    statusLabel: "Offline",
    timeAgo: "2 hours ago",
    color: "#475569",
    online: false,
  },
];

const chatMessages = [
  {
    id: 1,
    author: "Leo Chen",
    initials: "LC",
    text: "I've updated the nozzle geometry — throat diameter is now 42.55mm. Check Step 4!",
    time: "2:14 PM",
    isSelf: false,
  },
  {
    id: 2,
    author: "Sarah Miller",
    initials: "SM",
    text: "Should we adjust the expansion ratio? The exit pressure looks a bit high.",
    time: "2:17 PM",
    isSelf: false,
  },
  {
    id: 3,
    author: "You",
    initials: "YO",
    text: "Good catch Sarah. Leo, can you explain the current ratio choice?",
    time: "2:19 PM",
    isSelf: true,
  },
];

export default function StudentCollaborationPage() {
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState(chatMessages);

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        author: "You",
        initials: "YO",
        text: chatInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isSelf: true,
      },
    ]);
    setChatInput("");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a1a16]">
      {/* ── LEFT PANEL: Team Chat ───────────────────────────── */}
      <aside className="w-72 shrink-0 flex flex-col bg-[#0d1f1a] border-r border-[rgba(19,236,164,0.1)] h-full">
        {/* Chat Header */}
        <div className="px-4 py-4 border-b border-[rgba(19,236,164,0.1)]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Team Chat</h2>
            <span className="material-symbols-outlined text-[#13eca4] text-lg">chat_bubble</span>
          </div>
          {/* Member Avatar Row */}
          <div className="flex items-center gap-2">
            {teamMembers.slice(0, 3).map((m) => (
              <div
                key={m.id}
                title={m.name}
                className="size-8 rounded-full flex items-center justify-center text-[10px] font-bold text-[#0d1f1a] relative"
                style={{ backgroundColor: m.color }}
              >
                {m.initials}
                {m.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-[#13eca4] border border-[#0d1f1a]" />
                )}
              </div>
            ))}
            <span className="text-xs text-slate-400 ml-1">+1 offline</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-2 ${msg.isSelf ? "flex-row-reverse" : ""}`}>
              <div
                className="size-7 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 text-[#0d1f1a]"
                style={{
                  backgroundColor: msg.isSelf
                    ? "#60a5fa"
                    : msg.author === "Leo Chen"
                      ? PRIMARY
                      : "#94a3b8",
                }}
              >
                {msg.initials}
              </div>
              <div
                className={`max-w-45 ${msg.isSelf ? "items-end" : "items-start"} flex flex-col gap-0.5`}
              >
                {!msg.isSelf && (
                  <span className="text-[10px] font-semibold text-slate-400">{msg.author}</span>
                )}
                <div
                  className={`px-3 py-2 rounded-xl text-xs leading-relaxed ${
                    msg.isSelf
                      ? "bg-[#13eca4] text-[#0d1f1a] font-medium"
                      : "bg-[#1a2e30] text-slate-200"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-500">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="px-3 pb-4 pt-2 border-t border-[rgba(19,236,164,0.1)]">
          <div className="flex items-center gap-2 bg-[#1a2e30] rounded-xl px-3 py-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Send a message…"
              className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder:text-slate-500"
            />
            <button
              onClick={sendMessage}
              className="text-[#13eca4] hover:opacity-80 transition-opacity"
            >
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── CENTER PANEL: Workspace ──────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="px-6 py-4 border-b border-[rgba(19,236,164,0.1)] bg-[#0d1f1a] flex items-center justify-between">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-400">
            <Link
              href="/school/student/dashboard"
              className="hover:text-[#13eca4] transition-colors"
            >
              Projects
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="hover:text-[#13eca4] cursor-pointer transition-colors">
              Aerospace Engineering 101
            </span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#13eca4] font-semibold">Step 4: Propulsion Design</span>
          </nav>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Auto-saved</span>
            <span className="material-symbols-outlined text-[#13eca4] text-lg">cloud_done</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Project Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Propulsion System Design
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Collaborative Design Phase · Lesson 4 of 6
            </p>
          </div>

          {/* Team Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Team Progress
              </span>
              <span className="text-sm font-bold text-[#13eca4]">65%</span>
            </div>
            <div className="w-full h-2 bg-[#1a2e30] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#13eca4] rounded-full transition-all duration-500"
                style={{ width: "65%" }}
              />
            </div>
          </div>

          {/* Step Cards */}
          <div className="flex flex-col gap-4">
            {/* Step 3 – Completed */}
            <div className="rounded-2xl border border-[rgba(19,236,164,0.15)] bg-[#0d1f1a] p-5 opacity-60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-[#13eca4]/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#13eca4] text-lg">
                      check_circle
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Step 3 · Completed
                    </p>
                    <h3 className="text-sm font-bold text-white">Fuel Capacity Calculations</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1.5">
                    {["SM", "LC"].map((init) => (
                      <div
                        key={init}
                        className="size-6 rounded-full bg-slate-600 border border-[#0d1f1a] flex items-center justify-center text-[8px] font-bold text-white"
                      >
                        {init}
                      </div>
                    ))}
                  </div>
                  <button className="text-xs text-[#13eca4] font-semibold hover:underline">
                    Review Results
                  </button>
                </div>
              </div>
            </div>

            {/* Step 4 – Active */}
            <div className="rounded-2xl border-2 border-[#13eca4] bg-[#0d2420] p-5 shadow-lg shadow-[#13eca4]/10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-[#13eca4] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#0d1f1a] text-lg">edit</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#13eca4] uppercase tracking-widest">
                      Step 4 · Active
                    </p>
                    <h3 className="text-sm font-bold text-white">Nozzle Geometry Configuration</h3>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#13eca4]/15 border border-[#13eca4]/40 text-[10px] font-bold text-[#13eca4] uppercase tracking-widest">
                  <span className="size-1.5 rounded-full bg-[#13eca4] animate-pulse" />
                  LEO IS CURRENTLY EDITING
                </span>
              </div>

              {/* Stacked avatars + collaborators */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex -space-x-1">
                  <div className="size-7 rounded-full bg-[#13eca4] border-2 border-[#0d2420] flex items-center justify-center text-[9px] font-bold text-[#0d1f1a]">
                    LC
                  </div>
                  <div className="size-7 rounded-full bg-blue-400 border-2 border-[#0d2420] flex items-center justify-center text-[9px] font-bold text-white">
                    YO
                  </div>
                </div>
                <span className="text-xs text-slate-400">Leo editing · You viewing</span>
              </div>

              {/* Quote block */}
              <blockquote className="border-l-2 border-[#13eca4]/40 pl-3 mb-5 text-xs text-slate-300 italic leading-relaxed">
                &ldquo;I&apos;m adjusting the expansion ratio to 1:16 to optimise thrust at
                altitude. The throat geometry is critical for pressure consistency.&rdquo;
                <span className="block mt-1 text-[10px] not-italic text-slate-500 font-semibold">
                  — Leo Chen
                </span>
              </blockquote>

              {/* Metric Cards */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-[#142a25] rounded-xl p-3 border border-[rgba(19,236,164,0.15)]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                    Throat Diameter
                  </p>
                  <p className="text-xl font-black text-white">
                    42.55 <span className="text-sm font-normal text-slate-400">mm</span>
                  </p>
                </div>
                <div className="bg-[#142a25] rounded-xl p-3 border border-[rgba(19,236,164,0.15)]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                    Exit Pressure
                  </p>
                  <p className="text-xl font-black text-white">
                    0.084 <span className="text-sm font-normal text-slate-400">MPa</span>
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                <button
                  disabled
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 text-slate-500 text-xs font-bold cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-sm">lock</span>
                  Edit Locked
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#13eca4] text-[#13eca4] text-xs font-bold hover:bg-[#13eca4]/10 transition-colors">
                  <span className="material-symbols-outlined text-sm">add_comment</span>
                  Add Comment
                </button>
              </div>
            </div>

            {/* Step 5 – Locked */}
            <div className="rounded-2xl border border-dashed border-slate-700 bg-[#0d1f1a]/60 p-5">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-slate-800 flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-500 text-lg">lock</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                    Step 5 · Upcoming
                  </p>
                  <h3 className="text-sm font-bold text-slate-500">Structural Integrity Test</h3>
                  <p className="text-xs text-slate-600 mt-0.5">Locked until Step 4 is finalised</p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit button */}
          <div className="mt-8 flex justify-center">
            <button
              disabled
              className="flex items-center gap-2 px-8 py-3 bg-slate-800 text-slate-500 rounded-xl font-bold text-sm cursor-not-allowed uppercase tracking-widest"
            >
              <span className="material-symbols-outlined text-lg">send</span>
              Share Team Submission
            </button>
          </div>
        </div>
      </main>

      {/* ── RIGHT PANEL: Collaborator Activity ──────────────── */}
      <aside className="w-80 shrink-0 flex flex-col bg-[#0d1f1a] border-l border-[rgba(19,236,164,0.1)] h-full overflow-y-auto">
        <div className="px-4 py-4 border-b border-[rgba(19,236,164,0.1)]">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">
            Collaborator Activity
          </h2>
        </div>

        <div className="flex-1 px-4 py-4 flex flex-col gap-6">
          {/* Member list */}
          <div className="flex flex-col gap-3">
            {teamMembers.map((m, i) => (
              <div key={m.id} className="relative flex items-start gap-3">
                {/* Connector line */}
                {i < teamMembers.length - 1 && (
                  <div className="absolute left-4 top-9 bottom-0 w-px bg-[rgba(19,236,164,0.1)]" />
                )}
                <div
                  className={`size-9 rounded-full flex items-center justify-center text-[11px] font-bold text-[#0d1f1a] shrink-0 z-10 border-2 ${
                    m.status === "editing" ? "border-[#13eca4]" : "border-transparent"
                  } ${!m.online ? "opacity-40 grayscale" : ""}`}
                  style={{ backgroundColor: m.color }}
                >
                  {m.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-white truncate">{m.name}</p>
                    {m.online && m.status === "editing" && (
                      <span className="size-2 rounded-full bg-[#13eca4] animate-pulse" />
                    )}
                  </div>
                  <p
                    className={`text-xs truncate ${m.status === "editing" ? "text-[#13eca4]" : "text-slate-400"}`}
                  >
                    {m.statusLabel}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{m.timeAgo}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Project Brief */}
          <div className="bg-[#142a25] rounded-xl border border-[rgba(19,236,164,0.15)] p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
              Project Brief
            </p>
            <div className="flex flex-col gap-2">
              {[
                { label: "Target Thrust", value: "450 N" },
                { label: "Max Mass", value: "12.5 kg" },
                { label: "Fuel Type", value: "LOX / Kerosene" },
              ].map((spec) => (
                <div key={spec.label} className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{spec.label}</span>
                  <span className="text-xs font-bold text-white">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Download button */}
          <button className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-[rgba(19,236,164,0.3)] text-[#13eca4] text-xs font-bold hover:bg-[#13eca4]/10 transition-colors uppercase tracking-widest">
            <span className="material-symbols-outlined text-lg">download</span>
            Download Project PDF
          </button>
        </div>
      </aside>
    </div>
  );
}
