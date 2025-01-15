import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { Database } from '../database.types';

type Idea = Database['public']['Tables']['ideas']['Row'];
type NewIdea = Database['public']['Tables']['ideas']['Insert'];
type IdeaEditLog = Database['public']['Tables']['idea_edit_logs']['Row'];

const STALE_TIME = 1000 * 60 * 5; // 5 minutes
const CACHE_TIME = 1000 * 60 * 30; // 30 minutes

export function useIdeas(options?: UseQueryOptions<Idea[]>) {
  return useQuery({
    queryKey: ['ideas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ideas')
        .select(`
          *,
          author:profiles!ideas_author_id_fkey(*),
          feedback_by:profiles!ideas_feedback_by_fkey(*),
          comments:comments(*),
          votes:votes(*),
          contributors:idea_contributors(
            user_id,
            profiles:profiles(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    staleTime: STALE_TIME,
    cacheTime: CACHE_TIME,
    ...options,
  });
}

export function useCreateIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newIdea: NewIdea) => {
      const { data, error } = await supabase
        .from('ideas')
        .insert(newIdea)
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

export function useUpdateIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Idea> & { id: string }) => {
      const { data, error } = await supabase
        .from('ideas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      queryClient.setQueryData(['idea', data.id], data);
    },
  });
}

export function useEditIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates, 
      editorId 
    }: { 
      id: string; 
      updates: Partial<Idea>; 
      editorId: string;
    }) => {
      // Get the current idea state before update
      const { data: beforeIdea, error: fetchError } = await supabase
        .from('ideas')
        .select()
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Update the idea
      const { data: updatedIdea, error: updateError } = await supabase
        .from('ideas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Create edit log
      const { error: logError } = await supabase
        .from('idea_edit_logs')
        .insert({
          idea_id: id,
          editor_id: editorId,
          changes: {
            before: beforeIdea,
            after: updatedIdea
          }
        });

      if (logError) throw logError;

      return updatedIdea;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      queryClient.invalidateQueries({ queryKey: ['idea', data.id] });
      queryClient.invalidateQueries({ queryKey: ['idea-edit-logs', data.id] });
    },
  });
}

export function useIdeaEditLogs(ideaId: string | null) {
  return useQuery({
    queryKey: ['idea-edit-logs', ideaId],
    queryFn: async () => {
      if (!ideaId) return [];

      const { data, error } = await supabase
        .from('idea_edit_logs')
        .select(`
          *,
          editor:profiles(*)
        `)
        .eq('idea_id', ideaId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!ideaId,
    staleTime: STALE_TIME,
    cacheTime: CACHE_TIME,
  });
}

// Prefetch ideas for faster navigation
export async function prefetchIdeas(queryClient: any) {
  await queryClient.prefetchQuery({
    queryKey: ['ideas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ideas')
        .select(`
          *,
          author:profiles!ideas_author_id_fkey(*),
          feedback_by:profiles!ideas_feedback_by_fkey(*),
          comments:comments(*),
          votes:votes(*),
          contributors:idea_contributors(
            user_id,
            profiles:profiles(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}