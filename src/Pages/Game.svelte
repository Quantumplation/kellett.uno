<script lang="ts">
import { crossfade } from 'svelte/transition';
import { flip } from 'svelte/animate';

import Card from '../Components/card.svelte';
import Waiting from './Waiting.svelte';
import { game, isProcessing, player } from '../store';
import GameDebug from './GameDebug.svelte';
import { isClickable } from '../Model/model';

export let navigate: (p) => void;
export let host = false;
export let watch = false;
let debug = false;

$: console.log('Is Watch: ', watch, ' player: ', $player);

const [send, receive] = crossfade({
  duration: d => Math.sqrt(d * 300),
  fallback() {
    return {
      duration: 300,
      css: (t) => `opacity: ${t}`,
    };
  }
});

$: currentPlayer = $player && $player.toString();

$: error = $game ? $game.error : null;
$: winner = $game ? $game.winner : null;

// The game starts by dealing 7 cards to each player,
// so render 7 cards on top of the deck per player to animate that.
$: deckTop = $game ? $game.deck.slice(0, $game.players.length * 7).reverse() : [];

// Some svelte plugin doesn't like us importing types, so work around that
type GameCard = typeof deckTop[0];

let pileTop: GameCard[];
$: {
  // Render the two cards on top of the pile, with a "null" if neither is there.
  // We want to render two so that the bottom one doesn't visibly "fade out" when playing a new card.
  const pile = $game ? $game.pile : [];
  if (pile.length > 1) {
    pileTop = pile.slice(-2);
  } else if (pile.length) {
    pileTop = [null, pile[pile.length - 1]];
  } else {
    pileTop = [null];
  }
}

const cardRefs: Record<number, Card> = {};
function revealCard(card: GameCard) {
  const id = card ? card.id : -1;
  if (cardRefs[id]) {
    cardRefs[id].reveal();
  }
}

function revealCardInHand(card: GameCard, playerName: string) {
  if (playerName === currentPlayer || watch) {
    revealCard(card);
  }
}

</script>

<style type="text/scss">
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
    border: 1px solid white;
    border-radius: 5px;
    margin-top: 25px;
    padding-top: 20px;
  }
  .player-name {
    font-size: 20pt;
  }
  .currentPlayer {
    color: red;
  }
  .card {
    opacity: 10 !important; // keeps crossfade from hiding the card
  }
  .deck, .pile {
    width: 100px; // keeps crossfade from thinking that cards are the width of the browser
    & .card:not(:last-child) {
      position: fixed; // keeps animations from causing reflow
      z-index: -1; // makes sure that the final element (top of the deck/pile) is visible
    }
  }
</style>

<span>Debug: </span>
<input type="checkbox" bind:checked={debug} />

<div class="container">
{#if debug}
  <GameDebug />
{:else if error}
  ERROR: {JSON.stringify(error)}
{:else if winner}
  {winner} HAS WON!
{:else}
  {#if !$game}
    <span>Loading...</span>
    <button on:click={() => navigate("create")}>Create</button>
    <button on:click={() => navigate("join")}>Join</button>
  {:else if !$game.currentPlayer}
    <Waiting {navigate} host={host} />
  {:else}
    <span class="deck">Deck: {$game.deck.length}
      {#each deckTop as deck (deck.id)}
        <div class="card" in:receive={{key: deck.id}} out:send={{key: deck.id}}>
          <Card role="deck" card={deck} clickable={!watch && $game.currentPlayer == currentPlayer} />
        </div>
      {/each}
    </span>
    <span class="pile">
      Pile: {$game.pile.length}
      {#each pileTop as pile (pile ? pile.id : null)}
        <div class="card"
          in:receive={{key: pile ? pile.id : null}}
          on:introend="{() => revealCard(pile)}"
          out:send={{key: pile ? pile.id : null}}
        >
          <Card role="pile" card={pile} startRevealed={$game.lastPlayer === currentPlayer} bind:this={cardRefs[pile ? pile.id : -1]} />
        </div>
      {/each}
    </span>
    {#each $game.players as player}
      <div class="row">
        {#each player.hand as card (card.id)}
          <div class="card"
            in:receive={{key: card.id}}
            on:introend="{() => revealCardInHand(card, player.name)}"
            out:send={{key: card.id}}
            animate:flip={{duration: 300}}
          >
            <Card {card} bind:this={cardRefs[card.id]} clickable={!watch && isClickable($game, currentPlayer, player.name, card, $isProcessing)} />
          </div>
        {/each}
        {#if player.uno}
          <Card role="uno" owner={player} clickable={!watch} />
        {/if}
      </div>
      <span class="player-name" class:currentPlayer={player.name === $game.currentPlayer}>{player.name}</span>
    {/each}
  {/if}
{/if}
</div>