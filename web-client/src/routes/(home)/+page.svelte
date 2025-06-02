<script lang="ts">
	import { t } from '$lib/i18n/index';
	import { register } from 'swiper/element/bundle';
	import { onMount } from 'svelte';
	import { getRandomRecipes, getRecipeById } from '$lib/api/recipes';
	import { deleteListCommentsCache, listComments, postComment } from '$lib/api/comments';
	import { checkLike, createLike, deleteCheckLikeCache, deleteLike } from '$lib/api/likes';
	import {
		AppBar,
		Card,
		Container,
		Gap,
		IconButton,
		Spacer,
		NavigationDrawer,
		FilledButton
	} from '@celar-ui/svelte';
	import AppSettingsButton from '$lib/components/AppSettingsButton.svelte';
	import OpenLoginDialogButton from '$lib/components/OpenLoginDialogButton.svelte';
	import IconFavourite from '~icons/hugeicons/favourite';
	import IconComment from '~icons/hugeicons/bubble-chat';
	import IconShare from '~icons/hugeicons/share-08';
	import type { PageProps } from './$types';
	import type { Swiper } from 'swiper/types';
	import type { PublicRecipe } from '$lib/ts-binding/recipes';
	import type { PublicRecipeComment } from '$lib/ts-binding/recipe_comments';
	import CommentCard from '$lib/components/CommentCard.svelte';
	import { layout } from '$lib/stores/layout.svelte';

	register();

	let pageProps: PageProps = $props();
	let { user, session } = pageProps.data;
	let recipes = $state<(PublicRecipe | number)[]>(pageProps.data.initRecipes);
	let currentRecipeIndex = $state(0);
	let currentRecipe = $derived(recipes[currentRecipeIndex]);
	let currentRecipeId = $derived(
		typeof currentRecipe == 'number' ? currentRecipe : currentRecipe.id
	);
	let fetchLengh = pageProps.data.initRecipes.length;
	let safeLength = 5;
	let loadingRecipe = $state(false);

	let openComments = $state(false);
	let loadingComments = $state(false);
	let comments = $state<PublicRecipeComment[]>([]);
	let commentInputContent = $state('');
	let loadingPostComment = $state(false);

	let isLiked = $state(false);
	let loadingLike = $state(false);

	let swiperEl: HTMLElement;

	onMount(() => {
		swiperEl.addEventListener('swiperslidechange', async (event) => {
			comments = [];

			const swiper = (event as CustomEvent).detail[0] as Swiper;
			currentRecipeIndex = swiper.activeIndex;

			if (typeof recipes[currentRecipeIndex] === 'number') {
				const recipe = await getRecipeById(currentRecipeId);
				if (recipe) {
					recipes[currentRecipeIndex] = recipe;
					currentRecipe = recipes[currentRecipeIndex];
				}
			} else {
				currentRecipe = recipes[currentRecipeIndex];
			}

			updateLikeStatus();
			releaseRecipe(currentRecipeIndex - safeLength);

			if (currentRecipeIndex > recipes.length - safeLength && !loadingRecipe) {
				await fetchMoreRecipes();
			}
		});
	});

	async function toggleLike() {
		if (typeof currentRecipe == 'number') return;

		if (!session) {
			layout.openLoginDialog = true;
			return;
		}

		loadingLike = true;

		try {
			if (isLiked) {
				await deleteLike(currentRecipe.id, session.access_token);
				isLiked = false;
				if (currentRecipe.likes_count !== null) currentRecipe.likes_count -= 1;
			} else {
				await createLike(currentRecipe.id, session.access_token);
				isLiked = true;
				if (currentRecipe.likes_count !== null) currentRecipe.likes_count += 1;
			}

			if (user) {
				deleteCheckLikeCache(currentRecipe.id, user.id);
			}
		} catch (e) {
			console.error(e);
		}

		loadingLike = false;
	}

	async function updateLikeStatus() {
		if (!user) return;

		try {
			let stats = await checkLike(currentRecipeId, user.id);
			isLiked = stats.user_liked;
		} catch (e) {
			console.error(e);
		}
	}

	function releaseRecipe(index: number) {
		const recipe = recipes[index];
		if (recipe && typeof recipe != 'number') {
			recipes[index] = recipe.id;
		}
	}

	async function fetchRecipeComments(lastId?: number) {
		loadingComments = true;

		try {
			const newComments = await listComments(currentRecipeId, lastId);
			comments = comments.concat(newComments);
		} catch (e) {
			console.error(e);
		}

		loadingComments = false;
	}

	async function fetchMoreRecipes() {
		loadingRecipe = true;

		try {
			const moreRecipes = await getRandomRecipes(fetchLengh);
			recipes = recipes.concat(moreRecipes);
		} catch (e) {
			console.error(e);
		}

		loadingRecipe = false;
	}

	async function shareRecipe(): Promise<void> {
		if (currentRecipe == null || typeof currentRecipe == 'number') return;
		await navigator.share({
			title: currentRecipe.title,
			text: currentRecipe.description || undefined,
			url: currentRecipe.link || undefined
		});
	}

	async function submitComment(event: Event) {
		event.preventDefault();

		if (!session) {
			layout.openLoginDialog = true;
			return;
		}

		if (loadingPostComment) return;

		commentInputContent = commentInputContent.trim();
		if (!commentInputContent) return console.warn('commentInputContent is empty');

		loadingPostComment = true;

		try {
			const comment = await postComment(
				currentRecipeId,
				{ reply_to: null, content: commentInputContent },
				session.access_token
			);
			comments.push({
				...comment,
				user_name: user?.user_metadata.name || '',
				user_avatar_url: user?.user_metadata.avatar_url || ''
			});
			commentInputContent = '';

			await deleteListCommentsCache(currentRecipeId);
		} catch (e) {
			console.error(e);
		}

		loadingPostComment = false;
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

{#if typeof currentRecipe !== 'number'}
	<div class="section-fixed">
		<Spacer wrap="nowrap" direction="column" align="center" gap="0">
			<IconButton active={isLiked} loading={loadingLike} onclick={toggleLike}
				><IconFavourite class="icon-24" /></IconButton
			>
			<span>{currentRecipe.likes_count || 0}</span>
			<Gap size=".5rem" />

			<IconButton
				onclick={() => {
					if (!session) {
						layout.openLoginDialog = true;
						return;
					}
					openComments = true;
					if (comments.length === 0 && !loadingComments) {
						fetchRecipeComments();
					}
				}}><IconComment class="icon-24" /></IconButton
			>
			<span>{currentRecipe.comments_count}</span>
			<Gap size=".5rem" />

			<IconButton onclick={shareRecipe}><IconShare class="icon-24" /></IconButton>
		</Spacer>
	</div>
{/if}

<NavigationDrawer bind:open={openComments} position="right" width="400px">
	{#if loadingComments}
		Loading...
	{/if}

	{#each comments as comment (comment.id)}
		<CommentCard {...comment} />
		<Gap size=".5rem" />
	{/each}

	{#snippet footer()}
		{#if session}
			<form onsubmit={submitComment}>
				<Spacer wrap="nowrap">
					<textarea
						class="comment-input"
						placeholder={$t.common.comment}
						bind:value={commentInputContent}
					></textarea>
					<FilledButton type="submit" loading={loadingPostComment}>{$t.common.send}</FilledButton>
				</Spacer>
			</form>
		{:else}
			<div class="login-prompt">
				<p>{$t.common.loginToInteract}</p>
				<FilledButton onclick={() => (layout.openLoginDialog = true)}
					>{$t.common.login}</FilledButton
				>
			</div>
		{/if}
	{/snippet}
</NavigationDrawer>

<style lang="scss">
	.login-prompt {
		text-align: center;
		padding: var(--gap);

		p {
			color: var(--color-text);
			margin-bottom: var(--gap);
			font-size: 0.9rem;
		}
	}

	.comment-input {
		width: 100%;
		min-height: 3rem;
		height: 5rem;
		max-height: 300px;
		padding: var(--gap--md);
		border-radius: var(--radius--half);
		border: none;
		outline: 1px solid var(--color-primary);
		transition-duration: var(--transition-dur);
		transition-property: outline-color;
		resize: vertical;
		font-size: inherit;
		font-family: inherit;

		&:hover {
			outline-color: var(--color-primary--darker);
		}
	}

	.section-fixed {
		position: fixed;
		bottom: var(--gap);
		right: var(--gap);
		z-index: 10;
		background-color: rgba(var(--color-bg--rgb), 0.88);
		backdrop-filter: blur(var(--blur-length));
		padding: var(--gap--sm);
		border-radius: var(--radius);
		border: 2px solid var(--color-bg);
		box-shadow: 0 var(--gap--sm) var(--gap) var(--color-shadow--md);

		span {
			font-size: 0.8rem;
			opacity: 0.8;
		}
	}

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
