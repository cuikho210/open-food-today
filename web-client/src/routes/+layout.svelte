<script lang="ts">
	import '@celar-ui/svelte/src/styles/colors.scss';
	import '@celar-ui/svelte/src/styles/spacing.scss';
	import '@celar-ui/svelte/src/styles/misc.scss';
	import '$styles/index.scss';
	import '$styles/utils.scss';
	import '$styles/celar-components.scss';
	import AppSettingsDialog from '$lib/components/AppSettingsDialog.svelte';
	import LoginDialog from '$lib/components/LoginDialog.svelte';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';

	let { data, children } = $props();
	let { session, supabase, user } = data;

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});
</script>

{@render children()}

<AppSettingsDialog {user} {supabase} />

{#if !session}
	<LoginDialog {supabase} />
{/if}
