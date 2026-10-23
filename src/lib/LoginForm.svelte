<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import LockKeyhole from '@lucide/svelte/icons/lock-keyhole';
	import { enhance } from '$app/forms';

	let {
		heading,
		text,
		error = null,
		configured
	}: { heading: string; text: string; error?: string | null; configured: boolean } = $props();

	let sending = $state(false);
</script>

<main class="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4 py-16 text-center">
	<div
		class="mx-auto grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 via-fuchsia-500 to-sky-500 text-white shadow-lg shadow-fuchsia-500/20"
	>
		<LockKeyhole class="size-7" />
	</div>
	<h1
		class="mt-6 bg-gradient-to-br from-rose-500 via-fuchsia-500 to-sky-500 bg-clip-text pb-1 text-4xl font-extrabold tracking-tight text-transparent"
	>
		{heading}
	</h1>
	<p class="mt-2 text-balance text-zinc-500">{text}</p>

	{#if !configured}
		<p class="mt-8 rounded-2xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
			Noch nicht eingerichtet: Das Passwort ist auf dem Server nicht gesetzt.
		</p>
	{:else}
		<form
			method="POST"
			class="mt-8"
			use:enhance={() => {
				sending = true;
				return async ({ update }) => {
					await update();
					sending = false;
				};
			}}
		>
			<div
				class={[
					'flex items-center gap-2 rounded-full bg-white p-1.5 pl-5 shadow-lg ring-1 shadow-zinc-900/5 transition focus-within:ring-2 focus-within:ring-fuchsia-300',
					error ? 'ring-red-300' : 'ring-zinc-900/5'
				]}
			>
				<input
					type="password"
					name="password"
					required
					autocomplete="current-password"
					placeholder="Passwort"
					aria-label="Passwort"
					aria-invalid={!!error}
					class="min-w-0 flex-1 border-0 bg-transparent py-2 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
				/>
				<button
					type="submit"
					disabled={sending}
					aria-label="Weiter"
					class="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-rose-500 via-fuchsia-500 to-sky-500 text-white shadow-md transition hover:brightness-105 active:scale-95 disabled:opacity-60"
				>
					<ArrowRight class="size-5" />
				</button>
			</div>
			{#if error}
				<p class="mt-3 text-sm font-medium text-red-600">{error}</p>
			{/if}
		</form>
	{/if}
</main>
