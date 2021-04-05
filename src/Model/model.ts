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

export type Player = { name: string, hand: Hand, uno: boolean };

export type GameEvent =
  | { id?: number, type: 'create', gameId: string, playerCount: number }
  | { id?: number, type: 'join', player: string }
  | { id?: number, type: 'start', deck: Card[], startPlayer: string }
  | { id?: number, type: 'draw', player: string, count: number }
  | { id?: number, type: 'play', player: string, card: Card, chosenColor?: Color }
  | { id?: number, type: 'uno', target: string, caller: string }
  | { id?: number, type: 'shuffle' }
  | { id?: number, type: 'end', winner: string, reason: string };

export type Game = {
  id: string,
  lastEvent: number,
  lastPlayer: string;
  events: GameEvent[],
  playerCount: number,
  players: Player[],
  currentPlayer: string,
  deck: Deck,
  pile: Pile,
  direction: number,
};

export function rand(min: number, max: number) {
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
export function shuffleDeck(old: Deck): Deck {
  let newDeck = Array.from(old);
  for(let idx = 0; idx < newDeck.length - 1; idx++) {
    // Pick a swap position
    let swapWith = rand(idx, newDeck.length);
    let temp = newDeck[idx];
    newDeck[idx] = newDeck[swapWith];
    newDeck[swapWith] = temp;
  }
  return newDeck;
}

export function newDeck(): Deck {
  let deck: Deck = [];
  // Fill the deck with the appropriate cards
  // An uno deck has 108 cards
  //  - four 0's, one of each color
  //  - eighteen 1-9's, two of each color/number
  let id = 0;
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

  return shuffleDeck(deck);
}

export function randomPlayer(players: Player[]) {
  let idx = rand(0, players.length);
  return players[idx];
}

export function isClickable(game: Game, player: string, owner: string, card: Card) {
  return game && player == owner && owner == game.currentPlayer;
}