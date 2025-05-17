
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Security timeout and retry configuration
const DEFAULT_TIMEOUT = 15000; // 15 seconds
const MAX_RETRIES = 2;

// Rate limiting for auth operations
const authRequests = new Map<string, { count: number, lastAttempt: number }>();
const MAX_AUTH_REQUESTS = 5;
const AUTH_WINDOW = 60000; // 1 minute

// Define SiteSettings type
export interface SiteSettings {
  id: number;
  phone: string;
  email: string;
  address: string;
  google_maps_url: string;
  google_map_iframe?: string | null;
  office_hours: string;
  social_facebook: string | null;
  social_instagram: string | null;
  social_twitter: string | null;
  updated_at?: string;
}

// Enhanced Supabase client with extra security features
export const supabaseCustom = {
  // Basic operations
  from: supabase.from.bind(supabase),
  rpc: supabase.rpc.bind(supabase),
  storage: supabase.storage,
  
  // Auth operations with rate limiting
  auth: {
    ...supabase.auth,
    
    signInWithPassword: async (credentials: { email: string, password: string }) => {
      const key = `signin_${credentials.email}`;
      if (!checkRateLimit(key)) {
        throw new Error('Too many sign-in attempts. Please try again later.');
      }
      
      try {
        return await supabase.auth.signInWithPassword(credentials);
      } catch (error) {
        incrementRateLimit(key);
        throw error;
      }
    },
    
    signUp: async (credentials: { email: string, password: string }) => {
      const key = `signup_${credentials.email}`;
      if (!checkRateLimit(key)) {
        throw new Error('Too many sign-up attempts. Please try again later.');
      }
      
      try {
        return await supabase.auth.signUp(credentials);
      } catch (error) {
        incrementRateLimit(key);
        throw error;
      }
    },
    
    resetPasswordForEmail: async (email: string, options?: { redirectTo: string }) => {
      const key = `reset_${email}`;
      if (!checkRateLimit(key)) {
        throw new Error('Too many password reset attempts. Please try again later.');
      }
      
      try {
        return await supabase.auth.resetPasswordForEmail(email, options);
      } catch (error) {
        incrementRateLimit(key);
        throw error;
      }
    },
    
    // Pass-through other methods
    getSession: () => supabase.auth.getSession(),
    getUser: () => supabase.auth.getUser(),
    signOut: () => supabase.auth.signOut(),
    onAuthStateChange: (callback: any) => supabase.auth.onAuthStateChange(callback),
    updateUser: (data: any) => supabase.auth.updateUser(data),
  },
};

// Helper functions for security features
function addTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    // Create timeout error
    const timeoutId = setTimeout(() => {
      reject(new Error(`Request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    
    // Execute original promise
    promise
      .then(result => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch(error => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const record = authRequests.get(key) || { count: 0, lastAttempt: now };
  
  // Reset count if outside window
  if (now - record.lastAttempt > AUTH_WINDOW) {
    authRequests.set(key, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Check if rate limit exceeded
  if (record.count >= MAX_AUTH_REQUESTS) {
    return false;
  }
  
  // Update request count
  authRequests.set(key, { count: record.count + 1, lastAttempt: now });
  return true;
}

function incrementRateLimit(key: string): void {
  const record = authRequests.get(key);
  if (record) {
    authRequests.set(key, { ...record, count: record.count + 1 });
  }
}

// Scheduled cleanup of rate limit records
setInterval(() => {
  const now = Date.now();
  authRequests.forEach((record, key) => {
    if (now - record.lastAttempt > AUTH_WINDOW) {
      authRequests.delete(key);
    }
  });
}, AUTH_WINDOW);
