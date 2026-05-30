  // Appointment counts for summary cards

import React, { useState, useEffect, useMemo } from "react";
import API from "../services/api";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function Appointments() {
  // State declarations (all at top, before any useMemo/useEffect)
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState();
  const [slots, setSlots] = useState([]);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  // useMemo hooks after state declarations
  const filteredAppointments = useMemo(() => {
    if (!Array.isArray(appointments)) return [];
    if (activeTab === "upcoming") {
      // Treat 'booked' and 'upcoming' as upcoming
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
      return {
        upcoming: 0,
        completed: 0,
        cancelled: 0
      };
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


  // Helper to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    // Fetch doctors and appointments on mount
    const fetchDoctors = async () => {
      setError("");
      console.log("Fetching doctors...");
      try {
        const response = await API.get("/doctor/all", { headers: getAuthHeaders() });
        console.log("Doctors:", response.data);
        setDoctors(Array.isArray(response.data) ? response.data : []);
        if (Array.isArray(response.data) && response.data.length > 0) {
          setSelectedDoctorId(response.data[0].id);
        }
      } catch (error) {
        setDoctors([]);
        const errorMessage =
          error?.response?.data?.detail?.[0]?.msg ||
          error?.response?.data?.detail ||
          error.message ||
          "Something went wrong";
        setError(String(errorMessage));
        console.error("Doctor fetch failed:", error);
      }
    };
    const fetchAppointments = async () => {
      await loadAppointments();
    };
    fetchDoctors();
    fetchAppointments();
  }, []);


  useEffect(() => {
    // Fetch slots for selected doctor
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
        setSlots(loadedSlots);
        // Set calendar month to earliest available slot, or current month if none
        if (loadedSlots.length > 0) {
          const availableDates = loadedSlots.filter(s => !s.is_booked).map(s => s.date).sort();
          if (availableDates.length > 0) {
            setCalendarMonth(new Date(availableDates[0]));
          } else {
            setCalendarMonth(new Date());
          }
        } else {
          setCalendarMonth(new Date());
        }
      } catch (error) {
        setSlots([]);
        setCalendarMonth(new Date());
        const errorMessage =
          error?.response?.data?.detail?.[0]?.msg ||
          error?.response?.data?.detail ||
          error.message ||
          "Something went wrong";
        setError(String(errorMessage));
      }
    };
    fetchSlots();
  }, [selectedDoctorId]);

  // ==========================
  // Load Appointments
  // ==========================

  const loadAppointments = async () => {

    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      console.log("Appointment token:", token);
      if (!token) {
        setAppointments([]);
        setError("Please login again");
        setLoading(false);
        return;
      }
      const response =
        await API.get(
          "/appointments/my-appointments",
          { headers: { Authorization: `Bearer ${token}` } }
        );
      console.log("Appointment response:", response.data);
      let appts = [];
      if (Array.isArray(response.data)) {
        appts = response.data;
      } else if (Array.isArray(response.data.appointments)) {
        appts = response.data.appointments;
      }
      if (!Array.isArray(appts)) appts = [];
      setAppointments(appts);

    }
    catch (error) {

      const errorMessage =
        error?.response?.data?.detail?.[0]?.msg ||
        error?.response?.data?.detail ||
        error.message ||
        "Something went wrong";
      setError(String(errorMessage));
      setAppointments([]);
      console.log("Appointment fetch error:", error.response?.data || error.message);

    }
    finally {

      setLoading(false);

    }

  };


  // ==========================
  // Book Appointment
  // ==========================

  const handleBook =
    async (e) => {
      e.preventDefault();
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
        const selectedSlotId = selectedSlot.id;
        const bookingPayload = {
          doctor_id: Number(selectedDoctorId),
          slot_id: Number(selectedSlotId)
        };
        console.log("Booking payload:", bookingPayload);
        const response = await API.post(
          `/appointments/book/${selectedSlotId}`,
          bookingPayload,
          { headers: getAuthHeaders() }
        );
        console.log("Booking response:", response.data);
        setSuccess("Appointment booked successfully.");
        await loadAppointments();
      } catch (error) {
        const errorMessage =
          error?.response?.data?.detail?.[0]?.msg ||
          error?.response?.data?.detail ||
          error.message ||
          "Something went wrong";
        setError(String(errorMessage));
        console.log("Booking error:", error.response?.data || error.message);
      } finally {
        setBooking(false);
      }
    };


  // ==========================
  // Cancel Appointment
  // ==========================

  const handleCancel = async (id) => {
    setError("");
    setSuccess("");
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    // Optimistically remove from UI
    setAppointments(prev => prev.filter(a => a.id !== id));
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not logged in.");
        return;
      }
      await API.delete(`/appointments/cancel/${id}`, { headers: getAuthHeaders() });
      setSuccess("Appointment cancelled.");
      // Refresh appointments to update counts and slot availability
      await loadAppointments();
    } catch (error) {
      const errorMessage =
        error?.response?.data?.detail?.[0]?.msg ||
        error?.response?.data?.detail ||
        error.message ||
        "Something went wrong";
      setError(String(errorMessage));
      // Optionally, reload appointments if error
      await loadAppointments();
    }
  };


  return (

<div className="p-unit-6 md:p-gutter min-h-screen">

<div className="max-w-container-max mx-auto">

<header className="mb-unit-8">

<h2
className="
font-display-lg
text-[32px]
text-on-surface
"
>

Appointments

</h2>

<p
className="
font-body-md
text-on-surface-variant
mt-1
"
>

Book consultations with your care team.

</p>

</header>

<div
className="
grid
grid-cols-1
lg:grid-cols-3
gap-unit-6
"
>

{/* Left Side */}

<div className="lg:col-span-1">

<div
className="
glass-card
rounded-xl
p-unit-6
"
>

<h3
className="
font-headline-md
text-white
font-semibold
mb-6
"
>

Book Consultation

</h3>


<form onSubmit={handleBook} className="space-y-4">
  {/* Doctor select */}
  <select
    className="input-glass w-full rounded-lg px-3 py-3"
    value={selectedDoctorId || ""}
    onChange={e => {
      setSelectedDoctorId(Number(e.target.value));
      setSelectedDate(undefined);
      setSelectedSlot(null);
    }}
  >
    {doctors.length === 0 && <option value="">No doctors available</option>}
    {doctors.map(doctor => (
      <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
    ))}
  </select>

  {/* Calendar for available dates */}
  <div>
    <DayPicker
      mode="single"
      selected={selectedDate}
      onSelect={setSelectedDate}
      month={calendarMonth}
      onMonthChange={setCalendarMonth}
      disabled={date => {
        const availableDates = slots.filter(s => !s.is_booked).map(s => s.date);
        return !availableDates.includes(date?.toISOString().slice(0, 10));
      }}
      modifiers={{
        available: date => {
          const availableDates = slots.filter(s => !s.is_booked).map(s => s.date);
          return availableDates.includes(date?.toISOString().slice(0, 10));
        }
      }}
      modifiersClassNames={{
        available: "bg-secondary-container text-white"
      }}
      className="mb-4"
    />
  </div>

  {/* Time slot buttons */}
  {selectedDate && (
    <div className="flex flex-wrap gap-2 mb-4">
      {slots.filter(s => !s.is_booked && s.date === selectedDate.toISOString().slice(0, 10)).length === 0 && (
        <span className="text-on-surface-variant">No slots for this date</span>
      )}
      {slots.filter(s => !s.is_booked && s.date === selectedDate.toISOString().slice(0, 10)).map(slot => (
        <button
          type="button"
          key={slot.id}
          className={`px-4 py-2 rounded-lg border ${selectedSlot && selectedSlot.id === slot.id ? "bg-secondary-container text-white" : "bg-black/30 text-white border-white/10"}`}
          onClick={() => setSelectedSlot(slot)}
        >
          {slot.start_time}
        </button>
      ))}
    </div>
  )}

  <button
    type="submit"
    disabled={booking || !selectedSlot}
    className="w-full bg-secondary-container hover:bg-[#7222da] text-white py-3 rounded-lg font-semibold"
  >
    {booking ? "Booking..." : "Book Appointment"}
  </button>
</form>

{/* Error/Success messages */}
{error && (
  <div className="text-red-400 mb-2">{error}</div>
)}
{success && (
  <div className="text-green-400 mb-2">{success}</div>
)}

</div>

</div>

{/* Right Side */}

<div className="lg:col-span-2">

<div
className="
glass-card
rounded-xl
p-unit-6
"
>


{/* Appointment Count Summary Cards */}
<div className="flex flex-col sm:flex-row gap-4 mb-6">
  <div className="flex-1 glass-card rounded-xl p-4 flex flex-col items-center justify-center bg-gradient-to-br from-[#6f3ad1]/80 to-[#2d1b4e]/80 border border-white/10 shadow">
    <span className="text-lg font-semibold text-white mb-1">Upcoming Appointments</span>
    <span className="text-3xl font-bold text-secondary-container">{appointmentCounts.upcoming}</span>
  </div>
  <div className="flex-1 glass-card rounded-xl p-4 flex flex-col items-center justify-center bg-gradient-to-br from-blue-700/80 to-blue-900/80 border border-white/10 shadow">
    <span className="text-lg font-semibold text-white mb-1">Completed</span>
    <span className="text-3xl font-bold text-blue-200">{appointmentCounts.completed}</span>
  </div>
  <div className="flex-1 glass-card rounded-xl p-4 flex flex-col items-center justify-center bg-gradient-to-br from-red-700/80 to-red-900/80 border border-white/10 shadow">
    <span className="text-lg font-semibold text-white mb-1">Cancelled</span>
    <span className="text-3xl font-bold text-red-200">{appointmentCounts.cancelled}</span>
  </div>
</div>

{/* Appointment Status Tabs */}
<div className="flex gap-4 mb-6">
  {[
    { key: "upcoming", label: "Upcoming" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" }
  ].map(tab => (
    <button
      key={tab.key}
      onClick={() => setActiveTab(tab.key)}
      className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-150
        ${activeTab === tab.key
          ? "bg-secondary-container text-white shadow"
          : "bg-white/10 text-white hover:bg-secondary-container/80"}
      `}
      style={{ minWidth: 120 }}
    >
      {tab.label}
    </button>
  ))}
</div>

<h3
  className="font-headline-md text-white font-semibold mb-6"
>
  Scheduled Appointments
</h3>

{loading ? (
  <p className="text-white">Loading...</p>
) : !Array.isArray(filteredAppointments) || filteredAppointments.length === 0 ? (
  <p className="text-on-surface-variant">No appointments</p>
) : (
  <div className="space-y-4">
    {filteredAppointments.map(appointment => {
      // Find doctor specialization
      const doctor = doctors.find(d => d.id === appointment.doctor_id);
      const specialization = doctor?.specialization || "General Physician";

      // Status badge color logic
      const status = (appointment.status || "").toLowerCase();
      let badgeClass = "";
      let badgeText = appointment.status ? appointment.status.toUpperCase() : "BOOKED";
      if (["booked", "upcoming"].includes(status)) {
        badgeClass = "bg-green-600 text-white";
        badgeText = "BOOKED";
      } else if (status === "completed") {
        badgeClass = "bg-blue-700 text-white";
        badgeText = "COMPLETED";
      } else if (status === "cancelled") {
        badgeClass = "bg-red-600 text-white";
        badgeText = "CANCELLED";
      }
      return (
        <div
          key={appointment.id}
          className="glass-card bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-200 hover:shadow-xl"
        >
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg text-white truncate">
                  {appointment.doctor_name || `Doctor #${appointment.doctor_id}`}
                </p>
                <p className="text-sm text-secondary-container font-medium mb-1 truncate">
                  {specialization}
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <div className="flex flex-col">
                    <span className="text-xs text-on-surface-variant">Date</span>
                    <span className="text-base text-white font-semibold">
                      {appointment.date ? new Date(appointment.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      }) : "-"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-on-surface-variant">Time</span>
                    <span className="text-base text-white font-semibold">
                      {appointment.start_time ? new Date(`1970-01-01T${appointment.start_time}`).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      }) : "-"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-on-surface-variant">Status</span>
                    <span className={`mt-1 inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide ${badgeClass}`}>
                      {badgeText}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end sm:justify-center">
            <button
              onClick={() => handleCancel(appointment.id)}
              className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold shadow transition-all duration-150"
            >
              Cancel
            </button>
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

</div>

);

}