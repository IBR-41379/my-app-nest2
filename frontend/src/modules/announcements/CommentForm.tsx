import { useRef, useState } from "react";
import type { Comment } from "./types";

interface Props {
  onOptimisticAdd: (c: Comment) => void;
  onCommitAdd: (authorName: string, text: string, tempId: string) => Promise<void>;
}

export default function CommentForm({ onOptimisticAdd, onCommitAdd }: Props) {
  const nameRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const authorName = nameRef.current?.value?.trim() || "Anonymous";
    if (!text.trim()) {
      setErr("Please write a comment");
      return;
    }
    const tempId = `temp-${crypto.randomUUID()}`;
    const optimistic: Comment = {
      id: tempId,
      announcementId: "unknown",
      authorName,
      text,
      createdAt: new Date().toISOString()
    };
    onOptimisticAdd(optimistic);
    setPending(true);
    try {
      await onCommitAdd(authorName, text, tempId);
      setText("");
    } catch (e: any) {
      setErr(e?.api?.message || e.message || "Failed to add comment");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="col" style={{ gap: 8 }}>
      <input ref={nameRef} className="input" placeholder="Your name" />
      <textarea
        className="input"
        rows={3}
        placeholder="Write a comment"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {err && <div style={{ color: "var(--danger)" }}>{err}</div>}
      <div className="row" style={{ gap: 8 }}>
        <button type="submit" disabled={pending}>
          {pending ? "Posting..." : "Post"}
        </button>
      </div>
      <div className="helper">Comments allow 1 to 500 characters</div>
    </form>
  );
}
