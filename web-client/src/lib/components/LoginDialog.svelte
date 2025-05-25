<script lang="ts">
	import { Dialog } from '@celar-ui/svelte';
	import IconClose from '~icons/hugeicons/cancel-01';
	import { t } from '$lib/i18n';
	import { layout } from '$lib/stores/layout.svelte';
	import LoginForm from './LoginForm.svelte';
	import { type Props } from './LoginForm.svelte';

	let { supabase }: Props = $props();
</script>

<Dialog bind:open={layout.openLoginDialog} xs fluid>
	{#snippet title()}
		{$t.common.login}
	{/snippet}

	{#snippet close()}
		<IconClose class="icon-24" />
	{/snippet}

	<LoginForm {supabase} />
</Dialog>
