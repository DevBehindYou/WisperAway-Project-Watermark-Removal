import type { LedgerEntry } from "../api/client";

const sideLabel: Record<LedgerEntry["initiatorSide"], string> = {
  US: "You",
  CLIENT: "Client",
  SYSTEM: "System",
  UNKNOWN: "Unknown",
};

const sideColor: Record<LedgerEntry["initiatorSide"], string> = {
  US: "var(--color-primary)",
  CLIENT: "var(--color-tertiary)",
  SYSTEM: "var(--color-on-surface-variant)",
  UNKNOWN: "var(--color-error)",
};

export function TimelineEntry({ entry }: { entry: LedgerEntry }) {
  return (
    <div style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-3)" }}>
      <div style={{ width: 90, flexShrink: 0, font: "var(--type-label-medium)", color: "var(--color-on-surface-variant)" }}>
        {new Date(entry.createdAt).toLocaleDateString()}
      </div>
      <div
        style={{
          flexShrink: 0,
          width: 4,
          borderRadius: 2,
          background: sideColor[entry.initiatorSide],
        }}
      />
      <div>
        <div style={{ font: "var(--type-body-large)" }}>
          <strong>{sideLabel[entry.initiatorSide]}</strong> changed <em>{entry.fieldName}</em> on{" "}
          <strong>{entry.commitmentTitle}</strong>
          {entry.oldValue || entry.newValue ? (
            <span>
              : {entry.oldValue ?? "(none)"} → {entry.newValue}
            </span>
          ) : null}
        </div>
        {entry.reason && (
          <div style={{ font: "var(--type-body-medium)", color: "var(--color-on-surface-variant)" }}>{entry.reason}</div>
        )}
      </div>
    </div>
  );
}
