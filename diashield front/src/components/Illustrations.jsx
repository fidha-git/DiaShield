import React from "react";

export function HealthcareHero({ className = "" }) {
  return (
    <svg viewBox="0 0 400 300" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hero-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="hero-grad-2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <rect x="50" y="40" width="300" height="220" rx="24" fill="url(#hero-grad)" stroke="rgba(14,165,233,0.15)" strokeWidth="1" />
      <circle cx="200" cy="150" r="60" fill="url(#hero-grad-2)" stroke="rgba(14,165,233,0.2)" strokeWidth="1" />
      <circle cx="200" cy="150" r="40" fill="rgba(14,165,233,0.08)" stroke="rgba(14,165,233,0.2)" strokeWidth="1" />
      <circle cx="200" cy="150" r="20" fill="rgba(14,165,233,0.15)" />
      <path d="M195 140v20M185 150h20" stroke="#0EA5E9" strokeWidth="3" strokeLinecap="round" />
      <path d="M120 95c0-8.8 7.2-16 16-16h8c8.8 0 16 7.2 16 16v8c0 8.8-7.2 16-16 16h-8c-8.8 0-16-7.2-16-16v-8z" fill="rgba(14,165,233,0.12)" stroke="rgba(14,165,233,0.3)" strokeWidth="1" />
      <path d="M128 99h16M136 91v16" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" />
      <path d="M260 200c0-8.8 7.2-16 16-16h8c8.8 0 16 7.2 16 16v8c0 8.8-7.2 16-16 16h-8c-8.8 0-16-7.2-16-16v-8z" fill="rgba(56,189,248,0.1)" stroke="rgba(56,189,248,0.25)" strokeWidth="1" />
      <path d="M268 204h16M276 196v16" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
      <path d="M85 120l15-10 15 10 15-10 15 10" stroke="rgba(14,165,233,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M85 130l15-10 15 10 15-10 15 10" stroke="rgba(56,189,248,0.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M270 80h30" stroke="rgba(14,165,233,0.2)" strokeWidth="2" strokeLinecap="round" />
      <path d="M270 90h20" stroke="rgba(14,165,233,0.15)" strokeWidth="2" strokeLinecap="round" />
      <path d="M270 100h25" stroke="rgba(14,165,233,0.1)" strokeWidth="2" strokeLinecap="round" />
      <path d="M310 80c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10-10-4.5-10-10z" fill="rgba(14,165,233,0.08)" stroke="rgba(14,165,233,0.2)" strokeWidth="1" />
    </svg>
  );
}

export function EmptyAppointments({ className = "" }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="20" width="140" height="120" rx="12" fill="rgba(0,0,0,0.02)" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
      <rect x="50" y="40" width="100" height="8" rx="4" fill="rgba(0,0,0,0.04)" />
      <rect x="50" y="58" width="80" height="6" rx="3" fill="rgba(0,0,0,0.03)" />
      <rect x="50" y="74" width="60" height="6" rx="3" fill="rgba(0,0,0,0.03)" />
      <rect x="50" y="95" width="100" height="1" rx="0.5" fill="rgba(0,0,0,0.04)" />
      <rect x="50" y="105" width="70" height="6" rx="3" fill="rgba(0,0,0,0.03)" />
      <circle cx="100" cy="30" r="4" fill="rgba(239,68,68,0.3)" stroke="rgba(239,68,68,0.5)" strokeWidth="1" />
      <path d="M60 130l80-30" stroke="rgba(239,68,68,0.15)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="60" cy="130" r="3" fill="rgba(239,68,68,0.3)" />
      <circle cx="140" cy="100" r="3" fill="rgba(239,68,68,0.3)" />
    </svg>
  );
}

