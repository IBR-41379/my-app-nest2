import { useState } from "react";
import type { ReactionType } from "./types";

interface Props {
  onReact: (type: ReactionType) => Promise<void>;
  onRemove: () => Promise<void>;
}

export default function ReactionButtons({ onReact, onRemove }: Props) {
  const [pending, setPending] = useState<ReactionType | "remove" | null>(null);

  async function handle(type: ReactionType) {
    setPending(type);
    try {
      await onReact(type);
    } finally {
      setPending(null);
    }
  }

  async function handleRemove() {
    setPending("remove");
    try {
      await onRemove();
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="row" style={{ gap: 8 }}>
      <button onClick={() => handle("up")} disabled={!!pending}>
        👍 Upvote
      </button>
      <button onClick={() => handle("down")} disabled={!!pending}>
        👎 Downvote
      </button>
      <button onClick={() => handle("heart")} disabled={!!pending}>
        ❤️ Heart
      </button>
      <button onClick={handleRemove} disabled={!!pending}>
        Remove my reaction
      </button>
    </div>
  );
}
