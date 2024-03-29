import { player } from "../store";
import { Card, cardsEqual, Color, Game, GameError, GameEvent, newSeed, Hand, isError, isLegalMove, newDeck, Pile, Player, shuffleDeck } from "./model";

export function update(game: Game, event: GameEvent): { game: Game, events: GameEvent[] } | GameError {
  // If we are error'd out, don't process any more events
  if (game != null && game.error != null) {
    return game.error;
  }
  // Must process events in order
  if (game != null && game.lastEvent != event.id - 1) {
    return { err: true, type: 'out-of-order', id: game.lastEvent, evt: event };
  }
  // Once the game is done, don't continue to process
  if (game != null && game.winner != null) {
    return { err: true, type: 'game-over' };
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
      
      nextGame = joinGame(game, event.player);
    } break;
    case 'leave': {
      if (game) {
        nextGame = clone(game);
        if (nextGame.currentPlayer == event.player) {
          let idx = nextGame.players.findIndex(p => p.name === event.player);
          let nextIdx = (nextGame.players.length + idx + nextGame.direction * 1) % nextGame.players.length;
          nextGame.currentPlayer = nextGame.players[nextIdx].name;
        }
        if (game.currentPlayer) {
          // Game has started, shuffle their hand into the deck
          let player = nextGame.players.find(p => p.name === event.player);
          nextGame.deck.push(...player.hand);
          nextGame.deck = shuffleDeck(nextGame.deck, event.seed);
        }
        nextGame.players = nextGame.players.filter(p => p.name != event.player);
      }
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
      let playingPlayer = game.players.find(p => p.name === event.player);
      if(!playingPlayer.hand.find(c => cardsEqual(c, event.card))) {
        return { err: true, type: 'invalid-card', hand: playingPlayer.hand, card: event.card, pile: game.pile };
      }

      let result = play(game, event);
      if (isError(result)) {
        return result;
      }

      nextGame = result.game;
      events = result.events;

      player.update(p => {
        if (p && nextGame.currentPlayer === p) {
          // Play a chime for your turn
          var audio = new Audio('/sounds/your_turn.wav');
          audio.play();
        }
        return p;
      });

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
      var goe = shuffle(game, event.seed);
      if (isError(goe)) {
        return goe;
      }
      nextGame = goe;
    } break;
    case 'end': {
      if (!game) {
        return { err: true, type: 'not-created', event };
      }
      nextGame = end(game, event.winner);
      nextGame.lastEvent = event.id;
      nextGame.events.push(event);
      // HACK: return here, to avoid the stuff below
      return { game: nextGame, events: [] };
    }
  }
  if (!nextGame) {
    return { err: true, type: 'unknown', message: 'No branches produced a next game state' };
  }
  if (nextGame.currentPlayer && nextGame.deck.length === 0) {
    events.unshift({ type: 'shuffle', seed: newSeed() });
  }

  nextGame.lastEvent = event.id;
  nextGame.events.push(event);

  return { game: nextGame, events };
}

function clone<T>(a: T): T {
  return JSON.parse(JSON.stringify(a));
}

export function createGame(event: { gameId: string, turboMode: boolean }): Game {
  return {
    id: event.gameId,
    error: null,
    lastEvent: 0,
    lastPlayer: null,
    winner: null,
    events: [],
    players: [],
    currentPlayer: null,
    deck: [],
    pile: [],
    direction: 1,
    turboMode: event.turboMode,
  };
}

export function joinGame(game: Game, playerName: string): Game {
  game = clone(game);
  let first = true;
  // TODO: this doesn't actually work, because the player doesn't get notified of the new name
  while (game.players.find(p => p.name === playerName) != null) {
    if (first) {
      playerName += " I";
      first = false;
    }
    playerName += "I"
  }
  game.players.push({ name: playerName, hand: [], uno: false });
  return game;
}