export function EmptyHealthRecords({ className = "" }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="20" width="120" height="130" rx="8" fill="rgba(0,0,0,0.02)" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
      <rect x="60" y="35" width="80" height="6" rx="3" fill="rgba(0,0,0,0.04)" />
      <rect x="60" y="50" width="60" height="4" rx="2" fill="rgba(0,0,0,0.03)" />
      <line x1="60" y1="65" x2="140" y2="65" stroke="rgba(0,0,0,0.04)" strokeWidth="1" />
      <rect x="60" y="78" width="70" height="4" rx="2" fill="rgba(0,0,0,0.03)" />
      <rect x="60" y="90" width="50" height="4" rx="2" fill="rgba(0,0,0,0.03)" />
      <line x1="60" y1="105" x2="140" y2="105" stroke="rgba(0,0,0,0.04)" strokeWidth="1" />
      <rect x="60" y="118" width="65" height="4" rx="2" fill="rgba(0,0,0,0.03)" />
      <rect x="60" y="130" width="45" height="4" rx="2" fill="rgba(0,0,0,0.03)" />
      <circle cx="145" cy="140" r="12" fill="rgba(14,165,233,0.1)" stroke="rgba(14,165,233,0.2)" strokeWidth="1" />
      <path d="M141 140h8M145 136v8" stroke="#0EA5E9" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="55" cy="140" r="12" fill="rgba(56,189,248,0.1)" stroke="rgba(56,189,248,0.2)" strokeWidth="1" />
      <path d="M51 140h8M55 136v8" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyPrescriptions({ className = "" }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="55" y="20" width="90" height="120" rx="12" fill="rgba(0,0,0,0.02)" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
      <rect x="70" y="35" width="60" height="8" rx="4" fill="rgba(0,0,0,0.04)" />
      <rect x="70" y="52" width="50" height="6" rx="3" fill="rgba(0,0,0,0.03)" />
      <rect x="70" y="65" width="55" height="6" rx="3" fill="rgba(0,0,0,0.03)" />
      <rect x="70" y="78" width="45" height="6" rx="3" fill="rgba(0,0,0,0.03)" />
      <line x1="70" y1="95" x2="130" y2="95" stroke="rgba(0,0,0,0.04)" strokeWidth="1" />
      <rect x="70" y="105" width="50" height="6" rx="3" fill="rgba(0,0,0,0.03)" />
      <rect x="70" y="118" width="35" height="6" rx="3" fill="rgba(0,0,0,0.03)" />
      <path d="M50 130l100-20" stroke="rgba(239,68,68,0.15)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="50" cy="130" r="3" fill="rgba(239,68,68,0.3)" />
    </svg>
  );
}

