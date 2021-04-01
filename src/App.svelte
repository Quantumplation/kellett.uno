<script lang="ts">

  import Home from './Home.svelte';
  import Create from './Create.svelte';
  import Join from './Join.svelte';
  import Game from './Game.svelte';
  import GameDebug from './GameDebug.svelte';

  let page = '';
  navigate(window.location.pathname.substring(1) || '');
  function navigate(p: string) {
    if (p == 'home') {
      p = '';
    }
    if (window.location.pathname != `/${p}`) {
      window.history.pushState(null, null, `/${p}`);
    }
    page = p;
  }

function gameId() {
  return page.split('/')[1];
}

</script>

<svelte:window
  on:popstate={(e) => page = document.location.pathname.substring(1)}
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

{#if page == '' || page == 'home'}
<Home {navigate} />
{:else if page === 'create'}
<Create {navigate} />
{:else if page === 'join'}
<Join {navigate} />
{:else if page.startsWith('game')}
  {#if page.includes('debug')}
    <GameDebug host={page.includes('/host')} gameId={gameId()} />
  {:else}
    <Game {navigate} host={page.includes('/host')} />
  {/if}
{/if}