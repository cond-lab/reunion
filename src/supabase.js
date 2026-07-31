import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wkwdppyuxepigctzrhkm.supabase.co';
const supabaseKey = 'sb_publishable_paghr-MTrj608t0tBv6heQ_zcpRENbs';

export const supabase = createClient(supabaseUrl, supabaseKey);
