import React, { useState, useEffect, useRef } from "react";
import API from "../services/api";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const ref = useRef();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get("/notifications");
        const data = Array.isArray(res.data) ? res.data : [];
        setNotifications(data);
        setUnread(data.filter((n) => !n.is_read).length);
      } catch {
        // silently fail
      }
    };
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnread((prev) => Math.max(0, prev - 1));
    } catch {
      // silently fail
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-sky-100 transition-colors"
      >
        <span className="material-symbols-outlined text-slate-400">notifications</span>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl bg-white border border-sky-100 shadow-lg z-50">
          <div className="p-3 border-b border-sky-100">
            <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
          </div>
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm">
              No notifications yet
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 border-b border-sky-100 hover:bg-sky-50 cursor-pointer transition-colors ${!n.is_read ? "bg-sky-50" : ""}`}
                onClick={() => !n.is_read && handleMarkRead(n.id)}
              >
                <p className="text-slate-900 text-sm">{n.title || n.message}</p>
                <p className="text-slate-400 text-[11px] mt-1">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}