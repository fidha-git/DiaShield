export function formatINR(value) {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}
