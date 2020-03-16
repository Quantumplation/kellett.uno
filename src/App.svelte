<script lang="ts">

  let test: number = 100;

</script>

<style type="text/scss">
  :global(body) {
    background-color: #000;
  }

  .center {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100vh;

    h1 {
      font-size: 15vw;
    }
    .red{
      color: #fe0000;
    }
    .blue {
      color: #0245b6;
    }
    .green {
      color: #0d9c06;
    }
    .yellow {
      color: #EEE800;
    }
  }
</style>

<div class="center">
  <h1 class="red">   ke</h1>
  <h1 class="blue">  lle</h1>
  <h1 class="green"> tt.</h1>
  <h1 class="yellow">uno</h1>
</div>