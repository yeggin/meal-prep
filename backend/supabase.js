import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
    console.warn('Warning: SUPABASE_URL or SUPABASE_KEY is not defined. Using defaults or mock mode.');
    throw new Error('SUPABASE_URL or SUPABASE_KEY is not defined');
    
  }
  
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;