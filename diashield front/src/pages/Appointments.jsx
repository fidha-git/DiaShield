import React, { useState, useEffect, useMemo, useRef } from "react";
import API from "../services/api";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import DoctorAvatar from "../components/DoctorAvatar";
import { EmptyAppointments } from "../components/Illustrations";
import { formatINR } from "../utils/currency";

function toLocalDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const STEPS = [
  { num: 1, label: "Specialization" },
  { num: 2, label: "Choose Doctor" },
  { num: 3, label: "Date & Time" },
  { num: 4, label: "Review" },
];

const SPECIALIZATION_ICONS = {
  "Diabetologist": "monitor_heart",
  "Endocrinologist": "biotech",
  "Nutritionist": "restaurant",
  "General Physician": "stethoscope",
  "Cardiologist": "favorite",
  "Neurologist": "psychology",
  "Dermatologist": "skin",
  "Pediatrician": "child_care",
  "Psychiatrist": "mood",
  "Ophthalmologist": "visibility",
};

const SPECIALIZATION_COLORS = {
  "Diabetologist": "from-rose-500 to-pink-500",
  "Endocrinologist": "from-cyan-500 to-sky-500",
  "Nutritionist": "from-emerald-500 to-green-500",
  "General Physician": "from-sky-500 to-blue-500",
};

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [step, setStep] = useState(1);
  const [selectedSpecialization, setSelectedSpecialization] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState();
  const [slots, setSlots] = useState([]);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const carouselRef = useRef(null);

  const filteredAppointments = useMemo(() => {
    if (!Array.isArray(appointments)) return [];
    if (activeTab === "upcoming") {
      return appointments.filter(a => ["booked", "upcoming"].includes((a.status || "").toLowerCase()));
    }
    if (activeTab === "completed") {
      return appointments.filter(a => (a.status || "").toLowerCase() === "completed");
    }
    if (activeTab === "cancelled") {
      return appointments.filter(a => (a.status || "").toLowerCase() === "cancelled");
    }
    return appointments;
  }, [appointments, activeTab]);

  const appointmentCounts = useMemo(() => {
    if (!Array.isArray(appointments)) {
      return { upcoming: 0, completed: 0, cancelled: 0 };
    }
    return {
      upcoming: appointments.filter(a =>
        ["booked", "upcoming"].includes((a.status || "").toLowerCase())
      ).length,
      completed: appointments.filter(a =>
        (a.status || "").toLowerCase() === "completed"
      ).length,
      cancelled: appointments.filter(a =>
        (a.status || "").toLowerCase() === "cancelled"
      ).length
    };
  }, [appointments]);

  const specializations = useMemo(() => {
    const map = new Map();
    doctors.forEach(d => {
      const s = d.specialization || "General Physician";
      map.set(s, (map.get(s) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    let result = doctors;
    if (selectedSpecialization) {
      result = result.filter(d => d.specialization === selectedSpecialization);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.name?.toLowerCase().includes(q) ||
        d.specialization?.toLowerCase().includes(q) ||
        d.hospital?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [doctors, selectedSpecialization, searchQuery]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      setError("");
      try {
        const response = await API.get("/doctor/all", { headers: getAuthHeaders() });
        setDoctors(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        setDoctors([]);
        const errorMessage =
          error?.response?.data?.detail?.[0]?.msg ||
          error?.response?.data?.detail ||
          error.message ||
          "Something went wrong";
        setError(String(errorMessage));
      }
    };
    fetchDoctors();
    loadAppointments();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchSlots = async () => {
      setError("");
      setSelectedDate(undefined);
      setSelectedSlot(null);
      if (!selectedDoctorId) {
        setSlots([]);
        setCalendarMonth(new Date());
        return;
      }
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setSlots([]);
          setCalendarMonth(new Date());
          return;
        }
        const response = await API.get(`/doctor/slots/${selectedDoctorId}`, { headers: getAuthHeaders() });
        const loadedSlots = Array.isArray(response.data) ? response.data : [];
        if (cancelled) return;
        setSlots(loadedSlots);
        if (loadedSlots.length > 0) {
          const availableDates = loadedSlots.filter(s => !s.is_booked).map(s => s.date).sort();
          if (availableDates.length > 0) {
            setCalendarMonth(new Date(availableDates[0]));
          }
        }
      } catch (error) {
        if (cancelled) return;
        setSlots([]);
        setCalendarMonth(new Date());
      }
    };
    fetchSlots();
    return () => { cancelled = true; };
  }, [selectedDoctorId]);

  const loadAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setAppointments([]);
        setError("Please login again");
        setLoading(false);
        return;
      }
      const response = await API.get("/appointments/my-appointments", { headers: { Authorization: `Bearer ${token}` } });
      let appts = [];
      if (Array.isArray(response.data)) {
        appts = response.data;
      } else if (Array.isArray(response.data.appointments)) {
        appts = response.data.appointments;
      }
      if (!Array.isArray(appts)) appts = [];
      setAppointments(appts);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.detail?.[0]?.msg ||
        error?.response?.data?.detail ||
        error.message ||
        "Something went wrong";
      setError(String(errorMessage));
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    setError("");
    setSuccess("");
    setBooking(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not logged in.");
        setBooking(false);
        return;
      }
      if (!selectedSlot) {
        setError("Please select a slot.");
        setBooking(false);
        return;
      }
      const bookingPayload = {
        doctor_id: Number(selectedDoctorId),
        slot_id: Number(selectedSlot.id)
      };
      await API.post(`/appointments/book/${selectedSlot.id}`, bookingPayload, { headers: getAuthHeaders() });
      setSuccess("Appointment booked successfully.");
      setStep(1);
      setSelectedSpecialization(null);
      setSelectedDoctorId(null);
      setSelectedDate(undefined);
      setSelectedSlot(null);
      await loadAppointments();
    } catch (error) {
      const errorMessage =
        error?.response?.data?.detail?.[0]?.msg ||
        error?.response?.data?.detail ||
        error.message ||
        "Something went wrong";
      setError(String(errorMessage));
    } finally {
      setBooking(false);
    }
  };

  const handleCancel = async (id) => {
    setError("");
    setSuccess("");
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    setAppointments(prev => prev.filter(a => a.id !== id));
    try {
      const token = localStorage.getItem("token");
      if (!token) { setError("You are not logged in."); return; }
      await API.delete(`/appointments/cancel/${id}`, { headers: getAuthHeaders() });
      setSuccess("Appointment cancelled.");
      await loadAppointments();
    } catch (error) {
      const errorMessage = error?.response?.data?.detail || error.message || "Something went wrong";
      setError(String(errorMessage));
      await loadAppointments();
    }
  };

  const handleReschedule = async (appointmentId, newSlotId) => {
    setError("");
    setSuccess("");
    try {
      await API.put(`/appointments/reschedule/${appointmentId}/${newSlotId}`, {}, { headers: getAuthHeaders() });
      setSuccess("Appointment rescheduled successfully.");
      setRescheduleTarget(null);
      await loadAppointments();
    } catch (error) {
      setError(error?.response?.data?.detail || "Failed to reschedule");
    }
  };

  const timeSlots = selectedDate
    ? (() => {
        const dateStr = toLocalDateString(selectedDate);
        return slots.filter(s => !s.is_booked && s.date === dateStr);
      })()
    : [];

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);
  const totalSteps = STEPS.length;

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth * 0.6;
      carouselRef.current.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 transition-colors duration-300">
      <div className="page-container animate-fade-in">

        {/* Header */}
        <header className="mb-8">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-sky-500/10 to-cyan-500/10 dark:from-sky-500/20 dark:to-cyan-500/20 border border-sky-200 dark:border-slate-800/80 text-sky-700 dark:text-sky-400 text-[10px] font-bold uppercase tracking-widest mb-4 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            Patient Portal
          </div>
          <h1 className="text-3xl md:text-[42px] font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            <span className="text-gradient">Appointments</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-base">Book and manage your consultations with your care team.</p>
        </header>

        {/* Error/Success toasts */}
        <div className="fixed top-6 right-4 sm:right-6 z-50 flex flex-col gap-3 max-w-[90vw]">
          {error && (
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-red-650 dark:text-red-400 shadow-2xl animate-slide-down">
              <span className="material-symbols-outlined text-lg">error</span>
              <span className="font-semibold text-sm">{error}</span>
              <button onClick={() => setError("")} className="ml-2 opacity-60 hover:opacity-100">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 text-green-650 dark:text-green-400 shadow-2xl animate-slide-down">
              <span className="material-symbols-outlined text-lg">check_circle</span>
              <span className="font-semibold text-sm">{success}</span>
              <button onClick={() => setSuccess("")} className="ml-2 opacity-60 hover:opacity-100">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          )}
        </div>

        {/* 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* ─── LEFT COLUMN: Booking Wizard ─── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Progress Indicator */}
            <div className="bg-white dark:bg-[#0F172A]/90 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xl shadow-slate-100/50 dark:shadow-none">
              <div className="flex items-center justify-between">
                {STEPS.map((s, i) => (
                  <React.Fragment key={s.num}>
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        step === s.num
                          ? "bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-500/30 scale-110"
                          : step > s.num
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                      }`}>
                        {step > s.num ? (
                          <span className="material-symbols-outlined text-sm">check</span>
                        ) : (
                          s.num
                        )}
                      </div>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                        step === s.num
                          ? "text-sky-600 dark:text-sky-400"
                          : step > s.num
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-400 dark:text-slate-500"
                      }`}>
                        {s.label}
                      </span>
                    </div>
                    {i < totalSteps - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all duration-500 ${
                        step > s.num ? "bg-emerald-400" : "bg-slate-200 dark:bg-slate-700"
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Step 1: Select Specialization */}
            {step === 1 && (
              <div className="bg-white dark:bg-[#0F172A]/90 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-xl shadow-slate-100/50 dark:shadow-none animate-fade-in">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-sm text-white">category</span>
                  </span>
                  Select Specialization
                </h3>
                {specializations.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                    <span className="material-symbols-outlined text-3xl block mb-2">medical_services</span>
                    <p className="text-sm font-medium">No doctors available</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {specializations.map((spec) => {
                      const isSelected = selectedSpecialization === spec.name;
                      const icon = SPECIALIZATION_ICONS[spec.name] || "medical_services";
                      const gradient = SPECIALIZATION_COLORS[spec.name] || "from-sky-500 to-cyan-500";
                      return (
                        <button
                          key={spec.name}
                          onClick={() => {
                            setSelectedSpecialization(spec.name);
                            setSelectedDoctorId(null);
                            setStep(2);
                          }}
                          className={`relative group text-left p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                            isSelected
                              ? "border-sky-300 dark:border-sky-500/80 bg-sky-50/60 dark:bg-slate-800/60 shadow-lg shadow-sky-500/5 scale-[1.02]"
                              : "border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-sky-50/50 dark:hover:bg-slate-850 hover:border-sky-200 dark:hover:border-slate-700 hover:scale-[1.02]"
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg mb-3`}>
                            <span className="material-symbols-outlined text-white text-lg">{icon}</span>
                          </div>
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{spec.name}</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{spec.count} doctor{spec.count > 1 ? 's' : ''}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
                {selectedSpecialization && (
                  <button
                    onClick={() => setStep(2)}
                    className="w-full mt-4 px-4 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold text-sm hover:from-sky-600 hover:to-cyan-600 transition-all shadow-lg shadow-sky-500/20 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base align-middle mr-1">arrow_forward</span>
                    Continue to Choose Doctor
                  </button>
                )}
              </div>
            )}

            {/* Step 2: Choose Doctor (Carousel) */}
            {step === 2 && (
              <div className="bg-white dark:bg-[#0F172A]/90 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-xl shadow-slate-100/50 dark:shadow-none animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-sky-500 flex items-center justify-center shadow-md">
                      <span className="material-symbols-outlined text-sm text-white">stethoscope</span>
                    </span>
                    Choose Doctor
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setStep(1)}
                      className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_back</span>
                      Change
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">search</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by doctor, specialization, or hospital..."
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-slate-100"
                  />
                </div>

                {/* Specialization filter chips */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {specializations.map(spec => (
                    <button
                      key={spec.name}
                      onClick={() => setSelectedSpecialization(spec.name)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        selectedSpecialization === spec.name
                          ? "bg-sky-500 text-white shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-sky-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      {spec.name}
                    </button>
                  ))}
                </div>

                {/* Carousel */}
                {filteredDoctors.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 dark:text-slate-500">
                    <span className="material-symbols-outlined text-3xl block mb-2">search_off</span>
                    <p className="text-sm font-medium">
                      {searchQuery ? "No doctors match your search" : "No doctors available for this specialization"}
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <div
                      ref={carouselRef}
                      className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 hide-scrollbar"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {filteredDoctors.map((doctor) => {
                        const isSelected = selectedDoctorId === doctor.id;
                        return (
                          <div
                            key={doctor.id}
                            className={`snap-start shrink-0 w-[220px] md:w-[200px] p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col items-center text-center ${
                              isSelected
                                ? "border-sky-300 dark:border-sky-500/80 bg-sky-50/60 dark:bg-slate-800/60 shadow-lg shadow-sky-500/10 scale-[1.02] ring-2 ring-sky-400/30"
                                : "border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-sky-50/50 dark:hover:bg-slate-850 hover:border-sky-200 dark:hover:border-slate-700"
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/40 z-10">
                                <span className="material-symbols-outlined text-[14px] text-white">check</span>
                              </div>
                            )}
                            <div className="relative">
                              <DoctorAvatar profile_image={doctor.profile_image} doctor_name={doctor.name} size={72} />
                              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                                doctor.available_days ? "bg-green-500" : "bg-slate-400"
                              }`} />
                            </div>
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-3">{doctor.name}</p>
                            <p className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold mt-0.5">{doctor.specialization}</p>
                            <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 dark:text-slate-500">
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">calendar_today</span>
                                {doctor.experience} yrs
                              </span>
                              {doctor.consultation_fee != null && (
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs">payments</span>
                                  {formatINR(doctor.consultation_fee)}
                                </span>
                              )}
                            </div>
                            {doctor.hospital && (
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 truncate max-w-full">{doctor.hospital}</p>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDoctorId(doctor.id);
                                setSelectedDate(undefined);
                                setSelectedSlot(null);
                                setStep(3);
                              }}
                              className={`w-full mt-4 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-500/20"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-100 dark:hover:bg-slate-700"
                              }`}
                            >
                              {isSelected ? "Selected" : "Select Doctor"}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {filteredDoctors.length > 2 && (
                      <>
                        <button
                          onClick={() => scrollCarousel(-1)}
                          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg flex items-center justify-center hover:bg-sky-50 dark:hover:bg-slate-700 transition-all cursor-pointer z-10"
                        >
                          <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 text-lg">chevron_left</span>
                        </button>
                        <button
                          onClick={() => scrollCarousel(1)}
                          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg flex items-center justify-center hover:bg-sky-50 dark:hover:bg-slate-700 transition-all cursor-pointer z-10"
                        >
                          <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 text-lg">chevron_right</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Select Date & Time */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                {/* Selected doctor summary */}
                {selectedDoctor && (
                  <div className="bg-white dark:bg-[#0F172A]/90 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 shadow-xl shadow-slate-100/50 dark:shadow-none">
                    <div className="flex items-center gap-3">
                      <DoctorAvatar profile_image={selectedDoctor.profile_image} doctor_name={selectedDoctor.name} size={48} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{selectedDoctor.name}</p>
                        <p className="text-[11px] text-sky-600 dark:text-sky-400">{selectedDoctor.specialization}</p>
                      </div>
                      <button
                        onClick={() => setStep(2)}
                        className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        Change
                      </button>
                    </div>
                  </div>
                )}

                {/* Calendar */}
                <div className="bg-white dark:bg-[#0F172A]/90 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-xl shadow-slate-100/50 dark:shadow-none">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-sky-500 flex items-center justify-center shadow-md">
                      <span className="material-symbols-outlined text-sm text-white">calendar_month</span>
                    </span>
                    Select Date
                  </h3>
                  <style>{`
                    .rdp {
                      --rdp-cell-size: 44px;
                      --rdp-accent-color: #0EA5E9;
                      --rdp-background-color: rgba(14,165,233,0.15);
                      --rdp-accent-color-dark: #0EA5E9;
                      --rdp-background-color-dark: rgba(14,165,233,0.15);
                      --rdp-outline: 2px solid rgba(14,165,233,0.5);
                      --rdp-outline-selected: 2px solid rgba(14,165,233,0.5);
                      @media (max-width: 480px) { --rdp-cell-size: 38px; }
                      margin: 0;
                    }
                    .rdp-months { justify-content: center; }
                    .rdp-month { width: 100%; }
                    .rdp-table { width: 100%; }
                    .rdp-head_cell {
                      color: #64748B;
                      font-weight: 700;
                      font-size: 11px;
                      text-transform: uppercase;
                      padding-bottom: 8px;
                    }
                    html.dark .rdp-head_cell { color: #94A3B8; }
                    .rdp-cell { text-align: center; }
                    .rdp-button_reset { border-radius: 12px !important; font-weight: 550; }
                    .rdp-day { font-size: 14px; color: #64748B; border-radius: 12px !important; transition: all 0.2s; }
                    html.dark .rdp-day { color: #CBD5E1; }
                    .rdp-day:hover:not(.rdp-day_disabled) { background: rgba(14,165,233,0.15) !important; transform: scale(1.05); }
                    .rdp-day_selected { background: #0EA5E9 !important; color: white !important; font-weight: 700; box-shadow: 0 4px 12px rgba(14,165,233,0.4); }
                    .rdp-day_selected:hover { background: #0284C7 !important; }
                    .rdp-day_disabled { color: #CBD5E1 !important; cursor: not-allowed; opacity: 0.3; }
                    html.dark .rdp-day_disabled { color: #475569 !important; }
                    .rdp-day_today { font-weight: 700; color: #0EA5E9; }
                    .rdp-nav_button { border-radius: 10px !important; padding: 4px; color: #94A3B8; }
                    .rdp-nav_button:hover { background: #F1F5F9 !important; }
                    html.dark .rdp-nav_button:hover { background: #1E293B !important; }
                    .rdp-caption { padding: 0 0 12px 0; }
                    .rdp-caption_label { font-size: 16px; font-weight: 700; color: #334155; }
                    html.dark .rdp-caption_label { color: #F1F5F9; }
                    .rdp-vhidden { display: none; }
                    .rdp-day_available { background: rgba(14,165,233,0.08); color: #0EA5E9; font-weight: 600; }
                    html.dark .rdp-day_available { background: rgba(14,165,233,0.15); color: #38BDF8; }
                  `}</style>
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setSelectedSlot(null);
                    }}
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    disabled={date => {
                      const availableDates = slots.filter(s => !s.is_booked).map(s => s.date);
                      return !(date && availableDates.includes(toLocalDateString(date)));
                    }}
                    modifiers={{
                      available: date => {
                        const availableDates = slots.filter(s => !s.is_booked).map(s => s.date);
                        return !!(date && availableDates.includes(toLocalDateString(date)));
                      }
                    }}
                    modifiersClassNames={{
                      available: "rdp-day_available"
                    }}
                  />
                </div>

                {/* Time Slots */}
                <div className="bg-white dark:bg-[#0F172A]/90 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-xl shadow-slate-100/50 dark:shadow-none">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center shadow-md">
                      <span className="material-symbols-outlined text-sm text-white">schedule</span>
                    </span>
                    {selectedDate ? "Available Slots" : "Select a date to see slots"}
                  </h3>
                  {selectedDate && (
                    <>
                      {timeSlots.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-500 animate-fade-in">
                          <span className="material-symbols-outlined text-3xl block mb-2">event_busy</span>
                          <p className="text-sm">No slots available for this date</p>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-3 mb-6 animate-fade-in">
                          {timeSlots.map(slot => (
                            <button
                              type="button"
                              key={slot.id}
                              onClick={() => setSelectedSlot(slot)}
                              className={`px-5 py-3 rounded-xl border font-bold text-sm transition-all duration-200 cursor-pointer ${
                                selectedSlot && selectedSlot.id === slot.id
                                  ? "border-cyan-400 bg-cyan-50 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 shadow-lg shadow-cyan-500/10 scale-105"
                                  : "border-slate-200/60 dark:border-slate-800 bg-[#F0F9FF] dark:bg-slate-900 text-slate-550 dark:text-slate-400 hover:border-sky-200 dark:hover:border-slate-700 hover:bg-sky-100 dark:hover:bg-slate-800"
                              }`}
                            >
                              {slot.start_time?.slice(0, 5)}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  {selectedSlot && (
                    <button
                      onClick={() => setStep(4)}
                      className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold text-sm hover:from-sky-600 hover:to-cyan-600 transition-all shadow-lg shadow-sky-500/20 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base align-middle mr-1">arrow_forward</span>
                      Continue to Review
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Review & Confirm */}
            {step === 4 && (
              <div className="bg-white dark:bg-[#0F172A]/90 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-xl shadow-slate-100/50 dark:shadow-none animate-fade-in">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-sm text-white">assignment</span>
                  </span>
                  Review & Confirm
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-slate-800/40 border border-sky-100 dark:border-slate-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Specialization</span>
                      <button onClick={() => setStep(1)} className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1 cursor-pointer">
                        <span className="material-symbols-outlined text-sm">edit</span>Change
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm text-white">
                          {SPECIALIZATION_ICONS[selectedSpecialization] || "medical_services"}
                        </span>
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{selectedSpecialization}</span>
                    </div>
                  </div>

                  {selectedDoctor && (
                    <div className="p-4 rounded-2xl bg-cyan-50/50 dark:bg-slate-800/40 border border-cyan-100 dark:border-slate-700/50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Doctor</span>
                        <button onClick={() => setStep(2)} className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1 cursor-pointer">
                          <span className="material-symbols-outlined text-sm">edit</span>Change
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <DoctorAvatar profile_image={selectedDoctor.profile_image} doctor_name={selectedDoctor.name} size={44} />
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{selectedDoctor.name}</p>
                          <p className="text-[11px] text-sky-600 dark:text-sky-400">{selectedDoctor.specialization}</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500">{selectedDoctor.experience} years experience</p>
                        </div>
                      </div>
                      {selectedDoctor.hospital && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">location_on</span>
                          {selectedDoctor.hospital}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-slate-800/40 border border-emerald-100 dark:border-slate-700/50">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-3">Date & Time</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-slate-400">calendar_today</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {selectedDate?.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-slate-400">schedule</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {selectedSlot?.start_time?.slice(0, 5)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedDoctor?.consultation_fee != null && (
                    <div className="p-4 rounded-2xl bg-violet-50/50 dark:bg-slate-800/40 border border-violet-100 dark:border-slate-700/50">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Consultation Fee</span>
                      <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{formatINR(selectedDoctor.consultation_fee)}</p>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  disabled={booking || !selectedSlot}
                  onClick={handleBook}
                  className="w-full btn-primary py-3.5 shadow-lg shadow-sky-500/25 dark:shadow-sky-500/10 cursor-pointer font-bold"
                >
                  {booking ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">event_available</span>
                      Confirm Appointment
                    </>
                  )}
                </button>
              </div>
            )}

          </div>

          {/* ─── RIGHT COLUMN: Appointments ─── */}
          <div className="lg:col-span-3 space-y-10">

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-sky-500/20 to-sky-500/5 dark:from-sky-500/10 dark:to-sky-500/5 border border-sky-200 dark:border-slate-800/80 shadow-lg shadow-sky-100 dark:shadow-none transition-colors duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 dark:bg-sky-500/5 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-slate-850 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-sky-600 dark:text-sky-400 text-xl">calendar_month</span>
                  </div>
                  <p className="text-slate-450 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Upcoming</p>
                  <p className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{appointmentCounts.upcoming}</p>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-green-500/20 to-green-500/5 dark:from-green-500/10 dark:to-green-500/5 border border-green-200 dark:border-slate-800/80 shadow-lg shadow-green-100 dark:shadow-none transition-colors duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 dark:bg-green-500/5 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-slate-850 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-xl">check_circle</span>
                  </div>
                  <p className="text-slate-450 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Completed</p>
                  <p className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{appointmentCounts.completed}</p>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-red-500/20 to-red-500/5 dark:from-red-500/10 dark:to-red-500/5 border border-red-200 dark:border-slate-800/80 shadow-lg shadow-red-100 dark:shadow-none transition-colors duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 dark:bg-red-500/5 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-slate-850 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-xl">cancel</span>
                  </div>
                  <p className="text-slate-450 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Cancelled</p>
                  <p className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{appointmentCounts.cancelled}</p>
                </div>
              </div>
            </div>

            {/* Appointments Section */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-7">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-sky-500 flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-sm text-white">event_note</span>
                  </span>
                  Appointments
                </h3>
                <div className="flex gap-2">
                  {[
                    { key: "upcoming", label: "Upcoming" },
                    { key: "completed", label: "Completed" },
                    { key: "cancelled", label: "Cancelled" }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                        activeTab === tab.key
                          ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30"
                          : "bg-sky-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="animate-pulse bg-white dark:bg-[#0F172A]/90 border border-slate-150 dark:border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-lg shadow-slate-100/50">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-850" />
                        <div className="flex-1 space-y-3">
                          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3" />
                          <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded-lg w-1/4" />
                          <div className="flex gap-4">
                            <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded-lg w-20" />
                            <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded-lg w-20" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !Array.isArray(filteredAppointments) || filteredAppointments.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-[#0F172A]/90 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-xl shadow-slate-100/50 dark:shadow-none transition-colors duration-300">
                  <EmptyAppointments className="w-40 h-32 mx-auto mb-4 opacity-60 dark:opacity-40" />
                  <p className="text-slate-400 dark:text-slate-500 text-base font-semibold">No {activeTab} appointments</p>
                  <p className="text-slate-550 dark:text-slate-500 text-sm mt-1">Your scheduled appointments will appear here.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredAppointments.map(appointment => {
                    const doctor = doctors.find(d => d.id === appointment.doctor_id);
                    const specialization = doctor?.specialization || "General Physician";
                    const status = (appointment.status || "").toLowerCase();
                    let badgeClass = "";
                    let badgeText = appointment.status ? appointment.status.toUpperCase() : "BOOKED";
                    if (["booked", "upcoming"].includes(status)) {
                      badgeClass = "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200/65 dark:border-green-500/20";
                      badgeText = "BOOKED";
                    } else if (status === "completed") {
                      badgeClass = "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-200/65 dark:border-cyan-500/20";
                      badgeText = "COMPLETED";
                    } else if (status === "cancelled") {
                      badgeClass = "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200/65 dark:border-red-500/20";
                      badgeText = "CANCELLED";
                    }
                    return (
                      <div
                        key={appointment.id}
                        className="bg-white dark:bg-[#0F172A]/90 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-xl shadow-slate-100/50 dark:shadow-none transition-all duration-200 hover:bg-slate-50/50 dark:hover:bg-slate-850 hover:border-sky-200 dark:hover:border-slate-700"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                          <DoctorAvatar profile_image={doctor?.profile_image} doctor_name={appointment.doctor_name} size={64} />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div>
                                <p className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                                  {appointment.doctor_name || `Doctor #${appointment.doctor_id}`}
                                </p>
                                <p className="text-sm text-sky-600 dark:text-sky-400 font-bold mt-0.5">{specialization}</p>
                              </div>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide ${badgeClass}`}>
                                {badgeText}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-6 mt-4 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-base">calendar_today</span>
                                <span className="text-slate-800 dark:text-slate-200 font-semibold">
                                  {appointment.date ? new Date(appointment.date).toLocaleDateString("en-US", {
                                    month: "short", day: "numeric", year: "numeric"
                                  }) : "-"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-base">schedule</span>
                                <span className="text-slate-800 dark:text-slate-200 font-semibold">
                                  {appointment.start_time ? new Date(`1970-01-01T${appointment.start_time}`).toLocaleTimeString([], {
                                    hour: "2-digit", minute: "2-digit"
                                  }) : "-"}
                                </span>
                              </div>
                            </div>
                          </div>
                          {appointment.status === "booked" && (
                            <div className="flex items-center gap-3 mt-4 sm:mt-0">
                              <button
                                onClick={() => setRescheduleTarget(appointment)}
                                className="px-5 py-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold text-xs border border-cyan-200/80 dark:border-cyan-800 hover:bg-cyan-100 dark:hover:bg-cyan-800/40 transition-all duration-200 flex items-center gap-1.5 cursor-pointer animate-scale-in"
                              >
                                <span className="material-symbols-outlined text-base">edit_calendar</span>
                                Reschedule
                              </button>
                              <button
                                onClick={() => handleCancel(appointment.id)}
                                className="px-5 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-xs border border-red-200/80 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-800/40 transition-all duration-200 flex items-center gap-1.5 cursor-pointer animate-scale-in"
                              >
                                <span className="material-symbols-outlined text-base">cancel</span>
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      {rescheduleTarget && (
        <RescheduleModal
          appointment={rescheduleTarget}
          doctor={doctors.find(d => d.id === rescheduleTarget.doctor_id)}
          onClose={() => setRescheduleTarget(null)}
          onReschedule={handleReschedule}
        />
      )}
    </div>
  );
}

function RescheduleModal({ appointment, doctor, onClose, onReschedule }) {
  const [doctorSlots, setDoctorSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await API.get(`/doctor/slots/${appointment.doctor_id}`);
        setDoctorSlots(Array.isArray(res.data) ? res.data : []);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [appointment.doctor_id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSlotId) return;
    onReschedule(appointment.id, Number(selectedSlotId));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-4 mb-6">
          <DoctorAvatar profile_image={doctor?.profile_image} doctor_name={doctor?.name} size={56} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-600 dark:text-cyan-400">calendar_month</span>
                Reschedule
              </h3>
              <button onClick={onClose} className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 truncate">
              {doctor?.name || `Appointment #${appointment.id}`}
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-slate-505 dark:text-slate-400 uppercase tracking-wider mb-2 block">Select New Time Slot</label>
            {loading ? (
              <div className="p-6 bg-[#F0F9FF] dark:bg-slate-950 rounded-2xl border border-sky-100 dark:border-slate-800 text-center animate-pulse">
                <span className="w-5 h-5 border-2 border-sky-200 dark:border-slate-800 border-t-sky-500 rounded-full animate-spin inline-block" />
                <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Loading slots...</p>
              </div>
            ) : doctorSlots.length === 0 ? (
              <div className="p-6 bg-[#F0F9FF] dark:bg-slate-950 rounded-2xl border border-sky-100 dark:border-slate-800 text-center text-slate-500 dark:text-slate-450 text-sm font-medium">
                No available slots
              </div>
            ) : (
              <div className="flex flex-wrap gap-3 max-h-60 overflow-y-auto pr-1">
                {doctorSlots.filter((s) => !s.is_booked).map((slot) => (
                  <button
                    type="button"
                    key={slot.id}
                    onClick={() => setSelectedSlotId(String(slot.id))}
                    className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all duration-200 cursor-pointer ${
                      selectedSlotId === String(slot.id)
                        ? "border-cyan-400 bg-cyan-50 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 shadow-lg shadow-cyan-500/10 scale-105"
                        : "border-slate-200/60 dark:border-slate-800 bg-[#F0F9FF] dark:bg-slate-900 text-slate-550 dark:text-slate-400 hover:border-sky-200 dark:hover:border-slate-700 hover:bg-sky-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {new Date(slot.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    {" "}
                    {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={!selectedSlotId}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold text-sm hover:from-sky-600 hover:to-cyan-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-sky-500/20 dark:shadow-sky-500/10 cursor-pointer">
              Confirm Reschedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
