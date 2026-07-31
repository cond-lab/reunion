import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wkwdppyuxepigctzrhkm.supabase.co';
const supabaseKey = 'sb_publishable_paghr-MTrj608t0tBv6heQ_zcpRENbs';

// Cliente normal: mantiene tu sesión
export const supabase = createClient(supabaseUrl, supabaseKey);

// Cliente aislado: sirve para dar de alta usuarios sin cerrar tu sesión
export const supabaseAlta = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});
