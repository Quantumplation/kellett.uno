import { Writable, writable } from "svelte/store";
import type { GameEvent } from "./Model/event-sourcing";
import type { Game } from "./Model/model";

export let events: Writable<GameEvent[]> = writable([]);
export let game: Writable<Game> = writable(null);