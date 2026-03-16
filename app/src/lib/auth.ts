import { supabase } from './supabase';

export async function getEmailByUsername(username: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('email')
    .eq('username', username)
    .maybeSingle();

  if (error) throw error;
  return data?.email ?? null;
}

export async function signInWithUsername(username: string, password: string) {
  const email = await getEmailByUsername(username);

  if (!email) {
    throw new Error('No account found for that username.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}