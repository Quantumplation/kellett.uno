export type Color = 'red' | 'green' | 'blue' | 'yellow' | 'wild'
export type Card = 
  | { type: 'normal', color: Color, value: number }
  | { type: 'reverse', color: Color }
  | { type: 'draw', color: Color, amount: number };

export type Deck = Card[];
export type Pile = Card[];
export type Hand = Card[];

export type Player = { name: string, hand: Hand };

export type Game = { players: Player[], currentPlayer: string, deck: Deck, pile: Pile };