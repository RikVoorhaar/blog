<script lang="ts">
	export let classString: string = '';
</script>

<div class="grid grid-cols-1 place-items-center w-full">
	<div
		class="max-w-4xl w-full
  dark:text-white
    
    prose dark:prose-invert lg:prose-lg prose-zinc prose-p:mb-4 prose-p:mt-0 prose-p:leading-normal prose-li:my-0 prose-li:leading-normal prose-ul:py-0
	prose-h1:text-main-600 dark:prose-h1:text-main-500
	prose-h2:text-main-700 dark:prose-h2:text-main-400
	prose-h3:text-main-800 dark:prose-h3:text-main-300
	prose-h4:text-main-800 dark:prose-h4:text-main-300
	prose-h2:mb-2 prose-h2:mt-12
	prose-h3:mb-1 prose-h3:mt-8
	prose-h4:mb-1 prose-h4:mt-8
    min-w-0 p-6 m-4 rounded-xl
	bg-slate-100 dark:bg-zinc-900
    tansition-colors duration-300"
	>
		<div class={classString}>
			<slot />
		</div>
	</div>
</div>
