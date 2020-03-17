<script lang="ts">
let pressed = false;
</script>

<style type="text/scss">
  @import 'utilities.scss';

  .button {
    cursor: pointer;
    user-select: none;
    $border: 10px;
    $radius: 10px;
    padding: $border;
    width: 60%;
    max-width: 300px;
    margin: $border;
    color: white;
    background-color: $unoBlue;
    border-radius: $border + $radius;

    @include responsive-font(5vmin, 10px, 45px, 15pt);

    text-align: center;
    box-shadow: -1px 1px 0 white, -2px 2px 0 white, -3px 3px 0 white,
      -4px 4px 0 white;

    &:hover {
      box-shadow: -1px 1px 0 white, -2px 2px 0 white;
      transform: translate(-2px, 2px);
    }

    &.pressed {
      box-shadow: none;
      background-color: $unoRed;
      transform: translate(-4px, 4px);
    }
  }
</style>

<div
  class="button"
  class:pressed
  on:touchstart={() => pressed = true}
  on:mousedown={() => pressed = true}
  on:touchend={() => pressed = false}
  on:mouseup={() => pressed = false}
>
  <slot/>
</div>
