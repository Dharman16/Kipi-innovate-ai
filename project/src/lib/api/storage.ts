import { supabase } from '../supabase';

export async function uploadFile(file: File, path: string) {
  const { data, error } = await supabase.storage
    .from('attachments')
    .upload(path, file);

  if (error) throw error;
  return data;
}

export function getFileUrl(path: string) {
  const { data } = supabase.storage
    .from('attachments')
    .getPublicUrl(path);

  return data.publicUrl;
}