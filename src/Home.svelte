<script lang="ts">
  import Button from './Components/button.svelte';
  export let navigate;
</script>

<style type="text/scss">
  @import './Components/utilities.scss';
  .center {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100vh;

    h1 {
      font-size: 10vw;
    }
    .red {
      color: $unoRed;
    }
    .blue {
      color: $unoBlue;
    }
    .green {
      color: $unoGreen;
    }
    .yellow {
      color: $unoYellow;
    }
  }

  .buttons {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: absolute;
    bottom: 10%;
    height: 25%;
    justify-content: space-around;
  }
</style>

<div class="center">
    <h1 class="red">    ke</h1>
    <h1 class="blue">   lle</h1>
    <h1 class="green">  tt.</h1>
    <h1 class="yellow ">uno</h1>
</div>

<div class="buttons">
    <Button on:click={() => navigate('create')}>Create</Button>
    <Button on:click={() => navigate('join')}>Join</Button>
</div>