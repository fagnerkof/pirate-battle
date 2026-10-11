import { apiClient } from './client';
import { PlayerScore, MatchHistoryItem } from '../types';

export const fetchRanking = async (): Promise<PlayerScore[]> => {
  const { data } = await apiClient.get<PlayerScore[]>('/ranking');
  return data;
};

export const fetchMatchHistory = async (): Promise<MatchHistoryItem[]> => {
  const { data } = await apiClient.get<MatchHistoryItem[]>('/history');
  return data;
};

export const submitPlayerScore = async (
  scoreData: Omit<PlayerScore, 'id' | 'createdAt'> & { reason?: 'destroyed' | 'time_up' }
): Promise<PlayerScore> => {
  const { data } = await apiClient.post<PlayerScore>('/ranking', scoreData);
  return data;
};