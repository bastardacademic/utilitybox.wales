/** Dice and playing-card randomness. Uses the Web Crypto RNG, with rejection sampling so results are unbiased. */

export type RandomSource = (max: number) => number;

/** Uniform random integer in [0, max). Rejects values from the uneven top slice of the 32-bit range to avoid modulo bias. */
export function secureRandomInt(max: number): number {
  if (!Number.isInteger(max) || max <= 0 || max > 0x100000000) throw new RangeError('max must be an integer from 1 to 2^32');
  const range = 0x100000000;
  const limit = range - (range % max);
  const buffer = new Uint32Array(1);
  let value: number;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);
  return value % max;
}

export interface DieType {
  id: string;
  label: string;
  sides: number;
  /** Shown under the label to explain the unusual dice. */
  note?: string;
}

export const DICE: DieType[] = [
  { id: 'd3', label: 'D3', sides: 3, note: 'Usually a D6 counted as 1-3' },
  { id: 'd4', label: 'D4', sides: 4 },
  { id: 'd6', label: 'D6', sides: 6 },
  { id: 'd8', label: 'D8', sides: 8 },
  { id: 'd10', label: 'D10', sides: 10, note: '1-10' },
  { id: 'd12', label: 'D12', sides: 12 },
  { id: 'd20', label: 'D20', sides: 20 },
  { id: 'd100', label: 'D100', sides: 100, note: 'One roll, 1-100' },
  { id: 'dpercent', label: 'D%', sides: 100, note: 'Tens die + units die' }
];

export const MAX_DICE = 100;
export const MAX_MODIFIER = 1000;

export type RollMode = 'normal' | 'advantage' | 'disadvantage';

export interface RollRequest {
  die: DieType;
  count: number;
  modifier: number;
  mode?: RollMode;
}

export interface RollResult {
  die: DieType;
  count: number;
  modifier: number;
  mode: RollMode;
  /** Every die rolled, in order. With advantage/disadvantage this is the two D20s. */
  rolls: number[];
  /** Indexes into `rolls` that count toward the total (all of them, unless a D20 was rolled with advantage/disadvantage). */
  kept: number[];
  /** For D%: the tens die (0, 10 ... 90) and units die (0-9) behind each roll. */
  percentile?: Array<{ tens: number; units: number }>;
  subtotal: number;
  total: number;
  /** Stable text like "3D6+2" for history and sharing. */
  notation: string;
}

function percentileRoll(random: RandomSource): { value: number; tens: number; units: number } {
  const tens = random(10) * 10;
  const units = random(10);
  // 00 + 0 reads as 100, as on a real percentile pair.
  return { value: tens + units === 0 ? 100 : tens + units, tens, units };
}

export function rollDice(request: RollRequest, random: RandomSource = secureRandomInt): RollResult {
  const { die, modifier } = request;
  const mode = request.mode ?? 'normal';
  const count = request.count;
  if (!Number.isInteger(count) || count < 1 || count > MAX_DICE) throw new RangeError(`Roll between 1 and ${MAX_DICE} dice`);
  if (!Number.isInteger(modifier) || Math.abs(modifier) > MAX_MODIFIER) throw new RangeError(`Modifier must be a whole number from -${MAX_MODIFIER} to ${MAX_MODIFIER}`);
  if (mode !== 'normal' && (die.id !== 'd20' || count !== 1)) throw new RangeError('Advantage and disadvantage apply to a single D20');

  const rolls: number[] = [];
  const percentile: Array<{ tens: number; units: number }> = [];
  const rollsNeeded = mode === 'normal' ? count : 2;

  for (let i = 0; i < rollsNeeded; i++) {
    if (die.id === 'dpercent') {
      const r = percentileRoll(random);
      rolls.push(r.value);
      percentile.push({ tens: r.tens, units: r.units });
    } else {
      rolls.push(random(die.sides) + 1);
    }
  }

  let kept = rolls.map((_, i) => i);
  if (mode !== 'normal') {
    const pick = mode === 'advantage' ? (a: number, b: number) => (a >= b ? 0 : 1) : (a: number, b: number) => (a <= b ? 0 : 1);
    kept = [pick(rolls[0], rolls[1])];
  }

  const subtotal = kept.reduce((sum, i) => sum + rolls[i], 0);
  const modText = modifier === 0 ? '' : modifier > 0 ? `+${modifier}` : `${modifier}`;
  const prefix = mode === 'advantage' ? 'D20 (advantage)' : mode === 'disadvantage' ? 'D20 (disadvantage)' : `${count}${die.label}`;

  return {
    die,
    count,
    modifier,
    mode,
    rolls,
    kept,
    ...(die.id === 'dpercent' ? { percentile } : {}),
    subtotal,
    total: subtotal + modifier,
    notation: `${prefix}${modText}`
  };
}

/** Smallest and largest possible total for a roll, for showing the range. */
export function rollRange(request: RollRequest): { min: number; max: number } {
  const dice = request.mode && request.mode !== 'normal' ? 1 : request.count;
  return { min: dice + request.modifier, max: dice * request.die.sides + request.modifier };
}

// ---------------------------------------------------------------------------
// Playing cards
// ---------------------------------------------------------------------------

export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';

export interface PlayingCard {
  rank: string;
  suit: Suit;
}

export const SUITS: Array<{ id: Suit; symbol: string; red: boolean }> = [
  { id: 'spades', symbol: '♠', red: false },
  { id: 'hearts', symbol: '♥', red: true },
  { id: 'diamonds', symbol: '♦', red: true },
  { id: 'clubs', symbol: '♣', red: false }
];

export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const RANK_NAMES: Record<string, string> = { A: 'Ace', J: 'Jack', Q: 'Queen', K: 'King' };

export function cardName(card: PlayingCard): string {
  return `${RANK_NAMES[card.rank] ?? card.rank} of ${card.suit[0].toUpperCase()}${card.suit.slice(1)}`;
}

export function buildDeck(): PlayingCard[] {
  return SUITS.flatMap((suit) => RANKS.map((rank) => ({ rank, suit: suit.id })));
}

/** Fisher-Yates shuffle returning a new array. */
export function shuffle<T>(items: readonly T[], random: RandomSource = secureRandomInt): T[] {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = random(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
