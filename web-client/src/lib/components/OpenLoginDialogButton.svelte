<script lang="ts">
	import { layout } from '$lib/stores/layout.svelte';
	import IconLogin from '~icons/hugeicons/login-03';
	import { IconButton } from '@celar-ui/svelte';
</script>

<IconButton onclick={() => (layout.openLoginDialog = true)}>
	<IconLogin class="icon-24" />
</IconButton>
