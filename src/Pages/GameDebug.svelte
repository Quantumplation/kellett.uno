<script lang="ts">
  import App from '../App.svelte';
import Button from '../Components/button.svelte';
import { game } from '../store';
  export let host = false;
</script>
<style>
  .container {
    color: white;
    padding: 10px;
    display: flex;
    flex-direction: column;
  }
  .split {
    display: flex;
    flex-direction: row;
  }
  .preformat {
    white-space: pre;
  }
</style>

<div class="container">
  <span>
    Game: {$game.id}
  </span>
  <span>
    Error: {$game.error}
  </span>
  <span>
    Host: {host}
  </span>
  <span>
    State: {#if $game == null} Unknown {:else if !$game.currentPlayer} Waiting {:else} Playing {/if} 
  </span>
  {#if $game}
    <span class="split">
      <div class="container">
        Events:
        {#each $game.events as event }
          <div>
            {JSON.stringify({
              ...event,
              deck: event["deck"] ? "[...]" : undefined,
              cards: event["cards"] ? "[...]" : undefined,
              card: event["card"] ? "[...]" : undefined
            })}
          </div>
        {/each}
      </div>
      <div class="container">
        Game State:
        <div class="preformat">
          {JSON.stringify({ ...$game, events: undefined }, null, 2)}
        </div>
      </div>
    </span>
  {/if}
</div>