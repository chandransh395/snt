
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  // Function to check user admin status - separated to prevent deadlocks
  const checkUserAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('is_admin')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      
      setIsAdmin(data?.is_admin || false);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // First, set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
          console.log('Auth state changed:', event, currentSession?.user?.email);
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          // Use setTimeout to avoid Supabase function call inside the event handler
          if (currentSession?.user) {
            setTimeout(() => {
              checkUserAdminStatus(currentSession.user.id);
            }, 0);
          } else {
            setIsAdmin(false);
          }
        });

        // Then check for existing session
        const { data } = await supabase.auth.getSession();
        console.log('Initial session check:', data?.session?.user?.email);
        
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
          
          if (data.session.user) {
            await checkUserAdminStatus(data.session.user.id);
          }
        }
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: 'Account created',
        description: 'Please check your email to verify your account.',
      });
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast({
        title: 'Sign up failed',
        description: error.message || 'Failed to create account.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast({
        title: 'Sign in failed',
        description: error.message || 'Invalid email or password.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: 'Sign out failed',
        description: error.message || 'Failed to sign out.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAdmin,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
