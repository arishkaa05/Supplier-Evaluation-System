import { apiFetch } from "./client";
import { ServerCriterion, ServerKbRule, ServerSupplier } from "./dto";

// Suppliers
export const fetchSuppliers = () =>
  apiFetch<{ suppliers: ServerSupplier[] }>("/suppliers/all").then((r) => r.suppliers);

export const createSupplier = (name: string) =>
  apiFetch<{ supplier: ServerSupplier }>("/suppliers/create", {
    method: "POST",
    body: JSON.stringify({ name }),
  }).then((r) => r.supplier);

export const deleteSupplier = (id: number) =>
  apiFetch<{ ok: true }>(`/suppliers/${id}`, { method: "DELETE" });

// Observations
export type UpsertObservationDto = {
  supplierId: number;
  month: number;
  local_hiring?: number;
  completeness?: number;
  defects?: number;
  quality_local_hiring?: string;
  quality_completeness?: string;
  quality_defects?: string;
};

export const upsertObservation = (dto: UpsertObservationDto) =>
  apiFetch<{ observation: unknown }>("/observations/upsert", {
    method: "POST",
    body: JSON.stringify(dto),
  });

export const addMonth = (month: number) =>
  apiFetch<{ ok: true }>("/observations/add-month", {
    method: "POST",
    body: JSON.stringify({ month }),
  });

export const removeMonth = (month: number) =>
  apiFetch<{ removed: number }>(`/observations/month/${month}`, { method: "DELETE" });

// Criteria
export const fetchCriteria = () =>
  apiFetch<{ criteria: ServerCriterion[] }>("/criteria/all").then((r) => r.criteria);

// Knowledge base
export const fetchKnowledgeBase = () =>
  apiFetch<{ rules: ServerKbRule[] }>("/knowledge-base/all").then((r) => r.rules);

// Seed
export const runSeed = (reset = false) =>
  apiFetch<{
    ok: true;
    criteria: number;
    criterionRows: number;
    kbRules: number;
    suppliers: number;
    observations: number;
  }>(`/seed${reset ? "?reset=true" : ""}`, { method: "POST" });
