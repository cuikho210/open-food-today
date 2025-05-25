<script lang="ts">
	import { Dialog, Gap, RadioGroup, RadioItem } from '@celar-ui/svelte';
	import IconClose from '~icons/hugeicons/cancel-01';
	import { messages, setLocale, t, type I18nLocale } from '$lib/i18n';
	import { layout } from '$lib/stores/layout.svelte';

	let currentLocaleCode = $state($t.code);
</script>

<Dialog bind:open={layout.openAppSettings} xs fluid>
	{#snippet title()}
		{$t.common.settings}
	{/snippet}

	{#snippet close()}
		<IconClose class="icon-24" />
	{/snippet}

	<div>
		<h3>{$t.common.language}</h3>
		<Gap />
		<RadioGroup bind:value={currentLocaleCode}>
			{#each Object.entries(messages) as [localeCode, localeData] (localeCode)}
				<RadioItem
					value={localeCode}
					name="change-app-locale"
					onclick={() => setLocale(localeCode as I18nLocale)}
				>
					{localeData.name}
				</RadioItem>
			{/each}
		</RadioGroup>
	</div>
	<Gap />
</Dialog>
