import { GameConfig } from '../types';

const STORAGE_KEY = 'pirate_battle_config';

export const DEFAULT_CONFIG: GameConfig = {
  sessionTime: 60,   // Duração da partida em segundos (60 a 180)
  spawnInterval: 3,  // Intervalo de spawn de inimigos em segundos (1 a 10)
};

export const loadGameConfig = (): GameConfig => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        sessionTime: Math.min(180, Math.max(60, Number(parsed.sessionTime) || 60)),
        spawnInterval: Math.min(10, Math.max(1, Number(parsed.spawnInterval) || 3)),
      };
    }
  } catch {
    console.warn('Failed to load config from localStorage');
  }
  return DEFAULT_CONFIG;
};

export const saveGameConfig = (config: GameConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    console.warn('Failed to save config to localStorage');
  }
};