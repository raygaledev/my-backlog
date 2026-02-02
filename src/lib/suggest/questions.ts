import type { MoodType, EnergyLevel, TimeCommitment } from './types';

export interface QuestionOption<T> {
  value: T;
  emoji: string;
  label: string;
  description: string;
}

export interface Question<T> {
  id: string;
  title: string;
  options: QuestionOption<T>[];
}

export const MOOD_QUESTION: Question<MoodType> = {
  id: 'mood',
  title: 'What do you want to FEEL right now?',
  options: [
    {
      value: 'adrenaline',
      emoji: '🔥',
      label: 'Adrenaline / Focus',
      description: 'Fast, intense, skill-based',
    },
    {
      value: 'engaged',
      emoji: '🧠',
      label: 'Engaged / Thoughtful',
      description: 'Strategy, puzzles, choices',
    },
    {
      value: 'chill',
      emoji: '😌',
      label: 'Chill / Cozy',
      description: 'Low pressure, vibes',
    },
    {
      value: 'power',
      emoji: '😈',
      label: 'Power Fantasy',
      description: 'Destroy everything, feel strong',
    },
    {
      value: 'emotional',
      emoji: '😭',
      label: 'Emotional / Story-driven',
      description: 'Narrative, characters, feels',
    },
    {
      value: 'curious',
      emoji: '🧪',
      label: 'Curious / Experimental',
      description: 'Weird, unique mechanics',
    },
  ],
};

export const ENERGY_QUESTION: Question<EnergyLevel> = {
  id: 'energy',
  title: 'How much mental energy do you have?',
  options: [
    {
      value: 'high',
      emoji: '🧠',
      label: 'High',
      description: 'Learn systems, think, optimize',
    },
    {
      value: 'medium',
      emoji: '😐',
      label: 'Medium',
      description: 'Familiar mechanics, light thinking',
    },
    {
      value: 'low',
      emoji: '🫠',
      label: 'Low',
      description: 'Brain-off, react-only, comfy',
    },
  ],
};

export const TIME_QUESTION: Question<TimeCommitment> = {
  id: 'time',
  title: 'Time commitment you\'re willing to make?',
  options: [
    {
      value: 'short',
      emoji: '⏱',
      label: 'One session (1–3h)',
      description: 'Quick wins, roguelikes, short games',
    },
    {
      value: 'medium',
      emoji: '📅',
      label: 'A few nights (5–10h)',
      description: 'Weekend-sized adventures',
    },
    {
      value: 'long',
      emoji: '🧱',
      label: 'Long haul (20h+)',
      description: 'Deep dives, RPGs, big campaigns',
    },
  ],
};

export const QUESTIONS = [MOOD_QUESTION, ENERGY_QUESTION, TIME_QUESTION] as const;
