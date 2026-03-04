"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface Settings {
  siteName: string;
  supportEmail: string;
  platformUrl: string;
  features: {
    studentRegistration: boolean;
    googleClassroomSync: boolean;
    publicCourseLibrary: boolean;
  };
}

export default function PlatformSettingsPage() {
  const { appUser, loading: authLoading, hasPermission } = useAuthContext();
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!authLoading && !hasPermission("manage_settings")) {
      router.replace("/dashboard");
    }
  }, [appUser, authLoading, router, hasPermission]);

  useEffect(() => {
    if (!hasPermission("manage_settings")) return;
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [appUser, hasPermission]);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // fail silently
    } finally {
      setSaving(false);
    }
  };

  const toggleFeature = (key: keyof Settings["features"]) => {
    if (!settings) return;
    setSettings({
      ...settings,
      features: { ...settings.features, [key]: !settings.features[key] },
    });
  };

  if (authLoading || !hasPermission("manage_settings")) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary-green">
          progress_activity
        </span>
      </div>
    );
  }

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary-green">
          progress_activity
        </span>
      </div>
    );
  }

  const featureToggles: {
    key: keyof Settings["features"];
    label: string;
    description: string;
    icon: string;
  }[] = [
    {
      key: "studentRegistration",
      label: "Student Self-Registration",
      description: "Allow students to join classrooms using classroom codes",
      icon: "how_to_reg",
    },
    {
      key: "googleClassroomSync",
      label: "Google Classroom Sync",
      description: "Enable teachers to sync classes from Google Classroom",
      icon: "sync",
    },
    {
      key: "publicCourseLibrary",
      label: "Public Course Library",
      description: "Make course catalog visible to unauthenticated visitors",
      icon: "public",
    },
  ];

  return (
    <div className="min-h-screen bg-(--bg-page)">
      <header className="sticky top-0 z-10 bg-[rgba(16,34,28,0.8)] backdrop-blur-md border-b border-(--border-subtle) px-8 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-(--text-base)">Platform Settings</h1>
          <p className="text-(--text-muted) text-xs mt-0.5">Configure global platform options</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-primary-green text-sm font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Saved
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-primary-green text-white font-bold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? (
              <span className="material-symbols-outlined animate-spin text-[18px]">
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">save</span>
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </header>

      <div className="px-8 py-8 space-y-6 max-w-3xl">
        {/* General Settings */}
        <div className="bg-(--bg-card) rounded-2xl border border-(--border-subtle) p-6">
          <h2 className="text-(--text-base) font-bold mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary-green">tune</span>
            General
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-(--text-muted) text-xs font-medium block mb-1.5">Site Name</label>
              <input
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full bg-(--glass-bg) border border-(--border-subtle) rounded-lg px-4 py-2.5 text-sm text-(--text-base) placeholder:text-(--text-faint) focus:outline-none focus:border-(--border-strong)"
              />
            </div>
            <div>
              <label className="text-(--text-muted) text-xs font-medium block mb-1.5">
                Support Email
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full bg-(--glass-bg) border border-(--border-subtle) rounded-lg px-4 py-2.5 text-sm text-(--text-base) placeholder:text-(--text-faint) focus:outline-none focus:border-(--border-strong)"
              />
            </div>
            <div>
              <label className="text-(--text-muted) text-xs font-medium block mb-1.5">
                Platform URL
              </label>
              <input
                value={settings.platformUrl}
                onChange={(e) => setSettings({ ...settings, platformUrl: e.target.value })}
                className="w-full bg-(--glass-bg) border border-(--border-subtle) rounded-lg px-4 py-2.5 text-sm text-(--text-base) placeholder:text-(--text-faint) focus:outline-none focus:border-(--border-strong)"
              />
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="bg-(--bg-card) rounded-2xl border border-(--border-subtle) p-6">
          <h2 className="text-(--text-base) font-bold mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary-green">toggle_on</span>
            Features
          </h2>
          <div className="space-y-1">
            {featureToggles.map((ft) => (
              <div
                key={ft.key}
                className="flex items-center justify-between py-4 border-b border-(--border-subtle) last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[rgba(19,236,164,0.06)] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px] text-primary-green">
                      {ft.icon}
                    </span>
                  </div>
                  <div>
                    <p className="text-(--text-base) text-sm font-semibold">{ft.label}</p>
                    <p className="text-(--text-faint) text-xs mt-0.5">{ft.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleFeature(ft.key)}
                  className={`w-11 h-6 rounded-full relative transition-colors ${
                    settings.features[ft.key] ? "bg-primary-green" : "bg-[rgba(255,255,255,0.12)]"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${
                      settings.features[ft.key] ? "translate-x-[22px]" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Info */}
        <div className="bg-(--bg-card) rounded-2xl border border-(--border-subtle) p-6">
          <h2 className="text-(--text-base) font-bold mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary-green">info</span>
            Platform Info
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-4">
              <p className="text-(--text-faint) text-xs">Platform</p>
              <p className="text-(--text-base) text-sm font-semibold mt-1">STEM Impact Academy</p>
            </div>
            <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-4">
              <p className="text-(--text-faint) text-xs">Domain</p>
              <p className="text-primary-green text-sm font-semibold mt-1">
                academy.stemimpactcenterkenya.org
              </p>
            </div>
            <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-4">
              <p className="text-(--text-faint) text-xs">Firebase Project</p>
              <p className="text-(--text-base) text-sm font-semibold mt-1">stem-impact-academy</p>
            </div>
            <div className="bg-[rgba(255,255,255,0.03)] rounded-xl p-4">
              <p className="text-(--text-faint) text-xs">Version</p>
              <p className="text-(--text-base) text-sm font-semibold mt-1">1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
