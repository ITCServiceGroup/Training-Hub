export const truncateChartLabel = (value, maximumLength = 18) => {
  const label = String(value ?? "").trim();

  if (label.length <= maximumLength) return label;
  if (maximumLength <= 1) return "…";

  return `${label.slice(0, maximumLength - 1).trimEnd()}…`;
};
