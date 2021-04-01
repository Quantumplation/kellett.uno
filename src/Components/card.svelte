<script lang="ts">
import type { Card } from '../Model/model';
import * as symbols from '../assets/symbols';
import { emitEvent } from '../Model/peers';
import { player } from '../store';

export let card: Card;

let Symbol;
function getSymbol() {
  if (card == null) {
    return null;
  }
  if (card.type === 'reverse') {
    return symbols.Reverse;
  }
  if (card.type === 'skip') {
    return symbols.Skip;
  }
  if (card.type === 'draw' || card.color === 'wild') {
    return symbols.IDK;
  }
  switch (card.value) {
    case 0:
      return symbols.Zero;
    case 1:
      return symbols.One;
    case 2:
      return symbols.Two;
    case 3:
      return symbols.Three;
    case 4:
      return symbols.Four;
    case 5:
      return symbols.Five;
    case 6:
      return symbols.Six;
    case 7:
      return symbols.Seven;
    case 8:
      return symbols.Eight;
    case 9:
      return symbols.Nine;
    default:
      return symbols.IDK;
  }
}

$: Symbol = getSymbol();
let color = card ? card.color : 'none';
let value = card ? card.type : 'none';

function click() {
  emitEvent({ type: 'play', player: $player.toString(), card });
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
</style>

<div on:click={click}>
<svg class="card" viewBox="0 0 112 178">
  <rect width="100%" height="100%" fill="white" rx="10" />
  <rect x="10" y="10" width="92" height="158" class="{color}" rx="5" />
  <ellipse cx="56" cy="89" rx="72" ry="36" transform="rotate(115 56 89)" class="{color}" stroke="white" stroke-width=5/>
  <svelte:component this={Symbol} viewBox="0 0 72 80" x="16" y="12" width="34" height="34" />
  <g transform="rotate(180 48 84)">
    <svelte:component this={Symbol} viewBox="0 0 72 80" width="34" height="34"/>
  </g>
  <svelte:component this={Symbol} viewBox="0 0 72 80" x="32" y="44" width="84" height="84" />
</svg>
</div>