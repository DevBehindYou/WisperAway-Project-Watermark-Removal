import { useState } from "react";
import type { SearchResult } from "../api/client";
import { api } from "../api/client";

export interface SearchPageProps {
  tenantId: string;
}

export function SearchPage({ tenantId }: SearchPageProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const runSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { results } = await api.search(tenantId, query);
      setResults(results);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "var(--space-4)" }}>
      <h1 style={{ font: "var(--type-headline-small)" }}>Search</h1>
      <p style={{ color: "var(--color-on-surface-variant)", marginTop: 0 }}>
        Keyword search over real captured text. Every result cites where it came from — nothing here is a
        summary, and a query that doesn't match anything real returns nothing, not a guess.
      </p>

      <form onSubmit={runSearch} style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search commitments and captured text…"
          aria-label="Search"
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: "var(--shape-default)",
            border: "1px solid var(--color-outline)",
            font: "var(--type-body-large)",
            background: "var(--color-surface-container-lowest)",
            color: "var(--color-on-surface)",
          }}
        />
        <button
          type="submit"
          style={{
            background: "var(--color-primary)",
            color: "var(--color-on-primary)",
            border: "none",
            borderRadius: "var(--shape-default)",
            padding: "10px 24px",
            font: "var(--type-label-large)",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </form>

      {error && <p role="alert">{error}</p>}
      {loading && <p>Searching…</p>}

      {results !== null && !loading && (
        <div data-testid="search-results">
          {results.length === 0 ? (
            <p style={{ color: "var(--color-on-surface-variant)" }}>No matches for "{query}".</p>
          ) : (
            results.map((r) => (
              <div
                key={`${r.type}-${r.id}`}
                style={{
                  padding: "var(--space-3)",
                  marginBottom: "var(--space-2)",
                  background: "var(--color-surface-container)",
                  borderRadius: "var(--shape-default)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ font: "var(--type-title-medium)" }}>{r.title}</span>
                  <span style={{ font: "var(--type-label-medium)", color: "var(--color-on-surface-variant)", textTransform: "capitalize" }}>
                    {r.type.replace("_", " ")}
                  </span>
                </div>
                <blockquote
                  style={{
                    margin: "var(--space-2) 0 0 0",
                    padding: "var(--space-2) var(--space-3)",
                    borderLeft: "3px solid var(--color-tertiary)",
                    font: "var(--type-body-medium)",
                    fontStyle: "italic",
                    color: "var(--color-on-surface-variant)",
                  }}
                >
                  "{r.sourceEventBody}"
                </blockquote>
                <div style={{ font: "var(--type-label-medium)", color: "var(--color-on-surface-variant)", marginTop: "var(--space-1)" }}>
                  {new Date(r.occurredAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
