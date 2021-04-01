<script lang="ts">
import Card from '../Components/card.svelte';
import Waiting from './Waiting.svelte';
import { game } from '../store';

export let navigate: (p) => void;
export let host = false;

</script>

<style>
  span, div {
    color: white;
  }
</style>

{#if !$game}
  <button on:click={() => navigate("join")}>Loading...</button>
{:else if !$game.currentPlayer}
  <Waiting {navigate} />
{:else}
  <span>Deck: {$game.deck.length}</span>
  {#each $game.players as player}
    <span>{player.name}</span>
    <div>
      {#each player.hand as card}
        <Card {card} />
      {/each}
    </div>
  {/each}
{/if}
