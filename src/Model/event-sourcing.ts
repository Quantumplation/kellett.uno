import { Card, cardsEqual, Color, Game, GameEvent, Hand, newDeck, Pile, rand, shuffleDeck } from "./model";

export type GameError =
  | { err: true, type: 'unknown', message: string }
  | { err: true, type: 'out-of-order', id: number, evt: GameEvent }
  | { err: true, type: 'already-created' }
  | { err: true, type: 'not-created', event: GameEvent }
  | { err: true, type: 'game-full' }
  | { err: true, type: 'already-started' }
  | { err: true, type: 'not-started' }
  | { err: true, type: 'invalid-draw', expected: Card, actual: Card }
  | { err: true, type: 'out-of-turn', player: string, currentPlayer: string }
  | { err: true, type: 'invalid-uno', caller: string, target: string }
  | { err: true, type: 'invalid-card', hand: Hand, card: Card, pile: Pile };

export function isError(err: any): err is GameError {
  return err && err.err; // Good approximation
}

export function update(game: Game, event: GameEvent): { game: Game, events: GameEvent[] } | GameError {
  // Must process events in order
  if (game != null && game.lastEvent != event.id - 1) {
    return { err: true, type: 'out-of-order', id: game.lastEvent, evt: event };
  }

  let nextGame: Game;
  let events: GameEvent[] = [];
  switch(event.type) {
    case 'create': {
      if (game || event.id != 0) {
        return { err: true, type: 'already-created' };
      }

      nextGame = createGame(event);
    } break;
    case 'join': {
      if(!game) {
        return { err: true, type: 'not-created', event };
      }
      if (game.currentPlayer) {
        return { err: true, type: 'already-started' };
      }
      if (game.players.length == game.playerCount) {
        return { err: true, type: 'game-full' };
      }
      
      nextGame = joinGame(game, event.player);
    } break;
    case 'start': {
      if(!game) {
        return { err: true, type: 'not-created', event };
      }
      if (game.currentPlayer) {
        return { err: true, type: 'already-started' };
      }

      nextGame = startGame(game, event);
    } break;
    case 'draw': {
      if(!game) {
        return { err: true, type: 'not-created', event };
      }
      if (!game.currentPlayer) {
        return { err: true, type: 'not-started' };
      }

      let maybeNext = draw(game, event);
      if (isError(maybeNext)) {
        return maybeNext;
      }

      nextGame = maybeNext.game;
      events = maybeNext.events;
    } break;
    case 'play': {
      if(!game) {
        return { err: true, type: 'not-created', event };
      }
      if(!game.currentPlayer) {
        return { err: true, type: 'not-started' };
      }
      if(event.player != game.currentPlayer) {
        return { err: true, type: 'out-of-turn', player: event.player, currentPlayer: game.currentPlayer };
      }
      let player = game.players.find(p => p.name === event.player);
      if(!player.hand.find(c => cardsEqual(c, event.card))) {
        return { err: true, type: 'invalid-card', hand: player.hand, card: event.card, pile: game.pile };
      }

      let result = play(game, event);
      if (isError(result)) {
        return result;
      }

      nextGame = result.game;
      events = result.events;
    } break;
    case 'uno': {
      if(!game) {
        return { err: true, type: 'not-created', event };
      }
      if(!game.currentPlayer) {
        return { err: true, type: 'not-started' };
      }

      let result = uno(game, event);
      if (isError(result)) {
        return result;
      }
      nextGame = result.game;
      events = result.events;
    } break;
    case 'shuffle': {
      if (!game) {
        return { err: true, type: 'not-created', event };
      }
      nextGame = shuffle(game);
    }
  }
  if (!nextGame) {
    return { err: true, type: 'unknown', message: 'No branches produced a next game state' };
  }
  if (nextGame.currentPlayer && nextGame.deck.length === 0) {
    events.unshift({ type: 'shuffle' });
  }
  nextGame.lastEvent = event.id;
  nextGame.events.push(event);
  return { game: nextGame, events };
}

function clone<T>(a: T): T {
  return JSON.parse(JSON.stringify(a));
}

export function createGame(event: { gameId: string, playerCount: number }): Game {
  return {
    id: event.gameId,
    lastEvent: 0,
    events: [],
    playerCount: event.playerCount,
    players: [],
    currentPlayer: null,
    deck: [],
    pile: [],
    direction: 1,
  };
}

export function joinGame(game: Game, playerName: string): Game {
  game = clone(game);
  game.players.push({ name: playerName, hand: [], uno: false });
  return game;
}

export function startGame(game: Game, event: { deck: Card[], startPlayer: string }): Game {
  game = clone(game);
  game.playerCount = game.players.length;
  game.deck = event.deck;
  game.currentPlayer = event.startPlayer;
  return game;
}

export function draw(game: Game, event: { player: string, count: number }): { game: Game, events: GameEvent[] } | GameError {
  game = clone(game);
  let player = game.players.find(p => p.name == event.player);
  for(var i = 0; i < event.count; i++) {
    let next = game.deck.shift();
    player.hand.push(next);
    if (game.deck.length === 0) {
      break;
    }
  }
  player.uno = player.hand.length === 1;
  if (game.deck.length === 0) {
    return { game, events: [{ type: 'draw', player: event.player, count: event.count - i }] };
  }
  return { game, events: [] };
}

function isLegalMove(topCard: Card | null, newCard: Card) {
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

export function play(game: Game, event: { player: string, card: Card, chosenColor?: Color }): {game: Game, events: GameEvent[]} | GameError {
  game = clone(game);
  let player = game.players.find(p => p.name === event.player);
  let topCard = game.pile[game.pile.length - 1];
  if (!isLegalMove(topCard, event.card)) {
    return { err: true, type: 'invalid-card', hand: player.hand, pile: game.pile, card: event.card };
  }
  let playerIdx = game.players.indexOf(player);
  let nextIdx = (game.players.length + playerIdx + game.direction) % game.players.length;
  let nextPlayer = game.players[nextIdx];
  let events: GameEvent[] = [];
  switch(event.card.type) {
    case 'skip': {
      nextIdx = (game.players.length + playerIdx + game.direction * 2) % game.players.length;
    } break;
    case 'reverse': {
      game.direction *= -1;
    } break;
    case 'draw': {
      events.push({ type: 'draw', player: nextPlayer.name, count: event.card.amount });
    } break;
  }
  player.hand = player.hand.filter(c => !cardsEqual(c, event.card));
  player.uno = player.hand.length === 1;
  let card = clone(event.card);
  if (card.color === 'wild' && event.chosenColor) {
    card.color = event.chosenColor;
  }
  game.pile.push(card);
  game.currentPlayer = game.players[nextIdx].name;
  return { game, events };
}

export function uno(game: Game, event: { caller: string, target: string }): { game: Game, events: GameEvent[] } | GameError {
  game = clone(game);
  let player = game.players.find(p => p.name === event.target);
  if (!player.uno) {
    return { err: true, type: 'invalid-uno', caller: event.caller, target: event.target };
  }
  player.uno = false;
  if(event.caller === event.target) {
    return { game, events: [] };
  }
  let events: GameEvent[] = [{ type: 'draw', player: event.target, count: 2 }];
  return { game, events };
}

export function shuffle(game: Game): Game {
  game = clone(game);
  
  game.deck = game.pile.slice(0, -1);
  game.pile = game.pile.slice(-1);
  shuffleDeck(game.deck);
  return game;
}