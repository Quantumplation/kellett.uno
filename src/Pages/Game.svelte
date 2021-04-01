<script lang="ts">
import Card from '../Components/card.svelte';
import Waiting from './Waiting.svelte';
import { game } from '../store';
import GameDebug from './GameDebug.svelte';

export let navigate: (p) => void;
let debug = false;

</script>

<style>
  span, div {
    color: white;
  }
  .container {
    display: flex;
    flex-direction: column;
  }
</style>

<span>Debug: </span>
<input type="checkbox" bind:checked={debug} />

<div class="container">
{#if debug}
  <GameDebug />
{:else}
  {#if !$game}
    <span>Loading...</span>
    <button on:click={() => navigate("create")}>Create</button>
    <button on:click={() => navigate("join")}>Join</button>
  {:else if !$game.currentPlayer}
    <Waiting {navigate} />
  {:else}
    <span>Deck: {$game.deck.length}</span>
    <span>
      Pile
      <div>
        {#if $game.pile.length}
          <Card card={$game.pile[$game.pile.length - 1]} />
        {:else}
          <Card card={null} />
        {/if}
      </div>
    </span>
    {#each $game.players as player}
      <span>{player.name}</span>
      <div>
        {#each player.hand as card}
          <Card {card} />
        {/each}
      </div>
    {/each}
  {/if}
{/if}
</div>