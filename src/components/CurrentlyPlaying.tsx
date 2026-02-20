'use client';

import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Game {
  app_id: number;
  name: string;
  header_image: string | null;
  main_story_hours: number;
}

interface CurrentlyPlayingProps {
  game: Game;
  onFinish: () => void;
  onDrop: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CurrentlyPlaying({
  game,
  onFinish,
  onDrop,
  onCancel,
  isLoading,
}: CurrentlyPlayingProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <p className="text-sm text-zinc-500 uppercase tracking-wide mb-3 text-center">
        Currently Playing
      </p>
      <div className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
        <div className="relative h-48">
          {game.header_image ? (
            <Image
              src={game.header_image}
              alt={game.name}
              fill
              className="object-cover"
              sizes="448px"
            />
          ) : (
            <div className="w-full h-full bg-zinc-800" />
          )}
        </div>
        <div className="p-5">
          <a
            href={`https://store.steampowered.com/app/${game.app_id}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="group/title inline-flex items-center gap-1.5 text-xl font-semibold text-zinc-100 mb-1 hover:text-white transition-colors cursor-pointer"
          >
            {game.name}
            <ExternalLink className="w-4 h-4 shrink-0 opacity-0 group-hover/title:opacity-100 transition-opacity" />
          </a>
          {game.main_story_hours && (
            <p className="text-zinc-500 text-sm mb-5">{game.main_story_hours}h to complete</p>
          )}
          <div className="flex gap-3">
            <Button
              onClick={onFinish}
              disabled={isLoading}
              variant="success"
              className="flex-1 cursor-pointer"
            >
              Finish
            </Button>
            <Button
              onClick={onDrop}
              disabled={isLoading}
              variant="secondary"
              className="flex-1 cursor-pointer"
            >
              Drop
            </Button>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="mt-3 w-full text-sm text-zinc-500 hover:text-zinc-400 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
