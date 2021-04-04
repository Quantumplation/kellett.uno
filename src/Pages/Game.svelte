<script lang="ts">
import Card from '../Components/card.svelte';
import Waiting from './Waiting.svelte';
import { game, player } from '../store';
import GameDebug from './GameDebug.svelte';
import { isClickable } from '../Model/model';
import { handle_promise } from 'svelte/internal';

export let navigate: (p) => void;
let debug = false;

$: currentPlayer = $player && $player.toString();
$: topCard = $game && $game.pile.length ? $game.pile[$game.pile.length - 1] : null;

</script>

<style>
  span, div {
    color: white;
  }
  .container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .row {
    display: flex;
    flex-direction: row;
  }
  .currentPlayer {
    color: red;
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
    <span>Deck: {$game.deck.length}
      <div>
        <Card card={null} draw={true} clickable={$game.currentPlayer == currentPlayer} />
      </div>
    </span>
    <span>
      Pile
      <div>
        <Card card={topCard} showing="front" />
      </div>
    </span>
    {#each $game.players as player}
      <span class:currentPlayer={player.name === $game.currentPlayer}>{player.name}</span>
      <div class="row">
        {#each player.hand as card (card.id)}
          <Card {card} showing={player.name === currentPlayer ? 'front' : 'back'} clickable={isClickable($game, currentPlayer, player.name, card)} />
        {/each}
        {#if player.uno}
          <Card card={null} uno={true} owner={player} clickable={true} />
        {/if}
      </div>
    {/each}
  {/if}
{/if}
</div>