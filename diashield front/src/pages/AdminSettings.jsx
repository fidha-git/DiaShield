import React, { useState } from "react";
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

export default function AdminSettings() {
  const [toast, setToast] = useState(null);

  const [general, setGeneral] = useState({
    organization: "DiaShield",
    timezone: "Asia/Kolkata",
    supportEmail: "support@diashield.com",
  });

  const [security, setSecurity] = useState({
    sessionTimeout: "30",
    enforceMfa: true,
    passwordRotationDays: "90",
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    criticalIncidents: true,
    appointmentDigest: true,
  });

  const [system, setSystem] = useState({
    maintenanceMode: false,
    logRetentionDays: "180",
    modelVersion: "v3.2.1",
  });

  const saveSection = (label) => {
    setToast({ type: "success", message: `${label} settings saved` });
  };

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
                value={general.organization}
                onChange={(e) => setGeneral((p) => ({ ...p, organization: e.target.value }))}
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
                value={general.supportEmail}
                onChange={(e) => setGeneral((p) => ({ ...p, supportEmail: e.target.value }))}
              />
            </Field>
            <div className="pt-2 flex justify-end">
              <AdminButton onClick={() => saveSection("General")}>Save General</AdminButton>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel title="Security" icon="shield_lock">
          <div className="space-y-3">
            <Field label="Session Timeout (minutes)">
              <AdminInput
                type="number"
                value={security.sessionTimeout}
                onChange={(e) => setSecurity((p) => ({ ...p, sessionTimeout: e.target.value }))}
              />
            </Field>
            <Field label="Password Rotation (days)">
              <AdminInput
                type="number"
                value={security.passwordRotationDays}
                onChange={(e) => setSecurity((p) => ({ ...p, passwordRotationDays: e.target.value }))}
              />
            </Field>
            <Toggle
              label="Enforce Multi-Factor Authentication"
              enabled={security.enforceMfa}
              onChange={(enabled) => setSecurity((p) => ({ ...p, enforceMfa: enabled }))}
            />
            <div className="pt-2 flex justify-end">
              <AdminButton onClick={() => saveSection("Security")}>Save Security</AdminButton>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel title="Notifications" icon="notifications_active">
          <div className="space-y-3">
            <Toggle
              label="Email Alerts"
              enabled={notifications.emailAlerts}
              onChange={(enabled) => setNotifications((p) => ({ ...p, emailAlerts: enabled }))}
            />
            <Toggle
              label="Critical Incident Notifications"
              enabled={notifications.criticalIncidents}
              onChange={(enabled) => setNotifications((p) => ({ ...p, criticalIncidents: enabled }))}
            />
            <Toggle
              label="Appointment Digest"
              enabled={notifications.appointmentDigest}
              onChange={(enabled) => setNotifications((p) => ({ ...p, appointmentDigest: enabled }))}
            />
            <div className="pt-2 flex justify-end">
              <AdminButton onClick={() => saveSection("Notification")}>Save Notifications</AdminButton>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel title="System Configuration" icon="settings">
          <div className="space-y-3">
            <Field label="Model Version">
              <AdminInput
                value={system.modelVersion}
                onChange={(e) => setSystem((p) => ({ ...p, modelVersion: e.target.value }))}
              />
            </Field>
            <Field label="Log Retention (days)">
              <AdminInput
                type="number"
                value={system.logRetentionDays}
                onChange={(e) => setSystem((p) => ({ ...p, logRetentionDays: e.target.value }))}
              />
            </Field>
            <Toggle
              label="Maintenance Mode"
              enabled={system.maintenanceMode}
              onChange={(enabled) => setSystem((p) => ({ ...p, maintenanceMode: enabled }))}
            />
            <div className="flex items-center gap-2 pt-2">
              <Badge tone={system.maintenanceMode ? "rose" : "emerald"}>
                {system.maintenanceMode ? "Maintenance On" : "System Healthy"}
              </Badge>
              <div className="ml-auto">
                <AdminButton onClick={() => saveSection("System")}>Save System</AdminButton>
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
