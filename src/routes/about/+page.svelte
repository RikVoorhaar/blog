<script lang="ts">
	import { AtSign, MapPin, Github, Building } from 'lucide-svelte';

	import ContactItem from '$lib/components/contact/ContactItem.svelte';
	const iconSize = 20;
	const iconClass = 'inline';
</script>

<div class="grid grid-cols-1 place-items-center w-full opacity-90">
	<div
		class="max-w-xl w-full
  dark:text-white
	bg-slate-100 dark:bg-zinc-900
    min-w-0 p-6 m-4 rounded-xl
    tansition-colors duration-300"
	>
		<ContactItem type="email" content="rik.voorhaar@gmail.com" href="mailto:rik.voorhaar@gmail.com">
			<AtSign class={iconClass} size={iconSize} />
		</ContactItem>
		<ContactItem type="location" content="Copenhagen, Denmark">
			<MapPin class={iconClass} size={iconSize} />
		</ContactItem>
		<ContactItem type="github" content="RikVoorhaar" href="https://github.com/RikVoorhaar">
			<Github class={iconClass} size={iconSize} />
		</ContactItem>
		<ContactItem type="work" content="Grazper" href="https://grazper.com">
			<Building class={iconClass} size={iconSize} />
		</ContactItem>
	</div>
</div>
