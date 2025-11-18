import { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase, User, ReferralStats } from '../lib/supabase';

interface UserContextType {
  dbUser: User | null;
  referralStats: ReferralStats | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  dbUser: null,
  referralStats: null,
  loading: true,
  refreshUser: async () => {},
});

export const useDbUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded } = useUser();
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);

  const syncUserToDatabase = async () => {
    if (!clerkUser) {
      setDbUser(null);
      setReferralStats(null);
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

        const { data: stats } = await supabase
          .from('referral_stats')
          .select('*')
          .eq('user_id', existingUser.id)
          .maybeSingle();

        setReferralStats(stats);
      } else {
        const referralId = clerkUser.unsafeMetadata?.referralId as string;

        if (!referralId) {
          console.error('User missing referral ID in metadata');
          setLoading(false);
          return;
        }

        const { data: newUser, error } = await supabase
          .from('users')
          .insert({
            clerk_id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            full_name: clerkUser.fullName,
            referral_id: referralId,
          })
          .select()
          .single();

        if (error) throw error;
        setDbUser(newUser);

        const { data: newStats } = await supabase
          .from('referral_stats')
          .insert({
            user_id: newUser.id,
            total_referrals: 0,
            successful_referrals: 0,
            tombola_tickets_earned: 0,
          })
          .select()
          .single();

        setReferralStats(newStats);

        const { data: referrer } = await supabase
          .from('users')
          .select('id')
          .eq('personal_id', referralId)
          .maybeSingle();

        if (referrer) {
          await supabase.rpc('increment', {
            table_name: 'referral_stats',
            row_id: referrer.id,
            column_name: 'total_referrals',
          });
        }
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
    <UserContext.Provider value={{ dbUser, referralStats, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}
