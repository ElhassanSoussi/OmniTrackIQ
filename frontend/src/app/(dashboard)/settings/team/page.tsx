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
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="h-64 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
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
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-gray-500">
            Manage your team members and their permissions
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          disabled={!canInvite}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Invite Team Member
        </button>
      </div>

      {/* Settings Navigation */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        <a href="/settings" className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
          Profile
        </a>
        <a href="/settings/team" className="border-b-2 border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-600">
          Team
        </a>
        <a href="/settings/views" className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
          Saved Views
        </a>
        <a href="/settings/reports" className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
          Reports
        </a>
      </div>

      {/* Plan Info Banner */}
      {atUserLimit && (
        <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-amber-800">Team member limit reached</h3>
              <p className="text-sm text-amber-700">
                Your {team?.plan} plan allows up to {team?.max_users} team members. Upgrade to add more.
              </p>
            </div>
            <a
              href="/billing"
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
            >
              Upgrade Plan
            </a>
          </div>
        </div>
      )}

      {/* Team Members */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Team Members ({team?.current_users}/{team?.max_users === -1 ? "∞" : team?.max_users})
        </h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Last Active
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {team?.members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {member.name || member.email.split("@")[0]}
                      </div>
                      <div className="text-sm text-gray-500">{member.email}</div>
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
                        className="rounded border border-gray-300 px-2 py-1 text-sm"
                      >
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    ) : (
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          member.role === "owner"
                            ? "bg-purple-100 text-purple-800"
                            : member.role === "admin"
                            ? "bg-blue-100 text-blue-800"
                            : member.role === "member"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {ROLE_LABELS[member.role]}
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {new Date(member.created_at).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
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
                          className="text-gray-600 hover:text-gray-900"
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
                          className="text-red-600 hover:text-red-900"
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
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Pending Invites ({team.pending_invites.length})
          </h2>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Invited By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {team.pending_invites.map((invite) => (
                  <tr key={invite.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                      {invite.email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">
                        {ROLE_LABELS[invite.role]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {invite.invited_by_email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(invite.expires_at).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => resendInviteMutation.mutate(invite.id)}
                          disabled={resendInviteMutation.isPending}
                          className="text-emerald-600 hover:text-emerald-900 disabled:opacity-50"
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
                          className="text-red-600 hover:text-red-900"
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
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">
              Invite Team Member
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Send an invitation to join your team
            </p>

            <form onSubmit={handleInvite} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
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
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700"
                >
                  Role
                </label>
                <select
                  id="role"
                  value={inviteRole}
                  onChange={(e) =>
                    setInviteRole(e.target.value as "admin" | "member" | "viewer")
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  {ROLE_DESCRIPTIONS[inviteRole]}
                </p>
              </div>

              {inviteMutation.isError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {(inviteMutation.error as Error)?.message ||
                    "Failed to send invite. Please try again."}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteMutation.isPending}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {inviteMutation.isPending ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Permissions Info */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900">Role Permissions</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(ROLE_LABELS).map(([role, label]) => (
            <div key={role} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <h4 className="font-medium text-gray-900">{label}</h4>
              <p className="mt-1 text-sm text-gray-500">
                {ROLE_DESCRIPTIONS[role]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
