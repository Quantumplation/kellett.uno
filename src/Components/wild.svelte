<script lang="ts">
  import { tweened } from 'svelte/motion';
  import { cubicInOut } from 'svelte/easing';
  import type { Color } from '../Model/model';

  export let x = 0;
  export let y = 0;
  export let width = 112;
  export let height = 178;
  export let style: 'normal' | 'draw' = 'normal';
  export let choosingColor = false;
  export let chooseColor: (color: Color) => void = null;

  const idprefix = `unique-${Math.random()}`;

  const colors = [
    'yellow',
    'green',
    'blue',
    'red',
  ] as const;

  const normalCoords = [
    { x: 89, y: 89 },
    { x: 33, y: 89 },
    { x: 89, y: 0 },
    { x: 33, y: 0 },
  ];
  const drawCoords = [
    { x: 81, y: 85 },
    { x: 94, y: 67 },
    { x: 76, y: 55 },
    { x: 66, y: 75 },
  ];
  const activeCoords = [
    { x: 56, y: 89 },
    { x: 0, y: 89 },
    { x: 56, y: 0 },
    { x: 0, y: 0 },
  ];

  const normalStyles = {
    skew: -20,
    width: 56,
    height: 89,
    border: 0,
    viewBox: [0, 0, 112, 178],
  };
  const drawStyles = {
    skew: -20,
    width: 18.67,
    height: 29.66,
    border: 2,
    viewBox: [0, 0, 112, 178],
  };
  const activeStyles = {
    skew: 0,
    width: 56,
    height: 89,
    border: 0,
    viewBox: [37.33, 59.33, 37.33, 59.33],
  };

  const tweenSettings = {
    easing: cubicInOut,
    duration: 500,
  };
  $: defaultCoords = style === 'normal' ? normalCoords : drawCoords;
  $: defaultStyles = style === 'normal' ? normalStyles : drawStyles;

  const coords = tweened(defaultCoords, tweenSettings);
  const styles = tweened(defaultStyles, tweenSettings);
  $: {
    coords.set(choosingColor ? activeCoords : defaultCoords);
    styles.set(choosingColor ? activeStyles : defaultStyles);
  }

  function clickColor(index: number) {
    if (!choosingColor || !chooseColor) {
      return;
    }
    chooseColor(colors[index]);
  }
</script>

<style type="text/scss">
  @import 'utilities.scss';

  .red {
    fill: $unoRed;
  }
  .blue {
    fill: $unoBlue;
  }
  .green {
    fill: $unoGreen;
  }
  .yellow {
    fill: $unoYellow;
  }
</style>

<svg {x} {y} {width} {height} viewBox={$styles.viewBox.join(' ')}>
  <clipPath id="{idprefix}-oval">
    <ellipse cx="56" cy="89" rx="74" ry="38" transform="skewX({-$styles.skew}) rotate(115 56 89)" stroke-width=5/>
  </clipPath>
  <g transform="skewX({$styles.skew})" clip-path="url(#{idprefix}-oval)">
    <rect x=33 width=100% height=100% fill="white" />
    {#each colors as color, i}
      {#if $styles.border > 0}
        <rect
          x={$coords[i].x - $styles.border}
          y={$coords[i].y - $styles.border}
          width={$styles.width + (2 * $styles.border)}
          height={$styles.height + (2 * $styles.border)}
          fill="white"
          stroke="black"
          stroke-width={$styles.border > 0.5 ? 1 : 0}
        />
      {/if}
      <rect
        class={color}
        on:click={() => clickColor(i)}
        x={$coords[i].x}
        y={$coords[i].y}
        width={$styles.width}
        height={$styles.height}
      />
    {/each}
  </g>
  <ellipse cx="56" cy="89" rx="72" ry="36" transform="rotate(115 56 89)" stroke="white" fill="none" stroke-width=6/>
</svg>
