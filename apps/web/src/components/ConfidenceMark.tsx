interface ConfidenceMarkProps {
  confidence: number; // 0..1
}

function band(confidence: number): { color: string; label: string } {
  if (confidence >= 0.85) return { color: "var(--color-done)", label: "high confidence" };
  if (confidence >= 0.6) return { color: "var(--color-tertiary)", label: "medium confidence" };
  return { color: "var(--color-error)", label: "low confidence" };
}

export function ConfidenceMark({ confidence }: ConfidenceMarkProps) {
  const { color, label } = band(confidence);
  const radius = 9;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * confidence;

  return (
    <div
      role="img"
      aria-label={`${Math.round(confidence * 100)} percent confidence — ${label}`}
      style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-1)" }}
    >
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
        <circle cx="11" cy="11" r={radius} fill="none" stroke="var(--color-outline-variant)" strokeWidth="3" />
        <circle
          cx="11"
          cy="11"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 11 11)"
        />
      </svg>
      <span style={{ font: "var(--type-label-medium)", color: "var(--color-on-surface-variant)" }}>
        {Math.round(confidence * 100)}%
      </span>
    </div>
  );
}
