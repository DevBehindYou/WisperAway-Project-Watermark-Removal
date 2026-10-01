import { useEffect, useMemo, useState } from "react";
import type { Candidate } from "../api/client";
import { api } from "../api/client";
import { CandidateCard } from "../components/CandidateCard";
import { EvidencePanel } from "../components/EvidencePanel";

const TABS = [
  { key: "all", label: "All unresolved" },
  { key: "high", label: "High confidence" },
  { key: "review", label: "Needs review" },
  { key: "date", label: "Date conflict" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function matchesTab(c: Candidate, tab: TabKey): boolean {
  if (tab === "all") return c.state === "PENDING" || c.state === "NEEDS_DATE_REVIEW" || c.state === "NEEDS_IDENTITY_REVIEW";
  if (tab === "high") return c.state === "PENDING" && c.confidence >= 0.85;
  if (tab === "review") return c.state === "PENDING" && c.confidence < 0.85;
  if (tab === "date") return c.state === "NEEDS_DATE_REVIEW";
  return false;
}

export interface ReviewQueueProps {
  tenantId: string;
}

export function ReviewQueue({ tenantId }: ReviewQueueProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [tab, setTab] = useState<TabKey>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = () => {
    api
      .listCandidates(tenantId)
      .then((data) => {
        setCandidates(data);
        setLoadError(null);
      })
      .catch((e) => setLoadError(String(e)));
  };

  useEffect(load, [tenantId]);

  const filtered = useMemo(() => candidates.filter((c) => matchesTab(c, tab)), [candidates, tab]);
  const selected = filtered.find((c) => c.id === selectedId) ?? filtered[0] ?? null;

  const act = async (action: "accept" | "reject") => {
    if (!selected) return;
    setBusy(true);
    try {
      if (action === "accept") await api.acceptCandidate(selected.id, "me");
      else await api.rejectCandidate(selected.id);
      setSelectedId(null);
      load();
    } catch (e) {
      setLoadError(String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "var(--space-4)" }}>
      <h1 style={{ font: "var(--type-headline-small)" }}>Review Queue</h1>
      <p style={{ color: "var(--color-on-surface-variant)", marginTop: 0 }}>
        Extracted candidates pending confirmation. Nothing here is a real commitment yet.
      </p>

      <div role="tablist" style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "6px 14px",
              borderRadius: "var(--shape-provisional)",
              border: "1px solid var(--color-outline-variant)",
              background: tab === t.key ? "var(--color-primary-container)" : "transparent",
              color: tab === t.key ? "var(--color-on-primary-container)" : "var(--color-on-surface)",
              font: "var(--type-label-large)",
              cursor: "pointer",
            }}
          >
            {t.label} ({candidates.filter((c) => matchesTab(c, t.key)).length})
          </button>
        ))}
      </div>

      {loadError && <p role="alert">{loadError}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
        <div data-testid="candidate-list">
          {filtered.length === 0 && (
            <p style={{ color: "var(--color-on-surface-variant)" }}>Nothing in this tab right now.</p>
          )}
          {filtered.map((c) => (
            <CandidateCard key={c.id} candidate={c} selected={selected?.id === c.id} onSelect={() => setSelectedId(c.id)} />
          ))}
        </div>
        <div>
          {selected ? (
            <EvidencePanel candidate={selected} onAccept={() => act("accept")} onReject={() => act("reject")} busy={busy} />
          ) : (
            <p style={{ color: "var(--color-on-surface-variant)" }}>Select a candidate to see its evidence.</p>
          )}
        </div>
      </div>
    </div>
  );
}
