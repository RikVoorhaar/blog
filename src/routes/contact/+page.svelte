<script lang="ts">
	import { AtSign, MapPin, Github, Building } from 'lucide-svelte';
	import SmallContainer from '$lib/components/SmallContainer.svelte';

	import ContactItem from '$lib/components/contact/ContactItem.svelte';
	const iconSize = 20;
	const iconClass = 'inline';
</script>

<SmallContainer>
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
</SmallContainer>
