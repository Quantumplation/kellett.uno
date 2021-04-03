<script lang="ts">
import type { Card, Color, Player } from '../Model/model';
import * as symbols from '../assets/symbols';
import Wild from './wild.svelte';
import { emitEvent } from '../Model/peers';
import { game, player } from '../store';

export let card: Card;
export let clickable = false;
export let draw = false;
export let uno = false;
export let owner: Player;

let Symbol;
function getSymbol(card: Card) {
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
      return symbols.Plus2;
    }
    return symbols.Plus4;
  }
  return symbols.digits[card.value] || symbols.IDK;
}

$: Symbol = getSymbol(card);
$: color = card ? card.color : 'none';

let choosingColor = false;

function click() {
  if (uno) {
    emitEvent({ type: 'uno', caller: $player.toString(), target: owner.name })
  }
  if (draw) {
    emitEvent({ type: 'draw', player: $player.toString(), count: 1 });
  }
  if (card != null && clickable) {
    if (card.color === 'wild') {
      choosingColor = true;
    } else {
      emitEvent({ type: 'play', player: $player.toString(), card });
    }
  }
}

function chooseColor(color: Color) {
  choosingColor = false;
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
  .card {
    width: 100px;
  }
  .container {
    display: inline-block;
  }
  .clickable {
    cursor: pointer;
  }
  .grid {
    display: flex;
    flex-direction: column;
  }
  .row {
    display: flex;
    flex-direction: row;
  }
  .button {
    width: 50px;
    height: 75px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
</style>

<div class="container" class:clickable on:click={click}>
  <svg class="card" viewBox="0 0 112 178">
    <rect width="100%" height="100%" fill="white" rx="10" />
    <rect x="10" y="10" width="92" height="158" class="{color}" rx="5" />
    <ellipse cx="56" cy="89" rx="72" ry="36" transform="rotate(115 56 89)" class="{color}" stroke="white" stroke-width=5/>
    <svelte:component this={Symbol} x="12" y="10" width="28" height="38" />
    <g transform="rotate(180 50 84)">
      <svelte:component this={Symbol} width="28" height="38"/>
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
      <svelte:component this={Symbol} x="26" y="48" width="60" height="80" />
    {/if}
    {#if uno}
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="1.5em">UNO!</text>
    {/if}
  </svg>
</div>