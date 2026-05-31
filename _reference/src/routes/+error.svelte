<script lang="ts">
	import { Zap } from 'lucide-svelte';

	import SmallContainer from '$lib/components/SmallContainer.svelte';
	import { page } from '$app/stores';
</script>

<SmallContainer>
	<h1 class="font-extrabold text-3xl dark:text-main-500 text-main-600 mb-4">
		<Zap class="inline mb-1 mr-2" size="32"/>
		Error: {$page.status}
	</h1>
	<p>
		{@html $page.error?.message}
	</p>
</SmallContainer>
