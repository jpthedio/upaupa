import { useEffect, useRef } from "react";
import { supabase } from "./supabase";

/**
 * Fire-and-forget event logger.
 * Silently fails — analytics should never break the app.
 */
export function trackEvent(userId, teamId, event, page, meta, userEmail) {
  if (!supabase || !userId || !teamId) return;
  supabase
    .from("analytics_events")
    .insert({ user_id: userId, team_id: teamId, event, page, meta: meta || {}, user_email: userEmail || null })
    .then(() => {});
}

/**
 * Tracks page views + time-on-page.
 * Call once in Shell — it watches `page` changes automatically.
 */
export function usePageTracker(page, userId, teamId, userEmail) {
  const startRef = useRef(Date.now());
  const prevPageRef = useRef(page);

  useEffect(() => {
    if (!supabase || !userId || !teamId) return;

    // Log duration of previous page
    if (prevPageRef.current && prevPageRef.current !== page) {
      const seconds = Math.round((Date.now() - startRef.current) / 1000);
      if (seconds > 0) {
        trackEvent(userId, teamId, "page_leave", prevPageRef.current, { duration_seconds: seconds }, userEmail);
      }
    }

    // Log new page view
    trackEvent(userId, teamId, "page_view", page, null, userEmail);
    startRef.current = Date.now();
    prevPageRef.current = page;
  }, [page, userId, teamId, userEmail]);

  // Log duration on unmount (tab close / navigate away)
  useEffect(() => {
    if (!supabase || !userId || !teamId) return;
    function handleBeforeUnload() {
      const seconds = Math.round((Date.now() - startRef.current) / 1000);
      if (seconds > 0 && navigator.sendBeacon) {
        const body = JSON.stringify({
          user_id: userId,
          team_id: teamId,
          event: "page_leave",
          page: prevPageRef.current,
          meta: { duration_seconds: seconds },
          user_email: userEmail || null,
        });
        navigator.sendBeacon(
          `${supabase.supabaseUrl}/rest/v1/analytics_events`,
          new Blob([body], { type: "application/json" })
        );
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [userId, teamId, userEmail]);
}

// ─── Query functions (for analytics dashboard) ──────────────

/**
 * Fetch analytics events within a date range.
 * Admins (isAdmin=true) see all events; others see only their team's.
 */
export async function fetchAnalytics(teamId, daysBack = 30, isAdmin = false) {
  if (!supabase) return [];
  const since = new Date();
  since.setDate(since.getDate() - daysBack);
  let query = supabase
    .from("analytics_events")
    .select("*")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false });
  if (!isAdmin && teamId) {
    query = query.eq("team_id", teamId);
  }
  const { data } = await query;
  return data || [];
}
