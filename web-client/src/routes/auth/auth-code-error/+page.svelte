<script lang="ts">
	import { t } from '$lib/i18n/index';
	import { AppBar, Card, Container, Gap, OutlinedButton } from '@celar-ui/svelte';
	import AppSettingsButton from '$lib/components/AppSettingsButton.svelte';
</script>

<svelte:head>
	<title>Authentication Error - {$t.common.foodToday}</title>
</svelte:head>

<main>
	<AppBar>
		{#snippet title()}
			{$t.common.foodToday}
		{/snippet}

		{#snippet actions()}
			<AppSettingsButton />
		{/snippet}
	</AppBar>

	<Container sm style="padding-top: 5rem">
		<Card xs>
			<div class="error-content">
				<div class="error-icon">⚠️</div>
				<h1>{$t.auth.error.title}</h1>
				<Gap size="1rem" />
				<p class="error-message">{$t.auth.error.description}</p>
				<Gap size="1.5rem" />

				<OutlinedButton href="/">
					{$t.auth.error.goHome}
				</OutlinedButton>
			</div>
		</Card>
	</Container>
</main>

<style lang="scss">
	.error-content {
		text-align: center;
	}

	.error-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	h1 {
		color: var(--color-text-danger);
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0;
	}

	.error-message {
		line-height: 1.5;
		margin: 0;
	}
</style>
