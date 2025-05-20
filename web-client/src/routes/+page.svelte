<script lang="ts">
	import { AppBar, Container } from '@celar-ui/svelte';
	import { t } from '$lib/i18n/index';
	import AppSettingsButton from '$lib/components/AppSettingsButton.svelte';
</script>

<AppBar>
	{#snippet title()}
		{$t.common.foodToday}
	{/snippet}

	{#snippet actions()}
		<AppSettingsButton />
	{/snippet}
</AppBar>

<Container sm></Container>
