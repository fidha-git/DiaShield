import React, { useEffect, useState, useCallback } from "react";
import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from "../services/adminService";

const PAGE_SIZE = 8;

const formatINR = (value) => {
  if (value == null || isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value));
};

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg =
    type === "success"
      ? "bg-green-500/20 border-green-500/30 text-green-300"
      : "bg-red-500/20 border-red-500/30 text-red-300";

  const icon = type === "success" ? "check_circle" : "error";

  return (
    <div
      className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-xl ${bg} shadow-2xl animate-slide-down`}
    >
      <span className="material-symbols-outlined text-lg">{icon}</span>
      <span className="font-label-md">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-white/5 animate-pulse">
      <td className="p-4"><div className="h-4 w-6 rounded bg-white/10" /></td>
      <td className="p-4"><div className="h-4 w-32 rounded bg-white/10" /></td>
      <td className="p-4"><div className="h-4 w-24 rounded bg-white/10" /></td>
      <td className="p-4"><div className="h-4 w-12 rounded bg-white/10" /></td>
      <td className="p-4"><div className="h-4 w-20 rounded bg-white/10" /></td>
      <td className="p-4"><div className="h-4 w-28 rounded bg-white/10" /></td>
      <td className="p-4"><div className="h-4 w-14 rounded bg-white/10" /></td>
      <td className="p-4"><div className="h-8 w-24 rounded bg-white/10 ml-auto" /></td>
    </tr>
  );
}

const MODAL_BACKDROP =
  "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4";

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [toast, setToast] = useState(null);

  const showToast = (message, type) => setToast({ message, type });
  const closeToast = useCallback(() => setToast(null), []);

  const loadDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDoctors();
      setDoctors(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      showToast("Failed to load doctors", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  const filtered = doctors.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.name?.toLowerCase().includes(q) ||
      d.specialization?.toLowerCase().includes(q) ||
      d.hospital?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const refresh = () => {
    loadDoctors();
    setPage(1);
  };

  return (
    <div className="p-unit-6 md:p-gutter min-h-screen">
      <div className="max-w-container-max mx-auto">
        {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-unit-8">
          <div>
            <h2 className="font-display-lg text-[32px] md:text-display-lg text-on-surface">Doctors</h2>
            <p className="font-body-md text-on-surface-variant mt-1">Manage all registered doctors.</p>
          </div>
          <AddDoctorModal refresh={refresh} showToast={showToast} />
        </header>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name, specialization, or hospital..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-glass flex-1 px-4 py-2 rounded-lg text-on-surface placeholder-on-surface-variant bg-white/5 border border-white/10 focus:outline-none focus:border-purple-400/50"
          />
        </div>

        {loading ? (
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  {["ID", "Name", "Specialization", "Experience", "Qualification", "Hospital", "Consultation Fee", "Actions"].map((h) => (
                    <th key={h} className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
              </tbody>
            </table>
          </div>
        ) : paginated.length === 0 ? (
          <div className="glass-card rounded-xl flex flex-col items-center justify-center py-20 gap-4">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant">local_hospital</span>
            <span className="font-headline-md text-on-surface-variant">
              {search ? "No doctors match your search" : "No doctors registered yet"}
            </span>
            <p className="font-body-md text-on-surface-variant">
              {search ? "Try a different search term" : "Click the Add Doctor button to register the first doctor."}
            </p>
          </div>
        ) : (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">ID</th>
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">Name</th>
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">Specialization</th>
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">Experience</th>
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">Qualification</th>
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">Hospital</th>
                    <th className="text-left p-4 font-label-md text-on-surface-variant text-[11px]">Consultation Fee</th>
                    <th className="text-right p-4 font-label-md text-on-surface-variant text-[11px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((doc) => (
                    <DoctorRow
                      key={doc.id}
                      doctor={doc}
                      refresh={refresh}
                      showToast={showToast}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
                <span className="font-body-sm text-on-surface-variant">
                  Page {safePage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-on-surface font-label-md text-[11px] disabled:opacity-30 hover:bg-white/10 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-on-surface font-label-md text-[11px] disabled:opacity-30 hover:bg-white/10 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Doctor Row                                                        */
/* ------------------------------------------------------------------ */
function DoctorRow({ doctor, refresh, showToast }) {
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
        <td className="p-4 font-body-md text-on-surface">{doctor.id}</td>
        <td className="p-4 font-body-md text-on-surface">{doctor.name}</td>
        <td className="p-4">
          <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-[11px] font-label-md">
            {doctor.specialization}
          </span>
        </td>
        <td className="p-4 font-body-md text-on-surface">{doctor.experience} yrs</td>
        <td className="p-4 font-body-sm text-on-surface-variant max-w-[140px] truncate">{doctor.qualification}</td>
        <td className="p-4 font-body-md text-on-surface">{doctor.hospital}</td>
        <td className="p-4 font-body-md text-on-surface">{formatINR(doctor.consultation_fee)}</td>
        <td className="p-4 text-right">
          <div className="flex items-center justify-end gap-1">
            <ActionBtn icon="visibility" tip="View" onClick={() => setViewOpen(true)} />
            <ActionBtn icon="edit" tip="Edit" onClick={() => setEditOpen(true)} />
            <ActionBtn icon="delete" tip="Delete" onClick={() => setDeleteOpen(true)} danger />
          </div>
        </td>
      </tr>

      {viewOpen && (
        <ViewDoctorModal
          doctorId={doctor.id}
          onClose={() => setViewOpen(false)}
        />
      )}
      {editOpen && (
        <EditDoctorModal
          doctorId={doctor.id}
          onClose={() => setEditOpen(false)}
          refresh={refresh}
          showToast={showToast}
        />
      )}
      {deleteOpen && (
        <DeleteConfirmModal
          doctor={doctor}
          onClose={() => setDeleteOpen(false)}
          refresh={refresh}
          showToast={showToast}
        />
      )}
    </>
  );
}

function ActionBtn({ icon, tip, onClick, danger }) {
  return (
    <button
      title={tip}
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors ${
        danger
          ? "text-red-400 hover:bg-red-500/20"
          : "text-on-surface-variant hover:bg-white/10"
      }`}
    >
      <span className="material-symbols-outlined text-lg">{icon}</span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Modal wrapper                                                      */
