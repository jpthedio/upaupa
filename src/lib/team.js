import { supabase } from "./supabase";

/**
 * Called after login — ensures the current user has a team.
 * 1. If already a team member → return that team
 * 2. If there's a pending invite for their email → accept it
 * 3. Otherwise → create a new team as owner
 */
export async function ensureTeam(userId) {
  if (!supabase) return null;

  // Check admin status (parallel with membership check)
  const adminPromise = supabase
    .from("app_admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  // 1. Existing membership?
  const { data: membership } = await supabase
    .from("team_members")
    .select("team_id, role, teams(id, name, owner_id)")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  const { data: adminRow } = await adminPromise;
  const isAdmin = !!adminRow;

  if (membership) {
    return { teamId: membership.team_id, role: membership.role, team: membership.teams, isAdmin };
  }

  // 2. Pending invite matching this user's email?
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email) {
    const { data: invites } = await supabase
      .from("team_invites")
      .select("*")
      .eq("email", user.email.toLowerCase())
      .eq("status", "pending");

    if (invites?.length > 0) {
      const invite = invites[0];
      await supabase.from("team_members").insert({
        team_id: invite.team_id,
        user_id: userId,
        role: invite.role || "member",
        invited_email: invite.email,
        joined_at: new Date().toISOString(),
      });
      await supabase.from("team_invites").update({ status: "accepted" }).eq("id", invite.id);

      const { data: team } = await supabase
        .from("teams").select("*").eq("id", invite.team_id).single();

      return { teamId: invite.team_id, role: invite.role || "member", team, isAdmin };
    }
  }

  // 3. No membership, no invite → create a new team
  const { data: newTeam } = await supabase
    .from("teams")
    .insert({ owner_id: userId, name: "My Team" })
    .select()
    .single();

  if (newTeam) {
    await supabase.from("team_members").insert({
      team_id: newTeam.id,
      user_id: userId,
      role: "owner",
      joined_at: new Date().toISOString(),
    });
    return { teamId: newTeam.id, role: "owner", team: newTeam, isAdmin };
  }

  return null;
}

export async function inviteMember(teamId, email, invitedBy) {
  if (!supabase) return { error: "No Supabase" };
  const { error } = await supabase.from("team_invites").upsert({
    team_id: teamId,
    email: email.toLowerCase().trim(),
    role: "member",
    invited_by: invitedBy,
    status: "pending",
  }, { onConflict: "team_id,email" });
  return { error: error?.message || null };
}

export async function listTeamMembers(teamId) {
  if (!supabase) return [];
  const { data } = await supabase
    .from("team_members")
    .select("*")
    .eq("team_id", teamId)
    .order("created_at");
  return data || [];
}

export async function listInvites(teamId) {
  if (!supabase) return [];
  const { data } = await supabase
    .from("team_invites")
    .select("*")
    .eq("team_id", teamId)
    .eq("status", "pending")
    .order("created_at");
  return data || [];
}

export async function revokeInvite(inviteId) {
  if (!supabase) return;
  await supabase.from("team_invites").update({ status: "revoked" }).eq("id", inviteId);
}

export async function removeMember(memberId) {
  if (!supabase) return;
  await supabase.from("team_members").delete().eq("id", memberId);
}
