import React, { useEffect, useMemo, useState } from "react";
import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  fetchAdminAppointments,
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
  EmptyCard,
  AdminToast,
} from "../components/admin/AdminUI";
import { HealthcareHero } from "../components/Illustrations";
import SimplePagination from "../components/ui/SimplePagination";
import { formatINR } from "../utils/currency";

const PAGE_SIZE = 5;

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  phone: "",
  specialization: "",
  qualification: "",
  experience: "",
  consultation_fee: "",
  hospital: "",
  bio: "",
};

const PROFILE_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function Modal({ title, icon, children, onClose, wide = false }) {
  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/40 backdrop-blur-sm p-4 flex items-center justify-center" onClick={onClose}>
      <div className={`w-full ${wide ? "max-w-3xl" : "max-w-lg"} rounded-2xl border border-sky-100 bg-white p-5 shadow-2xl animate-scale-in max-h-[90vh] overflow-auto`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-sky-600">{icon}</span>
            {title}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, type = "text", className = "", ...props }) {
  const base = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10";

  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      {type === "textarea" ? (
        <textarea {...props} rows={4} className={`${base} resize-none`} />
      ) : (
        <input type={type} {...props} className={base} />
      )}
    </label>
  );
}

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("all");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [viewId, setViewId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [suspendDoctor, setSuspendDoctor] = useState(null);

  const closeToast = () => setToast(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [docRes, aptRes] = await Promise.all([getDoctors(), fetchAdminAppointments()]);
      setDoctors(Array.isArray(docRes.data) ? docRes.data : []);
      setAppointments(Array.isArray(aptRes.data) ? aptRes.data : []);
    } catch {
      setToast({ type: "error", message: "Failed to load doctors" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const specializations = useMemo(() => {
    const set = new Set();
    doctors.forEach((d) => set.add(d.specialization || "General"));
    return ["all", ...Array.from(set).sort()];
  }, [doctors]);

  const appointmentCounts = useMemo(() => {
    const counts = new Map();
    appointments.forEach((apt) => {
      counts.set(apt.doctor_id, (counts.get(apt.doctor_id) || 0) + 1);
    });
    return counts;
  }, [appointments]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return doctors.filter((d) => {
      const matchesSearch =
        !q ||
        (d.name || "").toLowerCase().includes(q) ||
        (d.hospital || "").toLowerCase().includes(q) ||
        (d.specialization || "").toLowerCase().includes(q);
      const matchesSpecialization = specialization === "all" || (d.specialization || "General") === specialization;
      return matchesSearch && matchesSpecialization;
    });
  }, [doctors, search, specialization]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  return (
    <AdminPage>
      <AdminToast toast={toast} onClose={closeToast} />

      <AdminHero
        title="Doctors"
        subtitle="View, update, and manage provider profiles in a premium healthcare operations workspace."
        right={<HealthcareHero className="w-full h-auto" />}
        actions={
          <AdminButton onClick={() => setCreateOpen(true)}>
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Add Doctor
          </AdminButton>
        }
      />

      <AdminPanel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <AdminInput
            placeholder="Search doctor by name, specialization, hospital"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <AdminSelect
            value={specialization}
            onChange={(e) => {
              setSpecialization(e.target.value);
              setPage(1);
            }}
          >
            {specializations.map((sp) => (
              <option key={sp} value={sp}>
                {sp === "all" ? "All Specializations" : sp}
              </option>
            ))}
          </AdminSelect>
          <div className="flex items-center justify-end text-sm text-slate-500">
            {filtered.length} doctors
          </div>
        </div>
      </AdminPanel>

      <div className="mt-5">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="shimmer h-[220px] rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyCard
            icon="stethoscope"
            title="No doctors found"
            subtitle="Try changing search filters or create a new doctor profile."
            action={<AdminButton onClick={() => setCreateOpen(true)}>Add Doctor</AdminButton>}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginated.map((doctor) => {
                const totalAppointments = appointmentCounts.get(doctor.id) || 0;
                const rating = (4 + ((doctor.experience || 1) % 10) / 10).toFixed(1);

                return (
                  <article key={doctor.id} className="rounded-[20px] border border-sky-100 bg-white p-5 shadow-md shadow-sky-100/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar
                          name={doctor.name}
                          src={doctor.profile_image ? `${PROFILE_BASE}${doctor.profile_image}` : ""}
                          size="lg"
                        />
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold text-slate-900 truncate">{doctor.name}</h3>
                          <p className="text-sm text-slate-500 truncate">{doctor.hospital || "Hospital not set"}</p>
                          <div className="mt-1">
                            <Badge tone="sky">{doctor.specialization || "General"}</Badge>
                          </div>
                        </div>
                      </div>
                      <Badge tone="emerald">{rating}?</Badge>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      <Info label="Experience" value={`${doctor.experience || 0} years`} icon="work_history" />
                      <Info label="Appointments" value={totalAppointments} icon="calendar_month" />
                      <Info label="Fee" value={formatINR(doctor.consultation_fee)} icon="payments" />
                      <Info label="Qualification" value={doctor.qualification || "-"} icon="school" />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <AdminButton variant="outline" className="flex-1 !text-xs !px-2" onClick={() => setViewId(doctor.id)}>
                        View
                      </AdminButton>
                      <AdminButton variant="outline" className="flex-1 !text-xs !px-2" onClick={() => setEditId(doctor.id)}>
                        Edit
                      </AdminButton>
                      <AdminButton variant="danger" className="flex-1 !text-xs !px-2" onClick={() => setSuspendDoctor(doctor)}>
                        Suspend
                      </AdminButton>
                    </div>
                  </article>
                );
              })}
            </div>

            <SimplePagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              itemLabel="doctors"
            />
          </>
        )}
      </div>

      {createOpen && (
        <DoctorFormModal
          title="Add Doctor"
          icon="person_add"
          submitLabel="Create Doctor"
          onClose={() => setCreateOpen(false)}
          onSubmit={async (form) => {
            await createDoctor(form);
            setToast({ type: "success", message: "Doctor created" });
            setCreateOpen(false);
            await loadData();
          }}
        />
      )}

      {viewId && <DoctorViewModal doctorId={viewId} onClose={() => setViewId(null)} />}

      {editId && (
        <DoctorFormModal
          title="Edit Doctor"
          icon="edit"
          doctorId={editId}
          submitLabel="Save Changes"
          onClose={() => setEditId(null)}
          onSubmit={async (form) => {
            await updateDoctor(editId, form);
            setToast({ type: "success", message: "Doctor updated" });
            setEditId(null);
            await loadData();
          }}
        />
      )}

      {suspendDoctor && (
        <Modal title="Suspend Doctor" icon="warning" onClose={() => setSuspendDoctor(null)}>
          <p className="text-sm text-slate-600">
            This will remove <span className="font-semibold text-slate-900">{suspendDoctor.name}</span> from the roster.
            This action can be reversed by recreating the profile.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <AdminButton variant="outline" onClick={() => setSuspendDoctor(null)}>
              Cancel
            </AdminButton>
            <AdminButton
              variant="danger"
              onClick={async () => {
                try {
                  await deleteDoctor(suspendDoctor.id);
                  setToast({ type: "success", message: "Doctor suspended" });
                  setSuspendDoctor(null);
                  await loadData();
                } catch {
                  setToast({ type: "error", message: "Failed to suspend doctor" });
                }
              }}
            >
              Suspend
            </AdminButton>
          </div>
        </Modal>
      )}
    </AdminPage>
  );
}

