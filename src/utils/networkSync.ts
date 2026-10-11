import { PlayerScore } from '../types';
import { apiClient } from '../api/client';

const OFFLINE_QUEUE_KEY = 'pirate_battle_pending_scores';
const NETWORK_SCENARIO_KEY = 'pirate_battle_network_scenario';

export type NetworkScenario = 'success' | 'slow' | 'error_500' | 'timeout' | 'offline';

export const getNetworkScenario = (): NetworkScenario => {
  return (localStorage.getItem(NETWORK_SCENARIO_KEY) as NetworkScenario) || 'success';
};

export const setNetworkScenario = (scenario: NetworkScenario): void => {
  localStorage.setItem(NETWORK_SCENARIO_KEY, scenario);
};

export const resetNetworkScenario = (): void => {
  localStorage.setItem(NETWORK_SCENARIO_KEY, 'success');
};

export const queuePendingScore = (score: Omit<PlayerScore, 'id' | 'createdAt'> & { reason?: 'destroyed' | 'time_up' }): void => {
  const queue = getPendingScores();
  queue.push({ ...score, tempId: crypto.randomUUID(), queuedAt: new Date().toISOString() });
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
};

export const getPendingScores = (): any[] => {
  const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const clearPendingScores = (): void => {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
};

// Sincroniza registros retidos assim que a conexão se restabelecer
export const syncPendingScores = async (): Promise<number> => {
  const queue = getPendingScores();
  if (queue.length === 0) return 0;

  let syncedCount = 0;
  const remainingQueue = [];

  for (const item of queue) {
    try {
      await apiClient.post('/ranking', item);
      syncedCount++;
    } catch {
      remainingQueue.push(item);
    }
  }

  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remainingQueue));
  return syncedCount;
};