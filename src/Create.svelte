<script lang="ts">
import shortid from 'shortid';
import Button from './Components/button.svelte';
export let navigate: (p: string) => void;

let pressed = false;
let unselectable = true;
let playerCount = 2;

shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+=');

function newId() {
    return shortid.generate();
}

let gameId = newId();

async function clickStart() {
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
    textArea.value = gameId;
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
    #code.loading {
        background-color: #888;
    }
    #code.error {
        background-color: $unoRed;
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
        margin-bottom: 16px;
    }
    .waiting img {
        width: 20%;
        animation: pausing-rotate ease-in-out 8s infinite;
        padding: 5px;
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

<div class="page">
    <div class="form">
        <ul class="row breadcrumbs">
            <!-- svelte-ignore a11y-missing-attribute -->
            <li><a on:click={navigateTo('home')}>Home</a></li>
            <li>Create</li>
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
                {gameId}
            </span>
        </div>
        <div class="row waiting">
                <img alt="Waiting..." src="images/reverse.png" />
                <span>{playerCount} player{playerCount > 1 ? 's' : ''} waiting...</span>
        </div>
        <Button disabled={playerCount <= 1} on:click={navigateTo(`game/${gameId}`)}>Start</Button>
    </div>
</div>