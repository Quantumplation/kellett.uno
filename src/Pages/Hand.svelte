<script lang="ts">
import type { Player } from "../Model/model";
import type { Card as GameCard } from '../Model/model';
import Card from '../Components/card.svelte';
import { flip } from 'svelte/animate';
import { isClickable } from '../Model/model';

  import { game, isProcessing } from '../store';

  export let player: Player;
  export let currentPlayerName: string;
  export let watch: boolean;
  export let revealCard: (GameCard) => void;
  export let cardRefs: Record<number, Card>;
  export let send;
  export let receive;
  
  let overlap = player.name !== currentPlayerName;

  function revealCardInHand(card: GameCard, playerName: string) {
    if (playerName === currentPlayerName || watch) {
      revealCard(card);
    }
  }
</script>
<style>
  .col {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .row {
    display: flex;
    flex-direction: row;
    justify-content: center;
    border: 1px solid white;
    border-radius: 5px;
    margin-top: 20px;
    padding-top: 20px;
    padding-left: 20px;
    padding-right: 50px;
    min-height: 170px;
    overflow-y:hidden;
    overflow-x:auto;
  }
  .row.mine {
    padding-right: 15px;
  }
  .card {
    width: 108px;
  }
  .card.overlap {
    width: 70px;
  }
  .card .spacer {
    position: absolute;
  }
</style>

<div class="col">
<div class="row" class:mine={!overlap}>
  {#each player.hand as card (card.id)}
    <div class="card"
      class:overlap
      in:receive={{key: card.id}}
      on:introend="{() => revealCardInHand(card, player.name)}"
      out:send={{key: card.id}}
      animate:flip={{duration: 300}}
    >
      <div class="spacer">
        <Card {card} bind:this={cardRefs[card.id]} clickable={!watch && isClickable($game, currentPlayerName, player.name, card, $isProcessing)} />
      </div>
    </div>
  {/each}
  {#if player.uno}
    <Card role="uno" owner={player} clickable={!watch} />
  {/if}
</div>
<span class="player-name" class:currentPlayer={player.name === $game.currentPlayer}>{player.name}</span>
</div>