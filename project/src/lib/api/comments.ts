import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { Database } from '../database.types';

type Comment = Database['public']['Tables']['comments']['Row'];
type NewComment = Database['public']['Tables']['comments']['Insert'];

export function useComments(ideaId: string | null) {
  return useQuery({
    queryKey: ['comments', ideaId],
    queryFn: async () => {
      if (!ideaId) return [];
      
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          author:profiles(*)
        `)
        .eq('idea_id', ideaId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!ideaId, // Only run query if ideaId exists
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newComment: NewComment) => {
      const { data, error } = await supabase
        .from('comments')
        .insert(newComment)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['comments', variables.idea_id] 
      });
    },
  });
}