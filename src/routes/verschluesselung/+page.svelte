<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Cloud from '@lucide/svelte/icons/cloud';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import LockOpen from '@lucide/svelte/icons/lock-open';
	import Shuffle from '@lucide/svelte/icons/shuffle';
	import Smartphone from '@lucide/svelte/icons/smartphone';
	import GithubIcon from '#lib/GithubIcon.svelte';
	import { SOURCE_URL } from '#lib/site.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const steps = [
		{
			icon: Smartphone,
			title: 'Verschlüsselt auf deinem Gerät',
			text: 'Deine Antworten werden direkt in deinem Browser verschlossen („clientseitig“), noch bevor sie dein Handy verlassen.'
		},
		{
			icon: LockOpen,
			title: 'Public Key: ein offenes Schloss',
			text: 'Die Seite bringt ein offenes Vorhängeschloss mit, den „Public Key“. Jeder kann damit etwas zuschließen, aber niemand kann damit etwas aufschließen.'
		},
		{
			icon: Cloud,
			title: 'Cloudflare sieht nur Zeichensalat',
			text: 'Gespeichert wird bei Cloudflare, einem Server-Anbieter. Dort liegt nur unlesbarer Zeichensalat, auch für Cloudflare und für uns selbst.'
		},
		{
			icon: KeyRound,
			title: 'Private Key: der einzige Schlüssel',
			text: 'Aufschließen kann nur der passende „Private Key“. Der liegt nicht im Internet, sondern nur bei der Person, die auswertet, und wird dort offline benutzt.'
		}
	];

	const anonymity = [
		{ icon: EyeOff, text: 'Wir speichern weder Namen noch IP-Adressen.' },
		{ icon: Shuffle, text: 'Bei der Auswertung werden alle Antworten gemischt.' }
	];
</script>

<svelte:head>
	<title>Verschlüsselung · {data.siteTitle}</title>
</svelte:head>

<main class="mx-auto max-w-2xl px-4 pt-8 pb-20 sm:pt-12">
	<a
		href="/"
		class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-zinc-500 transition hover:bg-white hover:text-zinc-900"
	>
		<ArrowLeft class="size-4" />
		Zurück
	</a>

	<header class="mt-6 mb-12 text-center">
		<h1 class="text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
			Wie sicher sind meine Antworten?
		</h1>
		<p class="mx-auto mt-4 max-w-md text-balance text-zinc-500">
			Kurz gesagt: Lesen kann sie nur die Auswertung, nicht einmal der Server, auf dem sie liegen.
		</p>
	</header>

	<ol class="relative space-y-4">
		{#each steps as step, i (step.title)}
			<li
				class="flex gap-4 rounded-[1.75rem] bg-white p-5 shadow-lg ring-1 shadow-zinc-900/[0.04] ring-zinc-900/5 sm:gap-5 sm:p-6"
			>
				<div
					class="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 via-fuchsia-500 to-sky-500 text-white shadow-md sm:size-12"
				>
					<step.icon class="size-6" strokeWidth={2} />
				</div>
				<div>
					<h2 class="font-bold sm:text-lg">
						<span class="text-zinc-300 tabular-nums">{i + 1}</span>
						{step.title}
					</h2>
					<p class="mt-1 text-[0.9375rem] leading-relaxed text-zinc-600 sm:text-base">
						{step.text}
					</p>
				</div>
			</li>
		{/each}
	</ol>

	<section class="mt-8 rounded-[1.75rem] bg-zinc-900 p-6 text-white sm:p-8">
		<h2 class="font-bold sm:text-lg">Und anonym ist es auch</h2>
		<ul class="mt-4 space-y-3">
			{#each anonymity as item (item.text)}
				<li class="flex items-center gap-3 text-zinc-300">
					<item.icon class="size-5 shrink-0 text-zinc-400" />
					{item.text}
				</li>
			{/each}
		</ul>
	</section>

	<a
		href={SOURCE_URL}
		target="_blank"
		rel="noopener noreferrer"
		class="mt-6 flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-zinc-500 transition hover:bg-white hover:text-zinc-900"
	>
		<GithubIcon class="size-5" />
		Der Quellcode ist öffentlich: selbst nachprüfen auf GitHub
	</a>
</main>
