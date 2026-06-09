import React from "react";

const btnBase = "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all";
const btnOutline = "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50";
const btnDisabled = "opacity-50 cursor-not-allowed";

export default function SimplePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  itemLabel = "records",
}) {
  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
      <p className="text-sm text-slate-500">
        Showing {from}-{to} of {totalItems} {itemLabel}
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`${btnBase} ${btnOutline} ${currentPage <= 1 ? btnDisabled : ""}`}
        >
          ← Previous
        </button>
        <span className="text-sm font-medium text-slate-700 select-none">
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={`${btnBase} ${btnOutline} ${currentPage >= totalPages ? btnDisabled : ""}`}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
