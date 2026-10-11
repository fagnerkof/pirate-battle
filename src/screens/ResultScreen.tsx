import React, { useState } from 'react';
import { useSubmitScore } from '../hooks/useGameApi';

interface ResultScreenProps {
  score: number;
  reason: 'destroyed' | 'time_up' | string;
  duration: number;
  onPlayAgain: () => void;
  onReturnMenu: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  score,
  reason,
  duration,
  onPlayAgain,
  onReturnMenu,
}) => {
  const [playerName, setPlayerName] = useState('');
  const submitMutation = useSubmitScore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && !submitMutation.isSuccess) {
      submitMutation.mutate({
        playerName: playerName.trim(),
        score,
        duration,
        reason: reason === 'destroyed' ? 'destroyed' : 'time_up',
      });
    }
  };

  return (
    <div style={containerStyle} role="region" aria-label="Match Results">
      <h2 style={{ fontSize: '36px', color: reason === 'destroyed' ? '#ef4444' : '#eab308' }}>
        {reason === 'destroyed' ? 'SHIP DESTROYED!' : 'TIME UP!'}
      </h2>

      <div style={cardStyle}>
        <p style={{ fontSize: '20px', marginBottom: '8px' }}>Final Score: <strong>{score}</strong></p>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Duration: {duration}s | Cause: {reason === 'destroyed' ? 'Sunk by enemies' : 'Session time expired'}
        </p>
      </div>

      {!submitMutation.isSuccess ? (
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '320px', marginBottom: '24px' }}>
          <label htmlFor="playerName" style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
            Enter your name for ranking:
          </label>
          <input
            id="playerName"
            type="text"
            required
            maxLength={20}
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Captain Name"
            style={inputStyle}
          />
          <button
            type="submit"
            style={submitButtonStyle}
            disabled={!playerName.trim() || submitMutation.isPending}
          >
            {submitMutation.isPending ? 'Saving...' : 'Save Score'}
          </button>
          {submitMutation.isError && (
            <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>Failed to save score. Try again.</p>
          )}
        </form>
      ) : (
        <p style={{ color: '#22c55e', marginBottom: '24px', fontWeight: 'bold' }}>
          Score registered successfully!
        </p>
      )}

      <div style={{ display: 'flex', gap: '16px' }}>
        <button onClick={onPlayAgain} style={primaryButtonStyle}>Play Again</button>
        <button onClick={onReturnMenu} style={secondaryButtonStyle}>Main Menu</button>
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: '#0f172a',
  color: '#fff',
  fontFamily: 'sans-serif',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#1e293b',
  padding: '24px',
  borderRadius: '12px',
  textAlign: 'center',
  marginBottom: '24px',
  minWidth: '280px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  fontSize: '16px',
  borderRadius: '6px',
  border: '1px solid #334155',
  backgroundColor: '#1e293b',
  color: '#fff',
  marginBottom: '12px',
  boxSizing: 'border-box',
};

const submitButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  fontSize: '16px',
  fontWeight: 'bold',
  backgroundColor: '#0284c7',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
};

const primaryButtonStyle: React.CSSProperties = {
  padding: '12px 24px',
  fontSize: '16px',
  fontWeight: 'bold',
  backgroundColor: '#22c55e',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: '12px 24px',
  fontSize: '16px',
  backgroundColor: '#475569',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
};