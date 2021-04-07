<script lang="ts" context="module">
  import { writable } from 'svelte/store';
  const lastClickedId = writable<number | null>(null);
</script>

<script lang="ts">
import type { Card, Color, Player } from '../Model/model';
import * as symbols from '../assets/symbols';
import { Uno } from '../assets/symbols';
import Wild from './wild.svelte';
import { emitEvent } from '../Model/peers';
import { game, isProcessing, player } from '../store';

export let card: Card;
export let clickable = false;
export let role: 'hand' | 'deck' | 'pile' | 'uno' = 'hand';
export let owner: Player | null = null;

export let startRevealed = false;
let revealed = startRevealed || shouldStartRevealed();
export function reveal() {
  revealed = true;
}

function shouldStartRevealed(): boolean {
  if (role === 'uno') {
    return true;
  }
  if (role === 'pile' && !card) {
    return true;
  }
  return false;
}

let CornerSymbol;
function getSymbol(card: Card, position: 'corner' | 'center') {
  if (card == null) {
    return null;
  }
  if (card.type === 'reverse') {
    return symbols.Reverse;
  }
  if (card.type === 'skip') {
    return symbols.Skip;
  }
  if (card.type === 'wild') {
    return card.color === 'wild' ? Wild : symbols.IDK;
  }
  if (card.type === 'draw') {
    if (card.amount === 2) {
      return position === 'corner' ? symbols.Plus2 : symbols.Pair;
    }
    return symbols.Plus4;
  }
  return symbols.digits[card.value] || symbols.IDK;
}

$: CornerSymbol = getSymbol(card, 'corner');
$: CenterSymbol = getSymbol(card, 'center');
$: color = card ? card.color : 'none';

let choosingColor = false;

$: if (!card || $lastClickedId !== card.id) {
  choosingColor = false;
}

function click() {
  lastClickedId.set(card ? card.id : null);
  if (!clickable) {
    return;
  }
  if (role === 'uno') {
    $isProcessing = true;
    emitEvent({ type: 'uno', caller: $player.toString(), target: owner && owner.name });
  }
  if (role === 'deck') {
    $isProcessing = true;
    emitEvent({ type: 'draw', player: $player.toString(), count: 1 });
  }
  if (role === 'hand') {
    if (card.color === 'wild') {
      choosingColor = true;
    } else {
      $isProcessing = true;
      emitEvent({ type: 'play', player: $player.toString(), card });
    }
  }
}

function chooseColor(color: Color) {
  choosingColor = false;
  $isProcessing = true;
  emitEvent({ type: 'play', player: $player.toString(), card, chosenColor: color })
}

</script>

<style type="text/scss">
  @import 'utilities.scss';

  .red {
    fill: $unoRed;
    background-color: $unoRed;
  }
  .blue {
    fill: $unoBlue;
    background-color: $unoBlue;
  }
  .green {
    fill: $unoGreen;
    background-color: $unoGreen;
  }
  .yellow {
    fill: $unoYellow;
    background-color: $unoYellow;
  }
  .clickable {
    cursor: pointer;
    margin-top: -20px;
  }
  .card {
    width: 100px;
    display: inline-block;
    transform-style: preserve-3d;
    transition: transform 0.3s ease-out;

    &.hidden {
      transform: perspective(500px) rotateY(-180deg);
    }
  }
  .face {
    backface-visibility: hidden;

    &.front {
      transform: rotateY(0deg);
      position: absolute;
      top: 0px;
      left: 0px;
      width: 100%;
      height: 100%;
    }

    &.back {
      transform: rotateY(180deg);
      position: static;
    }
  }
</style>

<div class="card" class:clickable class:hidden={!revealed} on:click={click}>
  <svg class="back face" viewBox="0 0 112 178">
    <rect width="100%" height="100%" fill="white" rx="10" />
    <rect x="10" y="10" width="92" height="158" fill="black" rx="5" />
    <ellipse cx="56" cy="89" rx="72" ry="36" transform="rotate(115 56 89)" class="red"/>
    <Uno x="16" y="35" width="80" />
  </svg>
  {#if revealed}
    <svg class="front face" viewBox="0 0 112 178">
      <rect width="100%" height="100%" fill="white" rx="10" />
      <rect x="10" y="10" width="92" height="158" class="{color}" rx="5" />
      <ellipse cx="56" cy="89" rx="72" ry="36" transform="rotate(115 56 89)" class="{color}" stroke="white" stroke-width=5/>
      <svelte:component this={CornerSymbol} x="12" y="10" width="28" height="38" />
      <g transform="rotate(180 50 84)">
        <svelte:component this={CornerSymbol} width="28" height="38"/>
      </g>
      {#if color === 'wild'}
        <clipPath id=cardbody>
          <rect x="10" y="10" width="92" height="158" rx="5" />
        </clipPath>
        <g clip-path=url(#cardbody)>
          <Wild
            x={0} y={0} width={112} height={178}
            style={card.type === 'draw' ? 'draw' : 'normal'}
            {choosingColor}
            {chooseColor}
          />
        </g>
      {:else}
        <svelte:component this={CenterSymbol} x="26" y="48" width="60" height="80" />
      {/if}
      {#if role === 'uno'}
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="1.5em">UNO!</text>
      {/if}
    </svg>
  {/if}
</div>