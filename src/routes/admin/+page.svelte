<script lang="ts">
	import Download from '@lucide/svelte/icons/download';
	import LogOut from '@lucide/svelte/icons/log-out';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Admin · {data.siteTitle}</title>
</svelte:head>

<main class="mx-auto max-w-xl px-4 pt-8 pb-20 sm:pt-12">
	<div class="flex items-center justify-between">
		<p class="text-sm font-semibold tracking-widest text-zinc-400 uppercase">{data.siteTitle}</p>
		<form method="POST" action="?/logout">
			<button
				class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-zinc-500 transition hover:bg-white hover:text-zinc-900"
			>
				<LogOut class="size-4" />
				Abmelden
			</button>
		</form>
	</div>

	<h1
		class="mt-6 bg-gradient-to-br from-rose-500 via-fuchsia-500 to-sky-500 bg-clip-text pb-1 text-5xl font-extrabold tracking-tight text-transparent"
	>
		Admin
	</h1>

	<div
		class="mt-8 rounded-[1.75rem] bg-white p-6 shadow-lg ring-1 shadow-zinc-900/[0.04] ring-zinc-900/5 sm:p-8"
	>
		<p class="text-6xl font-black tracking-tight tabular-nums">{data.count}</p>
		<p class="mt-1 text-zinc-500">
			{data.count === 1 ? 'Abgabe' : 'Abgaben'}
			{#if data.latest}
				· letzte am {new Date(data.latest).toLocaleString('de-DE', {
					dateStyle: 'medium',
					timeStyle: 'short'
				})}
			{/if}
		</p>

		<a
			href="/admin/export"
			download
			class="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-rose-500 via-fuchsia-500 to-sky-500 px-6 py-3 font-bold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]"
		>
			<Download class="size-5" />
			Verschlüsselten Export herunterladen
		</a>
	</div>

	<p class="mt-6 px-1 text-sm leading-relaxed text-zinc-500">
		Die Datei enthält nur verschlüsselte Antworten. Zum Lesen die lokale Datei
		<code class="rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-700">auswertung/auswertung.html</code>
		öffnen und dort den Private Key und den Export laden.
	</p>
</main>
