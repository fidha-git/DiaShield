import React, { useEffect, useState } from "react";
import {
  AdminPage,
  AdminHero,
  AdminPanel,
  AdminButton,
  AdminInput,
  AdminSelect,
  Badge,
  AdminToast,
} from "../components/admin/AdminUI";
import { HealthcareHero } from "../components/Illustrations";
import { getSettings, updateSettings } from "../services/adminService";

export default function AdminSettings() {
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  const [general, setGeneral] = useState({
    organization_name: "",
    timezone: "",
    support_email: "",
  });

  const [security, setSecurity] = useState({
    session_timeout: 30,
    mfa_enabled: true,
    password_rotation_days: 90,
  });

  const [notifications, setNotifications] = useState({
    email_alerts: true,
    critical_incident_notifications: true,
    appointment_digest: true,
  });

  const [system, setSystem] = useState({
    maintenance_mode: false,
    log_retention_days: 180,
    model_version: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await getSettings();
        const data = res.data;
        setGeneral({
          organization_name: data.organization_name,
          timezone: data.timezone,
          support_email: data.support_email,
        });
        setSecurity({
          session_timeout: data.session_timeout,
          mfa_enabled: data.mfa_enabled,
          password_rotation_days: data.password_rotation_days,
        });
        setNotifications({
          email_alerts: data.email_alerts,
          critical_incident_notifications: data.critical_incident_notifications,
          appointment_digest: data.appointment_digest,
        });
        setSystem({
          maintenance_mode: data.maintenance_mode,
          log_retention_days: data.log_retention_days,
          model_version: data.model_version,
        });
      } catch {
        setToast({ type: "error", message: "Failed to load settings" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveSection = async (section, payload) => {
    setSaving(section);
    try {
      const res = await updateSettings(payload);
      const data = res.data;
      if (section === "General") {
        setGeneral({
          organization_name: data.organization_name,
          timezone: data.timezone,
          support_email: data.support_email,
        });
      } else if (section === "Security") {
        setSecurity({
          session_timeout: data.session_timeout,
          mfa_enabled: data.mfa_enabled,
          password_rotation_days: data.password_rotation_days,
        });
      } else if (section === "Notifications") {
        setNotifications({
          email_alerts: data.email_alerts,
          critical_incident_notifications: data.critical_incident_notifications,
          appointment_digest: data.appointment_digest,
        });
      } else if (section === "System") {
        setSystem({
          maintenance_mode: data.maintenance_mode,
          log_retention_days: data.log_retention_days,
          model_version: data.model_version,
        });
      }
      setToast({ type: "success", message: `${section} settings saved` });
    } catch {
      setToast({ type: "error", message: `Failed to save ${section} settings` });
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <AdminPage>
        <AdminToast toast={toast} onClose={() => setToast(null)} />
        <AdminHero
          title="Settings"
          subtitle="Configure organization, security, notifications, and system-wide administration behavior."
          right={<HealthcareHero className="w-full h-auto" />}
        />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shimmer h-64 rounded-2xl" />
          ))}
        </div>
      </AdminPage>
    );
  }

  return (
    <AdminPage>
      <AdminToast toast={toast} onClose={() => setToast(null)} />

      <AdminHero
        title="Settings"
        subtitle="Configure organization, security, notifications, and system-wide administration behavior."
        right={<HealthcareHero className="w-full h-auto" />}
      />

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <AdminPanel title="General" icon="tune">
          <div className="space-y-3">
            <Field label="Organization Name">
              <AdminInput
                value={general.organization_name}
                onChange={(e) => setGeneral((p) => ({ ...p, organization_name: e.target.value }))}
              />
            </Field>
            <Field label="Timezone">
              <AdminSelect value={general.timezone} onChange={(e) => setGeneral((p) => ({ ...p, timezone: e.target.value }))}>
                <option value="Asia/Kolkata">Asia/Kolkata</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
              </AdminSelect>
            </Field>
            <Field label="Support Email">
              <AdminInput
                type="email"
                value={general.support_email}
                onChange={(e) => setGeneral((p) => ({ ...p, support_email: e.target.value }))}
              />
            </Field>
            <div className="pt-2 flex justify-end">
              <AdminButton
                onClick={() => saveSection("General", general)}
                disabled={saving === "General"}
              >
                {saving === "General" ? "Saving..." : "Save General"}
              </AdminButton>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel title="Security" icon="shield_lock">
          <div className="space-y-3">
            <Field label="Session Timeout (minutes)">
              <AdminInput
                type="number"
                value={security.session_timeout}
                onChange={(e) => setSecurity((p) => ({ ...p, session_timeout: Number(e.target.value) }))}
              />
            </Field>
            <Field label="Password Rotation (days)">
              <AdminInput
                type="number"
                value={security.password_rotation_days}
                onChange={(e) => setSecurity((p) => ({ ...p, password_rotation_days: Number(e.target.value) }))}
              />
            </Field>
            <Toggle
              label="Enforce Multi-Factor Authentication"
              enabled={security.mfa_enabled}
              onChange={(enabled) => setSecurity((p) => ({ ...p, mfa_enabled: enabled }))}
            />
            <div className="pt-2 flex justify-end">
              <AdminButton
                onClick={() => saveSection("Security", security)}
                disabled={saving === "Security"}
              >
                {saving === "Security" ? "Saving..." : "Save Security"}
              </AdminButton>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel title="Notifications" icon="notifications_active">
          <div className="space-y-3">
            <Toggle
              label="Email Alerts"
              enabled={notifications.email_alerts}
              onChange={(enabled) => setNotifications((p) => ({ ...p, email_alerts: enabled }))}
            />
            <Toggle
              label="Critical Incident Notifications"
              enabled={notifications.critical_incident_notifications}
              onChange={(enabled) => setNotifications((p) => ({ ...p, critical_incident_notifications: enabled }))}
            />
            <Toggle
              label="Appointment Digest"
              enabled={notifications.appointment_digest}
              onChange={(enabled) => setNotifications((p) => ({ ...p, appointment_digest: enabled }))}
            />
            <div className="pt-2 flex justify-end">
              <AdminButton
                onClick={() => saveSection("Notifications", notifications)}
                disabled={saving === "Notifications"}
              >
                {saving === "Notifications" ? "Saving..." : "Save Notifications"}
              </AdminButton>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel title="System Configuration" icon="settings">
          <div className="space-y-3">
            <Field label="Model Version">
              <AdminInput
                value={system.model_version}
                onChange={(e) => setSystem((p) => ({ ...p, model_version: e.target.value }))}
              />
            </Field>
            <Field label="Log Retention (days)">
              <AdminInput
                type="number"
                value={system.log_retention_days}
                onChange={(e) => setSystem((p) => ({ ...p, log_retention_days: Number(e.target.value) }))}
              />
            </Field>
            <Toggle
              label="Maintenance Mode"
              enabled={system.maintenance_mode}
              onChange={(enabled) => setSystem((p) => ({ ...p, maintenance_mode: enabled }))}
            />
            <div className="flex items-center gap-2 pt-2">
              <Badge tone={system.maintenance_mode ? "rose" : "emerald"}>
                {system.maintenance_mode ? "Maintenance On" : "System Healthy"}
              </Badge>
              <div className="ml-auto">
                <AdminButton
                  onClick={() => saveSection("System", system)}
                  disabled={saving === "System"}
                >
                  {saving === "System" ? "Saving..." : "Save System"}
                </AdminButton>
              </div>
            </div>
          </div>
        </AdminPanel>
      </section>
    </AdminPage>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 flex items-center justify-between"
    >
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <span
        className={`h-6 w-11 rounded-full transition-colors ${enabled ? "bg-sky-500" : "bg-slate-300"} relative`}
      >
        <span
          className={`absolute top-[2px] h-5 w-5 rounded-full bg-white transition-all ${enabled ? "left-[22px]" : "left-[2px]"}`}
        />
      </span>
    </button>
  );
}
