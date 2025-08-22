import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AnnouncementsAPI } from "./apiClient";
import type { Comment, Paginated, ReactionType } from "./types";
import ReactionButtons from "./ReactionButtons";
import CommentForm from "./CommentForm";

export default function AnnouncementDetail() {
  const { id = "" } = useParams();
  const [comments, setComments] = useState<Comment[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const limit = 10;

  const hasMore = useMemo(() => !!nextCursor, [nextCursor]);

  async function loadPage(cursor?: string) {
    try {
      const page: Paginated<Comment> = await AnnouncementsAPI.getComments(id, cursor, limit);
      setComments((prev) => (cursor ? [...prev, ...page.items] : page.items));
      setNextCursor(page.nextCursor ?? null);
    } catch (e: any) {
      setError(e?.api?.message || e.message || "Failed to load comments");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    setComments([]);
    setNextCursor(undefined);
    setLoading(true);
    loadPage();
  }, [id]);

  function onOptimisticAdd(c: Comment) {
    setComments((prev) => [c, ...prev]);
  }

  async function onCommitAdd(authorName: string, text: string, tempId: string) {
    try {
      const saved = await AnnouncementsAPI.addComment(id, { authorName, text });
      // replace the temp comment
      setComments((prev) => prev.map((c) => (c.id === tempId ? saved : c)));
    } catch (e: any) {
      // rollback
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      throw e;
    }
  }

  const pendingRef = useRef(false);
  async function sendReaction(type: ReactionType) {
    if (pendingRef.current) return;
    pendingRef.current = true;
    try {
      await AnnouncementsAPI.addReaction(id, type);
    } catch {
      // no state change here since list aggregates live on the list page
    } finally {
      pendingRef.current = false;
    }
  }

  async function removeReaction() {
    if (pendingRef.current) return;
    pendingRef.current = true;
    try {
      await AnnouncementsAPI.removeReaction(id);
    } finally {
      pendingRef.current = false;
    }
  }

  if (loading && nextCursor === undefined) return <div className="card">Loading...</div>;
  if (error) return <div className="card">Error: {error}</div>;

  return (
    <div className="col" style={{ gap: 12 }}>
      <Link to="/">&larr; Back</Link>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Announcement</h2>
        <div className="helper">Engage with comments and reactions</div>
        <div className="hr"></div>
        <ReactionButtons onReact={sendReaction} onRemove={removeReaction} />
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Add a comment</h3>
        <CommentForm onOptimisticAdd={onOptimisticAdd} onCommitAdd={onCommitAdd} />
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Comments</h3>
        {comments.length === 0 ? (
          <div className="empty">Be the first to comment</div>
        ) : (
          <div className="col">
            {comments.map((c) => (
              <div key={c.id} className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <strong>{c.authorName}</strong>: {c.text}
                </div>
                <div className="helper">{new Date(c.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}

        {hasMore && (
          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => {
                setLoadingMore(true);
                loadPage(nextCursor || undefined);
              }}
              disabled={loadingMore}
            >
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
