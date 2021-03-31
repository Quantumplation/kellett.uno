<script lang="ts">

  import Home from './Home.svelte';
  import Create from './Create.svelte';
  import Join from './Join.svelte';
  import Game from './Game.svelte';

  let page = '';
  navigate(window.location.pathname.substring(1) || '');
  function navigate(p: string) {
    if (p == 'home') {
      p = '';
    }
    window.history.pushState(null, null, `/${p}`);
    page = p;
  }


</script>

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
<Game {navigate} />
{/if}