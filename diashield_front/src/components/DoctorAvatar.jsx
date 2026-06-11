import React, { useState } from "react";

const AVATAR_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export default function DoctorAvatar({ profile_image, doctor_name, size = 60 }) {
  const [imgError, setImgError] = useState(false);

  const imgSrc = profile_image ? `${AVATAR_BASE}${profile_image}` : null;
  const showImage = imgSrc && !imgError;

  return (
    <div
      className="flex-shrink-0 rounded-full overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center ring-2 ring-white/10"
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <img
          src={imgSrc}
          alt={doctor_name || "Doctor"}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span
          className="material-symbols-outlined text-white"
          style={{ fontSize: size * 0.55 }}
        >
          person
        </span>
      )}
    </div>
  );
}
