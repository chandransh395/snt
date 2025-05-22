
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
      console.log("Checking admin status for user:", userId);
      const { data, error } = await supabase
        .from('user_roles')
        .select('is_admin')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking admin status:', error);
        return;
      }
      
      const adminStatus = data?.is_admin || false;
      console.log("Admin status result:", adminStatus);
      
      // If this is an admin login, create a notification
      if (adminStatus) {
        setIsAdmin(adminStatus);
        
        // Send admin login notification
        try {
          // First check if we can access the notifications table
          const { error: checkError } = await supabase
            .from('admin_notifications')
            .select('id')
            .limit(1);
            
          // If table exists, add an admin login notification
          if (!checkError || checkError.code !== 'PGRST116') {
            const email = user?.email || 'Unknown';
            const ipRequest = await fetch('https://api.ipify.org?format=json')
              .then(res => res.json())
              .catch(() => ({ ip: 'Unknown IP' }));
            
            const ip = ipRequest?.ip || 'Unknown IP';
              
            await supabase
              .from('admin_login_logs')
              .insert({
                user_id: userId,
                email: email,
                ip_address: ip,
                user_agent: navigator.userAgent
              });
              
            // Also show a browser notification for other admins
            if ('Notification' in window && Notification.permission === 'granted') {
              const notification = new Notification('Admin Login', {
                body: `Admin user ${email} logged in from ${ip}`,
                icon: '/logo192.png'
              });
                
              // Close after 5 seconds
              setTimeout(() => notification.close(), 5000);
            }
          }
        } catch (error) {
          console.error('Error logging admin login:', error);
        }
      } else {
        setIsAdmin(adminStatus);
      }
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
        
        // Finally set loading to false after all checks are done
        setIsLoading(false);
        
        // Unsubscribe when component unmounts
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
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
