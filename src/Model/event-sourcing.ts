import { Card, cardsEqual, Game, GameEvent, Hand, newDeck, Pile, rand } from "./model";

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

      nextGame = maybeNext;
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
  }
  if (!nextGame) {
    return { err: true, type: 'unknown', message: 'No branches produced a next game state' };
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
  game.players.push({ name: playerName, hand: [] });
  return game;
}

export function startGame(game: Game, event: { deck: Card[], startPlayer: string }): Game {
  game = clone(game);
  game.playerCount = game.players.length;
  game.deck = event.deck;
  game.currentPlayer = event.startPlayer;
  return game;
}

export function draw(game: Game, event: { player: string, count: number }): Game | GameError {
  game = clone(game);
  let player = game.players.find(p => p.name == event.player);
  for(var i = 0; i < event.count; i++) {
    let next = game.deck.shift();
    player.hand.push(next);
  }
  return game;
}

export function play(game: Game, event: { player: string, card: Card }): {game: Game, events: GameEvent[]} | GameError {
  game = clone(game);
  let player = game.players.find(p => p.name === event.player);
  let topCard = game.pile[game.pile.length - 1];
  let firstCard = !topCard;
  let sameColor = topCard && topCard.color === event.card.color;
  let sameValue = topCard && topCard.type === 'normal' && event.card.type === 'normal' && topCard.value === event.card.value;
  if (!firstCard && event.card.color != 'wild' && !sameColor && !sameValue) {
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
  events.push({ type: 'draw', player: player.name, count: 1 });
  game.pile.push(event.card);
  game.currentPlayer = game.players[nextIdx].name;
  return { game, events };
}