<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Check from '@lucide/svelte/icons/check';
	import Info from '@lucide/svelte/icons/info';
	import PenLine from '@lucide/svelte/icons/pen-line';
	import { accentFor } from '#lib/accents.ts';
	import { encrypt, importPublicKey } from '#lib/crypto.ts';
	import { MAX_ANSWER_LENGTH, type ResponsePlaintext } from '#lib/survey.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const audience = $derived(data.audience);
	const accent = $derived(accentFor(data.accentIndex));
	const questions = $derived(audience.sections.flatMap((section) => section.questions));

	let answers = $state<Record<string, string>>({});
	let status = $state<'idle' | 'sending' | 'done'>('idle');
	let errorMessage = $state('');

	const answeredCount = $derived(questions.filter((q) => answers[q.id]?.trim()).length);

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!data.publicKey) return;
		errorMessage = '';

		if (answeredCount === 0) {
			errorMessage = 'Beantworte mindestens eine Frage.';
			return;
		}

		status = 'sending';
		try {
			const plaintext: ResponsePlaintext = {
				v: 1,
				survey: data.surveyTitle,
				audience: audience.name,
				answers: audience.sections.flatMap((section) =>
					section.questions.map((question) => ({
						id: question.id,
						section: section.title,
						question: question.text,
						answer: (answers[question.id] ?? '').trim()
					}))
				)
			};
			const payload = await encrypt(await importPublicKey(data.publicKey), plaintext);

			const response = await fetch('/api/antworten', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(payload)
			});
			if (!response.ok) throw new Error(`HTTP ${response.status}`);

			answers = {};
			status = 'done';
			window.scrollTo({ top: 0, behavior: 'smooth' });
		} catch (error) {
			console.error(error);
			errorMessage = 'Senden hat nicht geklappt. Bitte versuch es nochmal.';
			status = 'idle';
		}
	}
</script>

<svelte:head>
	<title>{audience.name} · {data.surveyTitle}</title>
</svelte:head>

