export interface GameConfig {
  sessionTime: number;
  spawnInterval: number;
}

export interface PlayerScore {
  id?: string;
  playerName: string;
  score: number;
  duration: number;
  createdAt: string;
}

export interface MatchHistoryItem {
  id: string;
  playerName: string;
  score: number;
  reason: 'destroyed' | 'time_up';
  duration: number;
  createdAt: string;
}

export interface GameHUDState {
  score: number;
  timeLeft: number;
  playerHp: number;
  maxHp: number;
  isGameOver: boolean;
  gameOverReason: 'time_up' | 'destroyed' | null;
}