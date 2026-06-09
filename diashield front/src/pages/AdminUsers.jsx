import React, { useEffect, useMemo, useState } from "react";
import {
  fetchAdminUsers,
  blockUser,
  unblockUser,
  deleteUser,
} from "../services/adminService";
import {
  AdminPage,
  AdminHero,
  AdminPanel,
  AdminButton,
  AdminInput,
  AdminSelect,
  Badge,
  Avatar,
  TableShell,
  LoadingRows,
  EmptyCard,
  AdminToast,
  toneFromStatus,
} from "../components/admin/AdminUI";
import { HealthcareHero } from "../components/Illustrations";
import SimplePagination from "../components/ui/SimplePagination";

const PAGE_SIZE = 5;

function roleLabel(role) {
  if (!role) return "Patient";
  return role.slice(0, 1).toUpperCase() + role.slice(1);
}

function statusLabel(user) {
  return user.is_active === false ? "Blocked" : "Active";
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [toast, setToast] = useState(null);

  const closeToast = () => setToast(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminUsers();
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch {
      setToast({ type: "error", message: "Failed to load users" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return users.filter((user) => {
      const matchesSearch =
        !q ||
        (user.email || "").toLowerCase().includes(q) ||
        (user.username || "").toLowerCase().includes(q);
      const matchesRole = roleFilter === "all" || (user.role || "patient") === roleFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.is_active !== false) ||
        (statusFilter === "blocked" && user.is_active === false);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  const allVisibleSelected = paginated.length > 0 && paginated.every((u) => selectedIds.includes(u.id));

  const toggleVisibleSelection = () => {
    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !paginated.some((u) => u.id === id)));
      return;
    }
    const merged = new Set(selectedIds);
    paginated.forEach((u) => merged.add(u.id));
    setSelectedIds(Array.from(merged));
  };

  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const handleBlockToggle = async (user) => {
    try {
      if (user.is_active === false) await unblockUser(user.id);
      else await blockUser(user.id);
      setToast({
        type: "success",
        message: `${user.email} ${user.is_active === false ? "unblocked" : "blocked"}`,
      });
      await loadUsers();
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.detail || "Action failed" });
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user ${user.email}? This action cannot be undone.`)) return;
    try {
      await deleteUser(user.id);
      setToast({ type: "success", message: `${user.email} deleted` });
      await loadUsers();
      setSelectedIds((prev) => prev.filter((id) => id !== user.id));
    } catch (err) {
      setToast({ type: "error", message: err.response?.data?.detail || "Delete failed" });
    }
  };

  const bulkBlock = async (makeActive) => {
    if (selectedIds.length === 0) {
      setToast({ type: "error", message: "Select at least one user first" });
      return;
    }
    try {
      await Promise.all(
        selectedIds.map((id) => (makeActive ? unblockUser(id) : blockUser(id)))
      );
      setToast({
        type: "success",
        message: makeActive
          ? "Selected users unblocked"
          : "Selected users blocked",
      });
      setSelectedIds([]);
      await loadUsers();
    } catch {
      setToast({ type: "error", message: "Bulk update failed" });
    }
  };

  const counts = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.is_active !== false).length,
      blocked: users.filter((u) => u.is_active === false).length,
      admins: users.filter((u) => (u.role || "patient") === "admin").length,
    }),
    [users]
  );

  return (
    <AdminPage>
      <AdminToast toast={toast} onClose={closeToast} />

      <AdminHero
        title="Users"
        subtitle="Search and manage all platform users with enterprise-grade controls, role visibility, and bulk actions."
        right={<HealthcareHero className="w-full h-auto" />}
        actions={
          <>
            <AdminButton onClick={() => bulkBlock(false)}>
              <span className="material-symbols-outlined text-[18px]">block</span>
              Block Selected
            </AdminButton>
            <AdminButton variant="outline" onClick={() => bulkBlock(true)}>
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              Unblock Selected
            </AdminButton>
          </>
        }
      />

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatChip label="Total" value={counts.total} icon="group" tone="sky" />
        <StatChip label="Active" value={counts.active} icon="check_circle" tone="emerald" />
        <StatChip label="Blocked" value={counts.blocked} icon="block" tone="rose" />
        <StatChip label="Admins" value={counts.admins} icon="shield" tone="violet" />
      </section>

      <AdminPanel>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <AdminInput
            placeholder="Search by username or email"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <AdminSelect
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Roles</option>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </AdminSelect>
          <AdminSelect
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </AdminSelect>
          <div className="flex items-center justify-end text-sm text-slate-500">
            {selectedIds.length} selected
          </div>
        </div>
      </AdminPanel>

      <div className="mt-5">
        {loading ? (
          <TableShell>
            <table className="w-full">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                <tr>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <th key={i} className="text-left px-4 py-3 text-[11px] uppercase tracking-[0.12em] text-slate-500 font-semibold">Loading</th>
                  ))}
                </tr>
              </thead>
              <tbody>{LoadingRows({ cols: 8, rows: 10 })}</tbody>
            </table>
          </TableShell>
        ) : paginated.length === 0 ? (
          <EmptyCard
            icon="group_off"
            title="No users found"
            subtitle="Adjust filters or search criteria to discover matching users."
          />
        ) : (
          <>
            <TableShell>
              <table className="w-full min-w-[700px]">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                  <tr>
                    <th className="px-4 py-3">
                      <input type="checkbox" checked={allVisibleSelected} onChange={toggleVisibleSelection} />
                    </th>
                    <th className="text-left px-4 py-3 text-[11px] uppercase tracking-[0.12em] text-slate-500 font-semibold">User</th>
                    <th className="text-left px-4 py-3 text-[11px] uppercase tracking-[0.12em] text-slate-500 font-semibold">Email</th>
                    <th className="text-left px-4 py-3 text-[11px] uppercase tracking-[0.12em] text-slate-500 font-semibold">Role</th>
                    <th className="text-left px-4 py-3 text-[11px] uppercase tracking-[0.12em] text-slate-500 font-semibold">Status</th>
                    <th className="text-left px-4 py-3 text-[11px] uppercase tracking-[0.12em] text-slate-500 font-semibold">Joined</th>
                    <th className="text-right px-4 py-3 text-[11px] uppercase tracking-[0.12em] text-slate-500 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 align-middle">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(user.id)}
                          onChange={() => toggleSelection(user.id)}
                        />
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.username || "User"} src={user.profile_image ? `http://127.0.0.1:8000${user.profile_image}` : ""} size="sm" />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{user.username || "Unknown"}</p>
                            <p className="text-xs text-slate-500">ID #{user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle text-sm text-slate-700">{user.email}</td>
                      <td className="px-4 py-3 align-middle">
                        <Badge tone={toneFromStatus(user.role)}>{roleLabel(user.role || "patient")}</Badge>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <Badge tone={toneFromStatus(statusLabel(user).toLowerCase())}>{statusLabel(user)}</Badge>
                      </td>
                      <td className="px-4 py-3 align-middle text-sm text-slate-500">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="flex justify-end gap-2">
                          <AdminButton
                            variant={user.is_active === false ? "success" : "danger"}
                            className="!px-3 !py-1.5 !text-xs"
                            onClick={() => handleBlockToggle(user)}
                          >
                            {user.is_active === false ? "Unblock" : "Block"}
                          </AdminButton>
                          <AdminButton
                            variant="danger"
                            className="!px-3 !py-1.5 !text-xs"
                            onClick={() => handleDelete(user)}
                          >
                            Delete
                          </AdminButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>

            <SimplePagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </AdminPage>
  );
}

function StatChip({ label, value, icon, tone = "sky" }) {
  const tones = {
    sky: "from-sky-100 via-sky-50 to-white",
    emerald: "from-emerald-100 via-emerald-50 to-white",
    rose: "from-rose-100 via-rose-50 to-white",
    violet: "from-violet-100 via-violet-50 to-white",
  };

  return (
    <div className={`rounded-2xl border border-sky-100 p-4 bg-gradient-to-br ${tones[tone] || tones.sky} shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500 font-semibold">{label}</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{value}</p>
        </div>
        <span className="material-symbols-outlined text-sky-700">{icon}</span>
      </div>
    </div>
  );
}
