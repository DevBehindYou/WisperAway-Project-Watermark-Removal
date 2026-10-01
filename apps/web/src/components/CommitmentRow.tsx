import type { Commitment } from "../api/client";

const statusColor: Record<Commitment["status"], string> = {
  OPEN: "var(--color-outline)",
  IN_PROGRESS: "var(--color-primary)",
  WAITING: "var(--color-tertiary)",
  BLOCKED: "var(--color-blocked)",
  DONE: "var(--color-done)",
  DROPPED: "var(--color-on-surface-variant)",
  CANCELLED: "var(--color-on-surface-variant)",
};

export function CommitmentRow({ commitment }: { commitment: Commitment }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "var(--space-3)",
        marginBottom: "var(--space-2)",
        background: "var(--color-surface-container)",
        borderLeft: `3px solid ${statusColor[commitment.status]}`,
        borderRadius: "0 var(--shape-settled) var(--shape-settled) 0", // settled shape — this IS a confirmed commitment, not a candidate
      }}
    >
      <span style={{ font: "var(--type-title-medium)" }}>{commitment.title}</span>
      <span style={{ font: "var(--type-label-medium)", color: "var(--color-on-surface-variant)" }}>
        {commitment.dueAt ? `Due ${new Date(commitment.dueAt).toLocaleDateString()}` : "No due date"}
      </span>
    </div>
  );
}
