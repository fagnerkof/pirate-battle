import React, { useState } from 'react';
import { useRanking, useMatchHistory } from '../hooks/useGameApi';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenOptions: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, onOpenOptions }) => {
  const [activeTab, setActiveTab] = useState<'ranking' | 'history'>('ranking');

  const rankingQuery = useRanking();
  const historyQuery = useMatchHistory();

  return (
    <main style={containerStyle}>
      <h1 style={{ fontSize: '48px', marginBottom: '8px', color: '#f87171' }}>PIRATE BATTLE</h1>
      <p style={{ color: '#94a3b8', marginBottom: '32px' }}>Naval Combat Arena</p>

      <nav aria-label="Main Navigation" style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
        <button onClick={onStartGame} style={playButtonStyle} aria-label="Start Game">
          Play Game
        </button>
        <button onClick={onOpenOptions} style={actionButtonStyle} aria-label="Open Settings">
          Options
        </button>
      </nav>

      <section style={panelStyle} aria-label="Leaderboard and History">
        <div role="tablist" style={tabListStyle}>
          <button
            role="tab"
            aria-selected={activeTab === 'ranking'}
            onClick={() => setActiveTab('ranking')}
            style={activeTab === 'ranking' ? activeTabStyle : tabStyle}
          >
            Ranking Leaderboard
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
            style={activeTab === 'history' ? activeTabStyle : tabStyle}
          >
            Match History
          </button>
        </div>

        <div role="tabpanel" style={{ padding: '20px', color: '#cbd5e1' }}>
          {activeTab === 'ranking' && (
            <div>
              {rankingQuery.isLoading && <p style={{ textAlign: 'center' }}>Loading ranking...</p>}
              {rankingQuery.isError && <p style={{ color: '#ef4444', textAlign: 'center' }}>Failed to load ranking.</p>}
              {rankingQuery.data && rankingQuery.data.length === 0 && <p style={{ textAlign: 'center' }}>No scores recorded yet.</p>}
              {rankingQuery.data && rankingQuery.data.length > 0 && (
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>#</th>
                      <th style={thStyle}>Player</th>
                      <th style={thStyle}>Score</th>
                      <th style={thStyle}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingQuery.data.map((item, index) => (
                      <tr key={item.id || index}>
                        <td style={tdStyle}>{index + 1}</td>
                        <td style={tdStyle}>{item.playerName}</td>
                        <td style={tdStyle}>{item.score}</td>
                        <td style={tdStyle}>{item.duration}s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              {historyQuery.isLoading && <p style={{ textAlign: 'center' }}>Loading match history...</p>}
              {historyQuery.isError && <p style={{ color: '#ef4444', textAlign: 'center' }}>Failed to load history.</p>}
              {historyQuery.data && historyQuery.data.length === 0 && <p style={{ textAlign: 'center' }}>No match history available.</p>}
              {historyQuery.data && historyQuery.data.length > 0 && (
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Player</th>
                      <th style={thStyle}>Score</th>
                      <th style={thStyle}>Result</th>
                      <th style={thStyle}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyQuery.data.map((item) => (
                      <tr key={item.id}>
                        <td style={tdStyle}>{item.playerName}</td>
                        <td style={tdStyle}>{item.score}</td>
                        <td style={tdStyle}>{item.reason === 'destroyed' ? 'Destroyed' : 'Time Up'}</td>
                        <td style={tdStyle}>{new Date(item.createdAt).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
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

const playButtonStyle: React.CSSProperties = {
  padding: '14px 36px',
  fontSize: '20px',
  fontWeight: 'bold',
  backgroundColor: '#22c55e',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
};

const actionButtonStyle: React.CSSProperties = {
  padding: '14px 28px',
  fontSize: '18px',
  backgroundColor: '#3b82f6',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
};

const panelStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '540px',
  backgroundColor: '#1e293b',
  borderRadius: '12px',
  overflow: 'hidden',
};

const tabListStyle: React.CSSProperties = {
  display: 'flex',
  borderBottom: '1px solid #334155',
};

const tabStyle: React.CSSProperties = {
  flex: 1,
  padding: '12px',
  backgroundColor: 'transparent',
  color: '#94a3b8',
  border: 'none',
  cursor: 'pointer',
  fontSize: '16px',
};

const activeTabStyle: React.CSSProperties = {
  ...tabStyle,
  color: '#38bdf8',
  borderBottom: '2px solid #38bdf8',
  fontWeight: 'bold',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '14px',
};

const thStyle: React.CSSProperties = {
  borderBottom: '1px solid #334155',
  padding: '8px',
  textAlign: 'left',
  color: '#94a3b8',
};

const tdStyle: React.CSSProperties = {
  padding: '8px',
  borderBottom: '1px solid #1e293b',
};