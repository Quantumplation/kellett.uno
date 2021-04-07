import { Writable, writable } from "svelte/store";
import type { Game } from "./Model/model";

export let game: Writable<Game> = writable(null);
export let player: Writable<String> = writable(null);

// Used to prevent double clicks: set to true before emitting the event,
// set to false once we've processed the state change which should make
// the UI unclickable for other reasons
export let isProcessing: Writable<boolean> = writable(false);

// Once we've received an update for the game, we can 
game.subscribe(g => {
  isProcessing.set(false);
});