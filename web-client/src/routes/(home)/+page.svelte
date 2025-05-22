<script lang="ts">
	import { t } from '$lib/i18n/index';
	import { register } from 'swiper/element/bundle';
	import { onMount } from 'svelte';
	import { getRandomRecipes, getRecipeById } from '$lib/api/recipes';
	import { AppBar, Card, Container, Gap } from '@celar-ui/svelte';
	import AppSettingsButton from '$lib/components/AppSettingsButton.svelte';
	import type { PageProps } from './$types';
	import type { Swiper } from 'swiper/types';
	import type { Recipe } from '$lib/ts-binding/recipes';

	register();

	let pageProps: PageProps = $props();
	let recipes = $state<(Recipe | number)[]>(pageProps.data.initRecipes);
	let fetchLengh = pageProps.data.initRecipes.length;
	let safeLength = 5;
	let loading = $state(false);

	let swiperEl: HTMLElement;

	onMount(() => {
		swiperEl.addEventListener('swiperslidechange', async (event) => {
			const swiper = (event as CustomEvent).detail[0] as Swiper;
			const activeIndex = swiper.activeIndex;

			if (typeof recipes[activeIndex] === 'number') {
				const recipe = await getRecipeById(recipes[activeIndex]);
				if (recipe) {
					recipes[activeIndex] = recipe;
				}
			}

			releaseRecipe(activeIndex - safeLength);

			if (activeIndex > recipes.length - safeLength && !loading) {
				await fetchMoreRecipes();
			}
		});
	});

	function releaseRecipe(index: number) {
		const recipe = recipes[index];
		if (recipe && typeof recipe != 'number') {
			recipes[index] = recipe.id;
		}
	}

	async function fetchMoreRecipes() {
		loading = true;

		try {
			const moreRecipes = await getRandomRecipes(fetchLengh);
			recipes = recipes.concat(moreRecipes);
		} catch (e) {
			console.error(e);
		}

		loading = false;
	}
</script>

<main>
	<AppBar>
		{#snippet title()}
			{$t.common.foodToday}
		{/snippet}

		{#snippet actions()}
			<AppSettingsButton />
		{/snippet}
	</AppBar>

	<Container sm style="padding: 0">
		<swiper-container bind:this={swiperEl} direction="vertical" slides-per-view="1">
			{#each recipes as recipe, index (index)}
				<swiper-slide>
					{#if typeof recipe == 'number'}
						<p>Loading...</p>
					{:else}
						<Card class="slide-card" fluid>
							<a href={recipe.link} target="_blank">
								<img src={recipe.image_url} alt={recipe.title} />
							</a>

							<article>
								<a href={recipe.link} target="_blank" class="text-info">
									<h2>{recipe.title}</h2>
								</a>
								<Gap size=".5rem" />
								<p>{recipe.description}</p>
							</article>
						</Card>
					{/if}
				</swiper-slide>
			{/each}
		</swiper-container>
	</Container>
</main>

<style lang="scss">
	main {
		position: relative;
		width: 100lvw;
		height: 100dvh;
		background-color: var(--color-primary--lighter);
		background-image: url('/bg0.jpg');
		overflow: hidden;
	}

	:global([data-app-bar]) {
		position: fixed !important;
		top: 0;
		width: 100%;
		z-index: 50;
		background-color: rgba(var(--color-bg--rgb), 0.5) !important;
		border-bottom: 2px solid var(--color-bg);
	}

	:global(.slide-card) {
		max-height: calc(100dvh - 84px);
		background-color: rgba(var(--color-bg--rgb), 0.5) !important;
		border: 2px solid var(--color-bg);
		backdrop-filter: blur(var(--blur-length));
		overflow: hidden;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
		gap: var(--gap);

		img {
			width: 100%;
			max-height: 50vh;
			object-fit: cover;
			border-radius: var(--radius);
		}
	}

	swiper-container {
		position: relative;
		width: 100%;
		height: 100dvh;
		padding: 0 var(--gap);

		swiper-slide {
			display: flex;
			justify-content: center;
			align-items: center;
			padding-top: 48px;
		}
	}
</style>
