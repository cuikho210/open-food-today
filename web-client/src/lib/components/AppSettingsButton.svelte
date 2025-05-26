<script lang="ts">
	import { layout } from '$lib/stores/layout.svelte';
	import IconSettings from '~icons/hugeicons/settings-03';
	import { Avatar, IconButton } from '@celar-ui/svelte';
	import type { User } from '@supabase/supabase-js';

	let { user }: { user?: User | null } = $props();
	let avatarUrl = $derived<string | undefined>(user?.user_metadata.avatar_url);
</script>

<IconButton
	onclick={() => (layout.openAppSettings = true)}
	style={avatarUrl ? 'padding: 0' : undefined}
>
	{#if avatarUrl}
		<Avatar src={avatarUrl} alt={user?.user_metadata.name} size="40px" />
	{:else}
		<IconSettings class="icon-24" />
	{/if}
</IconButton>
