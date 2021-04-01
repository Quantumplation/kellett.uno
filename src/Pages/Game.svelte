<script lang="ts">
import Card from '../Components/card.svelte';
import Waiting from './Waiting.svelte';
import { game } from '../store';
const colors = ['red', 'green', 'blue', 'yellow'] as const;
const digits = new Array(10).fill(null).map((_, i) => i);

export let navigate: (p) => void;
export let host = false;

</script>

<style>
</style>

{#if !$game.currentPlayer}
  <Waiting {navigate} />
{:else}
  {#each colors as color}
    {#each digits as digit }
      <Card cardType="normal" value={digit} {color} />
    {/each}
    <br/>
  {/each}
{/if}
