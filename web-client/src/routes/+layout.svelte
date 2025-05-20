<script lang="ts">
	import '@celar-ui/svelte/src/styles/colors.scss';
	import '@celar-ui/svelte/src/styles/spacing.scss';
	import '@celar-ui/svelte/src/styles/misc.scss';
	import '$styles/index.scss';
	import '$styles/utils.scss';

	let { children } = $props();
</script>

{@render children()}
