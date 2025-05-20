<script lang="ts">
	import { AppBar, Card, Container, Gap } from '@celar-ui/svelte';
	import { t } from '$lib/i18n/index';
	import AppSettingsButton from '$lib/components/AppSettingsButton.svelte';
	import { register } from 'swiper/element/bundle';

	register();
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
		<swiper-container direction="vertical" slides-per-view="1">
			{#snippet slide(content: string)}
				<swiper-slide>
					<Card class="slide-card" fluid>
						{content}
						<Gap size="100vh" />
					</Card>
				</swiper-slide>
			{/snippet}

			{@render slide('Slide 1')}
			{@render slide('Slide 2')}
			{@render slide('Slide 3')}
			{@render slide('Slide 4')}
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
	}

	swiper-container {
		position: relative;
		width: 100%;
		height: 100dvh;
		padding: var(--gap);

		swiper-slide {
			display: flex;
			justify-content: center;
			align-items: center;
			padding-top: 48px;
		}
	}
</style>
