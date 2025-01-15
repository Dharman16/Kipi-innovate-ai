import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { Database } from '../database.types';

type Vote = Database['public']['Tables']['votes']['Row'];
type NewVote = Database['public']['Tables']['votes']['Insert'];

export function useVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newVote: NewVote) => {
      // First, check if the vote already exists
      const { data: existingVote } = await supabase
        .from('votes')
        .select()
        .eq('idea_id', newVote.idea_id)
        .eq('user_id', newVote.user_id)
        .maybeSingle();

      // If vote already exists, return early
      if (existingVote) {
        return existingVote;
      }

      // If vote doesn't exist, create it
      const { data, error } = await supabase
        .from('votes')
        .insert(newVote)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
    },
  });
}

export function useUnvote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ideaId, userId }: { ideaId: string; userId: string }) => {
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('idea_id', ideaId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
    },
  });
}