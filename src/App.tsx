import { useState } from 'react';
import { MainMenu } from './screens/MainMenu';
import { OptionsScreen } from './screens/OptionsScreen';
import { ResultScreen } from './screens/ResultScreen';
import { GameCanvas } from './components/GameCanvas';
import { GameConfig } from './types';
import { loadGameConfig, saveGameConfig } from './utils/storage';

type ScreenState = 'menu' | 'options' | 'game' | 'result';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('menu');
  const [config, setConfig] = useState<GameConfig>(loadGameConfig());
  const [lastGameResult, setLastGameResult] = useState<{ score: number; reason: string } | null>(null);

  const handleSaveConfig = (newConfig: GameConfig) => {
    setConfig(newConfig);
    saveGameConfig(newConfig);
    setCurrentScreen('menu');
  };

  const handleGameOver = (finalScore: number, reason: string) => {
    setLastGameResult({ score: finalScore, reason });
    setCurrentScreen('result');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
      {currentScreen === 'menu' && (
        <MainMenu
          onStartGame={() => setCurrentScreen('game')}
          onOpenOptions={() => setCurrentScreen('options')}
        />
      )}

      {currentScreen === 'options' && (
        <OptionsScreen
          currentConfig={config}
          onSave={handleSaveConfig}
          onBack={() => setCurrentScreen('menu')}
        />
      )}

      {currentScreen === 'game' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px' }}>
          <button
            onClick={() => setCurrentScreen('menu')}
            style={{
              alignSelf: 'flex-start',
              marginLeft: '20px',
              padding: '8px 16px',
              backgroundColor: '#334155',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            ← Exit Game
          </button>
          <GameCanvas config={config} onGameOver={handleGameOver} />
        </div>
      )}

      {currentScreen === 'result' && lastGameResult && (
        <ResultScreen
          score={lastGameResult.score}
          reason={lastGameResult.reason}
          duration={config.sessionTime}
          onPlayAgain={() => setCurrentScreen('game')}
          onReturnMenu={() => setCurrentScreen('menu')}
        />
      )}
    </div>
  );
}