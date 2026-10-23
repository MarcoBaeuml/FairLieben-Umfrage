<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import { accentFor } from '#lib/accents.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{data.siteTitle}</title>
</svelte:head>

<main class="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4 py-16 text-center">
	<h1
		class="bg-gradient-to-br from-rose-500 via-fuchsia-500 to-sky-500 bg-clip-text pb-2 text-5xl font-extrabold tracking-tight text-transparent sm:text-7xl"
	>
		{data.siteTitle}
	</h1>
	{#each data.intro as paragraph, i (i)}
		<p class="mx-auto mt-4 max-w-sm text-balance text-zinc-500">{paragraph}</p>
	{/each}

	<p class="mt-10 text-sm font-semibold text-zinc-400 sm:mt-12">Fragen für:</p>
	<nav class="mt-3 grid grid-cols-2 gap-3 sm:gap-4">
		{#each data.audiences as audience, i (audience.id)}
			<a
				href="/{audience.id}"
				class={[
					'group rounded-3xl bg-gradient-to-br p-[2px] shadow-lg shadow-zinc-900/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-[0.98]',
					accentFor(i).gradient
				]}
			>
				<span
					class="flex h-full flex-col items-center gap-3 rounded-[calc(1.5rem-2px)] bg-white px-3 py-7 sm:px-4 sm:py-8"
				>
					<span class="text-xl font-extrabold tracking-tight sm:text-2xl">{audience.name}</span>
					<span
						class={[
							'grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br text-white transition group-hover:translate-x-1',
							accentFor(i).gradient
						]}
						aria-hidden="true"
					>
						<ArrowRight class="size-5" />
					</span>
				</span>
			</a>
		{:else}
			<p class="col-span-2 rounded-2xl bg-white p-6 text-zinc-500 ring-1 ring-zinc-900/5">
				Noch keine Fragen hinterlegt.
			</p>
		{/each}
	</nav>
</main>
