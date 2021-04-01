<script lang="ts">
import Button from './Components/button.svelte';
import { isError } from './Model/event-sourcing';
import { rand } from './Model/model';
import { connect, emitEvent } from './Model/peers';
import { game } from './store';
export let navigate: (p: string) => void;

let gameCode = "";
let joinDisabled = true;
$: joinDisabled = !gameCode;

function navigateTo(p: string) {
    return () => {
        navigate(p);
        return false;
    }
}

connect('kellett_uno_test');
setTimeout(function join() {
    game.update(u => {
        if (!u) {
            // Retry in one second
            console.log('Retrying...');
            setTimeout(join, 1000);
            return u;
        }
        let goe = emitEvent({ type: 'join', player: 'Player ' + rand(0, 100000) });
        if (isError(goe)) {
            console.log('?? ', goe);
        }
        return u;
    });
}, 1000);

</script>
<style type="text/scss">

    @import './Components/utilities.scss';

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
            <li>Join</li>
        </ul>
        <div class="row code">
            <input type="text" placeholder="Game Code" bind:value={gameCode} />
        </div>
        <div class="row join">
            <Button disabled={joinDisabled}>Join</Button>
        </div>
    </div>
</div>