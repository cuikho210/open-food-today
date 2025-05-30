<script lang="ts">
	import { t } from '$lib/i18n/index';
	import { register } from 'swiper/element/bundle';
	import { onMount } from 'svelte';
	import { getRandomRecipes, getRecipeById } from '$lib/api/recipes';
	import { AppBar, Card, Container, Gap } from '@celar-ui/svelte';
	import AppSettingsButton from '$lib/components/AppSettingsButton.svelte';
	import OpenLoginDialogButton from '$lib/components/OpenLoginDialogButton.svelte';
	import type { PageProps } from './$types';
	import type { Swiper } from 'swiper/types';
	import type { Recipe } from '$lib/ts-binding/recipes';

	register();

	let pageProps: PageProps = $props();
	let { user } = pageProps.data;
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

<div class="appbar">
	<AppBar>
		{#snippet title()}
			{$t.common.foodToday}
		{/snippet}

		{#snippet actions()}
			{#if !user}
				<OpenLoginDialogButton />
			{/if}

			<AppSettingsButton {user} />
		{/snippet}
	</AppBar>
</div>

<Container sm style="padding: 0">
	<swiper-container bind:this={swiperEl} direction="vertical" slides-per-view="1" mousewheel="true">
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

<style lang="scss">
	.appbar {
		position: fixed;
		top: 0;
		width: 100%;
		z-index: 50;
	}

	:global(.slide-card) {
		max-height: calc(100dvh - 84px);
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

		@media screen and (min-width: 840px) {
			flex-direction: row;
			align-items: flex-start;
			justify-content: center;

			img {
				width: 360px;
			}
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
