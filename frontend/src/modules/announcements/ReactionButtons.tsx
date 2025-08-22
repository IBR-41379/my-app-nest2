import { useState, useEffect } from "react";
import type { ReactionType } from "./types";

interface Props {
  reactions: Record<ReactionType, number>;
  userReaction?: ReactionType | null;
  onReact: (type: ReactionType) => Promise<void>;
  onRemove: () => Promise<void>;
}

export default function ReactionButtons({ reactions, userReaction, onReact, onRemove }: Props) {
  const [pending, setPending] = useState<ReactionType | "remove" | null>(null);
  const [optimisticReactions, setOptimisticReactions] = useState(reactions);
  const [optimisticUserReaction, setOptimisticUserReaction] = useState(userReaction);

  // Update optimistic state when props change
  useEffect(() => {
    setOptimisticReactions(reactions);
  }, [reactions]);

  useEffect(() => {
    setOptimisticUserReaction(userReaction);
  }, [userReaction]);

  async function handle(type: ReactionType) {
    if (pending) return;
    
    setPending(type);
    
    // Optimistic updates
    const newReactions = { ...optimisticReactions };
    
    // Remove previous reaction optimistically
    if (optimisticUserReaction) {
      newReactions[optimisticUserReaction] = Math.max(0, newReactions[optimisticUserReaction] - 1);
    }
    
    // Add new reaction optimistically
    newReactions[type] = newReactions[type] + 1;
    
    setOptimisticReactions(newReactions);
    setOptimisticUserReaction(type);

    try {
      await onReact(type);
    } catch (error) {
      // Rollback optimistic updates on error
      setOptimisticReactions(reactions);
      setOptimisticUserReaction(userReaction);
      console.error('Failed to add reaction:', error);
    } finally {
      setPending(null);
    }
  }

  async function handleRemove() {
    if (pending || !optimisticUserReaction) return;
    
    setPending("remove");
    
    // Optimistic updates
    const newReactions = { ...optimisticReactions };
    newReactions[optimisticUserReaction] = Math.max(0, newReactions[optimisticUserReaction] - 1);
    
    setOptimisticReactions(newReactions);
    setOptimisticUserReaction(null);

    try {
      await onRemove();
    } catch (error) {
      // Rollback optimistic updates on error
      setOptimisticReactions(reactions);
      setOptimisticUserReaction(userReaction);
      console.error('Failed to remove reaction:', error);
    } finally {
      setPending(null);
    }
  }

  const buttonStyle = (type: ReactionType) => ({
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    background: optimisticUserReaction === type ? '#e3f2fd' : 'white',
    cursor: pending ? 'not-allowed' : 'pointer',
    opacity: pending ? 0.6 : 1,
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  });

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <button 
        onClick={() => handle("up")} 
        disabled={!!pending}
        style={buttonStyle('up')}
      >
        👍 {optimisticReactions.up}
      </button>
      <button 
        onClick={() => handle("down")} 
        disabled={!!pending}
        style={buttonStyle('down')}
      >
        👎 {optimisticReactions.down}
      </button>
      <button 
        onClick={() => handle("heart")} 
        disabled={!!pending}
        style={buttonStyle('heart')}
      >
        ❤️ {optimisticReactions.heart}
      </button>
      
      {optimisticUserReaction && (
        <button 
          onClick={handleRemove} 
          disabled={!!pending}
          style={{
            padding: '6px 10px',
            border: '1px solid #ff6b6b',
            borderRadius: '4px',
            background: 'white',
            color: '#ff6b6b',
            cursor: pending ? 'not-allowed' : 'pointer',
            opacity: pending ? 0.6 : 1,
            fontSize: '12px',
          }}
        >
          Remove
        </button>
      )}
      
      {pending && (
        <span style={{ fontSize: '12px', color: '#666' }}>
          {pending === 'remove' ? 'Removing...' : 'Adding...'}
        </span>
      )}
    </div>
  );
}
