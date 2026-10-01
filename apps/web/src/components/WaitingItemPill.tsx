import type { WaitingItemRow } from "../api/client";

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

export function WaitingItemPill({ item }: { item: WaitingItemRow }) {
  const days = daysSince(item.waitingSince);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "var(--space-2)",
        padding: "var(--space-2) var(--space-3)",
        marginBottom: "var(--space-2)",
        background: "var(--color-tertiary-container)",
        color: "var(--color-on-tertiary-container)",
        borderRadius: "var(--shape-provisional)",
      }}
    >
      <div>
        <div style={{ font: "var(--type-title-medium)" }}>{item.commitmentTitle}</div>
        <div style={{ font: "var(--type-body-medium)" }}>
          Waiting on {item.waitingOn}
          {item.waitingReason ? ` — ${item.waitingReason}` : ""}
        </div>
      </div>
      <span style={{ font: "var(--type-label-medium)", whiteSpace: "nowrap" }}>
        {days === 0 ? "since today" : `${days}d`}
      </span>
    </div>
  );
}
