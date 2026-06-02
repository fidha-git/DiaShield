import React, { useEffect, useState } from "react";
import { fetchAdminActivityLogs } from "../services/adminService";

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchAdminActivityLogs();
        setLogs(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load activity logs", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = logs.filter((log) => {
    const q = search.toLowerCase();
    return (
      log.username?.toLowerCase().includes(q) ||
      log.action?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-unit-6 md:p-gutter min-h-screen">
      <div className="max-w-container-max mx-auto">
        <header className="mb-unit-8">
          <h2 className="font-display-lg text-[32px] md:text-display-lg text-on-surface">Activity Logs</h2>
          <p className="font-body-md text-on-surface-variant mt-1">Audit trail of all user actions.</p>
        </header>

        <input
          type="text"
          placeholder="Search by username or action..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-glass w-full mb-6 px-4 py-2 rounded-lg text-on-surface placeholder-on-surface-variant bg-white/5 border border-white/10 focus:outline-none focus:border-cyan-400/50"
        />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="text-on-surface-variant font-headline-md">Loading activity logs...</span>
          </div>
        ) : (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">User ID</th>
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">Username</th>
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">Action</th>
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-on-surface-variant font-body-md">
                        No activity logs found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((log, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 font-body-md text-on-surface">{log.user_id}</td>
                        <td className="p-4 font-body-md text-on-surface">{log.username}</td>
                        <td className="p-4 font-body-sm text-on-surface-variant max-w-md truncate">{log.action}</td>
                        <td className="p-4 font-body-sm text-on-surface-variant whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
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