<main class="mx-auto max-w-2xl px-4 pt-6 pb-28 sm:pt-12 sm:pb-32">
	<a
		href="/"
		class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-zinc-500 transition hover:bg-white hover:text-zinc-900"
	>
		<ArrowLeft class="size-4" />
		Zurück
	</a>

	<header class="mt-4 mb-10 text-center sm:mt-6 sm:mb-12">
		<p class="text-sm font-semibold tracking-widest text-zinc-400 uppercase">{data.surveyTitle}</p>
		<h1
			class={[
				'mt-2 bg-gradient-to-br bg-clip-text pb-1 text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl',
				accent.gradient
			]}
		>
			{audience.name}
		</h1>
		{#if data.publicKey && status !== 'done'}
			<p
				class="mx-auto mt-5 inline-flex max-w-md items-start gap-2 rounded-2xl bg-white/70 px-4 py-2.5 text-left text-sm text-zinc-500 ring-1 ring-zinc-900/5 backdrop-blur"
			>
				<Info class="mt-0.5 size-4 shrink-0" />
				Bitte nur einmal abgeben.
			</p>
		{/if}
	</header>

	{#if !data.publicKey}
		<p class="rounded-3xl bg-red-50 p-6 text-red-700 ring-1 ring-red-200">
			Noch nicht eingerichtet: Die Umgebungsvariable <code>PUBLIC_KEY</code> ist nicht gesetzt.
		</p>
	{:else if status === 'done'}
		<div
			class="rounded-[1.75rem] bg-white px-6 py-10 text-center shadow-xl ring-1 shadow-zinc-900/5 ring-zinc-900/5 sm:p-10"
		>
			<div
				class={[
					'mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br text-3xl font-bold text-white shadow-lg',
					accent.gradient
				]}
			>
				<Check class="size-8" strokeWidth={3} />
			</div>
			<p class="mt-5 text-3xl font-extrabold tracking-tight">Danke!</p>
			<p class="mx-auto mt-2 max-w-sm text-zinc-500">
				Deine Antworten sind angekommen. Du bist fertig und musst nichts weiter tun.
			</p>
			<p class="mt-8 text-xs text-zinc-400">
				Nur wenn es wirklich sein muss:
				<button
					type="button"
					class="font-semibold underline decoration-zinc-300 underline-offset-2 transition hover:text-zinc-700"
					onclick={() => (status = 'idle')}
				>
					nochmal abgeben
				</button>
			</p>
		</div>
	{:else}
		<form onsubmit={submit}>
			{#each audience.sections as section (section.title)}
				<section class="mb-12 sm:mb-14">
					<div class="mb-4 flex items-center gap-3 px-1 sm:mb-5">
						<h2 class="text-xl font-extrabold tracking-tight text-balance sm:text-2xl">
							{section.title}
						</h2>
						<span class={['shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold', accent.soft]}>
							{section.questions.length}
						</span>
					</div>

					<div class="space-y-4 sm:space-y-5">
						{#each section.questions as question, i (question.id)}
							{@const answered = !!answers[question.id]?.trim()}
							<div
								class={[
									'overflow-hidden rounded-[1.75rem] bg-white shadow-lg ring-1 shadow-zinc-900/[0.04] ring-zinc-900/5 transition duration-300 focus-within:shadow-xl focus-within:ring-2 sm:focus-within:-translate-y-0.5',
									accent.focus
								]}
							>
								<div class="p-5 pb-4 sm:p-7 sm:pb-5">
									<div class="flex items-center justify-between">
										<span
											class={[
												'rounded-full px-3 py-1 text-xs font-bold tracking-wide tabular-nums',
												accent.soft
											]}
										>
											{String(i + 1).padStart(2, '0')}
											<span class="opacity-50"
												>/ {String(section.questions.length).padStart(2, '0')}</span
											>
										</span>
										<span
											class={[
												'grid size-7 place-items-center rounded-full transition duration-300',
												answered
													? ['scale-100 bg-gradient-to-br text-white shadow-md', accent.gradient]
													: 'scale-90 bg-zinc-100 text-transparent'
											]}
											aria-hidden="true"
										>
											<Check class="size-4" strokeWidth={3} />
										</span>
									</div>
									<label
										for={question.id}
										class="mt-3 block text-[1.0625rem] leading-snug font-semibold text-pretty text-zinc-800 sm:mt-4 sm:text-xl sm:leading-snug"
									>
										{question.text}
									</label>
								</div>
								<div class="group relative">
									<PenLine
										class={[
											'pointer-events-none absolute top-4.5 left-5 size-4 text-zinc-300 transition-colors sm:top-5.5 sm:left-7',
											accent.icon
										]}
										aria-hidden="true"
									/>
									<textarea
										id={question.id}
										rows="3"
										maxlength={MAX_ANSWER_LENGTH}
										placeholder="Deine Antwort …"
										bind:value={answers[question.id]}
										class="block [field-sizing:content] min-h-28 w-full cursor-text resize-none border-0 border-t border-zinc-100 bg-zinc-50/70 py-4 pr-5 pl-11 text-base text-zinc-900 transition-colors placeholder:text-zinc-400 hover:bg-zinc-100/60 focus:bg-white focus:outline-none sm:min-h-32 sm:py-5 sm:pr-7 sm:pl-14"
									></textarea>
								</div>
							</div>
						{/each}
					</div>
				</section>
			{/each}

			<div class="sticky bottom-[max(1rem,env(safe-area-inset-bottom))] z-10">
				{#if errorMessage}
					<p
						class="mb-3 rounded-2xl bg-red-50 px-4 py-2.5 text-sm text-red-700 ring-1 ring-red-200"
					>
						{errorMessage}
					</p>
				{/if}
				<div
					class="flex items-center justify-between gap-3 rounded-full bg-white/80 py-2 pr-2 pl-5 shadow-2xl ring-1 shadow-zinc-900/10 ring-zinc-900/5 backdrop-blur-xl sm:gap-4 sm:pl-6"
				>
					<div class="flex-1">
						<p class="text-sm text-zinc-500">
							<span class={['font-extrabold', accent.text]}>{answeredCount}</span>
							/ {questions.length} beantwortet
						</p>
						<div class="mt-1.5 h-1 w-full max-w-40 overflow-hidden rounded-full bg-zinc-100">
							<div
								class={[
									'h-full rounded-full bg-gradient-to-r transition-all duration-500',
									accent.gradient
								]}
								style:width="{(answeredCount / questions.length) * 100}%"
							></div>
						</div>
					</div>
					<button
						type="submit"
						disabled={status === 'sending'}
						class={[
							'shrink-0 rounded-full bg-gradient-to-br px-5 py-3 font-bold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98] disabled:opacity-60 sm:px-7',
							accent.gradient
						]}
					>
						{status === 'sending' ? 'Sende …' : 'Abschicken'}
					</button>
				</div>
			</div>
		</form>
	{/if}
</main>
