<script lang="ts">
import Card from './Components/card.svelte';
const colors = ['red', 'green', 'blue', 'yellow'] as const;
const digits = new Array(10).fill(null).map((_, i) => i);

export let navigate: (p) => void;
export let host = false;

</script>

<style>
</style>

{#each colors as color}
  {#each digits as digit }
    <Card cardType="normal" value={digit} {color} />
  {/each}
  <br/>
{/each}
