"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

interface TeamMember {
  id: string;
  email: string;
  name: string | null;
  role: "owner" | "admin" | "member" | "viewer";
  created_at: string;
  last_login_at: string | null;
}

interface TeamInvite {
  id: string;
  email: string;
  role: "admin" | "member" | "viewer";
  status: string;
  created_at: string;
  expires_at: string;
  invited_by_email: string;
}

interface TeamInfo {
  account_id: string;
  account_name: string;
  plan: string;
  max_users: number;
  current_users: number;
  members: TeamMember[];
  pending_invites: TeamInvite[];
}

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  owner: "Full access including billing and account deletion",
  admin: "Can manage team, integrations, and settings",
  member: "Can view and create reports",
  viewer: "Read-only access to dashboards",
};

export default function TeamSettingsPage() {
  const queryClient = useQueryClient();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member" | "viewer">("member");
  const [editingMember, setEditingMember] = useState<string | null>(null);

  const { data: team, isLoading, error } = useQuery<TeamInfo>({
    queryKey: ["team"],
    queryFn: async () => {
      const res = await apiFetch<TeamInfo>("/team");
      return res as TeamInfo;
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      return apiFetch("/team/invites", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteRole("member");
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return apiFetch(`/team/members/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
      setEditingMember(null);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiFetch(`/team/members/${userId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
    },
  });

  const cancelInviteMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      return apiFetch(`/team/invites/${inviteId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
    },
  });

  const resendInviteMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      return apiFetch(`/team/invites/${inviteId}/resend`, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
    },
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-[#f6f8fa] dark:bg-[#21262d]" />
          <div className="h-64 rounded bg-[#f6f8fa] dark:bg-[#21262d]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-md border border-[#ffccd5] bg-[#ffebe9] p-4 text-[#cf222e] dark:border-[#f8514966] dark:bg-[#f8514915] dark:text-[#f85149]">
          Failed to load team information. Please try again.
        </div>
      </div>
    );
  }

  const canInvite = team && (team.max_users === -1 || team.current_users < team.max_users);
  const atUserLimit = team && team.max_users !== -1 && team.current_users >= team.max_users;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1f2328] dark:text-[#e6edf3]">Settings</h1>
          <p className="mt-1 text-[#57606a] dark:text-[#8b949e]">
            Manage your team members and their permissions
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          disabled={!canInvite}
          className="rounded-md bg-[#238636] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2ea043] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Invite Team Member
        </button>
      </div>

      {/* Settings Navigation */}
      <div className="mb-6 flex gap-2 border-b border-[#d0d7de] dark:border-[#30363d]">
        <a href="/settings" className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-[#57606a] hover:text-[#1f2328] dark:text-[#8b949e] dark:hover:text-[#e6edf3]">
          Profile
        </a>
        <a href="/settings/team" className="border-b-2 border-[#fd8c73] px-4 py-2 text-sm font-medium text-[#1f2328] dark:border-[#f78166] dark:text-[#e6edf3]">
          Team
        </a>
        <a href="/settings/views" className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-[#57606a] hover:text-[#1f2328] dark:text-[#8b949e] dark:hover:text-[#e6edf3]">
          Saved Views
        </a>
        <a href="/settings/reports" className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-[#57606a] hover:text-[#1f2328] dark:text-[#8b949e] dark:hover:text-[#e6edf3]">
          Reports
        </a>
      </div>

      {/* Plan Info Banner */}
      {atUserLimit && (
        <div className="mb-6 rounded-md border border-[#d4a72c66] bg-[#fff8c5] p-4 dark:border-[#bb800926] dark:bg-[#bb800915]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-[#9a6700] dark:text-[#d29922]">Team member limit reached</h3>
              <p className="text-sm text-[#6e5000] dark:text-[#bb8009]">
                Your {team?.plan} plan allows up to {team?.max_users} team members. Upgrade to add more.
              </p>
            </div>
            <a
              href="/billing"
              className="rounded-md bg-[#bf8700] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#9a6700]"
            >
              Upgrade Plan
            </a>
          </div>
        </div>
      )}

      {/* Team Members */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-[#1f2328] dark:text-[#e6edf3]">
          Team Members ({team?.current_users}/{team?.max_users === -1 ? "∞" : team?.max_users})
        </h2>
        <div className="overflow-hidden rounded-md border border-[#d0d7de] bg-white dark:border-[#30363d] dark:bg-[#161b22]">
          <table className="min-w-full divide-y divide-[#d0d7de] dark:divide-[#30363d]">
            <thead className="bg-[#f6f8fa] dark:bg-[#161b22]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#57606a] dark:text-[#8b949e]">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#57606a] dark:text-[#8b949e]">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#57606a] dark:text-[#8b949e]">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#57606a] dark:text-[#8b949e]">
                  Last Active
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-[#57606a] dark:text-[#8b949e]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
              {team?.members.map((member) => (
                <tr key={member.id} className="hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div>
                      <div className="font-medium text-[#1f2328] dark:text-[#e6edf3]">
                        {member.name || member.email.split("@")[0]}
                      </div>
                      <div className="text-sm text-[#57606a] dark:text-[#8b949e]">{member.email}</div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {editingMember === member.id && member.role !== "owner" ? (
                      <select
                        aria-label="Select role"
                        value={member.role}
                        onChange={(e) => {
                          updateRoleMutation.mutate({
                            userId: member.id,
                            role: e.target.value,
                          });
                        }}
                        className="rounded-md border border-[#d0d7de] px-2 py-1 text-sm dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#e6edf3]"
                      >
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    ) : (
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          member.role === "owner"
                            ? "bg-[#fbefff] text-[#8250df] dark:bg-[#a371f726] dark:text-[#a371f7]"
                            : member.role === "admin"
                            ? "bg-[#ddf4ff] text-[#0969da] dark:bg-[#388bfd26] dark:text-[#58a6ff]"
                            : member.role === "member"
                            ? "bg-[#dafbe1] text-[#1a7f37] dark:bg-[#23863629] dark:text-[#3fb950]"
                            : "bg-[#eaeef2] text-[#57606a] dark:bg-[#6e768166] dark:text-[#8b949e]"
                        }`}
                      >
                        {ROLE_LABELS[member.role]}
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-[#57606a] dark:text-[#8b949e]">
                    {new Date(member.created_at).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-[#57606a] dark:text-[#8b949e]">
                    {member.last_login_at
                      ? new Date(member.last_login_at).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    {member.role !== "owner" && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            setEditingMember(
                              editingMember === member.id ? null : member.id
                            )
                          }
                          className="text-[#57606a] hover:text-[#1f2328] dark:text-[#8b949e] dark:hover:text-[#e6edf3]"
                        >
                          {editingMember === member.id ? "Cancel" : "Edit"}
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Are you sure you want to remove ${member.email} from the team?`
                              )
                            ) {
                              removeMemberMutation.mutate(member.id);
                            }
                          }}
                          className="text-[#cf222e] hover:text-[#a40e26] dark:text-[#f85149] dark:hover:text-[#ff7b72]"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Invites */}
      {team?.pending_invites && team.pending_invites.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-[#1f2328] dark:text-[#e6edf3]">
            Pending Invites ({team.pending_invites.length})
          </h2>
          <div className="overflow-hidden rounded-md border border-[#d0d7de] bg-white dark:border-[#30363d] dark:bg-[#161b22]">
            <table className="min-w-full divide-y divide-[#d0d7de] dark:divide-[#30363d]">
              <thead className="bg-[#f6f8fa] dark:bg-[#161b22]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#57606a] dark:text-[#8b949e]">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#57606a] dark:text-[#8b949e]">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#57606a] dark:text-[#8b949e]">
                    Invited By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#57606a] dark:text-[#8b949e]">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-[#57606a] dark:text-[#8b949e]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
                {team.pending_invites.map((invite) => (
                  <tr key={invite.id} className="hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]">
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-[#1f2328] dark:text-[#e6edf3]">
                      {invite.email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex rounded-full bg-[#eaeef2] px-2 py-1 text-xs font-semibold text-[#57606a] dark:bg-[#6e768166] dark:text-[#8b949e]">
                        {ROLE_LABELS[invite.role]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-[#57606a] dark:text-[#8b949e]">
                      {invite.invited_by_email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-[#57606a] dark:text-[#8b949e]">
                      {new Date(invite.expires_at).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => resendInviteMutation.mutate(invite.id)}
                          disabled={resendInviteMutation.isPending}
                          className="text-[#238636] hover:text-[#2ea043] dark:text-[#3fb950] dark:hover:text-[#56d364] disabled:opacity-50"
                        >
                          Resend
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Cancel invitation for ${invite.email}?`
                              )
                            ) {
                              cancelInviteMutation.mutate(invite.id);
                            }
                          }}
                          className="text-[#cf222e] hover:text-[#a40e26] dark:text-[#f85149] dark:hover:text-[#ff7b72]"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-md border border-[#d0d7de] bg-white p-6 shadow-gh-lg dark:border-[#30363d] dark:bg-[#161b22]">
            <h2 className="text-lg font-semibold text-[#1f2328] dark:text-[#e6edf3]">
              Invite Team Member
            </h2>
            <p className="mt-1 text-sm text-[#57606a] dark:text-[#8b949e]">
              Send an invitation to join your team
            </p>

            <form onSubmit={handleInvite} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#1f2328] dark:text-[#e6edf3]"
                >
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  required
                  className="mt-1 w-full rounded-md border border-[#d0d7de] bg-white px-3 py-2 text-[#1f2328] placeholder-[#6e7781] focus:border-[#0969da] focus:outline-none focus:ring-1 focus:ring-[#0969da] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#e6edf3] dark:placeholder-[#6e7681]"
                />
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-[#1f2328] dark:text-[#e6edf3]"
                >
                  Role
                </label>
                <select
                  id="role"
                  value={inviteRole}
                  onChange={(e) =>
                    setInviteRole(e.target.value as "admin" | "member" | "viewer")
                  }
                  className="mt-1 w-full rounded-md border border-[#d0d7de] bg-white px-3 py-2 text-[#1f2328] focus:border-[#0969da] focus:outline-none focus:ring-1 focus:ring-[#0969da] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#e6edf3]"
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
                <p className="mt-1 text-sm text-[#57606a] dark:text-[#8b949e]">
                  {ROLE_DESCRIPTIONS[inviteRole]}
                </p>
              </div>

              {inviteMutation.isError && (
                <div className="rounded-md border border-[#ffccd5] bg-[#ffebe9] p-3 text-sm text-[#cf222e] dark:border-[#f8514966] dark:bg-[#f8514915] dark:text-[#f85149]">
                  {(inviteMutation.error as Error)?.message ||
                    "Failed to send invite. Please try again."}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="rounded-md border border-[#d0d7de] bg-[#f6f8fa] px-4 py-2 text-sm font-medium text-[#1f2328] transition hover:bg-[#eaeef2] dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#e6edf3] dark:hover:bg-[#30363d]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteMutation.isPending}
                  className="rounded-md bg-[#238636] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2ea043] disabled:opacity-50"
                >
                  {inviteMutation.isPending ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Permissions Info */}
      <div className="mt-8 rounded-md border border-[#d0d7de] bg-white p-6 dark:border-[#30363d] dark:bg-[#161b22]">
        <h3 className="text-lg font-semibold text-[#1f2328] dark:text-[#e6edf3]">Role Permissions</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(ROLE_LABELS).map(([role, label]) => (
            <div key={role} className="rounded-md border border-[#d0d7de] bg-[#f6f8fa] p-4 dark:border-[#30363d] dark:bg-[#21262d]">
              <h4 className="font-medium text-[#1f2328] dark:text-[#e6edf3]">{label}</h4>
              <p className="mt-1 text-sm text-[#57606a] dark:text-[#8b949e]">
                {ROLE_DESCRIPTIONS[role]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
