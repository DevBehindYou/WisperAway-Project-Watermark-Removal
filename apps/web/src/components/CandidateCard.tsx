import type { Candidate } from "../api/client";
import { ConfidenceMark } from "./ConfidenceMark";

interface CandidateCardProps {
  candidate: Candidate;
  selected: boolean;
  onSelect: () => void;
}

const stateLabel: Record<Candidate["state"], string> = {
  PENDING: "Needs review",
  AUTO_ACCEPTED: "Auto-accepted",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  MERGED: "Merged",
  NEEDS_DATE_REVIEW: "Date needs review",
  NEEDS_IDENTITY_REVIEW: "Person needs review",
};

export function CandidateCard({ candidate, selected, onSelect }: CandidateCardProps) {
  const isDateFlagged = candidate.state === "NEEDS_DATE_REVIEW";

  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "var(--space-3)",
        marginBottom: "var(--space-2)",
        background: selected ? "var(--color-surface-container-high)" : "var(--color-surface-container)",
        border: selected ? "2px solid var(--color-primary)" : "1px solid var(--color-outline-variant)",
        borderRadius: "var(--shape-provisional)", // review-queue items are always provisional
        cursor: "pointer",
        font: "inherit",
        color: "inherit",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-2)" }}>
        <span style={{ font: "var(--type-title-medium)" }}>{candidate.title}</span>
        <ConfidenceMark confidence={candidate.confidence} />
      </div>

      <div
        style={{
          marginTop: "var(--space-1)",
          font: "var(--type-body-medium)",
          color: "var(--color-on-surface-variant)",
        }}
      >
        {candidate.promisedToHint && <span>To {candidate.promisedToHint}</span>}
        {candidate.clientHint && <span> · {candidate.clientHint}</span>}
      </div>

      <div style={{ marginTop: "var(--space-2)", display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
        <span
          style={{
            font: "var(--type-label-medium)",
            padding: "2px 10px",
            borderRadius: "var(--shape-provisional)",
            background: isDateFlagged ? "var(--color-tertiary-container)" : "var(--color-secondary-container)",
            color: isDateFlagged ? "var(--color-on-tertiary-container)" : "var(--color-on-surface-variant)",
          }}
        >
          {stateLabel[candidate.state]}
        </span>
        {candidate.rawDatePhrase && (
          <span style={{ font: "var(--type-label-medium)", color: "var(--color-on-surface-variant)" }}>
            "{candidate.rawDatePhrase}"
          </span>
        )}
      </div>
    </button>
  );
}
