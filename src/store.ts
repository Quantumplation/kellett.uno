import { Writable, writable } from "svelte/store";
import type { Game } from "./Model/model";

export let game: Writable<Game> = writable(null);
export let player: Writable<String> = writable(null);