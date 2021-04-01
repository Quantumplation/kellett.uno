<script lang="ts">
  export let gameId;
  export let host = false;
</script>
<style>
  .container {
    color: white;
    padding: 10px;
    display: flex;
    flex-direction: column;
  }
</style>

<div class="container">
  <span>
    Game: {gameId}
  </span>
  <span>
    Host: {host}
  </span>
</div>