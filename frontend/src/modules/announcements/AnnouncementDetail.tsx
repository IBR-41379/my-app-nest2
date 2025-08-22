import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AnnouncementsAPI } from "./apiClient";
import type { Comment, Paginated, ReactionType, AnnouncementSummary } from "./types";
import ReactionButtons from "./ReactionButtons";
import CommentForm from "./CommentForm";
import { usePolling } from "../../shared/usePolling";

export default function AnnouncementDetail() {
  const { id = "" } = useParams();
  const [announcement, setAnnouncement] = useState<AnnouncementSummary | null>(null);
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const limit = 10;

  const hasMore = useMemo(() => !!nextCursor, [nextCursor]);

  async function loadAnnouncement() {
    try {
      const announcement = await AnnouncementsAPI.getById(id);
      setAnnouncement(announcement);
      setLastUpdate(new Date());
    } catch (e: any) {
      if (e.message?.includes('404') || e.message?.includes('not found')) {
        setError("Announcement not found");
      } else {
        setError(e?.api?.message || e.message || "Failed to load announcement");
      }
    }
  }

  async function refreshData() {
    try {
      // Refresh announcement data (reactions, comment count)
      await loadAnnouncement();
      
      // Refresh comments if we have any loaded
      if (comments && comments.length > 0) {
        const page: Paginated<Comment> = await AnnouncementsAPI.getComments(id, undefined, comments.length);
        setComments(page.items);
        setNextCursor(page.nextCursor ?? null);
      }
    } catch (e: any) {
      console.warn('Failed to refresh data:', e);
    }
  }

  // Poll for updates every 5 seconds
  usePolling(refreshData, 5000, !loading && !error && !!announcement);

  async function loadPage(cursor?: string) {
    try {
      const page: Paginated<Comment> = await AnnouncementsAPI.getComments(id, cursor, limit);
      setComments((prev) => (cursor ? [...(prev || []), ...page.items] : page.items));
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
    setAnnouncement(null);
    
    Promise.all([
      loadAnnouncement(),
      loadPage()
    ]);
  }, [id]);

  function onOptimisticAdd(c: Comment) {
    setComments((prev) => [c, ...(prev || [])]);
    // Update comment count optimistically
    if (announcement) {
      setAnnouncement(prev => prev ? { ...prev, commentCount: prev.commentCount + 1 } : null);
    }
  }

  async function onCommitAdd(authorName: string, text: string, tempId: string) {
    try {
      const saved = await AnnouncementsAPI.addComment(id, { authorName, text });
      // replace the temp comment
      setComments((prev) => (prev || []).map((c) => (c.id === tempId ? saved : c)));
    } catch (e: any) {
      // rollback
      setComments((prev) => (prev || []).filter((c) => c.id !== tempId));
      if (announcement) {
        setAnnouncement(prev => prev ? { ...prev, commentCount: Math.max(0, prev.commentCount - 1) } : null);
      }
      throw e;
    }
  }

  const pendingRef = useRef(false);
  async function sendReaction(type: ReactionType) {
    if (pendingRef.current) return;
    pendingRef.current = true;
    try {
      await AnnouncementsAPI.addReaction(id, type);
      setUserReaction(type);
      // The optimistic updates are handled in ReactionButtons component
    } catch (error) {
      console.error('Failed to send reaction:', error);
      throw error;
    } finally {
      pendingRef.current = false;
    }
  }

  async function removeReaction() {
    if (pendingRef.current) return;
    pendingRef.current = true;
    try {
      await AnnouncementsAPI.removeReaction(id);
      setUserReaction(null);
    } catch (error) {
      console.error('Failed to remove reaction:', error);
      throw error;
    } finally {
      pendingRef.current = false;
    }
  }

  if (loading && nextCursor === undefined) return <div className="card">Loading...</div>;
  if (error) return <div className="card">Error: {error}</div>;
  if (!announcement) return <div className="card">Announcement not found</div>;

  return (
    <div className="col" style={{ gap: 12 }}>
      <Link to="/">&larr; Back</Link>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>{announcement.title}</h2>
        <div className="helper">
          {announcement.commentCount} comments • Last activity: {new Date(announcement.lastActivityAt).toLocaleDateString()}
          {lastUpdate && (
            <span style={{ marginLeft: '8px', fontSize: '11px', color: '#999' }}>
              • Updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="hr"></div>
        <ReactionButtons 
          reactions={announcement.reactions}
          userReaction={userReaction}
          onReact={sendReaction} 
          onRemove={removeReaction} 
        />
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Add a comment</h3>
        <CommentForm onOptimisticAdd={onOptimisticAdd} onCommitAdd={onCommitAdd} />
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Comments ({comments?.length || 0})</h3>
        {!comments || comments.length === 0 ? (
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
