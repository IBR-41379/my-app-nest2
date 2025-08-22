import type { AnnouncementSummary, Comment, Paginated, ReactionType } from "./types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const FRONTEND_USER_ID = "demo-user-1"; // replace with real auth in production

type Method = "GET" | "POST" | "DELETE";
type Json = Record<string, unknown>;

/**
 * Minimal fetch helper:
 * - Adds ETag support for GET list endpoint using localStorage cache
 * - Adds headers: JSON, x-user-id
 * - Parses structured API errors
 */
async function request<T>(
  path: string,
  init: RequestInit & { method?: Method; etagKey?: string } = {}
): Promise<{ data: T; etag?: string | null; notModified?: boolean }> {
  const url = `${BASE_URL}${path}`;
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json");
  headers.set("x-user-id", FRONTEND_USER_ID);

  // Optional ETag flow for GET
  if (init.method === "GET" || !init.method) {
    const etagKey = init.etagKey;
    if (etagKey) {
      const previous = localStorage.getItem(`etag:${etagKey}`);
      if (previous) headers.set("If-None-Match", previous);
    }
  }

  const res = await fetch(url, { ...init, headers });

  if (res.status === 304) {
    const etagKey = (init as any).etagKey;
    const cached = etagKey ? localStorage.getItem(`cache:${etagKey}`) : null;
    if (!cached) throw new Error("304 but no cache available");
    return { data: JSON.parse(cached) as T, etag: null, notModified: true };
  }

  const etag = res.headers.get("ETag");

  if (!res.ok) {
    let body: any = null;
    try {
      body = await res.json();
    } catch {
      // ignore
    }
    const err = new Error(body?.message || res.statusText) as Error & { api?: any };
    err.api = body;
    throw err;
  }

  const data = (await res.json()) as T;

  // cache if we got an ETag
  const etagKey = (init as any).etagKey as string | undefined;
  if (etag && etagKey) {
    localStorage.setItem(`etag:${etagKey}`, etag);
    localStorage.setItem(`cache:${etagKey}`, JSON.stringify(data));
  }

  return { data, etag };
}

export const AnnouncementsAPI = {
  async list(): Promise<AnnouncementSummary[]> {
    const { data } = await request<AnnouncementSummary[]>("/announcements", {
      method: "GET",
      etagKey: "announcements:list"
    });
    return data;
  },

  async getById(id: string): Promise<AnnouncementSummary> {
    const { data } = await request<AnnouncementSummary>(`/announcements/${id}`);
    return data;
  },

  async getComments(
    id: string,
    cursor?: string,
    limit = 10
  ): Promise<Paginated<Comment>> {
    const params = new URLSearchParams();
    if (cursor) params.set("cursor", cursor);
    if (limit) params.set("limit", String(limit));
    const qs = params.toString() ? `?${params.toString()}` : "";
    const { data } = await request<Paginated<Comment>>(
      `/announcements/${id}/comments${qs}`
    );
    return data;
  },

  async addComment(id: string, payload: { authorName: string; text: string }) {
    const { data } = await request<Comment>(`/announcements/${id}/comments`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return data;
  },

  async addReaction(id: string, type: ReactionType) {
    const idempotencyKey = crypto.randomUUID();
    const { data } = await request<{ ok: true }>(`/announcements/${id}/reactions`, {
      method: "POST",
      body: JSON.stringify({ type }),
      headers: { "Idempotency-Key": idempotencyKey }
    });
    return data;
  },

  async removeReaction(id: string) {
    const { data } = await request<{ ok: true }>(`/announcements/${id}/reactions`, {
      method: "DELETE"
    });
    return data;
  }
};
