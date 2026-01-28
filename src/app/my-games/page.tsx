'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

interface Game {
  app_id: number;
  name: string;
  playtime_forever: number;
  genres: string[] | null;
  categories: string[] | null;
  description: string | null;
  release_date: string | null;
  metacritic: number | null;
  header_image: string | null;
  main_story_hours: number | null;
  metadata_synced: boolean | null;
}

export default function MyGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGames() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('games')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      setGames(data || []);
      setLoading(false);
    }

    loadGames();
  }, []);

  if (loading) return <div className="p-8 text-zinc-400">Loading...</div>;

  const syncedCount = games.filter(g => g.metadata_synced).length;
  const hltbCount = games.filter(g => g.main_story_hours).length;

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <h1 className="text-2xl font-bold text-zinc-100 mb-2">My Games ({games.length})</h1>
      <p className="text-zinc-400 mb-6">
        Synced: {syncedCount}/{games.length} | HLTB data: {hltbCount}/{games.length}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-zinc-300">
          <thead className="text-xs text-zinc-400 uppercase bg-zinc-900">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">App ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Playtime</th>
              <th className="px-4 py-3">HLTB</th>
              <th className="px-4 py-3">Metacritic</th>
              <th className="px-4 py-3">Genres</th>
              <th className="px-4 py-3">Categories</th>
              <th className="px-4 py-3">Release</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Synced</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr key={game.app_id} className="border-b border-zinc-800 hover:bg-zinc-900">
                <td className="px-4 py-3">
                  {game.header_image ? (
                    <Image
                      src={game.header_image}
                      alt={game.name}
                      width={96}
                      height={45}
                      className="rounded"
                    />
                  ) : '-'}
                </td>
                <td className="px-4 py-3 text-zinc-500">{game.app_id}</td>
                <td className="px-4 py-3 font-medium text-zinc-100">{game.name}</td>
                <td className="px-4 py-3">{Math.round(game.playtime_forever / 60)}h</td>
                <td className="px-4 py-3">{game.main_story_hours ? `${game.main_story_hours}h` : '-'}</td>
                <td className="px-4 py-3">{game.metacritic || '-'}</td>
                <td className="px-4 py-3 max-w-[200px]">{game.genres?.join(', ') || '-'}</td>
                <td className="px-4 py-3 max-w-[200px]">{game.categories?.join(', ') || '-'}</td>
                <td className="px-4 py-3">{game.release_date || '-'}</td>
                <td className="px-4 py-3 max-w-[300px] text-xs text-zinc-500">{game.description || '-'}</td>
                <td className="px-4 py-3">{game.metadata_synced ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
