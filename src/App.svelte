<script lang="ts">

  let test: number = 100;

</script>

<style type="text/scss">
  $unoRed: #fe0000;
  $unoBlue: #0245b6;
  $unoGreen: #0d9c06;
  $unoYellow: #eee800;

  @import 'utilities.scss';


  :global(body) {
    background-color: #000;
    margin: 0px;
    padding: 0px;
    font-family: 'Roboto', sans-serif;
    overflow: hidden;
  }

  .center {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100vh;

    h1 {
      font-size: 10vw;
    }
    .red{
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

    .button {
      cursor: pointer;
      $border: 10px;
      $radius: 10px;
      padding: $border;
      width: 60%;
      max-width: 300px;
      margin: $border;
      color: white;
      background-color: $unoBlue;
      border-radius: $border + $radius;

      @include responsive-font(5vmin, 10px, 45px, 15pt);
      
      text-align: center;
      box-shadow:
        -1px 1px 0 white,
        -2px 2px 0 white,
        -3px 3px 0 white,
        -4px 4px 0 white;
    }
  }
</style>

<div class="center">
  <h1 class="red">    ke</h1>
  <h1 class="blue">   lle</h1>
  <h1 class="green">  tt.</h1>
  <h1 class="yellow ">uno</h1>
</div>

<div class="buttons">
  <div class="button create">Create Game</div>
  <div class="button join">Join Game</div>
</div>