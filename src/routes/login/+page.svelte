<script lang="ts">
	import LoginForm from '#lib/LoginForm.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>{data.siteTitle}</title>
</svelte:head>

<LoginForm
	heading={data.siteTitle}
	text="Gib das Passwort ein, das ihr im Kurs bekommen habt."
	error={form?.error}
	configured={data.configured}
/>
