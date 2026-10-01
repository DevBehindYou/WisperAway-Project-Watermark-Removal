import { useEffect, useState } from "react";
import type { Candidate, SourceEvent } from "../api/client";
import { api } from "../api/client";
import { ConfidenceMark } from "./ConfidenceMark";

interface EvidencePanelProps {
  candidate: Candidate;
  onAccept: () => void;
  onReject: () => void;
  busy: boolean;
}

export function EvidencePanel({ candidate, onAccept, onReject, busy }: EvidencePanelProps) {
  const [event, setEvent] = useState<SourceEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEvent(null);
    setError(null);
    api
      .getSourceEvent(candidate.originEventId)
      .then(setEvent)
      .catch((e) => setError(String(e)));
  }, [candidate.originEventId]);

  return (
    <div
      style={{
        background: "var(--color-surface-container-highest)",
        borderRadius: "var(--shape-default)",
        padding: "var(--space-4)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ font: "var(--type-headline-small)", margin: 0 }}>{candidate.title}</h2>
        <ConfidenceMark confidence={candidate.confidence} />
      </div>

      <section style={{ marginTop: "var(--space-4)" }}>
        <h3
          style={{
            font: "var(--type-label-large)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: "var(--color-on-surface-variant)",
            margin: "0 0 var(--space-2) 0",
          }}
        >
          Evidence
        </h3>
        {error && <p role="alert">Could not load the source evidence: {error}</p>}
        {!event && !error && <p>Loading…</p>}
        {event && (
          <blockquote
            data-testid="evidence-quote"
            style={{
              margin: 0,
              padding: "var(--space-3)",
              background: "var(--color-surface-container-low)",
              borderLeft: "3px solid var(--color-tertiary)",
              borderRadius: "0 var(--shape-default) var(--shape-default) 0",
              font: "var(--type-body-large)",
              fontStyle: "italic",
            }}
          >
            "{event.body}"
            <footer
              style={{
                marginTop: "var(--space-2)",
                fontStyle: "normal",
                font: "var(--type-label-medium)",
                color: "var(--color-on-surface-variant)",
              }}
            >
              {event.kind} · via {event.sourceAdapter} · {new Date(event.occurredAt).toLocaleString()}
            </footer>
          </blockquote>
        )}
      </section>

      {candidate.rawDatePhrase && (
        <section style={{ marginTop: "var(--space-3)", font: "var(--type-body-medium)" }}>
          <strong>Raw date phrase:</strong> "{candidate.rawDatePhrase}"
          {candidate.deterministicResolvedDueAt ? (
            <span> → resolves to {new Date(candidate.deterministicResolvedDueAt).toLocaleString()}</span>
          ) : (
            <span style={{ color: "var(--color-tertiary)" }}> → could not be resolved from text alone; needs review</span>
          )}
        </section>
      )}

      <div style={{ marginTop: "var(--space-4)", display: "flex", gap: "var(--space-2)" }}>
        <button
          onClick={onAccept}
          disabled={busy}
          style={{
            background: "var(--color-primary)",
            color: "var(--color-on-primary)",
            border: "none",
            borderRadius: "var(--shape-default)",
            padding: "10px 20px",
            font: "var(--type-label-large)",
            cursor: busy ? "default" : "pointer",
            opacity: busy ? 0.6 : 1,
          }}
        >
          Accept
        </button>
        <button
          onClick={onReject}
          disabled={busy}
          style={{
            background: "transparent",
            color: "var(--color-on-surface)",
            border: "1px solid var(--color-outline)",
            borderRadius: "var(--shape-default)",
            padding: "10px 20px",
            font: "var(--type-label-large)",
            cursor: busy ? "default" : "pointer",
            opacity: busy ? 0.6 : 1,
          }}
        >
          Reject
        </button>
      </div>
    </div>
  );
}
