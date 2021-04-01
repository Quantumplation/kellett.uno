<script lang="ts">
type CardType = 'normal' | 'skip' | 'reverse' | 'draw';
type NormalColor = 'red' | 'blue' | 'green' | 'yellow';
type Color = NormalColor | 'wild';
import * as symbols from '../assets/symbols';

export let cardType: CardType;
export let value: number;
export let color: Color;

let Symbol;
function getSymbol() {
  if (cardType !== 'normal') {
    return symbols.IDK;
  }
  switch (value) {
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