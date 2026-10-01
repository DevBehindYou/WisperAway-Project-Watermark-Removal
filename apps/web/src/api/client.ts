export type CandidateState =
  | "PENDING"
  | "AUTO_ACCEPTED"
  | "ACCEPTED"
  | "REJECTED"
  | "MERGED"
  | "NEEDS_DATE_REVIEW"
  | "NEEDS_IDENTITY_REVIEW";

export interface Candidate {
  id: string;
  tenantId: string;
  title: string;
  description: string | null;
  ownerHint: string | null;
  promisedToHint: string | null;
  clientHint: string | null;
  rawDatePhrase: string | null;
  deterministicResolvedDueAt: string | null;
  confidence: number;
  state: CandidateState;
  originEventId: string;
  createdAt: string;
}

export interface SourceEvent {
  id: string;
  kind: string;
  body: string;
  occurredAt: string;
  sourceAdapter: string;
}

export type CommitmentStatus = "OPEN" | "IN_PROGRESS" | "WAITING" | "BLOCKED" | "DONE" | "DROPPED" | "CANCELLED";

export interface Commitment {
  id: string;
  title: string;
  detail: string | null;
  status: CommitmentStatus;
  dueAt: string | null;
  promisedAt: string;
  confidence: number | null;
}

export interface WaitingItemRow {
  id: string;
  commitmentId: string;
  commitmentTitle: string;
  waitingOn: string;
  waitingSince: string;
  waitingReason: string | null;
}

export interface ClientAccount {
  id: string;
  tenantId: string;
  name: string;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  commitmentId: string;
  commitmentTitle: string;
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
  initiatedBy: string | null;
  initiatorSide: "US" | "CLIENT" | "SYSTEM" | "UNKNOWN";
  reason: string | null;
  createdAt: string;
}

export interface ClientView {
  client: ClientAccount;
  commitments: Commitment[];
  timeline: LedgerEntry[];
}

export interface SearchResult {
  type: "commitment" | "source_event";
  id: string;
  title: string;
  snippet: string;
  sourceEventId: string;
  sourceEventBody: string;
  occurredAt: string;
}

const BASE = "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${init?.method ?? "GET"} ${path} failed: ${res.status} ${body}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  listCandidates: (tenantId: string) => request<Candidate[]>(`/candidates?tenantId=${tenantId}`),
  acceptCandidate: (id: string, acceptedBy: string) =>
    request(`/candidates/${id}/accept`, { method: "POST", body: JSON.stringify({ acceptedBy }) }),
  rejectCandidate: (id: string) => request(`/candidates/${id}/reject`, { method: "POST" }),
  getSourceEvent: (id: string) => request<SourceEvent>(`/source-events/${id}`),
  listCommitments: (tenantId: string) => request<Commitment[]>(`/commitments?tenantId=${tenantId}`),
  listWaitingItems: (tenantId: string) => request<WaitingItemRow[]>(`/waiting-items?tenantId=${tenantId}`),
  listClientAccounts: (tenantId: string) => request<ClientAccount[]>(`/client-accounts?tenantId=${tenantId}`),
  getClientView: (clientId: string) => request<ClientView>(`/client-accounts/${clientId}/view`),
  search: (tenantId: string, q: string) =>
    request<{ results: SearchResult[] }>(`/search?tenantId=${tenantId}&q=${encodeURIComponent(q)}`),
};
