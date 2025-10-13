import { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase, User } from '../lib/supabase';

interface UserContextType {
  dbUser: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  dbUser: null,
  loading: true,
  refreshUser: async () => {},
});

export const useDbUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded } = useUser();
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const syncUserToDatabase = async () => {
    if (!clerkUser) {
      setDbUser(null);
      setLoading(false);
      return;
    }

    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', clerkUser.id)
        .maybeSingle();

      if (existingUser) {
        setDbUser(existingUser);
      } else {
        const { data: newUser, error } = await supabase
          .from('users')
          .insert({
            clerk_id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            full_name: clerkUser.fullName,
          })
          .select()
          .single();

        if (error) throw error;
        setDbUser(newUser);
      }
    } catch (error) {
      console.error('Error syncing user to database:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      syncUserToDatabase();
    }
  }, [clerkUser?.id, isLoaded]);

  const refreshUser = async () => {
    setLoading(true);
    await syncUserToDatabase();
  };

  return (
    <UserContext.Provider value={{ dbUser, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}