/* ------------------------------------------------------------------ */
function Modal({ title, icon, children, onClose, wide }) {
  return (
    <div className={MODAL_BACKDROP} onClick={onClose}>
      <div
        className={`glass-card rounded-xl p-6 w-full ${wide ? "max-w-2xl" : "max-w-lg"} max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-400">{icon}</span>
            {title}
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Form field helper                                                  */
/* ------------------------------------------------------------------ */
function Field({ label, id, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-label-md text-on-surface-variant text-[11px]">{label}</label>
      {props.type === "textarea" ? (
        <textarea
          id={id}
          {...props}
          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-purple-400/50 text-sm resize-none"
        />
      ) : (
        <input
          id={id}
          {...props}
          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-purple-400/50 text-sm"
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Add Doctor Modal                                                   */
/* ------------------------------------------------------------------ */
function AddDoctorModal({ refresh, showToast }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
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
  });

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createDoctor({
        ...form,
        experience: Number(form.experience),
        consultation_fee: Number(form.consultation_fee),
      });
      showToast("Doctor created successfully", "success");
      setOpen(false);
      setForm({
        name: "", email: "", password: "", phone: "", specialization: "",
        qualification: "", experience: "", consultation_fee: "", hospital: "", bio: "",
      });
      refresh();
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to create doctor";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white px-5 py-2.5 rounded-lg font-label-md hover:from-purple-500 hover:to-purple-400 transition-all shadow-lg shadow-purple-500/25"
      >
        <span className="material-symbols-outlined text-lg">add</span>
        Add Doctor
      </button>

      {open && (
        <Modal title="Add New Doctor" icon="local_hospital" onClose={() => setOpen(false)} wide>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Field label="Full Name" id="name" name="name" required value={form.name} onChange={handleChange} placeholder="Dr. John Doe" />
            </div>
            <Field label="Email" id="email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="dr.john@hospital.com" />
            <Field label="Password" id="password" name="password" type="password" required value={form.password} onChange={handleChange} placeholder="Min 8 characters" />
            <Field label="Phone Number" id="phone" name="phone" required value={form.phone} onChange={handleChange} placeholder="+1234567890" />
            <Field label="Specialization" id="specialization" name="specialization" required value={form.specialization} onChange={handleChange} placeholder="Endocrinologist" />
            <Field label="Qualification" id="qualification" name="qualification" required value={form.qualification} onChange={handleChange} placeholder="MD, PhD" />
            <Field label="Experience (Years)" id="experience" name="experience" type="number" required value={form.experience} onChange={handleChange} placeholder="10" />
            <Field label="Consultation Fee (₹)" id="consultation_fee" name="consultation_fee" type="number" step="0.01" required value={form.consultation_fee} onChange={handleChange} placeholder="500" />
            <Field label="Hospital / Clinic" id="hospital" name="hospital" required value={form.hospital} onChange={handleChange} placeholder="City Hospital" />
            <div className="md:col-span-2">
              <Field label="Bio (optional)" id="bio" name="bio" type="textarea" value={form.bio} onChange={handleChange} placeholder="Short professional bio..." />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg border border-white/10 text-on-surface-variant font-label-md hover:bg-white/5 transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 text-white font-label-md hover:from-purple-500 hover:to-purple-400 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {saving ? "Creating..." : "Create Doctor"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  View Doctor Modal                                                  */
/* ------------------------------------------------------------------ */
function ViewDoctorModal({ doctorId, onClose }) {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getDoctorById(doctorId);
        setDoctor(res.data);
      } catch {
        // handled by empty state
      } finally {
        setLoading(false);
      }
    })();
  }, [doctorId]);

  return (
    <Modal title="Doctor Details" icon="badge" onClose={onClose}>
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <span className="w-6 h-6 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
        </div>
      ) : !doctor ? (
        <p className="text-center text-on-surface-variant font-body-md">Could not load doctor details.</p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-white/10">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-white">person</span>
            </div>
            <div>
              <h4 className="font-headline-md text-on-surface">{doctor.name}</h4>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[11px] font-label-md">
                {doctor.specialization}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <DetailItem label="Email" value={doctor.email || "—"} />
            <DetailItem label="Phone" value={doctor.phone || "—"} />
            <DetailItem label="Qualification" value={doctor.qualification || "—"} />
            <DetailItem label="Experience" value={doctor.experience ? `${doctor.experience} years` : "—"} />
            <DetailItem label="Consultation Fee" value={formatINR(doctor.consultation_fee)} />
            <DetailItem label="Hospital" value={doctor.hospital || "—"} />
            <DetailItem label="Bio" value={doctor.bio || "—"} className="md:col-span-2" />
          </div>
        </div>
      )}
    </Modal>
  );
}

function DetailItem({ label, value, className = "" }) {
  return (
    <div className={className}>
      <p className="font-label-md text-on-surface-variant text-[11px] mb-0.5">{label}</p>
      <p className="font-body-md text-on-surface">{value}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Edit Doctor Modal                                                  */
/* ------------------------------------------------------------------ */
function EditDoctorModal({ doctorId, onClose, refresh, showToast }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getDoctorById(doctorId);
        const d = res.data;
        setForm({
          name: d.name || "",
          phone: d.phone || "",
          specialization: d.specialization || "",
          qualification: d.qualification || "",
          experience: d.experience ?? "",
          consultation_fee: d.consultation_fee ?? "",
          hospital: d.hospital || "",
          bio: d.bio || "",
        });
      } catch {
        showToast("Failed to load doctor details", "error");
        onClose();
      } finally {
        setLoading(false);
      }
    })();
  }, [doctorId, onClose, showToast]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDoctor(doctorId, {
        ...form,
        experience: form.experience !== "" ? Number(form.experience) : undefined,
        consultation_fee: form.consultation_fee !== "" ? Number(form.consultation_fee) : undefined,
      });
      showToast("Doctor updated successfully", "success");
      refresh();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to update doctor";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Edit Doctor" icon="edit" onClose={onClose} wide>
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <span className="w-6 h-6 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Field label="Full Name" id="edit-name" name="name" required value={form.name} onChange={handleChange} />
          </div>
          <Field label="Phone Number" id="edit-phone" name="phone" required value={form.phone} onChange={handleChange} />
          <Field label="Specialization" id="edit-spec" name="specialization" required value={form.specialization} onChange={handleChange} />
          <Field label="Qualification" id="edit-qual" name="qualification" required value={form.qualification} onChange={handleChange} />
          <Field label="Experience (Years)" id="edit-exp" name="experience" type="number" required value={form.experience} onChange={handleChange} />
          <Field label="Consultation Fee (₹)" id="edit-fee" name="consultation_fee" type="number" step="0.01" required value={form.consultation_fee} onChange={handleChange} />
          <Field label="Hospital / Clinic" id="edit-hospital" name="hospital" required value={form.hospital} onChange={handleChange} />
          <div className="md:col-span-2">
            <Field label="Bio (optional)" id="edit-bio" name="bio" type="textarea" value={form.bio} onChange={handleChange} />
          </div>
          <div className="md:col-span-2 flex justify-end gap-3 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-white/10 text-on-surface-variant font-label-md hover:bg-white/5 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 text-white font-label-md hover:from-purple-500 hover:to-purple-400 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/*  Delete Confirm Modal                                               */
/* ------------------------------------------------------------------ */
function DeleteConfirmModal({ doctor, onClose, refresh, showToast }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteDoctor(doctor.id);
      showToast("Doctor deleted successfully", "success");
      refresh();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to delete doctor";
      showToast(msg, "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal title="Delete Doctor" icon="warning" onClose={onClose}>
      <div className="flex flex-col items-center text-center gap-4 py-4">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl text-red-400">delete_forever</span>
        </div>
        <p className="font-body-md text-on-surface">
          Are you sure you want to delete <span className="font-label-md text-on-surface">{doctor.name}</span>?
        </p>
        <p className="font-body-sm text-on-surface-variant">This action cannot be undone.</p>
        <div className="flex gap-3 mt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-white/10 text-on-surface-variant font-label-md hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-500 text-white font-label-md hover:from-red-500 hover:to-red-400 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {deleting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
