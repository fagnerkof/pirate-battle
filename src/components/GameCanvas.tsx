import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import { GameConfig, GameHUDState } from '../types';

interface GameCanvasProps {
  config: GameConfig;
  onGameOver?: (finalScore: number, reason: string) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ config, onGameOver }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [hud, setHud] = useState<GameHUDState>({
    score: 0,
    timeLeft: config.sessionTime,
    playerHp: 100,
    maxHp: 100,
    isGameOver: false,
    gameOverReason: null,
  });

  useEffect(() => {
    let isMounted = true;
    const container = containerRef.current;
    if (!container) return;

    const engine = new GameEngine(config);
    engineRef.current = engine;

    engine.onHUDUpdate = (newHud) => {
      if (isMounted) {
        setHud(newHud);
        if (newHud.isGameOver && onGameOver && newHud.gameOverReason) {
          onGameOver(newHud.score, newHud.gameOverReason);
        }
      }
    };

    engine.init(container).catch((err) => {
      console.error('Erro na inicialização do PixiJS:', err);
    });

    const handleBlur = () => engine.pause();
    const handleFocus = () => engine.resume();

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      engine.destroy();
      engineRef.current = null;
    };
  }, [config]);

  return (
    <div style={{ position: 'relative', width: '800px', height: '600px', margin: '20px auto', backgroundColor: '#0f172a' }}>
      {/* HUD React Overlay */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        right: 10,
        display: 'flex',
        justifyContent: 'space-between',
        color: '#ffffff',
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        pointerEvents: 'none',
        zIndex: 10,
      }}>
        <div>HP: {hud.playerHp} / {hud.maxHp}</div>
        <div>TIME: {hud.timeLeft}s</div>
        <div>SCORE: {hud.score}</div>
      </div>

      <div ref={containerRef} style={{ width: '800px', height: '600px' }} />
    </div>
  );
};