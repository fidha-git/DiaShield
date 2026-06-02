import React, { useEffect, useState } from "react";
import { fetchAdminUsers, blockUser, unblockUser, deleteUser } from "../services/adminService";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [actionMsg, setActionMsg] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminUsers();
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleBlockToggle = async (user) => {
    try {
      if (user.is_active) {
        await blockUser(user.id);
      } else {
        await unblockUser(user.id);
      }
      setActionMsg(`User ${user.email} ${user.is_active ? "blocked" : "unblocked"}`);
      loadUsers();
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err) {
      setActionMsg("Action failed: " + (err.response?.data?.detail || err.message));
      setTimeout(() => setActionMsg(null), 3000);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user ${user.email}? This cannot be undone.`)) return;
    try {
      await deleteUser(user.id);
      setActionMsg(`User ${user.email} deleted`);
      loadUsers();
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err) {
      setActionMsg("Delete failed: " + (err.response?.data?.detail || err.message));
      setTimeout(() => setActionMsg(null), 3000);
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-unit-6 md:p-gutter min-h-screen">
      <div className="max-w-container-max mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-unit-8">
          <div>
            <h2 className="font-display-lg text-[32px] md:text-display-lg text-on-surface">User Management</h2>
            <p className="font-body-md text-on-surface-variant mt-1">Manage all registered users.</p>
          </div>
        </header>

        {actionMsg && (
          <div className="mb-4 p-3 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-label-md">
            {actionMsg}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by email or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-glass flex-1 px-4 py-2 rounded-lg text-on-surface placeholder-on-surface-variant bg-white/5 border border-white/10 focus:outline-none focus:border-cyan-400/50"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-on-surface focus:outline-none focus:border-cyan-400/50"
          >
            <option value="all">All Roles</option>
            <option value="patient">Patients</option>
            <option value="doctor">Doctors</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="text-on-surface-variant font-headline-md">Loading users...</span>
          </div>
        ) : (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">ID</th>
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">Username</th>
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">Email</th>
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">Role</th>
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">Status</th>
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">Created</th>
                    <th className="text-right p-4 font-label-md text-on-surface-variant text-[11px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-on-surface-variant font-body-md">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((user) => (
                      <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 font-body-md text-on-surface">{user.id}</td>
                        <td className="p-4 font-body-md text-on-surface">{user.username}</td>
                        <td className="p-4 font-body-md text-on-surface">{user.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-[11px] font-label-md ${
                            user.role === "admin"
                              ? "bg-purple-500/20 text-purple-400"
                              : user.role === "doctor"
                              ? "bg-cyan-500/20 text-cyan-400"
                              : "bg-green-500/20 text-green-400"
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`flex items-center gap-1 text-[11px] font-label-md ${
                            user.is_active !== false ? "text-green-400" : "text-red-400"
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${
                              user.is_active !== false ? "bg-green-400" : "bg-red-400"
                            }`} />
                            {user.is_active !== false ? "Active" : "Blocked"}
                          </span>
                        </td>
                        <td className="p-4 font-body-sm text-on-surface-variant">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleBlockToggle(user)}
                              className={`px-3 py-1.5 rounded-lg text-[11px] font-label-md transition-colors ${
                                user.is_active !== false
                                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                  : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                              }`}
                            >
                              {user.is_active !== false ? "Block" : "Unblock"}
                            </button>
                            <button
                              onClick={() => handleDelete(user)}
                              className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-[11px] font-label-md transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
