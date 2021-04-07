import type { Game, GameEvent, GameError } from './model';
import { isError } from './model';
import { update } from "./event-sourcing";
import { game } from '../store';
import Peer from 'peerjs';

let peer: Peer;
let clients: { [id: string]: { lastEvent: number, conn: Peer.DataConnection } } = {};
let host: Peer.DataConnection;
export function startListening(id: string) {
  peer = new Peer(id, { debug: 2 });
  peer.on('error', (err) => {
    console.log('[HOST] Network Err: ', err);
  });
  // TODO: handle errors and disconnects
  peer.on('connection',(conn) => {
    conn.on('open', () => {
      console.log('[HOST] New connection, ', conn.peer);
      clients[conn.peer] = { lastEvent: -1, conn };
      conn.on('data', (data) => {
        console.log('[HOST] Received:', data);
        if (data.type == 'join') {
          if (conn.metadata != null && conn.metadata != data.player) {
            console.log('[HOST] Impersonation?', data);
            conn.close();
            return;
          } else {
            conn.metadata = data.player;
          }
        }
        let goe = emitEvent(data);
        if (isError(goe)) {
          console.log('[HOST] Error applying event', goe);
          conn.send(goe);
        }
      })
      game.subscribe(newGame => {
        // Make sure each client sees the events we know about
        for(const c in clients) {
          const client = clients[c];
          while(client.lastEvent < newGame.lastEvent) {
            let nextEvent = newGame.events[client.lastEvent + 1];
            client.conn.send(nextEvent);
            client.lastEvent = nextEvent.id;
          }
        }
      });
      // Kick, just in case
      game.update(g => g);
    });
  });
}

export function connect(id: string) {
  peer = new Peer(null, { debug: 2 });
  peer.on('open', (i) => {
    let conn = peer.connect(id, { reliable: true });
    conn.on('open', () => {
      host = conn;
      conn.on('data', (data) => {
        console.log('[CLNT] Received: ', data);
        if (isError(data)) {
          console.log('[CLNT] Error from server: ', data);
          game.update(g => { g.error = data; return g; });
        } else {
          let goe = receiveEvent(data);
          if (isError(goe)) {
            console.log('[CLNT] Error applying locally: ', goe);
          }
        }
      });
    })
  });
}

export function emitEvent(event: GameEvent): GameError | null {
  // Try to apply the event locally first
  if (host) {
    console.log('[CLNT] Sending: ', event);
    host.send(event);
  } else if(clients) {
    let goe = receiveEvent(event);
    if (isError(goe)) {
      console.log('[GAME] Error applying state: ', goe);
      for (var client of Object.values(clients)) {
        client.conn.send(goe);
      }
      return goe;
    } else if(goe && goe.length > 0) {
      for(const evt of goe) {
        emitEvent(evt);
      }
    }
  }

  return null;
}

export function receiveEvent(event: GameEvent): GameError | GameEvent[] {
  // Try to apply the event locally first
  let error: GameError;
  let events: GameEvent[];
  game.update(g => {
    if (event.id == null) {
      if (!g) {
        event.id = 0;
      } else {
        event.id = g.lastEvent + 1;
      }
    }
    let goe = update(g, event);
    if (isError(goe)) {
      error = goe;
      g.error = goe;
      return g;
    }

    console.log('[GAME] Update: ', goe);
    if(goe.events && goe.events.length) {
      console.log('[GAME] Additional Events: ', goe.events);
      events = goe.events;
    }
    return goe.game;
  });
  if(error) {
    return error;
  }

  return events;
}