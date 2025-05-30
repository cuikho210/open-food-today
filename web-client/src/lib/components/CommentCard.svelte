<script lang="ts">
	import { Avatar, Spacer } from '@celar-ui/svelte';
	import type { PublicRecipeComment } from '$lib/ts-binding/recipe_comments';

	let { user_avatar_url, user_name, content }: PublicRecipeComment = $props();
</script>

<div class="comment-card">
	<Spacer wrap="nowrap">
		<Avatar alt={user_name} src={user_avatar_url} size="64px" style="flex-shrink: 0;" />
		<div>
			<h4>{user_name}</h4>
			<p>
				{content}
			</p>
		</div>
	</Spacer>
</div>

<style lang="scss">
	.comment-card {
		padding: var(--gap--half);
	}
</style>