export function startGame(game: Game, event: { deck: Card[], startPlayer: string }): Game {
  game = clone(game);
  game.deck = event.deck;
  game.currentPlayer = event.startPlayer;

  // Play a shuffle sound
  var audio = new Audio('/sounds/shuffle.wav');
  audio.play();

  return game;
}

export function isRob(player: string): boolean {
  return ['rob', 'splagoon'].includes(player.toLocaleLowerCase());
}

function isRobInitialDraw(event: { player: string, count: number }): boolean {
  return isRob(event.player) && event.count === 7;
}

const holyHand: Partial<Card>[] = [
  { type: 'draw', amount: 2, color: 'blue' },
  { type: 'skip', color: 'red' },
  { type: 'normal', color: 'yellow', value: 1 },
  { type: 'normal', color: 'yellow', value: 2 },
  { type: 'normal', color: 'green', value: 1 },
  { type: 'normal', color: 'green', value: 6 },
  { type: 'wild', color: 'wild' }
]

function isMatch(holyCard: Partial<Card>, card: Card) {
  return Object.entries(holyCard)
    .every(([key, value]) => card[key] === value);
}

export function draw(game: Game, event: { player: string, count: number }): { game: Game, events: GameEvent[] } | GameError {
  game = clone(game);
  let player = game.players.find(p => p.name == event.player);
  let i = event.count;
  if (isRobInitialDraw(event)) {
    for (const holyCard of holyHand) {
      const cardIdx = game.deck.findIndex(c => isMatch(holyCard, c));
      if (cardIdx >= 0) {
        player.hand.push(game.deck[cardIdx]);
        game.deck.splice(cardIdx, 1);
        --i;
      }
    }
  }
  for(;i > 0 && game.deck.length > 0; i--) {
    let next = game.deck.shift();
    player.hand.push(next);
  }
  player.uno = player.hand.length === 1;
  if (i > 0) {
    return { game, events: [{ type: 'draw', player: event.player, count: i }] };
  }
  
  var audio = new Audio('/sounds/draw.wav');
  audio.play();

  return { game, events: [] };
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
      // Recompute the next player, since direction has changed
      nextIdx = (game.players.length + playerIdx + game.direction) % game.players.length;
      nextPlayer = game.players[nextIdx];
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
  game.lastPlayer = player.name;
  game.currentPlayer = game.players[nextIdx].name;
  if (player.hand.length === 0) {
    // If playing this card causes me to win, just emit that win event
    events.push({ type: 'end', winner: player.name, reason: 'Empty hand!' });
  }
  
  var audio = new Audio('/sounds/play.wav');
  audio.play();

  return { game, events };
}

export function uno(game: Game, event: { caller: string, target: string }): { game: Game, events: GameEvent[] } | GameError {
  game = clone(game);
  let player = game.players.find(p => p.name === event.target);
  if (!player.uno) {
    // return { err: true, type: 'invalid-uno', caller: event.caller, target: event.target };
    // Don't fail, because this might just be a race condition
    return { game, events: [] };
  }
  player.uno = false;
  if(event.caller === event.target) {
    return { game, events: [] };
  }
  let events: GameEvent[] = [{ type: 'draw', player: event.target, count: 2 }];
  return { game, events };
}

export function shuffle(game: Game, seed: number): Game | GameError {
  game = clone(game);

  if (game.pile.length === 1 && game.deck.length === 0) {
    // The last card is on the pile, so we can't draw it;
    return { err: true, type: 'infinite-draw' };
  }
  
  game.deck = shuffleDeck(game.pile.slice(0, -1), seed);
  game.pile = game.pile.slice(-1);
  // Reset the wild card states
  for (const card of game.deck) {
    if (card.type === 'wild') {
      card.color = 'wild';
    }
    if (card.type === 'draw' && card.amount === 4) {
      card.color = 'wild';
    }
  }
  
  // Play a shuffle sound
  var audio = new Audio('/sounds/shuffle.wav');
  audio.play();

  return game;
}

export function end(game: Game, winner: string) {
  game = clone(game);
  game.winner = winner;
  return game;
}