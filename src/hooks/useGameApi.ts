import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchRanking, fetchMatchHistory, submitPlayerScore } from '../api/rankingApi';
import { PlayerScore } from '../types';

export const useRanking = () => {
  return useQuery({
    queryKey: ['ranking'],
    queryFn: fetchRanking,
  });
};

export const useMatchHistory = () => {
  return useQuery({
    queryKey: ['history'],
    queryFn: fetchMatchHistory,
  });
};

export const useSubmitScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scoreData: Omit<PlayerScore, 'id' | 'createdAt'> & { reason?: 'destroyed' | 'time_up' }) =>
      submitPlayerScore(scoreData),
    onSuccess: () => {
      // Invalida as consultas para que as tabelas atualizem automaticamente
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });
};