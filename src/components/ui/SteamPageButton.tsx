'use client';

import { ExternalLink } from 'lucide-react';

interface SteamPageButtonProps {
  appId: number;
  className?: string;
}

export function SteamPageButton({ appId, className = '' }: SteamPageButtonProps) {
  return (
    <a
      href={`https://store.steampowered.com/app/${appId}/`}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      <ExternalLink className="w-3 h-3" />
      Steam
    </a>
  );
}
