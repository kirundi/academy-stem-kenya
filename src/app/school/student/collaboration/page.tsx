"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { doc, updateDoc, deleteField, serverTimestamp, documentId } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthContext } from "@/contexts/AuthContext";
import { useDocument, useCollection, useCreateDoc } from "@/hooks/useFirestore";
import { where, orderBy, limit } from "@/hooks/useFirestore";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Group {
  id: string;
  name: string;
  studentIds: string[];
  courseIds: string[];
  classroomId: string;
  teacherId: string;
  currentStep?: number;
  totalSteps?: number;
  progress?: number;
  presence?: Record<
    string,
    {
      displayName: string;
      status: "editing" | "viewing";
      lastSeen: unknown;
    }
  >;
}

interface GroupMessage {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: { seconds: number } | null;
}

interface MemberUser {
  id: string;
  displayName: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MEMBER_COLORS = ["#2dd4bf", "#60a5fa", "#f59e0b", "#a78bfa", "#f472b6", "#34d399"];

function memberColor(index: number) {
  return MEMBER_COLORS[index % MEMBER_COLORS.length];
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatTime(ts: { seconds: number } | null): string {
  if (!ts) return "";
  return new Date(ts.seconds * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// Loading / empty states
// ---------------------------------------------------------------------------

function CentreState({ icon, title, body }: { icon: string; title: string; body?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
      <span className="material-symbols-outlined text-5xl text-(--text-faint)">{icon}</span>
      <h2 className="text-(--text-base) font-bold text-xl">{title}</h2>
      {body && <p className="text-(--text-muted) text-sm max-w-sm">{body}</p>}
      <Link
        href="/school/student/dashboard"
        className="text-(--primary-green) text-sm hover:underline mt-2"
      >
        ← Back to Dashboard
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inner component (needs useSearchParams → must be inside Suspense)
// ---------------------------------------------------------------------------

function CollaborationContent() {
  const searchParams = useSearchParams();
  const groupId = searchParams.get("groupId");
  const { appUser } = useAuthContext();
  const uid = appUser?.uid ?? "";
  const displayName = appUser?.displayName ?? "Student";
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // ── Fetch group doc (real-time) ──────────────────────────────────────────
  const { data: group, loading: groupLoading } = useDocument<Group>("groups", groupId);

  // ── Fetch member user docs ───────────────────────────────────────────────
  const memberIds = group?.studentIds ?? [];
  const { data: memberUsers } = useCollection<MemberUser>(
    "users",
    memberIds.length > 0 ? [where(documentId(), "in", memberIds.slice(0, 10))] : [],
    memberIds.length > 0
  );

  // ── Fetch classroom info ─────────────────────────────────────────────────
  const { data: classroom } = useDocument<{
    name: string;
    subject: string;
  }>("classrooms", group?.classroomId ?? null);

  // ── Real-time chat (subcollection) ───────────────────────────────────────
  const msgsPath = groupId ? `groups/${groupId}/messages` : "";
  const { data: messages } = useCollection<GroupMessage>(
    msgsPath,
    [orderBy("createdAt", "asc"), limit(100)],
    !!groupId
  );
  const { create: addMessage, loading: sending } = useCreateDoc(msgsPath);

  const [chatInput, setChatInput] = useState("");

  // ── Presence ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!groupId || !uid) return;
    const groupRef = doc(db, "groups", groupId);

    // Register as "viewing" on mount
    updateDoc(groupRef, {
      [`presence.${uid}`]: {
        displayName,
        status: "viewing",
        lastSeen: serverTimestamp(),
      },
    }).catch(() => {});

    // Heartbeat every 30 s so others see "last seen" is fresh
    const heartbeat = setInterval(() => {
      updateDoc(groupRef, {
        [`presence.${uid}.lastSeen`]: serverTimestamp(),
      }).catch(() => {});
    }, 30_000);

    // Remove presence on unmount / tab close
    return () => {
      clearInterval(heartbeat);
      updateDoc(groupRef, {
        [`presence.${uid}`]: deleteField(),
      }).catch(() => {});
    };
  }, [groupId, uid, displayName]);

  // ── Auto-scroll chat ─────────────────────────────────────────────────────
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // ── Send message ─────────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = chatInput.trim();
    if (!text || sending || !groupId) return;
    setChatInput("");
    await addMessage({ authorId: uid, authorName: displayName, text });
  };

  // ── Guard states ─────────────────────────────────────────────────────────
  if (!groupId) {
    return (
      <CentreState
        icon="group_work"
        title="No Group Selected"
        body="Ask your teacher to share your group link, or navigate here from your project assignment."
      />
    );
  }

  if (groupLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="material-symbols-outlined animate-spin text-4xl text-(--primary-green)">
          progress_activity
        </span>
      </div>
    );
  }

  if (!group) {
    return <CentreState icon="error" title="Group not found." />;
  }

  if (!group.studentIds.includes(uid)) {
    return (
      <CentreState icon="lock" title="Access Denied" body="You are not a member of this group." />
    );
  }

  // ── Derived state ─────────────────────────────────────────────────────────
  const presence = group.presence ?? {};
  const currentStep = group.currentStep ?? 1;
  const totalSteps = group.totalSteps ?? 5;
  const progress = group.progress ?? Math.round(((currentStep - 1) / totalSteps) * 100);

  const members = memberIds.map((id, idx) => {
    const userDoc = memberUsers.find((u) => (u as MemberUser & { id: string }).id === id);
    const name = id === uid ? "You" : (userDoc?.displayName ?? "Member");
    const pres = presence[id];
    return {
      id,
      name,
      initials: initials(name),
      color: memberColor(idx),
      status: (pres?.status ?? "offline") as "editing" | "viewing" | "offline",
      online: !!pres,
      isSelf: id === uid,
    };
  });

  const onlineCount = members.filter((m) => m.online).length;
  const editorEntry = Object.entries(presence).find(
    ([id, p]) => p.status === "editing" && id !== uid
  );
  const editorName = editorEntry?.[1].displayName ?? null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-[#0a1a16]">
      {/* ── LEFT: Team Chat ─────────────────────────────────────────────── */}
      <aside className="w-72 shrink-0 flex flex-col bg-(--bg-page) border-r border-(--border-subtle) h-full">
        {/* Header */}
        <div className="px-4 py-4 border-b border-(--border-subtle)">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-(--text-base) uppercase tracking-widest">Team Chat</h2>
            <span className="flex items-center gap-1.5 text-[10px] text-(--text-muted)">
              <span className="size-1.5 rounded-full bg-(--primary-green)" />
              {onlineCount} online
            </span>
          </div>
          {/* Avatar row */}
          <div className="flex items-center gap-2">
            {members.slice(0, 5).map((m) => (
              <div
                key={m.id}
                title={m.name}
                className="size-8 rounded-full flex items-center justify-center text-[10px] font-bold text-[#0d1f1a] relative"
                style={{ backgroundColor: m.online ? m.color : "#475569" }}
              >
                {m.initials}
                {m.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-(--primary-green) border border-[#0d1f1a]" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3">
          {messages.length === 0 && (
            <p className="text-center text-xs text-(--text-faint) mt-6 px-2">
              No messages yet — say hi to your team!
            </p>
          )}
          {messages.map((msg) => {
            const isSelf = msg.authorId === uid;
            const senderIdx = memberIds.indexOf(msg.authorId);
            const color = senderIdx >= 0 ? memberColor(senderIdx) : "#94a3b8";
            return (
              <div key={msg.id} className={`flex gap-2 ${isSelf ? "flex-row-reverse" : ""}`}>
                <div
                  className="size-7 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 text-[#0d1f1a]"
                  style={{ backgroundColor: isSelf ? "#60a5fa" : color }}
                >
                  {initials(isSelf ? "You" : msg.authorName || "?")}
                </div>
                <div
                  className={`max-w-45 flex flex-col gap-0.5 ${isSelf ? "items-end" : "items-start"}`}
                >
                  {!isSelf && (
                    <span className="text-[10px] font-semibold text-(--text-muted)">
                      {msg.authorName}
                    </span>
                  )}
                  <div
                    className={`px-3 py-2 rounded-xl text-xs leading-relaxed ${
                      isSelf
                        ? "bg-(--primary-green) text-[#0d1f1a] font-medium"
                        : "bg-(--bg-card) text-(--text-base)"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-(--text-faint)">{formatTime(msg.createdAt)}</span>
                </div>
              </div>
            );
          })}
          <div ref={chatBottomRef} />
        </div>

        {/* Input */}
        <div className="px-3 pb-4 pt-2 border-t border-(--border-subtle)">
          <div className="flex items-center gap-2 bg-(--bg-card) rounded-xl px-3 py-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Send a message…"
              className="flex-1 bg-transparent border-none outline-none text-xs text-(--text-base) placeholder:text-(--text-faint)"
              disabled={sending}
            />
            <button
              onClick={handleSend}
              disabled={sending || !chatInput.trim()}
              className="text-(--primary-green) hover:opacity-80 transition-opacity disabled:opacity-30"
            >
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── CENTRE: Workspace ───────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="px-6 py-4 border-b border-(--border-subtle) bg-(--bg-page) flex items-center justify-between">
          <nav className="flex items-center gap-1.5 text-xs text-(--text-muted)">
            <Link
              href="/school/student/dashboard"
              className="hover:text-(--primary-green) transition-colors"
            >
              Dashboard
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-(--text-muted)">{classroom?.name ?? "Project"}</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-(--primary-green) font-semibold">{group.name}</span>
          </nav>
          <div className="flex items-center gap-2">
            <span className="text-xs text-(--text-muted)">Auto-saved</span>
            <span className="material-symbols-outlined text-(--primary-green) text-lg">cloud_done</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-black text-(--text-base) tracking-tight">{group.name}</h1>
            <p className="text-sm text-(--text-muted) mt-1">
              {classroom?.subject ?? "Group Project"} · Step {currentStep} of {totalSteps}
            </p>
          </div>

          {/* Team Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-(--text-muted)">
                Team Progress
              </span>
              <span className="text-sm font-bold text-(--primary-green)">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-(--bg-card) rounded-full overflow-hidden">
              <div
                className="h-full bg-(--primary-green) rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step Cards */}
          <div className="flex flex-col gap-4">
            {Array.from({ length: totalSteps }, (_, i) => {
              const stepNum = i + 1;
              const isCompleted = stepNum < currentStep;
              const isActive = stepNum === currentStep;
              const isLocked = stepNum > currentStep;

              return (
                <div
                  key={stepNum}
                  className={`rounded-2xl p-5 border transition-all ${
                    isActive
                      ? "border-2 border-(--primary-green) bg-[#0d2420] shadow-lg shadow-(--primary-green)/10"
                      : isCompleted
                        ? "border border-(--border-medium) bg-(--bg-page) opacity-60"
                        : "border border-dashed border-(--border) bg-(--bg-page)/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`size-8 rounded-full flex items-center justify-center ${
                          isActive
                            ? "bg-(--primary-green)"
                            : isCompleted
                              ? "bg-(--primary-green)/20"
                              : "bg-(--bg-elevated)"
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-lg ${
                            isActive
                              ? "text-[#0d1f1a]"
                              : isCompleted
                                ? "text-(--primary-green)"
                                : "text-(--text-faint)"
                          }`}
                        >
                          {isCompleted ? "check_circle" : isActive ? "edit" : "lock"}
                        </span>
                      </div>
                      <div>
                        <p
                          className={`text-[10px] font-bold uppercase tracking-widest ${
                            isActive
                              ? "text-(--primary-green)"
                              : isCompleted
                                ? "text-(--text-faint)"
                                : "text-(--text-faint)"
                          }`}
                        >
                          Step {stepNum} ·{" "}
                          {isCompleted ? "Completed" : isActive ? "Active" : "Upcoming"}
                        </p>
                        <h3
                          className={`text-sm font-bold ${isLocked ? "text-(--text-faint)" : "text-(--text-base)"}`}
                        >
                          Project Phase {stepNum}
                        </h3>
                      </div>
                    </div>

                    {isActive && editorName && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-(--primary-green)/15 border border-(--primary-green)/40 text-[10px] font-bold text-(--primary-green) uppercase tracking-widest">
                        <span className="size-1.5 rounded-full bg-(--primary-green) animate-pulse" />
                        {editorName.split(" ")[0]} editing
                      </span>
                    )}
                  </div>

                  {isLocked && (
                    <p className="text-xs text-(--text-faint) mt-2 ml-11">
                      Locked until Step {stepNum - 1} is finalised
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit */}
          <div className="mt-8 flex justify-center">
            <button
              disabled
              className="flex items-center gap-2 px-8 py-3 bg-(--bg-elevated) text-(--text-faint) rounded-xl font-bold text-sm cursor-not-allowed uppercase tracking-widest opacity-50"
            >
              <span className="material-symbols-outlined text-lg">send</span>
              Share Team Submission
            </button>
          </div>
        </div>
      </main>

      {/* ── RIGHT: Collaborator Activity ────────────────────────────────── */}
      <aside className="w-80 shrink-0 flex flex-col bg-(--bg-page) border-l border-(--border-subtle) h-full overflow-y-auto">
        <div className="px-4 py-4 border-b border-(--border-subtle)">
          <h2 className="text-sm font-bold text-(--text-base) uppercase tracking-widest">Collaborators</h2>
        </div>

        <div className="flex-1 px-4 py-4 flex flex-col gap-6">
          {/* Member list */}
          <div className="flex flex-col gap-3">
            {members.map((m, i) => (
              <div key={m.id} className="relative flex items-start gap-3">
                {i < members.length - 1 && (
                  <div className="absolute left-4 top-9 bottom-0 w-px bg-[rgba(45,212,191,0.1)]" />
                )}
                <div
                  className={`size-9 rounded-full flex items-center justify-center text-[11px] font-bold text-[#0d1f1a] shrink-0 z-10 border-2 ${
                    m.status === "editing" ? "border-(--primary-green)" : "border-transparent"
                  } ${!m.online ? "opacity-40 grayscale" : ""}`}
                  style={{ backgroundColor: m.color }}
                >
                  {m.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-(--text-base) truncate">
                      {m.name}
                      {m.isSelf && <span className="text-(--text-faint) font-normal"> (you)</span>}
                    </p>
                    {m.online && m.status === "editing" && (
                      <span className="size-2 rounded-full bg-(--primary-green) animate-pulse" />
                    )}
                  </div>
                  <p
                    className={`text-xs truncate ${
                      m.status === "editing"
                        ? "text-(--primary-green)"
                        : m.online
                          ? "text-(--text-muted)"
                          : "text-(--text-faint)"
                    }`}
                  >
                    {m.online
                      ? m.status === "editing"
                        ? "Currently editing"
                        : "Viewing"
                      : "Offline"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Group info panel */}
          <div className="bg-[#142a25] rounded-xl border border-(--border-medium) p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-(--text-muted) mb-3">
              Group Info
            </p>
            <div className="flex flex-col gap-2">
              {[
                { label: "Classroom", value: classroom?.name ?? "—" },
                { label: "Subject", value: classroom?.subject ?? "—" },
                { label: "Members", value: String(memberIds.length) },
                {
                  label: "Online now",
                  value: String(onlineCount),
                  accent: true,
                },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-xs text-(--text-muted)">{row.label}</span>
                  <span
                    className={`text-xs font-bold ${row.accent ? "text-(--primary-green)" : "text-(--text-base)"}`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page export — wraps inner component in Suspense (required for useSearchParams)
// ---------------------------------------------------------------------------

export default function StudentCollaborationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-[#0a1a16]">
          <span className="material-symbols-outlined animate-spin text-4xl text-(--primary-green)">
            progress_activity
          </span>
        </div>
      }
    >
      <CollaborationContent />
    </Suspense>
  );
}
