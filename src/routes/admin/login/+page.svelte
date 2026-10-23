<script lang="ts">
	import LoginForm from '#lib/LoginForm.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>Admin · {data.siteTitle}</title>
</svelte:head>

<LoginForm
	heading="Admin"
	text="Zugang zum verschlüsselten Export."
	error={form?.error}
	configured={data.configured}
/>
