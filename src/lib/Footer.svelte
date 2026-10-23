<script lang="ts">
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import GithubIcon from '#lib/GithubIcon.svelte';
	import { SOURCE_URL } from '#lib/site.ts';

	let { title, audiences }: { title: string; audiences: { id: string; name: string }[] } = $props();

	const links = $derived([
		{ href: '/', label: 'Start' },
		...audiences.map((audience) => ({ href: `/${audience.id}`, label: audience.name })),
		{ href: '/verschluesselung', label: 'Verschlüsselung' }
	]);
</script>

<footer class="border-t border-zinc-900/5 bg-white/60 backdrop-blur">
	<div
		class="mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 py-8 sm:flex-row sm:justify-between"
	>
		<a href="/" class="font-extrabold tracking-tight text-zinc-800">{title}</a>

		<nav class="flex flex-wrap justify-center gap-x-1 gap-y-2">
			{#each links as link (link.href)}
				<a
					href={link.href}
					class="rounded-full px-3 py-1.5 text-sm font-medium text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
				>
					{link.label}
				</a>
			{/each}
		</nav>

		<div class="flex items-center gap-4">
			<a
				href="/verschluesselung"
				class="inline-flex items-center gap-1.5 text-xs text-zinc-400 transition hover:text-zinc-700"
			>
				<ShieldCheck class="size-4" />
				Anonym &amp; verschlüsselt
			</a>
			<a
				href={SOURCE_URL}
				target="_blank"
				rel="noopener noreferrer"
				aria-label="Quellcode auf GitHub"
				title="Quellcode auf GitHub"
				class="text-zinc-400 transition hover:text-zinc-900"
			>
				<GithubIcon class="size-5" />
			</a>
		</div>
	</div>
</footer>
