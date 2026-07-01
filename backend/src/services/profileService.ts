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


interface UpdateProfileInput {
  full_name?: string;
  birth_date?: Date;
  gender?: string;
  country?: string;
  avatar_url?: string;
}

export const updateProfileService = async (userId: string, dataToUpdate: UpdateProfileInput) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...dataToUpdate,
      updated_at: new Date() // Buenas prácticas para auditoría
    })
    .eq('id', userId)
    .select() // Devuelve el registro actualizado
    .single();

  if (error) {
    throw new Error(`Error al actualizar el perfil: ${error.message}`);
  }

  return data;
};