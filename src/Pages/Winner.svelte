<script lang="ts">
  import { player } from '../store';
  export let winner;

  let color = 'red';
  
  setInterval(() => {
    let colors = ['red', 'blue', 'green', 'yellow'];
    color = colors[(colors.indexOf(color) + 1) % colors.length];
  }, 500);
</script>


<style type="text/scss">
  @import '../Components/utilities.scss';
  .fill {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 60pt;
    color: white;
  }
  .lose {
    padding-top: 40px;
    font-size: 30pt;
    color: grey;
  }
  .text {
    transition: color 0.25s ease-in-out;
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
</style>

<div class="fill">
  <div>{winner} has <span class={`text ${color}`}>WON!</span></div>
  {#if winner !== $player}
    <div class="lose">
      (And you lost!)
    </div>
  {/if}
</div>