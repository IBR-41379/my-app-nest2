import { http, HttpResponse } from "msw";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const demoAnnouncements = [
  {
    id: "a1",
    title: "Water supply maintenance",
    commentCount: 2,
    reactions: { up: 3, down: 1, heart: 5 },
    lastActivityAt: new Date().toISOString()
  }
];

let comments = [
  {
    id: "c1",
    announcementId: "a1",
    authorName: "Alex",
    text: "Thanks for the heads up",
    createdAt: new Date().toISOString()
  },
  {
    id: "c2",
    announcementId: "a1",
    authorName: "Priya",
    text: "Will there be backup supply",
    createdAt: new Date().toISOString()
  }
];

export const handlers = [
  http.get(`${API}/announcements`, () => {
    return HttpResponse.json(demoAnnouncements, {
      headers: { ETag: `"demo-etag"` }
    });
  }),

  http.get(`${API}/announcements/:id/comments`, ({ request }) => {
    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    const page1 = comments.slice(0, 2);
    if (!cursor) {
      return HttpResponse.json({ items: page1, nextCursor: null });
    }
    return HttpResponse.json({ items: [], nextCursor: null });
  }),

  http.post(`${API}/announcements/:id/comments`, async ({ request, params }) => {
    const body = (await request.json()) as any;
    const id = crypto.randomUUID();
    const item = {
      id,
      announcementId: String(params.id),
      authorName: body.authorName,
      text: body.text,
      createdAt: new Date().toISOString()
    };
    comments = [item, ...comments];
    return HttpResponse.json(item, { status: 201 });
  }),

  http.post(`${API}/announcements/:id/reactions`, () => {
    return HttpResponse.json({ ok: true }, { status: 201 });
  }),

  http.delete(`${API}/announcements/:id/reactions`, () => {
    return HttpResponse.json({ ok: true });
  })
];
