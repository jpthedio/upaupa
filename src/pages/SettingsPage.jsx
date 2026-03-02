import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCcw, Upload, CheckCircle2, LogOut, Cloud, Users, X, Mail } from "lucide-react";
import { Field } from "@/components/shared/Field";
import { InfoTip } from "@/components/shared/InfoTip";
import { saveData } from "@/lib/storage";
import { buildSeed } from "@/lib/seed";
import { parseCSV, importCSV } from "@/lib/csv-import";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { inviteMember, listTeamMembers, listInvites, revokeInvite, removeMember } from "@/lib/team";
import { APP_VERSION } from "@/App";

export function SettingsPage() {
  const { data, update, setData, setConfirm, selectedMonth, updatePrefs, updateSettings, team, role } = useApp();
  const { user, hasSupabase, signOut } = useAuth();
  const dueDayOptions = Array.from({ length: 28 }, (_, i) => i + 1);
  const fileRef = useRef(null);
  const [csvRows, setCsvRows] = useState(null);
  const [csvResult, setCsvResult] = useState(null);

  // Team state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState(null);
  const [members, setMembers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);

  useEffect(() => {
    if (!team?.teamId) return;
    listTeamMembers(team.teamId).then(setMembers);
    listInvites(team.teamId).then(setPendingInvites);
  }, [team?.teamId]);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rows = parseCSV(ev.target.result);
      setCsvRows(rows);
      setCsvResult(null);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function doImport() {
    if (!csvRows) return;
    const { data: merged, imported } = importCSV(data, csvRows, selectedMonth);
    saveData(merged);
    setData(merged);
    setCsvResult(imported);
    setCsvRows(null);
  }

  function handleDueDayChange(v) {
    const dueDay = Number(v);
    updateSettings({ dueDay });
  }

  async function handleInvite() {
    if (!inviteEmail.trim() || !team?.teamId || !user) return;
    setInviting(true);
    setInviteMsg(null);
    const { error } = await inviteMember(team.teamId, inviteEmail.trim(), user.id);
    setInviting(false);
    if (error) {
      setInviteMsg({ type: "error", text: error });
    } else {
      setInviteMsg({ type: "success", text: `Tell ${inviteEmail.trim()} to open UpaUpa and sign in with that email.` });
      setInviteEmail("");
      listInvites(team.teamId).then(setPendingInvites);
    }
  }

  async function handleRevoke(inviteId) {
    await revokeInvite(inviteId);
    setPendingInvites((prev) => prev.filter((i) => i.id !== inviteId));
  }

  async function handleRemove(memberId) {
    await removeMember(memberId);
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Settings</h1>

      <Card className="border border-zinc-200/80 shadow-sm">
        <CardContent className="p-5 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-900">Rent Settings</h3>
          <Field label={<span className="flex items-center gap-1">Due Day (day of month) <InfoTip text="The day of the month when rent is due (e.g., every 5th)." /></span>}>
            <Select value={String(data.settings.dueDay)} onValueChange={handleDueDayChange} disabled={role !== "owner"}>
              <SelectTrigger className="w-32 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>{dueDayOptions.map((d) => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          {role !== "owner" && <p className="text-xs text-zinc-400">Only the owner can change this.</p>}
        </CardContent>
      </Card>

      <Card className="border border-zinc-200/80 shadow-sm">
        <CardContent className="p-5 space-y-3">
          <h3 className="text-sm font-semibold text-zinc-900">About UpaUpa</h3>
          <p className="text-xs text-zinc-400">Version {APP_VERSION}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {[
              { label: "Buildings", value: data.buildings.length },
              { label: "Units", value: data.units.length },
              { label: "Tenants", value: data.tenants.filter((t) => t.status === "active").length },
              { label: "Payments", value: data.payments.length },
            ].map((s) => (
              <div key={s.label} className="text-center p-3 bg-zinc-50 rounded-xl">
                <p className="text-lg font-semibold text-zinc-900">{s.value}</p>
                <p className="text-xs text-zinc-400">{s.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {role === "owner" && (
        <Card className="border border-zinc-200/80 shadow-sm">
          <CardContent className="p-5 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-1">Import Data <InfoTip text="Upload a CSV file to bulk-import buildings, units, tenants, and payments." /></h3>
            <p className="text-xs text-zinc-400">Import from a spreadsheet (CSV format). Matches the same format as the CSV export from the Payments page.</p>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="rounded-full">
              <Upload size={14} className="mr-1" /> Choose CSV File
            </Button>

            {csvRows && (
              <div className="space-y-3 pt-2">
                <p className="text-sm font-medium text-zinc-700">{csvRows.length} row{csvRows.length !== 1 ? "s" : ""} found</p>
                <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 max-h-48">
                  <table className="text-xs w-full">
                    <thead>
                      <tr className="border-b border-zinc-200 bg-zinc-100">
                        {Object.keys(csvRows[0] || {}).map((h) => <th key={h} className="px-2 py-1.5 text-left font-medium text-zinc-500">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {csvRows.slice(0, 5).map((row, i) => (
                        <tr key={i} className="border-b border-zinc-100">
                          {Object.values(row).map((v, j) => <td key={j} className="px-2 py-1 text-zinc-600 whitespace-nowrap">{v}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {csvRows.length > 5 && <p className="text-xs text-zinc-400 px-2 py-1">...and {csvRows.length - 5} more</p>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={doImport} className="rounded-full bg-zinc-900 hover:bg-zinc-800">Import {csvRows.length} Rows</Button>
                  <Button variant="outline" size="sm" onClick={() => setCsvRows(null)} className="rounded-full">Cancel</Button>
                </div>
              </div>
            )}

            {csvResult !== null && (
              <div className="flex items-center gap-2 text-sm text-emerald-600 pt-1">
                <CheckCircle2 size={16} /> Imported {csvResult} payment{csvResult !== 1 ? "s" : ""} successfully.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Team section */}
      {hasSupabase && user && team && (
        <Card className="border border-zinc-200/80 shadow-sm">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-1">
              <Users size={16} className="text-blue-500" /> Team
            </h3>

            {role === "owner" ? (
              <>
                <p className="text-xs text-zinc-400">
                  Invite a member to view your buildings and record payments.
                </p>

                {/* Invite form */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                      placeholder="Member's email"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-300"
                    />
                  </div>
                  <Button
                    onClick={handleInvite}
                    disabled={inviting || !inviteEmail.trim()}
                    size="sm"
                    className="rounded-full bg-zinc-900 hover:bg-zinc-800 text-white shrink-0"
                  >
                    {inviting ? "..." : "Invite"}
                  </Button>
                </div>

                {inviteMsg && (
                  <p className={`text-xs ${inviteMsg.type === "error" ? "text-red-500" : "text-emerald-600"}`}>
                    {inviteMsg.type === "success" && <CheckCircle2 size={12} className="inline mr-1" />}
                    {inviteMsg.text}
                  </p>
                )}

                {/* Pending invites */}
                {pendingInvites.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-zinc-500">Pending Invites</p>
                    {pendingInvites.map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between py-1.5 px-2 bg-amber-50 rounded-lg">
                        <span className="text-sm text-zinc-600">{inv.email}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-amber-600">Pending</span>
                          <button onClick={() => handleRevoke(inv.id)} className="text-zinc-400 hover:text-red-500">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Active members */}
                {members.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-zinc-500">Members</p>
                    {members.map((m) => (
                      <div key={m.id} className="flex items-center justify-between py-1.5 px-2 bg-zinc-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-medium text-zinc-600">
                            {(m.invited_email || m.user_id)?.[0]?.toUpperCase() || "?"}
                          </div>
                          <span className="text-sm text-zinc-700">
                            {m.invited_email || (m.user_id === user.id ? user.email : m.user_id.slice(0, 8) + "...")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-400 capitalize">{m.role}</span>
                          {m.role !== "owner" && (
                            <button
                              onClick={() => setConfirm({ msg: "Remove this team member?", fn: () => handleRemove(m.id) })}
                              className="text-zinc-400 hover:text-red-500"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-zinc-600">
                  You're a member of <strong>{team.team?.name || "this team"}</strong>.
                </p>
                <p className="text-xs text-zinc-400">
                  You can view buildings, tenants, and record payments. Only the owner can delete data or change settings.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {role === "owner" && (
        <Card className="border border-zinc-200/80 shadow-sm">
          <CardContent className="p-5 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-900">Data Management</h3>
            <p className="text-xs text-zinc-400">Reset all data to demo defaults. This cannot be undone.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirm({ msg: "Reset all data to demo defaults? All your current data will be lost.", fn: () => { const seed = buildSeed(); saveData(seed); setData(seed); updatePrefs("onboarded", true); } })}
              className="rounded-full text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <RotateCcw size={14} className="mr-1" /> Reset to Demo Data
            </Button>
          </CardContent>
        </Card>
      )}

      {hasSupabase && user && (
        <Card className="border border-zinc-200/80 shadow-sm">
          <CardContent className="p-5 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-1">
              <Cloud size={16} className="text-emerald-500" /> Account
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-semibold text-emerald-700">
                {user.email?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-900 truncate">{user.email}</p>
                <p className="text-xs text-emerald-600">Synced to cloud</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirm({ msg: "Sign out? Your data is safely stored in the cloud.", fn: signOut })}
              className="rounded-full"
            >
              <LogOut size={14} className="mr-1" /> Sign Out
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