function Info({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2">
      <div className="flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] text-slate-500 font-semibold">
        <span className="material-symbols-outlined text-[14px]">{icon}</span>
        {label}
      </div>
      <p className="text-sm font-semibold text-slate-800 mt-1 truncate">{value}</p>
    </div>
  );
}

function DoctorViewModal({ doctorId, onClose }) {
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getDoctorById(doctorId);
        setDoctor(res.data);
      } catch {
        setDoctor(null);
      }
    })();
  }, [doctorId]);

  return (
    <Modal title="Doctor Profile" icon="badge" onClose={onClose} wide>
      {!doctor ? (
        <p className="text-sm text-slate-500">Loading profile...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <Info label="Name" value={doctor.name} icon="person" />
          <Info label="Specialization" value={doctor.specialization} icon="stethoscope" />
          <Info label="Experience" value={`${doctor.experience} years`} icon="work_history" />
          <Info label="Qualification" value={doctor.qualification} icon="school" />
          <Info label="Hospital" value={doctor.hospital} icon="local_hospital" />
          <Info label="Consultation" value={formatINR(doctor.consultation_fee)} icon="payments" />
          <Info label="Phone" value={doctor.phone || "-"} icon="call" />
          <Info label="Bio" value={doctor.bio || "Not provided"} icon="article" />
        </div>
      )}
    </Modal>
  );
}

function DoctorFormModal({
  title,
  icon,
  submitLabel,
  onClose,
  onSubmit,
  doctorId = null,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!doctorId);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!doctorId) return;
    (async () => {
      try {
        const res = await getDoctorById(doctorId);
        const d = res.data;
        setForm({
          name: d.name || "",
          email: d.email || "",
          password: "",
          phone: d.phone || "",
          specialization: d.specialization || "",
          qualification: d.qualification || "",
          experience: d.experience ?? "",
          consultation_fee: d.consultation_fee ?? "",
          hospital: d.hospital || "",
          bio: d.bio || "",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [doctorId]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        experience: Number(form.experience || 0),
        consultation_fee: Number(form.consultation_fee || 0),
      };
      if (!payload.password) delete payload.password;
      if (!payload.email) delete payload.email;
      await onSubmit(payload);
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to save doctor profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={title} icon={icon} onClose={onClose} wide>
      {loading ? (
        <p className="text-sm text-slate-500">Loading doctor profile...</p>
      ) : (
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Full Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          <Field label="Phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} required />
          {!doctorId && (
            <>
              <Field label="Email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
              <Field label="Password" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />
            </>
          )}
          <Field label="Specialization" value={form.specialization} onChange={(e) => setForm((p) => ({ ...p, specialization: e.target.value }))} required />
          <Field label="Qualification" value={form.qualification} onChange={(e) => setForm((p) => ({ ...p, qualification: e.target.value }))} required />
          <Field label="Experience (Years)" type="number" value={form.experience} onChange={(e) => setForm((p) => ({ ...p, experience: e.target.value }))} required />
          <Field label="Consultation Fee" type="number" value={form.consultation_fee} onChange={(e) => setForm((p) => ({ ...p, consultation_fee: e.target.value }))} required />
          <Field className="md:col-span-2" label="Hospital" value={form.hospital} onChange={(e) => setForm((p) => ({ ...p, hospital: e.target.value }))} required />
          <Field className="md:col-span-2" label="Bio" type="textarea" value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} />

          {error ? <p className="md:col-span-2 text-sm text-rose-600">{error}</p> : null}

          <div className="md:col-span-2 flex justify-end gap-2">
            <AdminButton variant="outline" onClick={onClose} type="button">
              Cancel
            </AdminButton>
            <AdminButton type="submit" disabled={saving}>
              {saving ? "Saving..." : submitLabel}
            </AdminButton>
          </div>
        </form>
      )}
    </Modal>
  );
}
