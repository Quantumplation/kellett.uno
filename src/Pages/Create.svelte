<script lang="ts">
import Button from '../Components/button.svelte';
import shortid from "shortid";
import { emitEvent, startListening } from "../Model/peers";
import { game, player } from "../store";
import { randomName } from '../Model/model';

export let navigate: (p: string) => void;

function navigateTo(p: string) {
    return () => {
        navigate(p);
        return false;
    }
}

let playerName;

shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_');

function newGame() {
    game.set(null);
    player.set(null);

    let id = null;
    while(id == null || id.startsWith('_') || id.startsWith('-') || id.endsWith('_') || id.endsWith('-')) {
        id = shortid.generate();
    }

    playerName = playerName || randomName();

    emitEvent({ type: 'create', gameId: id });
    emitEvent({ type: 'join', player: playerName });
    player.set(playerName);
    startListening(id);

    navigate(`game/${id}/host`);
}
</script>

<style lang="scss">
    
    @import '../Components/utilities.scss';

    .page {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
    }
    .form {
        $border: 10px;
        $radius: 10px;
        padding: $border;
        border-radius: $border + $radius;
        background-color: white;
        color: black;
        width: 30%;
        min-width: 200px;
        display: flex;
        flex-direction: column;
        align-items: center;

        box-shadow:
            -1px 1px 0 $unoGreen,
            -3px 3px 0 $unoGreen,
            -5px 5px 0 $unoGreen,
            -7px 7px 0 $unoGreen;
    }
    .row {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .breadcrumbs {
        padding: 10px 16px;
        justify-content: center;
        list-style: none;
    }
    .breadcrumbs li {
        font-size: 120%;
        display: inline;
    }
    .breadcrumbs li+li:before {
        padding: 8px;
        content: "/\00a0";
    }
    .breadcrumbs li a {
        color: $unoBlue;
        text-decoration: none;
    }
    .breadcrumbs li a:hover {
        color: $unoRed;
        text-decoration: underline;
    }
</style>

<div class="page">
    <div class="form">
        <ul class="row breadcrumbs">
            <!-- svelte-ignore a11y-missing-attribute -->
            <li><a on:click={navigateTo('home')}>Home</a></li>
            <li>Create</li>
        </ul>
        <div class="row code">
            <input type="text" placeholder="Player Name" bind:value={playerName} />
        </div>
        <div class="row join">
            <Button on:click={newGame}>New</Button>
        </div>
    </div>
</div>