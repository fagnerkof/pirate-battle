import React, { useState } from 'react';
import { GameConfig } from '../types';

interface OptionsScreenProps {
  currentConfig: GameConfig;
  onSave: (newConfig: GameConfig) => void;
  onBack: () => void;
}

export const OptionsScreen: React.FC<OptionsScreenProps> = ({ currentConfig, onSave, onBack }) => {
  const [sessionTime, setSessionTime] = useState(currentConfig.sessionTime);
  const [spawnInterval, setSpawnInterval] = useState(currentConfig.spawnInterval);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (sessionTime < 60 || sessionTime > 180) {
      setError('Session time must be between 60 and 180 seconds.');
      return;
    }

    if (spawnInterval < 1 || spawnInterval > 10) {
      setError('Enemy spawn interval must be between 1 and 10 seconds.');
      return;
    }

    setError(null);
    onSave({ sessionTime, spawnInterval });
  };

  return (
    <div style={containerStyle} role="region" aria-label="Game Settings">
      <h2 style={{ marginBottom: '24px' }}>Game Options</h2>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '360px' }}>
        <div style={fieldGroupStyle}>
          <label htmlFor="sessionTime" style={labelStyle}>
            Game Session Time (60 - 180 sec):
          </label>
          <input
            id="sessionTime"
            type="number"
            min={60}
            max={180}
            value={sessionTime}
            onChange={(e) => setSessionTime(Number(e.target.value))}
            style={inputStyle}
            aria-required="true"
          />
        </div>

        <div style={fieldGroupStyle}>
          <label htmlFor="spawnInterval" style={labelStyle}>
            Enemy Spawn Time (1 - 10 sec):
          </label>
          <input
            id="spawnInterval"
            type="number"
            min={1}
            max={10}
            value={spawnInterval}
            onChange={(e) => setSpawnInterval(Number(e.target.value))}
            style={inputStyle}
            aria-required="true"
          />
        </div>

        {error && <p style={errorStyle} role="alert">{error}</p>}

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button type="submit" style={primaryButtonStyle}>Save Options</button>
          <button type="button" onClick={onBack} style={secondaryButtonStyle}>Back to Menu</button>
        </div>
      </form>
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
  color: '#ffffff',
  fontFamily: 'sans-serif',
};

const fieldGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  marginBottom: '16px',
};

const labelStyle: React.CSSProperties = {
  marginBottom: '6px',
  fontSize: '14px',
};

const inputStyle: React.CSSProperties = {
  padding: '10px',
  fontSize: '16px',
  borderRadius: '6px',
  border: '1px solid #334155',
  backgroundColor: '#1e293b',
  color: '#fff',
};

const errorStyle: React.CSSProperties = {
  color: '#ef4444',
  fontSize: '14px',
  marginTop: '8px',
};

const primaryButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: '12px',
  fontSize: '16px',
  fontWeight: 'bold',
  backgroundColor: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
};

const secondaryButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: '12px',
  fontSize: '16px',
  backgroundColor: '#475569',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
};