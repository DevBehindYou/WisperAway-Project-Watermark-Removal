import { db } from "../db/client.js";
import { tenants, clientAccounts, persons } from "../db/schema.js";
import { eq } from "drizzle-orm";

export async function createTenant(name: string) {
  const [tenant] = await db.insert(tenants).values({ name }).returning();
  return tenant;
}

/**
 * Per ADR 0004 (single-tenant for now, by choice, not by accident): this
 * deployment has exactly one tenant. Idempotent — returns the existing
 * one if it's there, creates it only on a genuinely first boot. This
 * replaced apps/web silently minting a new tenant into localStorage
 * whenever storage was empty, which meant a cleared browser or a second
 * browser silently forked into a second, disconnected workspace. That
 * was a data-continuity bug, not a missing-auth problem — a full login/
 * session layer would be over-building for a deployment ADR 0004 already
 * says is single-user. Revisit this function specifically (not sooner)
 * if that ADR ever flips to multi-tenant.
 */
export async function getOrCreateSingleTenant() {
  const [existing] = await db.select().from(tenants).limit(1);
  if (existing) return existing;
  return createTenant("Ashu — personal workspace");
}

export async function createClientAccount(input: { tenantId: string; name: string }) {
  const [client] = await db.insert(clientAccounts).values(input).returning();
  return client;
}

export async function createPerson(input: { tenantId: string; displayName: string }) {
  const [person] = await db.insert(persons).values(input).returning();
  return person;
}

export async function listClientAccounts(tenantId: string) {
  return db.select().from(clientAccounts).where(eq(clientAccounts.tenantId, tenantId));
}

export async function listPersons(tenantId: string) {
  return db.select().from(persons).where(eq(persons.tenantId, tenantId));
}
