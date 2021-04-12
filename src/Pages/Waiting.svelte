<script lang="ts">
import shortid from 'shortid';
import App from '../App.svelte';
import Button from '../Components/button.svelte';
import { newDeck, randomPlayer } from '../Model/model';
import { emitEvent } from '../Model/peers';
import { game } from '../store';
export let navigate: (p: string) => void;
export let host = false;

let pressed = false;
let unselectable = true;

let playerCount;
$: {
    if ($game) {
        playerCount = $game.players.length - 1;
    }
}

async function clickStart() {
    const origin = window.location.origin;
    pressed = true;
    var textArea = document.createElement("textarea");
    textArea.style.position = 'fixed';
    textArea.style.top = '0'; textArea.style.left = '0';
    textArea.style.width = '2em'; textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.value = `${origin}/join/${$game.id}`;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    let successful = false;
    try {
        successful = document.execCommand('copy');
    } catch (err) {/**/}
    if(!successful) {
        unselectable = false;
    }
    document.body.removeChild(textArea);
}
function clickEnd() {
    pressed = false;
}

function navigateTo(p: string) {
    return () => {
        navigate(p);
        return false;
    }
}

function startGame() {
    emitEvent({ type: 'start', deck: newDeck($game.players.length), startPlayer: randomPlayer($game.players).name });
    
    // Draw a hand for each player
    for(const player of $game.players) {
        emitEvent({ type: 'draw', player: player.name, count: 7 });
    }

    navigate(`game/${$game.id}/host`);
}
</script>
<style type="text/scss">

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
    .code {
        justify-content: space-around;
        padding: 10px 16px;
    }
    #code {
        margin: 0px 5px;
        padding: 5px 10px;
        font-size: 120%;
        border-radius: 3px;
        color: white;
    }
    #code.success {
        cursor: pointer;
        background-color: $unoBlue;
    }
    #code.pressed {
        background-color: $unoRed;
    }
    .unselectable {
        user-select: none;
    }
    .waiting {
        padding: 10px 16px;
    }
    .waiting img {
        width: 20%;
        animation: pausing-rotate ease-in-out 8s infinite;
        padding: 5px;
    }
    .player-list {
        margin-top: -40px;
    }

    @keyframes pausing-rotate {
        0% { transform: rotate(0deg); }
        20% { transform: rotate(0deg); }
        30% { transform: rotate(180deg); }
        70% { transform: rotate(180deg); }
        80% { transform: rotate(0deg); }
        100% { transform: rotate(0deg); }
    }
</style>

{#if $game}
    <div class="page">
        <div class="form">
            <ul class="row breadcrumbs">
                <!-- svelte-ignore a11y-missing-attribute -->
                <li><a on:click={navigateTo('home')}>Home</a></li>
                <li>{"Waiting"}</li>
            </ul>
            <div class="row code">
                <span>Game Code:</span>
                
                <span
                    id="code"
                    class="success"
                    class:pressed
                    class:unselectable
                    on:touchstart={clickStart}
                    on:mousedown={clickStart}
                    on:touchend={clickEnd}
                    on:mouseup={clickEnd}>
                    {$game.id}
                </span>
            </div>
            <div class="row waiting">
                    <img alt="Waiting..." src="/images/reverse.png" />
                    <span>{playerCount} other player{playerCount != 1 ? 's' : ''} waiting...</span>
            </div>
            <div class="row player-list">
                <ul>
                    {#each $game.players as player}
                        <li>{player.name}</li>
                    {/each}
                </ul>
            </div>
            {#if host}
                <Button disabled={playerCount < 1} on:click={startGame}>Start</Button>
            {/if}
        </div>
    </div>
{:else}
    Loading...
{/if}