'use client';

import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { AuthModal } from '@/components/auth/AuthModal';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Profile {
  steam_id: string | null;
  steam_username: string | null;
  steam_avatar: string | null;
}

interface Game {
  app_id: number;
  name: string;
}

function HomeContent() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [gameCount, setGameCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
  const syncingRef = useRef(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  const syncGames = useCallback(async (games: Game[]) => {
    for (let i = 0; i < games.length; i++) {
      setSyncProgress({ current: i + 1, total: games.length });

      try {
        await fetch('/api/games/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ appId: games[i].app_id }),
        });
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (err) {
        console.error(`Failed to sync ${games[i].name}:`, err);
      }
    }
  }, []);

  useEffect(() => {
    if (searchParams.has('error')) {
      router.replace('/', { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    const supabase = createClient();

    async function loadUserData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('steam_id, steam_username, steam_avatar')
          .eq('id', user.id)
          .single();

        setProfile(profileData);

        if (profileData?.steam_id) {
          const { count: totalGames } = await supabase
            .from('games')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

          setGameCount(totalGames || 0);

          // Show UI immediately, then check for unsynced games
          setIsLoading(false);

          // Check for unsynced games
          const { data: unsyncedGames } = await supabase
            .from('games')
            .select('app_id, name')
            .eq('user_id', user.id)
            .or('metadata_synced.is.null,metadata_synced.eq.false');

          if (
            unsyncedGames &&
            unsyncedGames.length > 0 &&
            !syncingRef.current
          ) {
            syncingRef.current = true;
            setIsSyncing(true);
            setSyncProgress({ current: 0, total: unsyncedGames.length });
            await syncGames(unsyncedGames);
            setIsSyncing(false);
            syncingRef.current = false;
          }
          return;
        }
      }

      setIsLoading(false);
    }

    loadUserData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setProfile(null);
        setGameCount(0);
      }
    });

    return () => subscription.unsubscribe();
  }, [syncGames]);

  const handleConnectSteam = () => {
    window.location.href = '/api/steam/auth';
  };

  const isSteamConnected = profile?.steam_id != null;

  return (
    <div className='min-h-screen bg-zinc-950'>
      <Header />

      <main className='pt-16'>
        <section className='max-w-4xl mx-auto px-6 py-24 md:py-32'>
          <div className='text-center'>
            <h1 className='text-4xl md:text-5xl font-bold text-zinc-100 leading-tight mb-6'>
              Stop scrolling.{' '}
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400'>
                Start playing.
              </span>
            </h1>
            <p className='text-lg text-zinc-400 mb-10 max-w-xl mx-auto'>
              Connect your Steam library and let us pick your next game based on
              your mood and available time.
            </p>

            {isLoading ? (
              <div className='space-y-6'>
                <div className='inline-flex items-center gap-3 px-4 py-2 bg-zinc-800 rounded-lg'>
                  <div className='w-8 h-8 bg-zinc-700 rounded animate-pulse' />
                  <div className='w-24 h-4 bg-zinc-700 rounded animate-pulse' />
                  <span className='text-zinc-700'>·</span>
                  <div className='w-16 h-4 bg-zinc-700 rounded animate-pulse' />
                </div>
                <div className='h-12 w-40 mx-auto bg-zinc-800 rounded-lg animate-pulse' />
              </div>
            ) : user ? (
              isSteamConnected ? (
                <div className='space-y-6'>
                  <div className='inline-flex items-center gap-3 px-4 py-2 bg-zinc-800 rounded-lg'>
                    {profile?.steam_avatar && (
                      <Image
                        src={profile.steam_avatar}
                        alt=''
                        width={32}
                        height={32}
                        className='rounded'
                      />
                    )}
                    <span className='text-zinc-100'>
                      {profile?.steam_username}
                    </span>
                    <span className='text-zinc-500'>·</span>
                    <span className='text-zinc-400'>{gameCount} games</span>
                  </div>
                  {isSyncing ? (
                    <div className='w-full max-w-sm mx-auto space-y-3'>
                      <div className='h-2 bg-zinc-800 rounded-full overflow-hidden'>
                        <div
                          className='h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-200'
                          style={{
                            width: `${(syncProgress.current / syncProgress.total) * 100}%`,
                          }}
                        />
                      </div>
                      <p className='text-zinc-400 text-sm'>
                        Analyzing games... {syncProgress.current} of{' '}
                        {syncProgress.total}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Button size='lg'>Pick a Game</Button>
                    </div>
                  )}
                </div>
              ) : (
                <Button size='lg' onClick={handleConnectSteam}>
                  Connect Your Steam
                </Button>
              )
            ) : (
              <Button size='lg' onClick={() => setIsAuthModalOpen(true)}>
                Get Started
              </Button>
            )}
          </div>

          <div className='mt-24 grid md:grid-cols-3 gap-6 text-center'>
            <div className='p-6'>
              <div className='text-3xl font-bold text-zinc-100 mb-2'>1</div>
              <p className='text-zinc-400'>Connect Steam</p>
            </div>
            <div className='p-6'>
              <div className='text-3xl font-bold text-zinc-100 mb-2'>2</div>
              <p className='text-zinc-400'>
                Answer a couple of high-impact questions
              </p>
            </div>
            <div className='p-6'>
              <div className='text-3xl font-bold text-zinc-100 mb-2'>3</div>
              <p className='text-zinc-400'>Get your pick</p>
            </div>
          </div>
        </section>

        <footer className='py-6 border-t border-zinc-800'>
          <div className='max-w-4xl mx-auto px-6 text-center'>
            <p className='text-sm text-zinc-500'>MyBacklog</p>
          </div>
        </footer>
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode='signup'
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className='min-h-screen bg-zinc-950' />}>
      <HomeContent />
    </Suspense>
  );
}
