<script lang="ts">

  let test: number = 100;

</script>

<style type="text/scss">
  :global(body) {
    background-color: #FE0000;
  }

  .center {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100vh;

    h1 {
      font-size: 600%;
    }
    h1.kellett {
      background: rgb(2,69,182);
      background: linear-gradient(90deg, rgba(2,69,182,1) 48%, rgba(13,156,6,1) 48%);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    h1.uno {
      color: #EEE800;
    }
  }
</style>

<div class="center">
  <h1 class="kellett">kellett</h1><h1 class="uno">.uno</h1>
</div>