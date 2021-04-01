<script lang="ts">
  import { game } from '../store';
  export let gameId;
  export let host = false;
</script>
<style>
  .container {
    color: white;
    padding: 10px;
    display: flex;
    flex-direction: column;
  }
</style>

<div class="container">
  <span>
    Game: {gameId}
  </span>
  <span>
    Host: {host}
  </span>
  <span>
    State: {#if $game == null} Unknown {:else if !$game.currentPlayer} Waiting {:else} Playing {/if} 
  </span>
</div>