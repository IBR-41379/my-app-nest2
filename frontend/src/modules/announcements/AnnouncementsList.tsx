import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnnouncementsAPI } from "./apiClient";
import type { AnnouncementSummary } from "./types";
import { usePolling } from "../../shared/usePolling";

export default function AnnouncementsList() {
  const [items, setItems] = useState<AnnouncementSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      const data = await AnnouncementsAPI.list();
      setItems(data);
    } catch (e: any) {
      setError(e?.api?.message || e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  usePolling(load, 5000, true);

  if (loading && !items) return <div className="card">Loading announcements...</div>;
  if (error) return <div className="card">Error: {error}</div>;
  if (!items || items.length === 0) return <div className="card empty">No announcements yet</div>;

  return (
    <div className="list">
      {items.map((a) => (
        <div key={a.id} className="card">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div className="col" style={{ gap: 4 }}>
              <Link to={`/announcements/${a.id}`} className="title">
                {a.title}
              </Link>
              <div className="helper">
                Last activity: {new Date(a.lastActivityAt).toLocaleString()}
              </div>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <span className="badge">💬 {a.commentCount}</span>
              <span className="badge">👍 {a.reactions.up || 0}</span>
              <span className="badge">👎 {a.reactions.down || 0}</span>
              <span className="badge">❤️ {a.reactions.heart || 0}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
