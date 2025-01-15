import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { Database } from '../database.types';

type BeanAward = Database['public']['Tables']['bean_awards']['Row'];
type NewBeanAward = Database['public']['Tables']['bean_awards']['Insert'];

export function useBeanAwards(ideaId: string | null) {
  return useQuery({
    queryKey: ['bean-awards', ideaId],
    queryFn: async () => {
      if (!ideaId) return [];

      const { data, error } = await supabase
        .from('bean_awards')
        .select(`
          *,
          awarded_by:profiles(*)
        `)
        .eq('idea_id', ideaId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!ideaId,
  });
}

export function useAwardBeans() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (award: NewBeanAward) => {
      const { data, error } = await supabase
        .from('bean_awards')
        .insert(award)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bean-awards', variables.idea_id] });
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
    },
  });
}