export function EmptyReports({ className = "" }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="50" y="25" width="100" height="110" rx="8" fill="rgba(0,0,0,0.02)" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
      <rect x="65" y="40" width="70" height="6" rx="3" fill="rgba(0,0,0,0.04)" />
      <rect x="65" y="55" width="55" height="4" rx="2" fill="rgba(0,0,0,0.03)" />
      <rect x="65" y="67" width="60" height="4" rx="2" fill="rgba(0,0,0,0.03)" />
      <line x1="65" y1="80" x2="135" y2="80" stroke="rgba(0,0,0,0.04)" strokeWidth="1" />
      <rect x="65" y="90" width="50" height="4" rx="2" fill="rgba(0,0,0,0.03)" />
      <rect x="65" y="102" width="65" height="4" rx="2" fill="rgba(0,0,0,0.03)" />
      <rect x="65" y="114" width="40" height="4" rx="2" fill="rgba(0,0,0,0.03)" />
      <path d="M50 30l20 10-20 10" stroke="rgba(239,68,68,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="155" cy="40" r="12" fill="rgba(14,165,233,0.08)" stroke="rgba(14,165,233,0.15)" strokeWidth="1" />
      <path d="M149 40l4 4 6-8" stroke="#0EA5E9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AIHealthcareIllustration({ className = "" }) {
  return (
    <svg viewBox="0 0 400 300" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ai-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <rect x="40" y="30" width="320" height="240" rx="24" fill="url(#ai-grad)" stroke="rgba(14,165,233,0.12)" strokeWidth="1" />
      <circle cx="200" cy="140" r="70" fill="rgba(14,165,233,0.06)" stroke="rgba(14,165,233,0.15)" strokeWidth="1" />
      <circle cx="200" cy="140" r="50" fill="rgba(56,189,248,0.06)" stroke="rgba(56,189,248,0.12)" strokeWidth="1" />
      <circle cx="200" cy="140" r="30" fill="rgba(14,165,233,0.08)" stroke="rgba(14,165,233,0.15)" strokeWidth="1" />
      <path d="M200 120v40M180 140h40" stroke="#0EA5E9" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M120 100l15-8 15 8 15-8 15 8" stroke="rgba(14,165,233,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M120 115l15-8 15 8 15-8 15 8" stroke="rgba(56,189,248,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M120 130l15-8 15 8 15-8 15 8" stroke="rgba(14,165,233,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="260" y="80" width="60" height="40" rx="8" fill="rgba(14,165,233,0.08)" stroke="rgba(14,165,233,0.2)" strokeWidth="1" />
      <rect x="270" y="90" width="40" height="4" rx="2" fill="rgba(14,165,233,0.15)" />
      <rect x="270" y="100" width="25" height="4" rx="2" fill="rgba(14,165,233,0.1)" />
      <rect x="260" y="135" width="60" height="40" rx="8" fill="rgba(56,189,248,0.08)" stroke="rgba(56,189,248,0.2)" strokeWidth="1" />
      <rect x="270" y="145" width="40" height="4" rx="2" fill="rgba(56,189,248,0.15)" />
      <rect x="270" y="155" width="25" height="4" rx="2" fill="rgba(56,189,248,0.1)" />
      <circle cx="80" cy="195" r="18" fill="rgba(14,165,233,0.08)" stroke="rgba(14,165,233,0.15)" strokeWidth="1" />
      <circle cx="80" cy="195" r="8" fill="rgba(14,165,233,0.15)" />
      <path d="M78 192v6M75 195h6" stroke="#0EA5E9" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="100" cy="80" r="8" fill="rgba(56,189,248,0.12)" stroke="rgba(56,189,248,0.2)" strokeWidth="1" />
      <path d="M280 190l15-10 15 10 15-10 15 10" stroke="rgba(14,165,233,0.15)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="200" cy="230" r="5" fill="rgba(0,0,0,0.03)" />
    </svg>
  );
}

export function HealthcareArtwork({ className = "" }) {
  return (
    <svg viewBox="0 0 500 600" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="artwork-bg" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.05" />
        </radialGradient>
      </defs>
      <rect width="500" height="600" rx="24" fill="url(#artwork-bg)" />
      <circle cx="250" cy="280" r="140" fill="rgba(14,165,233,0.06)" stroke="rgba(14,165,233,0.1)" strokeWidth="1" />
      <circle cx="250" cy="280" r="100" fill="rgba(56,189,248,0.04)" stroke="rgba(56,189,248,0.08)" strokeWidth="1" />
      <circle cx="250" cy="280" r="60" fill="rgba(14,165,233,0.06)" stroke="rgba(14,165,233,0.12)" strokeWidth="1" />
      <circle cx="250" cy="280" r="25" fill="rgba(14,165,233,0.12)" />
      <path d="M243 268v14M250 261v7M257 268v14" stroke="#0EA5E9" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M235 275h30" stroke="#0EA5E9" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M120 150l20-12 20 12 20-12 20 12" stroke="rgba(14,165,233,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M120 165l20-12 20 12 20-12 20 12" stroke="rgba(56,189,248,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M340 380l20-12 20 12 20-12 20 12" stroke="rgba(14,165,233,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="140" y="400" width="80" height="50" rx="10" fill="rgba(14,165,233,0.06)" stroke="rgba(14,165,233,0.15)" strokeWidth="1" />
      <rect x="155" y="412" width="50" height="5" rx="2.5" fill="rgba(14,165,233,0.12)" />
      <rect x="155" y="422" width="35" height="4" rx="2" fill="rgba(14,165,233,0.08)" />
      <rect x="155" y="432" width="45" height="4" rx="2" fill="rgba(14,165,233,0.08)" />
      <rect x="280" y="400" width="80" height="50" rx="10" fill="rgba(56,189,248,0.06)" stroke="rgba(56,189,248,0.15)" strokeWidth="1" />
      <rect x="295" y="412" width="50" height="5" rx="2.5" fill="rgba(56,189,248,0.12)" />
      <rect x="295" y="422" width="35" height="4" rx="2" fill="rgba(56,189,248,0.08)" />
      <rect x="295" y="432" width="45" height="4" rx="2" fill="rgba(56,189,248,0.08)" />
      <rect x="280" y="140" width="80" height="50" rx="10" fill="rgba(14,165,233,0.06)" stroke="rgba(14,165,233,0.15)" strokeWidth="1" />
      <rect x="295" y="152" width="50" height="5" rx="2.5" fill="rgba(14,165,233,0.12)" />
      <rect x="295" y="162" width="35" height="4" rx="2" fill="rgba(14,165,233,0.08)" />
      <circle cx="160" cy="210" r="8" fill="rgba(14,165,233,0.1)" stroke="rgba(14,165,233,0.2)" strokeWidth="1" />
      <path d="M157 210h6M160 207v6" stroke="#0EA5E9" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="340" cy="210" r="8" fill="rgba(56,189,248,0.1)" stroke="rgba(56,189,248,0.2)" strokeWidth="1" />
      <path d="M337 210h6M340 207v6" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="250" cy="460" r="5" fill="rgba(0,0,0,0.03)" />
      <circle cx="400" cy="300" r="4" fill="rgba(14,165,233,0.15)" />
      <circle cx="100" cy="350" r="4" fill="rgba(56,189,248,0.15)" />
      <path d="M240 285l10 10 15-15" stroke="rgba(14,165,233,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
