import { Card, cardsEqual, Game, GameEvent, newDeck, rand } from "./model";



export type GameError =
  | { err: true, type: 'unknown', message: string }
  | { err: true, type: 'out-of-order', id: number, evt: GameEvent }
  | { err: true, type: 'already-created' }
  | { err: true, type: 'not-created', event: GameEvent }
  | { err: true, type: 'game-full' }
  | { err: true, type: 'already-started' }
  | { err: true, type: 'not-started' }
  | { err: true, type: 'invalid-draw', expected: Card, actual: Card }

export function isError(err: any): err is GameError {
  return err && err.err; // Good approximation
}

export function update(game: Game, event: GameEvent): Game | GameError {
  // Must process events in order
  if (game != null && game.lastEvent != event.id - 1) {
    return { err: true, type: 'out-of-order', id: game.lastEvent, evt: event };
  }

  let nextGame: Game;
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

      nextGame = startGame(game);
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

      nextGame = maybeNext;
    }
  }
  if (!nextGame) {
    return { err: true, type: 'unknown', message: 'No branches produced a next game state' };
  }
  nextGame.lastEvent = event.id;
  nextGame.events.push(event);
  return nextGame;
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
    pile: []
  };
}

export function joinGame(game: Game, playerName: string): Game {
  game = clone(game);
  game.players.push({ name: playerName, hand: [] });
  return game;
}

export function startGame(game: Game): Game {
  game = clone(game);
  game.playerCount = game.players.length;
  game.deck = newDeck();
  let player = rand(0, game.playerCount);
  game.currentPlayer = game.players[player].name;
  return game;
}

export function draw(game: Game, event: { player: string, cards: Card[] }): Game | GameError {
  game = clone(game);
  let player = game.players.find(p => p.name == event.player);
  for(var card of event.cards) {
    let next = game.deck.pop();
    if (!cardsEqual(card, next)) {
      return { err: true, type: 'invalid-draw', expected: card, actual: next };
    }
    player.hand.push(next);
  }
  return game;
}