import { useEffect, useState } from "react";
import type { ClientAccount, ClientView as ClientViewData } from "../api/client";
import { api } from "../api/client";
import { TimelineEntry } from "../components/TimelineEntry";

export interface ClientViewProps {
  tenantId: string;
}

export function ClientView({ tenantId }: ClientViewProps) {
  const [clients, setClients] = useState<ClientAccount[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<ClientViewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listClientAccounts(tenantId)
      .then((list) => {
        setClients(list);
        if (list.length > 0) setSelectedId(list[0].id);
      })
      .catch((e) => setError(String(e)));
  }, [tenantId]);

  useEffect(() => {
    if (!selectedId) return;
    api.getClientView(selectedId).then(setView).catch((e) => setError(String(e)));
  }, [selectedId]);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "var(--space-4)" }}>
      <h1 style={{ font: "var(--type-headline-small)" }}>Clients</h1>
      {error && <p role="alert">{error}</p>}
      {clients.length === 0 && !error && (
        <p style={{ color: "var(--color-on-surface-variant)" }}>No client accounts yet.</p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "var(--space-4)" }}>
        <div>
          {clients.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              aria-pressed={selectedId === c.id}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "var(--space-2) var(--space-3)",
                marginBottom: "var(--space-1)",
                background: selectedId === c.id ? "var(--color-primary-container)" : "transparent",
                color: selectedId === c.id ? "var(--color-on-primary-container)" : "var(--color-on-surface)",
                border: "none",
                borderRadius: "var(--shape-settled)",
                font: "var(--type-body-large)",
                cursor: "pointer",
              }}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div>
          {view && (
            <>
              <h2 style={{ font: "var(--type-title-large)", marginTop: 0 }}>{view.client.name}</h2>
              <p style={{ color: "var(--color-on-surface-variant)" }}>
                {view.commitments.length} commitment{view.commitments.length === 1 ? "" : "s"} on record
              </p>

              <h3
                style={{
                  font: "var(--type-label-large)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "var(--color-on-surface-variant)",
                }}
              >
                Timeline
              </h3>
              {view.timeline.length === 0 ? (
                <p style={{ color: "var(--color-on-surface-variant)" }}>No changes recorded yet.</p>
              ) : (
                <div data-testid="timeline">
                  {view.timeline.map((entry) => (
                    <TimelineEntry key={entry.id} entry={entry} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
