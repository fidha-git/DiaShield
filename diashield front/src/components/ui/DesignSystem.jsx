import React from "react";

const buttonVariants = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  danger: "btn-danger",
  success: "btn-success",
  outline: "btn-outline",
};

const buttonSizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-3 text-base",
  lg: "px-6 py-3.5 text-base",
};

export function PageContainer({ children, className = "" }) {
  return <div className={`page-container ${className}`}>{children}</div>;
}

export function PageHeader({ title, subtitle, icon, action, className = "" }) {
  return (
    <div className={`page-header ${className}`}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          {icon ? (
            <div className="inline-flex items-center gap-3 rounded-full bg-sky-100 px-4 py-2 text-sky-700">
              <span className="material-symbols-outlined text-lg">{icon}</span>
              <span className="text-sm font-semibold uppercase tracking-[0.2em]">{title}</span>
            </div>
          ) : null}
          <div className="space-y-2">
            <h1 className="page-heading">{title}</h1>
            {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
          </div>
        </div>
        {action ? <div className="flex flex-wrap gap-3">{action}</div> : null}
      </div>
    </div>
  );
}

export function Card({ children, className = "" }) {
  return <div className={`ds-card ${className}`}>{children}</div>;
}

export function Button({ variant = "primary", size = "md", className = "", as = "button", children, ...props }) {
  const Component = as;
  return (
    <Component className={`${buttonVariants[variant] || buttonVariants.primary} ${buttonSizes[size] || buttonSizes.md} ${className}`} {...props}>
      {children}
    </Component>
  );
}

export function FormField({ label, htmlFor, children, className = "" }) {
  return (
    <label htmlFor={htmlFor} className={`ds-form-field ${className}`}>
      {label ? <span className="ds-form-label">{label}</span> : null}
      {children}
    </label>
  );
}

export function Input({ className = "", ...props }) {
  return <input className={`ds-input ${className}`} {...props} />;
}

export function Select({ className = "", children, ...props }) {
  return (
    <select className={`ds-select ${className}`} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ className = "", ...props }) {
  return <textarea className={`ds-textarea ${className}`} {...props} />;
}

export function TableWrapper({ children, className = "" }) {
  return <div className={`ds-table-wrapper ${className}`}>{children}</div>;
}

export function ModalOverlay({ children, onClose, className = "" }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className={`w-full max-w-xl ${className}`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
