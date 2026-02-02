import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lklydqknwbbbzwxnvguj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DZ33TBjx6gZfgM7UTTBb7A_UT-gwUX7';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);