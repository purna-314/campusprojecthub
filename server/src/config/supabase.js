import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { initialBatches, initialFaculty, initialProjects, initialUsers } from '../seedData.js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

export let supabase = null;
export let isSupabaseConnected = false;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err.message);
  }
}

export async function connectSupabase() {
  if (!supabase) {
    return false;
  }

  try {
    console.log('🔄 Checking Supabase connection...');
    const { data, error } = await supabase.from('batches').select('id').limit(1);
    
    if (error) {
      // Table might not exist yet or key invalid
      console.warn('⚠️ Supabase responded with notice:', error.message);
      if (error.code === '42P01') {
        console.warn('ℹ Tables not found yet in Supabase. Please run the supabase_schema.sql script in your Supabase SQL editor.');
      }
      return false;
    }

    isSupabaseConnected = true;
    console.log('\x1b[32m%s\x1b[0m', '✔ Connected to Supabase Cloud PostgreSQL successfully!');
    
    // Seed initial data if tables are empty
    await seedSupabaseIfEmpty();
    return true;
  } catch (err) {
    isSupabaseConnected = false;
    console.error('✖ Failed to connect to Supabase:', err.message);
    return false;
  }
}

export async function seedSupabaseIfEmpty() {
  if (!supabase) return;

  try {
    // Check batches
    const { count: batchCount } = await supabase.from('batches').select('*', { count: 'exact', head: true });
    if (batchCount === 0) {
      console.log('🌱 Seeding initial Batches to Supabase...');
      await supabase.from('batches').insert(initialBatches);
    }

    // Check faculty
    const { count: facCount } = await supabase.from('faculty').select('*', { count: 'exact', head: true });
    if (facCount === 0) {
      console.log('🌱 Seeding initial Faculty to Supabase...');
      await supabase.from('faculty').insert(initialFaculty);
    }

    // Check users
    const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    if (userCount === 0) {
      console.log('🌱 Seeding initial Users to Supabase...');
      await supabase.from('users').insert(initialUsers);
    }

    // Check projects
    const { count: projCount } = await supabase.from('projects').select('*', { count: 'exact', head: true });
    if (projCount === 0) {
      console.log('🌱 Seeding initial Projects to Supabase...');
      await supabase.from('projects').insert(initialProjects);
    }
  } catch (err) {
    console.error('Error during Supabase auto-seeding:', err.message);
  }
}

export async function resetSupabaseDb() {
  if (!supabase || !isSupabaseConnected) return false;
  try {
    await supabase.from('projects').delete().neq('id', 'keep_all');
    await supabase.from('users').delete().neq('id', 'keep_all');
    await supabase.from('faculty').delete().neq('id', 'keep_all');
    await supabase.from('batches').delete().neq('id', 'keep_all');

    await supabase.from('batches').insert(initialBatches);
    await supabase.from('faculty').insert(initialFaculty);
    await supabase.from('users').insert(initialUsers);
    await supabase.from('projects').insert(initialProjects);
    return true;
  } catch (err) {
    console.error('Error resetting Supabase database:', err.message);
    return false;
  }
}
