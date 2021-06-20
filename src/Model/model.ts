import Alea from 'alea';

export type Color = 'red' | 'green' | 'blue' | 'yellow' | 'wild';
export type Card = 
  | { id: number, type: 'normal', color: Color, value: number }
  | { id: number, type: 'wild', color: Color }
  | { id: number, type: 'reverse', color: Color }
  | { id: number, type: 'skip', color: Color }
  | { id: number, type: 'draw', color: Color, amount: number };

export type Deck = Card[];
export type Pile = Card[];
export type Hand = Card[];

export type Player = { name: string, hand: Hand, uno: boolean, flatlining?: number };

export type GameEvent =
  | { id?: number, type: 'create', gameId: string }
  | { id?: number, type: 'join', player: string }
  | { id?: number, type: 'leave', player: string, seed: number }
  | { id?: number, type: 'start', deck: Card[], startPlayer: string }
  | { id?: number, type: 'draw', player: string, count: number }
  | { id?: number, type: 'play', player: string, card: Card, chosenColor?: Color }
  | { id?: number, type: 'uno', target: string, caller: string }
  | { id?: number, type: 'shuffle', seed: number }
  | { id?: number, type: 'end', winner: string, reason: string };

export type GameError =
  | { err: true, type: 'unknown', message: string }
  | { err: true, type: 'out-of-order', id: number, evt: GameEvent }
  | { err: true, type: 'already-created' }
  | { err: true, type: 'not-created', event: GameEvent }
  | { err: true, type: 'already-started' }
  | { err: true, type: 'not-started' }
  | { err: true, type: 'game-over' }
  | { err: true, type: 'invalid-draw', expected: Card, actual: Card }
  | { err: true, type: 'infinite-draw' }
  | { err: true, type: 'out-of-turn', player: string, currentPlayer: string }
  | { err: true, type: 'invalid-uno', caller: string, target: string }
  | { err: true, type: 'invalid-card', hand: Hand, card: Card, pile: Pile };

export function isError(err: any): err is GameError {
  return err && err.err; // Good approximation
}

export type Game = {
  id: string,
  error: GameError,
  lastEvent: number,
  lastPlayer: string,
  winner: string,
  events: GameEvent[],
  players: Player[],
  currentPlayer: string,
  deck: Deck,
  pile: Pile,
  direction: number,
};

export function newSeed(): number {
  return new Date().valueOf();
}

function getPrng(seed: number) {
  const prng = Alea(seed);
  return (min: number, max: number) => {
    return min + Math.floor(prng() * (max - min));
  }
}

function rand(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min));
}

export function cardsEqual(a: Card, b: Card) {
  if (a.id != b.id || a.type != b.type || a.color != b.color) {
    return false;
  }
  switch(a.type) {
    case 'normal': {
      if(a.value != (b as any).value) {
        return false;
      }
    } break;
    case 'draw': {
      if(a.amount != (b as any).amount) {
        return false;
      }
    } break;
  }
  return true;
}

// Fisher Yates shuffle
export function shuffleDeck(old: Deck, seed: number): Deck {
  const prng = getPrng(seed)
  let newDeck = Array.from(old);
  for(let idx = 0; idx < newDeck.length - 1; idx++) {
    // Pick a swap position
    let swapWith = prng(idx, newDeck.length);
    let temp = newDeck[idx];
    newDeck[idx] = newDeck[swapWith];
    newDeck[swapWith] = temp;
  }
  return newDeck;
}

export function newDeck(players: number): Deck {
  let id = 0;
  let deck: Deck = [];

  // Use 1 deck for every 4 players
  let deckCount = Math.floor(players / 4);
  for (let i = 0; i <= deckCount; i++) {
    // Fill the deck with the appropriate cards
    // An uno deck has 108 cards
    //  - four 0's, one of each color
    //  - eighteen 1-9's, two of each color/number
    for(const color of ['red', 'yellow', 'blue', 'green'] as const) {
      for(let value = 0; value < 10; value++) {
        deck.push({ id: id++, type: 'normal', color, value });
        if(value != 0) {
          deck.push({ id: id++, type: 'normal', color, value });
        }
      }

      //- 24 action cards, two of each per color
      for(let i = 0; i < 2; i++) {
        deck.push({ id: id++, type: 'skip', color });
        deck.push({ id: id++, type: 'reverse', color });
        deck.push({ id: id++, type: 'draw', color, amount: 2 });
      }
    }
    // - Four wild cards, and four wild draw fours
    for(let i = 0; i < 4; i++) {
      deck.push({ id: id++, type: 'wild', color: 'wild' });
      deck.push({ id: id++, type: 'draw', color: 'wild', amount: 4 });
    }
  }

  return shuffleDeck(deck, newSeed());
}

export function randomPlayer(players: Player[]) {
  let idx = rand(0, players.length);
  return players[idx];
}

const adjectives = [
  "plain", "icy", "greasy",
  "tired", "sharp", "voiceless",
  "sweet", "resonant", "knowledgeable",
  "plausible", "awful", "lacking",
  "true", "grotesque", "spotted",
  "royal", "vulgar", "foregoing",
  "efficient", "fair", "numberless",
  "understood", "nonstop", "lovely"
];
const animals = [
  "lovebird", "coati", "puma",
  "chinchilla", "jerboa", "elephant",
  "marten", "tapir", "puppy",
  "hippopotamus", "okapi", "panda",
  "bear", "toad", "prairie dog",
  "coyote", "guinea pig", "mink",
  "ram", "mule", "dung beetle",
  "highland cow", "ground hot", "ibex"
];

export function randomName() {
  return `${adjectives[rand(0, adjectives.length)]} ${animals[rand(0, animals.length)]}`;
}

export function isLegalMove(topCard: Card | null, newCard: Card) {
  if (!topCard) {
    return true;
  }
  if (newCard.color === 'wild') {
    return true;
  }
  if (newCard.color === topCard.color) {
    return true;
  }
  switch (topCard.type) {
    case 'normal': {
      return newCard.type === 'normal' && newCard.value === topCard.value;
    }
    case 'draw': {
      return newCard.type === 'draw' && newCard.amount === topCard.amount;
    }
    default: {
      return newCard.type === topCard.type;
    }
  }
}


export function isClickable(game: Game, player: string, owner: string, card: Card, processing: boolean): boolean {
  if (!game) { return false; }
  const playerOwnsCard = player === owner;
  const isPlayersTurn = owner === game.currentPlayer;
  const legalMove = isLegalMove(game.pile[game.pile.length - 1], card);
  return game && playerOwnsCard && isPlayersTurn && legalMove && !processing;
}