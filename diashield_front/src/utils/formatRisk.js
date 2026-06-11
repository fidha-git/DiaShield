export function formatRisk(probability) {
  if (probability == null || isNaN(probability)) return "N/A";
  const pct = probability * 100;
  if (pct === 0) return "0%";
  if (pct < 1) return "<1%";
  if (pct < 10) return `${pct.toFixed(1)}%`;
  return `${Math.round(pct)}%`;
}
