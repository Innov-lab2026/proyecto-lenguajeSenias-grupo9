import { supabase } from "../config/supabaseClient";

export const getProfileByIdService = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single(); 

  if (error) {
    throw new Error(`No se pudo obtener el perfil: ${error.message}`);
  }

  return data;
};