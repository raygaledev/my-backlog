import type { SuggestionContext, GameForSuggestion } from './types';

const MOOD_DESCRIPTIONS = {
  adrenaline: 'fast-paced, intense, skill-based gameplay that gets the heart pumping',
  engaged: 'strategic depth, puzzles, meaningful choices that require thinking',
  chill: 'relaxing, low-pressure, cozy vibes with no stress',
  power: 'feeling powerful, destroying enemies, power fantasy fulfillment',
  emotional: 'emotional narrative, compelling story, memorable characters',
  curious: 'unique mechanics, experimental gameplay, something different',
};

const ENERGY_DESCRIPTIONS = {
  high: 'complex systems to learn, optimization, deep mechanics',
  medium: 'familiar mechanics with some light thinking required',
  low: 'minimal cognitive load, react-only, comfortable and easy to play',
};

const TIME_DESCRIPTIONS = {
  short: '1-5 hours to complete OR games playable in short sessions (roguelikes count!)',
  medium: '5-12 hours total, perfect for a few evenings',
  long: '20+ hours, deep commitment, epic adventures',
};

function formatGameForPrompt(game: GameForSuggestion): string {
  const parts = [
    `"${game.name}" (ID: ${game.app_id})`,
    game.genres?.length ? `Genres: ${game.genres.join(', ')}` : null,
    game.main_story_hours ? `Length: ${game.main_story_hours}h` : null,
    game.playtime_forever > 0 ? `Already played: ${Math.round(game.playtime_forever / 60)}h` : 'Never played',
    game.steam_review_weighted ? `Rating: ${game.steam_review_weighted}%` : null,
    game.reroll_count > 0 ? `(Skipped ${game.reroll_count} time${game.reroll_count > 1 ? 's' : ''} before)` : null,
  ].filter(Boolean);

  return parts.join(' | ');
}

export function buildSuggestionPrompt(context: SuggestionContext): string {
  const { preferences, backlogGames, finishedGames, droppedGames, excludeAppIds } = context;

  // Filter out excluded games
  const eligibleGames = backlogGames.filter(g => !excludeAppIds.includes(g.app_id));

  if (eligibleGames.length === 0) {
    throw new Error('No eligible games to suggest');
  }

  const gamesListFormatted = eligibleGames
    .map(formatGameForPrompt)
    .join('\n');

  const prompt = `You are a game recommendation assistant helping a user pick their next game from their Steam backlog.

## USER'S CURRENT MOOD & PREFERENCES

**Desired feeling:** ${MOOD_DESCRIPTIONS[preferences.mood]}
**Mental energy level:** ${ENERGY_DESCRIPTIONS[preferences.energy]}
**Time commitment:** ${TIME_DESCRIPTIONS[preferences.time]}

## THEIR BACKLOG (${eligibleGames.length} eligible games)

${gamesListFormatted}

## CONTEXT FROM THEIR HISTORY

${finishedGames.length > 0 ? `Games they FINISHED (they enjoyed these enough to complete): ${finishedGames.slice(0, 10).join(', ')}${finishedGames.length > 10 ? ` and ${finishedGames.length - 10} more` : ''}` : 'No finished games yet.'}

${droppedGames.length > 0 ? `Games they DROPPED (less interested in these styles): ${droppedGames.slice(0, 10).join(', ')}${droppedGames.length > 10 ? ` and ${droppedGames.length - 10} more` : ''}` : 'No dropped games.'}

## YOUR TASK

Pick ONE game from the backlog that best matches their current mood, energy, and time preferences. Consider:
- Games they've skipped before should generally be deprioritized (but not excluded)
- Higher-rated games are generally safer picks
- Match the time commitment (roguelikes work for "short" sessions even if total playtime is long)
- Match the mood/genre appropriately

Respond with ONLY valid JSON in this exact format:
{
  "app_id": <number>,
  "reasoning": "<2-3 sentences explaining why this game fits their current mood, energy level, and time constraints>"
}`;

  return prompt;
}

export function parseAIResponse(response: string): { app_id: number; reasoning: string } {
  // Try to extract JSON from the response (handles markdown code blocks)
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No valid JSON found in AI response');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  if (typeof parsed.app_id !== 'number' || !Number.isInteger(parsed.app_id)) {
    throw new Error('Invalid app_id in AI response');
  }

  if (typeof parsed.reasoning !== 'string' || parsed.reasoning.length === 0) {
    throw new Error('Invalid reasoning in AI response');
  }

  return {
    app_id: parsed.app_id,
    reasoning: parsed.reasoning,
  };
}
