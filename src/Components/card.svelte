<script lang="ts">
import type { Card } from '../Model/model';
import * as symbols from '../assets/symbols';
import { emitEvent } from '../Model/peers';
import { game, player } from '../store';

export let card: Card;
export let clickable = false;
export let draw = false;

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
  if (card.color === 'wild') {
    return symbols.IDK;
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
$: value = card ? card.type : 'none';

let choosingColor = card && card.color == 'wild';

function click() {
  if (draw) {
    emitEvent({ type: 'draw', player: $player.toString(), count: 1 });
  }
  if (card != null && clickable) {
    emitEvent({ type: 'play', player: $player.toString(), card });
  }
}
</script>

<style type="text/scss">
  @import 'utilities.scss';

  svg {
    & rect, ellipse {
      &.red {
        fill: $unoRed;
      }
      &.blue {
        fill: $unoBlue;
      }
      &.green {
        fill: $unoGreen;
      }
      &.yellow {
        fill: $unoYellow;
      }
    }
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
  <svelte:component this={Symbol} x="26" y="48" width="60" height="80" />
</svg>
</div>