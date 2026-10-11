import { http, HttpResponse, delay } from 'msw';
import { PlayerScore, MatchHistoryItem } from '../types';
import { getNetworkScenario } from '../utils/networkSync';

const RANKING_KEY = 'pirate_battle_mock_ranking';
const HISTORY_KEY = 'pirate_battle_mock_history';

const getStoredRanking = (): PlayerScore[] => {
  const data = localStorage.getItem(RANKING_KEY);
  if (data) return JSON.parse(data);

  const initial: PlayerScore[] = [
    { id: '1', playerName: 'Blackbeard', score: 18, duration: 120, createdAt: new Date().toISOString() },
    { id: '2', playerName: 'Anne Bonny', score: 14, duration: 90, createdAt: new Date().toISOString() },
    { id: '3', playerName: 'Calico Jack', score: 9, duration: 60, createdAt: new Date().toISOString() },
  ];
  localStorage.setItem(RANKING_KEY, JSON.stringify(initial));
  return initial;
};

const getStoredHistory = (): MatchHistoryItem[] => {
  const data = localStorage.getItem(HISTORY_KEY);
  return data ? JSON.parse(data) : [];
};

const applyScenarioEffects = async () => {
  const scenario = getNetworkScenario();

  if (scenario === 'slow') {
    await delay(2500); // Latência alta
  } else if (scenario === 'timeout') {
    await delay(6000); // Força estouro do timeout
  } else if (scenario === 'error_500') {
    throw new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' });
  } else if (scenario === 'offline') {
    throw HttpResponse.error();
  } else {
    await delay(300); // Sucesso padrão
  }
};

export const handlers = [
  http.get('/api/ranking', async () => {
    await applyScenarioEffects();
    const ranking = getStoredRanking().sort((a, b) => b.score - a.score);
    return HttpResponse.json(ranking);
  }),

  http.get('/api/history', async () => {
    await applyScenarioEffects();
    const history = getStoredHistory();
    return HttpResponse.json(history);
  }),

  http.post('/api/ranking', async ({ request }) => {
    await applyScenarioEffects();
    const body = (await request.json()) as Omit<PlayerScore, 'id' | 'createdAt'> & { reason?: 'destroyed' | 'time_up' };

    const ranking = getStoredRanking();
    const history = getStoredHistory();

    const createdAt = new Date().toISOString();
    const id = crypto.randomUUID();

    const newScore: PlayerScore = {
      id,
      playerName: body.playerName,
      score: body.score,
      duration: body.duration,
      createdAt,
    };

    const newHistoryItem: MatchHistoryItem = {
      id,
      playerName: body.playerName,
      score: body.score,
      reason: body.reason || 'time_up',
      duration: body.duration,
      createdAt,
    };

    ranking.push(newScore);
    history.unshift(newHistoryItem);

    localStorage.setItem(RANKING_KEY, JSON.stringify(ranking));
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

    return HttpResponse.json(newScore, { status: 201 });
  }),
];