<script lang="ts">

  import Home from './Pages/Home.svelte';
  import Create from './Pages/Create.svelte';
  import Join from './Pages/Join.svelte';
  import Game from './Pages/Game.svelte';
  import GameDebug from './Pages/GameDebug.svelte';
  import { page } from './store';
import Winner from './Pages/Winner.svelte';

  $: console.log(`[LOCAL] Moving to page ${$page}`);
  $: navigate($page);

  navigate(window.location.pathname.substring(1) || '');
  function navigate(p: string) {
    if (p == 'home') {
      p = '';
    }
    if (window.location.pathname != `/${p}`) {
      window.history.pushState(null, null, `/${p}`);
    }
    $page = p;
  }

function gameId(p: string) {
  return p.split('/')[1];
}
function isHost(p: string) {
  return p.includes('host');
}
function isWatch(p: string) {
  return p.includes('watch');
}

</script>

<svelte:window
  on:popstate={(e) => $page = document.location.pathname.substring(1)}
/>

<style type="text/scss">
  @import './Components/utilities.scss';

  :global(body) {
    background-color: #000;
    margin: 0px;
    padding: 0px;
    font-family: 'Roboto', sans-serif;
    overflow: hidden;
  }
</style>

{#if $page == '' || $page == 'home'}
  <Home {navigate} />
{:else if $page === 'create'}
  <Create {navigate} />
{:else if $page.startsWith('join')}
  <Join {navigate} gameCode={gameId($page)} />
{:else if $page.startsWith('game')} />
  <Game {navigate} host={isHost($page)} watch={isWatch($page)} />
{:else if $page.startsWith('win')}
  <Winner winner={gameId($page)} />
{/if}