<script lang="ts">
import { crossfade } from 'svelte/transition';
import type { Card as GameCard } from '../Model/model';
import Card from '../Components/card.svelte';
import Waiting from './Waiting.svelte';
import { game, isProcessing, player } from '../store';
import GameDebug from './GameDebug.svelte';
import Hand from './Hand.svelte';

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

$: currentPlayerName = $player && $player.toString();
$: currentPlayer = $game ? $game.players.find(p => p.name == currentPlayerName) : null;
$: otherPlayers = $game ? $game.players.filter(p => p.name != currentPlayerName) : null;

$: error = $game ? $game.error : null;
$: winner = $game ? $game.winner : null;

// The game starts by dealing 7 cards to each player,
// so render 7 cards on top of the deck per player to animate that.
$: deckTop = $game ? $game.deck.slice(0, $game.players.length * 7).reverse() : [];

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
          <Card role="deck" card={deck} clickable={!watch && $game.currentPlayer == currentPlayerName} />
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
          <Card role="pile" card={pile} startRevealed={$game.lastPlayer === currentPlayerName} bind:this={cardRefs[pile ? pile.id : -1]} />
        </div>
      {/each}
    </span>
    <Hand player={currentPlayer} {currentPlayerName} {watch} {revealCard} {cardRefs} {send} {receive}></Hand>
    {#each otherPlayers as player}
      <Hand {player} {currentPlayerName} {watch} {revealCard} {cardRefs} {send} {receive}></Hand>
    {/each}
  {/if}
{/if}
</div>