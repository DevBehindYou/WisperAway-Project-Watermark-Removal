import { useEffect, useState } from "react";
import type { Commitment, WaitingItemRow } from "../api/client";
import { api } from "../api/client";
import { CommitmentRow } from "../components/CommitmentRow";
import { WaitingItemPill } from "../components/WaitingItemPill";

export interface DashboardProps {
  tenantId: string;
}

/**
 * Design doc §5.2 describes five zones: Now, At Risk, Waiting on others,
 * Follow-ups, Personal Goals. Only two are built here — Open commitments
 * and Waiting on others — because those are the only two with real
 * backend logic behind them. At Risk needs a real risk calculation (spec
 * §21's capacity check) that doesn't exist yet; Personal Goals needs a
 * Goal entity that isn't in the Phase 1 schema at all (it's a Phase 6
 * concern per spec §98). Showing empty placeholder cards for those would
 * look like a finished feature. Naming the gap instead.
 */
export function Dashboard({ tenantId }: DashboardProps) {
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [waiting, setWaiting] = useState<WaitingItemRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.listCommitments(tenantId), api.listWaitingItems(tenantId)])
      .then(([c, w]) => {
        setCommitments(c);
        setWaiting(w);
      })
      .catch((e) => setError(String(e)));
  }, [tenantId]);

  const open = commitments.filter((c) => c.status === "OPEN" || c.status === "IN_PROGRESS");

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "var(--space-4)" }}>
      <h1 style={{ font: "var(--type-headline-small)" }}>Dashboard</h1>
      {error && <p role="alert">{error}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
        <section>
          <h2 style={{ font: "var(--type-title-large)" }}>Open ({open.length})</h2>
          {open.length === 0 && <p style={{ color: "var(--color-on-surface-variant)" }}>Nothing open right now.</p>}
          {open.map((c) => (
            <CommitmentRow key={c.id} commitment={c} />
          ))}
        </section>

        <section>
          <h2 style={{ font: "var(--type-title-large)" }}>Waiting on others ({waiting.length})</h2>
          {waiting.length === 0 && (
            <p style={{ color: "var(--color-on-surface-variant)" }}>Nothing waiting on anyone right now.</p>
          )}
          {waiting.map((w) => (
            <WaitingItemPill key={w.id} item={w} />
          ))}
        </section>
      </div>

      <div
        style={{
          marginTop: "var(--space-5)",
          padding: "var(--space-3)",
          border: "1px dashed var(--color-outline-variant)",
          borderRadius: "var(--shape-default)",
          font: "var(--type-body-medium)",
          color: "var(--color-on-surface-variant)",
        }}
      >
        <strong>Not built yet, not faked here:</strong> "At risk" needs a real capacity/deadline calculation
        (spec §21) that doesn't exist. "Personal goals" needs a Goal entity that isn't in the Phase 1 schema.
        Both are placeholders in the design file, not on this screen — see docs/STATE.md.
      </div>
    </div>
  );
}
