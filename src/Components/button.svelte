<script lang="ts">
import { createEventDispatcher } from 'svelte';
let pressed = false;
export let disabled = false;

const dispatcher = createEventDispatcher();

function clickStart() {
  if(disabled) {
    return;
  }
  pressed = true;
}

function clickEnd() {
  if(disabled) {
    return;
  }
  pressed = false;
  dispatcher('click');
}
</script>

<style type="text/scss">
  @import 'utilities.scss';

  .button {
    &:not(.disabled) {
      cursor: pointer;
    }
    user-select: none;
    $border: 10px;
    $radius: 10px;
    padding: $border 3*$border;
    width: 60%;
    max-width: 150px;
    margin: $border;
    color: white;
    background-color: $unoBlue;
    border-radius: $border + $radius;

    @include responsive-font(5vmin, 10px, 45px, 15pt);

    text-align: center;
    box-shadow: -1px 1px 0 white, -2px 2px 0 white, -3px 3px 0 white,
      -4px 4px 0 white;

    &:not(.disabled):hover {
      box-shadow: -1px 1px 0 white, -2px 2px 0 white;
      transform: translate(-2px, 2px);
    }

    &.pressed {
      box-shadow: none;
      background-color: $unoRed;
      transform: translate(-4px, 4px);
    }

    &.disabled {
      background-color: $unoGrey;
    }
  }
</style>

<div
  class="button"
  class:pressed
  class:disabled
  on:touchstart={clickStart}
  on:mousedown={clickStart}
  on:touchend={clickEnd}
  on:mouseup={clickEnd}
>
  <slot/>
</div>