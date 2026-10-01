import { useEffect, useState } from "react";
import { ReviewQueue } from "./pages/ReviewQueue";
import { Dashboard } from "./pages/Dashboard";
import { ClientView } from "./pages/ClientView";
import { SearchPage } from "./pages/Search";

/**
 * Single-tenant bootstrap: fetches the one real workspace from the API
 * (GET /workspace, idempotent — see services/api/src/services/setup.ts)
 * instead of the earlier approach of minting a tenant into localStorage
 * on first load, which forked into a second, disconnected workspace
 * whenever storage was cleared or the app was opened in a new browser.
 *
 * This is still a placeholder for real auth, not real auth — it's just
 * an honest one now instead of a silently-buggy one. A real login/
 * session layer only makes sense once ADR 0004 (single-tenant) changes.
 */

type View = "dashboard" | "review" | "clients" | "search";

export function App() {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>("dashboard");

  useEffect(() => {
    fetch("/api/workspace")
      .then((r) => r.json())
      .then((tenant) => setTenantId(tenant.id))
      .catch((e) => setError(String(e)));
  }, []);

  if (error) return <p role="alert">Could not reach the API: {error}</p>;
  if (!tenantId) return <p>Loading…</p>;

  return (
    <div>
      <nav
        style={{
          display: "flex",
          gap: "var(--space-3)",
          padding: "var(--space-3) var(--space-4)",
          borderBottom: "1px solid var(--color-outline-variant)",
          font: "var(--type-label-large)",
        }}
      >
        <span style={{ font: "var(--type-title-large)", marginRight: "var(--space-3)" }}>Keystone</span>
        <button onClick={() => setView("dashboard")} aria-current={view === "dashboard"} style={navButtonStyle(view === "dashboard")}>
          Dashboard
        </button>
        <button onClick={() => setView("review")} aria-current={view === "review"} style={navButtonStyle(view === "review")}>
          Review Queue
        </button>
        <button onClick={() => setView("clients")} aria-current={view === "clients"} style={navButtonStyle(view === "clients")}>
          Clients
        </button>
        <button onClick={() => setView("search")} aria-current={view === "search"} style={navButtonStyle(view === "search")}>
          Search
        </button>
      </nav>
      {view === "dashboard" && <Dashboard tenantId={tenantId} />}
      {view === "review" && <ReviewQueue tenantId={tenantId} />}
      {view === "clients" && <ClientView tenantId={tenantId} />}
      {view === "search" && <SearchPage tenantId={tenantId} />}
    </div>
  );
}

function navButtonStyle(active: boolean): React.CSSProperties {
  return {
    background: "none",
    border: "none",
    borderBottom: active ? "2px solid var(--color-primary)" : "2px solid transparent",
    color: active ? "var(--color-primary)" : "var(--color-on-surface)",
    font: "inherit",
    cursor: "pointer",
    padding: "var(--space-1) 0",
  };
}
