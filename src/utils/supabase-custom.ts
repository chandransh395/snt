
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

// This is a workaround for TypeScript type limitations
// It allows us to access tables that might not be in the auto-generated types
export const supabaseCustom = {
  from: <T extends keyof Database['public']['Tables'] | string>(table: T) => {
    return supabase.from(table as any);
  },
  // Add other methods as needed
  auth: supabase.auth,
  storage: supabase.storage,
  rpc: supabase.rpc,
};

export default supabaseCustom;
