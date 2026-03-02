import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Eye, Clock, Users, Activity } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { fetchAnalytics } from "@/lib/analytics";

export function AnalyticsPage() {
  const { team, isAdmin } = useApp();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30");

  useEffect(() => {
    if (!team?.teamId) return;
    setLoading(true);
    fetchAnalytics(team.teamId, Number(range), isAdmin).then((data) => {
      setEvents(data);
      setLoading(false);
    });
  }, [team?.teamId, range, isAdmin]);

  const stats = useMemo(() => {
    if (!events.length) return null;

    // Page views per page
    const pageViews = {};
    const pageDurations = {};
    const userSet = new Set();
    const dailyViews = {};

    for (const e of events) {
      userSet.add(e.user_id);

      if (e.event === "page_view") {
        pageViews[e.page] = (pageViews[e.page] || 0) + 1;
        const day = e.created_at.slice(0, 10);
        dailyViews[day] = (dailyViews[day] || 0) + 1;
      }

      if (e.event === "page_leave" && e.meta?.duration_seconds) {
        if (!pageDurations[e.page]) pageDurations[e.page] = [];
        pageDurations[e.page].push(e.meta.duration_seconds);
      }
    }

    // Average duration per page
    const avgDurations = {};
    for (const [page, durations] of Object.entries(pageDurations)) {
      avgDurations[page] = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
    }

    // Sort pages by views
    const topPages = Object.entries(pageViews)
      .sort((a, b) => b[1] - a[1])
      .map(([page, views]) => ({ page, views, avgSeconds: avgDurations[page] || 0 }));

    // Total views
    const totalViews = Object.values(pageViews).reduce((a, b) => a + b, 0);

    // Daily activity (last 14 days)
    const days = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ day: key, views: dailyViews[key] || 0 });
    }

    // Recent activity feed (last 20 events)
    const recent = events.slice(0, 20).map((e) => ({
      id: e.id,
      event: e.event,
      page: e.page,
      userId: e.user_id,
      time: e.created_at,
      meta: e.meta,
    }));

    return { totalViews, uniqueUsers: userSet.size, topPages, days, recent };
  }, [events]);

  if (!isAdmin) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Analytics</h1>
        <p className="text-sm text-zinc-500">Only admins can view analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Analytics</h1>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-36 rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-800 rounded-full animate-spin" />
        </div>
      ) : !stats || stats.totalViews === 0 ? (
        <Card className="border border-zinc-200/80 shadow-sm">
          <CardContent className="p-8 text-center">
            <BarChart3 size={32} className="mx-auto text-zinc-300 mb-3" />
            <p className="text-sm font-medium text-zinc-600">No activity yet</p>
            <p className="text-xs text-zinc-400 mt-1">Analytics will appear as your team uses the app.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <Card className="border border-zinc-200/80 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye size={14} className="text-blue-500" />
                  <span className="text-xs text-zinc-500">Page Views</span>
                </div>
                <p className="text-2xl font-bold text-zinc-900">{stats.totalViews}</p>
              </CardContent>
            </Card>
            <Card className="border border-zinc-200/80 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={14} className="text-emerald-500" />
                  <span className="text-xs text-zinc-500">Active Users</span>
                </div>
                <p className="text-2xl font-bold text-zinc-900">{stats.uniqueUsers}</p>
              </CardContent>
            </Card>
            <Card className="border border-zinc-200/80 shadow-sm col-span-2 lg:col-span-1">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={14} className="text-amber-500" />
                  <span className="text-xs text-zinc-500">Total Events</span>
                </div>
                <p className="text-2xl font-bold text-zinc-900">{events.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Daily activity chart */}
          <Card className="border border-zinc-200/80 shadow-sm">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-zinc-900 mb-4">Daily Activity (14 days)</h3>
              <div className="flex items-end gap-1 h-24">
                {stats.days.map((d) => {
                  const max = Math.max(...stats.days.map((x) => x.views), 1);
                  const h = d.views > 0 ? Math.max((d.views / max) * 100, 6) : 0;
                  const dayLabel = new Date(d.day + "T12:00:00").toLocaleDateString("en-PH", { weekday: "short" });
                  return (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div className="w-full bg-blue-400 rounded-t transition-all" style={{ height: `${h}%`, minHeight: d.views > 0 ? 4 : 0 }} />
                      <span className="text-[8px] text-zinc-400 leading-none">{dayLabel}</span>
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-[10px] rounded-lg px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                        {d.day}: {d.views} views
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top pages */}
          <Card className="border border-zinc-200/80 shadow-sm">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-zinc-900 mb-3">Pages by Usage</h3>
              <div className="space-y-2">
                {stats.topPages.map((p) => {
                  const pct = stats.totalViews > 0 ? (p.views / stats.totalViews) * 100 : 0;
                  return (
                    <div key={p.page} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-zinc-700 w-24 capitalize">{p.page}</span>
                      <div className="flex-1 h-6 bg-zinc-100 rounded-full overflow-hidden relative">
                        <div className="h-full bg-blue-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">{p.views}</span>
                      </div>
                      <div className="flex items-center gap-1 w-20 text-right">
                        <Clock size={10} className="text-zinc-400" />
                        <span className="text-xs text-zinc-500">
                          {p.avgSeconds > 60 ? `${Math.round(p.avgSeconds / 60)}m` : `${p.avgSeconds}s`} avg
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card className="border border-zinc-200/80 shadow-sm">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-zinc-900 mb-3">Recent Activity</h3>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {stats.recent.map((e) => (
                  <div key={e.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-zinc-50 text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${e.event === "page_view" ? "bg-blue-400" : "bg-zinc-300"}`} />
                      <span className="text-zinc-700 capitalize">{e.page}</span>
                      <span className="text-xs text-zinc-400">
                        {e.event === "page_leave" && e.meta?.duration_seconds
                          ? `${e.meta.duration_seconds}s`
                          : e.event.replace("_", " ")}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-400">
                      {new Date(e.time).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
