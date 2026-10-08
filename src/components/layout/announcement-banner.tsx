"use client";

import { useEffect, useState } from "react";
import { getBrowserClient, isSupabaseConfigured } from "@/lib/supabase-browser";
import { X } from "lucide-react";

const STORAGE_KEY = "yaaq-announcement-banner-dismissed";

/**
 * Optional public announcement banner. Reads the banner settings from
 * platform_settings (publicly readable keys, disabled by default) and
 * renders nothing when disabled, missing, or Supabase is unconfigured.
 */
export function AnnouncementBanner() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!isSupabaseConfigured()) return;
      try {
        if (window.sessionStorage.getItem(STORAGE_KEY)) return;

        const supabase = getBrowserClient();
        const { data } = await supabase
          .from("platform_settings")
          .select("key, value")
          .in("key", ["announcement_banner_enabled", "announcement_banner_message"]);

        const rows = (data ?? []) as { key: string; value: unknown }[];
        const enabled = rows.find((row) => row.key === "announcement_banner_enabled")?.value;
        const text = rows.find((row) => row.key === "announcement_banner_message")?.value;

        if (enabled === true && typeof text === "string" && text.trim()) {
          setMessage(text.trim());
        }
      } catch {
        // Banner is non-critical: silently skip on any error.
      }
    };
    run();
  }, []);

  if (!message) return null;

  const dismiss = () => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // sessionStorage may be unavailable; ignore.
    }
    setMessage(null);
  };

  return (
    <div
      className="bg-yaaq-navy text-white"
      role="region"
      aria-label="Platform announcement"
    >
      <div className="container-yaaq flex items-start justify-between gap-4 py-2.5">
        <p className="text-sm text-white/90">{message}</p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded p-1 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
