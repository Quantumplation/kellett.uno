import { Game, GameEvent, GameError, newSeed } from './model';
import { isError } from './model';
import { update } from "./event-sourcing";
import { game, page, player } from '../store';
import Peer from 'peerjs';

let peer: Peer;
let clients: { [id: string]: { lastEvent: number, conn: Peer.DataConnection, heartbeat: number } } = {};
let host: Peer.DataConnection;

function isClosed(conn: Peer.DataConnection) {
  return !conn.peerConnection || conn.peerConnection.iceConnectionState === 'disconnected';
}

/** Server code */
export function startListening(id: string) {
  peer = new Peer(`${id}`, { debug: 2 });

  // If we ever get an error, make sure to print it so we can debug
  peer.on('error', (err) => {
    console.log('[HOST] Network Err: ', err);
  });

  // Try to reconnect if we get disconnected
  peer.on('disconnected', () => {
    console.log('[HOST] Disconnected, attempting to reconnect...');
    peer.reconnect();
  });

  peer.on('close', () => {
    console.log('[HOST] Connection closed.  Refresh the page!');
  });

  // When a new peer connects
  peer.on('connection',(conn) => {
    // If the connection is closed, record a disconnect event
    conn.on('close', () => {
      console.log('[HOST] Someone left');
      // Attempt to apply the event to the game state
      if (conn.metadata) {
        let goe = emitEvent({ type: 'leave', player: conn.metadata, seed: newSeed() });
        // If we got an error, mirror that to the person who sent us the message
        if (isError(goe)) {
          console.log('[HOST] Error applying event', goe);
          conn.send(goe);
        }
      }
      delete clients[conn.peer];
    });

    // Wait for the connection to finish opening
    conn.on('open', () => {
      console.log('[HOST] New connection, ', conn.peer);
      // Keep track of this client
      clients[conn.peer] = { lastEvent: -1, conn, heartbeat: new Date().valueOf() };
      // When we receive data from one of the players
      conn.on('data', (data) => {
        if (data.type === 'heartbeat') {
          clients[conn.peer].heartbeat = new Date().valueOf();
          return;
        }
        console.log('[HOST] Received:', data);

        // If we receive a join event, check for impersonation, or track the player on the connection
        if (data.type == 'join') {
          let hasStarted = false;
          game.update(g => {
            hasStarted = !!g.currentPlayer;
            return g;
          });
          if (hasStarted) {
            // Redirect them to the watch page
            conn.send({ err: true, type: 'already-started' });
            return;
          }

          if (conn.metadata != null && conn.metadata != data.player) {
            console.log('[HOST] Impersonation?', data);
            conn.close();
            return;
          } else {
            conn.metadata = data.player;
          }
        }

        // Attempt to apply the event to the game state
        let goe = emitEvent(data);
        // If we got an error, mirror that to the person who sent us the message
        if (isError(goe)) {
          console.log('[HOST] Error applying event', goe);
          conn.send(goe);
          return;
        }
      });
      // Whenever the game is updated, pump messages to our clients
      game.subscribe(newGame => {
        // Make sure each client sees the events we know about
        for(const c in clients) {
          const client = clients[c];
          const timeSinceHeartbeat = new Date().valueOf() - client.heartbeat;
          const dead = timeSinceHeartbeat > 30000;
          // HACK: peerjs has a bug, where they don't emit close events
          if (dead || isClosed(client.conn)) {
            console.log(`[HOST] ${client.conn.metadata} (${client.conn.peer}) has disconnected`);
            let isPlayer = !!client.conn.metadata;
            delete clients[c];
            if (isPlayer) {
              emitEvent({ type: 'leave', player: client.conn.metadata, seed: newSeed() });
            }
            continue;
          }
          // There may be multiple events to send
          while(client.lastEvent < newGame.lastEvent) {
            let nextEvent = newGame.events[client.lastEvent + 1];
            client.conn.send(nextEvent);
            client.lastEvent = nextEvent.id;
          }
        }
      });
      // Kick game ever second, just in case
      window.setInterval(() => {
        game.update(g => {
          if (g) {
            for(const c in clients) {
              const client = clients[c];
              let player = g.players.find(p => p.name == client.conn.metadata);
              if (player) {
                player.flatlining = Math.round((new Date().valueOf() - client.heartbeat) / 1000);
              }
            }
          }
          return g;
        });
      }, 1000);
    });
  });
}

export function connect(id: string, attempt = 0) {
  if (host && host.open) {
    return;
  }
  if (attempt > 0) {
    if (attempt % 5 === 0 && host) {
      console.log('Host connection may be dead, attempting to recreate it');
      host = null;
    }
  }
  tryConnect(id);
  setTimeout(() => connect(id, attempt + 1), 1000);
}
function tryConnect(id: string) {
  if (peer) {
    openConn(id);
    return;
  }
  peer = new Peer(null, { debug: 2 });
  peer.on('open', () => {
    openConn(id)
  });
  peer.on('error', () => {
    host = null;
    peer = null;
    connect(id);
  })
}
function openConn(id: string) {
  if (host && isClosed(host)) {
    host = null;
  }
  if (host) {
    return;
  }
  const conn = peer.connect(id, { reliable: true });
  host = conn;
  conn.on('open', () => {
    // Send a heartbeat every 2 seconds
    const heartbeat = window.setInterval(() => {
      if (window['stopHeart']) {
        return;
      }
      console.log('[CLNT] Ba-thump');
      conn.send({ type: 'heartbeat' });
    }, 2000);
    conn.on('close', () => window.clearInterval(heartbeat));
    conn.on('data', (data) => {
      console.log('[CLNT] Received: ', data);
      if (isError(data)) {
        console.log('[CLNT] Error from server: ', data);
        if (data.type === 'already-started') {
          // HACK(pi): Just downgrade to watching,
          // by redirecting the page
          page.set(`game/${id}/watch`);
          player.set(null);
        } else {
          game.update(g => { g.error = data; return g; });
        }
      } else {
        let goe = receiveEvent(data);
        if (isError(goe)) {
          console.log('[CLNT] Error applying locally: ', goe);
        }
      }
    });
  });
  conn.on('error', () => {
    host = null;
    connect(id);
  })
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