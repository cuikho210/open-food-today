<script lang="ts">
	import { layout } from '$lib/stores/layout.svelte';
	import IconSettings from '~icons/hugeicons/settings-03';
	import { IconButton } from '@celar-ui/svelte';
</script>

<IconButton onclick={() => (layout.openAppSettings = true)}>
	<IconSettings class="icon-24" />
</IconButton>
