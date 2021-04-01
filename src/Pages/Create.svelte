<script lang="ts">
import shortid from "shortid";
import { emitEvent, startListening } from "../Model/peers";
import { player } from "../store";

import Waiting from "./Waiting.svelte";

export let navigate: (p: string) => void;

shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_');

function newGame() {
    let id = shortid.generate();
    emitEvent({ type: 'create', gameId: id, playerCount: 4 });
    emitEvent({ type: 'join', player: 'Host' });
    player.set('Host');
    startListening(id);
}
newGame();
</script>

<Waiting {navigate} host={true}/>