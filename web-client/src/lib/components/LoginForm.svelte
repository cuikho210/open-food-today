<script lang="ts">
	import { ElevatedButton } from '@celar-ui/svelte';
	import type { SupabaseClient } from '@supabase/supabase-js';

	export interface Props {
		supabase: SupabaseClient;
	}

	let { supabase }: Props = $props();

	async function login() {
		supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: window.location.origin + '/auth/callback'
			}
		});
	}
</script>

<ElevatedButton onclick={login}>Login</ElevatedButton>
