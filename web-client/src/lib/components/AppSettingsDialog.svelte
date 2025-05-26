<script lang="ts">
	import {
		Avatar,
		Dialog,
		Gap,
		OutlinedButton,
		RadioGroup,
		RadioItem,
		Spacer
	} from '@celar-ui/svelte';
	import IconClose from '~icons/hugeicons/cancel-01';
	import { messages, setLocale, t, type I18nLocale } from '$lib/i18n';
	import { layout } from '$lib/stores/layout.svelte';
	import type { SupabaseClient, User } from '@supabase/supabase-js';

	let { user, supabase }: { user: User | null; supabase: SupabaseClient } = $props();
	let currentLocaleCode = $state($t.code);

	async function signOut() {
		const { error } = await supabase.auth.signOut();
		if (error) console.error(error);
		location.reload();
	}
</script>

<Dialog bind:open={layout.openAppSettings} xs fluid>
	{#snippet title()}
		{$t.common.settings}
	{/snippet}

	{#snippet close()}
		<IconClose class="icon-24" />
	{/snippet}

	{#if user}
		<Spacer wrap="nowrap">
			<Avatar size="80px" src={user.user_metadata.avatar_url} />

			<div>
				<h3>Hi, {user.user_metadata.name}!</h3>
				<Gap />
				<Spacer>
					<OutlinedButton href="#">
						{$t.common.profile}
					</OutlinedButton>
					<OutlinedButton onclick={signOut}>
						{$t.common.signOut}
					</OutlinedButton>
				</Spacer>
			</div>
		</Spacer>
		<Gap />
	{/if}

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
