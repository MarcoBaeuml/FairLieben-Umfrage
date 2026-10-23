<script lang="ts">
	import './layout.css';
	import fontUrl from '@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2?url';
	import { page } from '$app/state';
	import Footer from '#lib/Footer.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<svelte:head>
	<meta name="description" content={data.description} />
	<meta name="theme-color" content="#fafafa" />
	<link rel="preload" href={fontUrl} as="font" type="font/woff2" crossorigin="anonymous" />

	<link rel="icon" href="/favicon.ico" sizes="32x32" />
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
	<link rel="manifest" href="/site.webmanifest" />
	<meta name="apple-mobile-web-app-title" content={data.siteTitle} />

	<!-- Link-Vorschau in WhatsApp, Signal, Telegram, Instagram usw. -->
	<meta property="og:type" content="website" />
	<meta property="og:locale" content="de_DE" />
	<meta property="og:site_name" content={data.siteTitle} />
	<meta property="og:title" content={data.siteTitle} />
	<meta property="og:description" content={data.description} />
	<meta property="og:url" content={page.url.href} />
	<meta property="og:image" content="{page.url.origin}/og-image.jpg" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="{data.siteTitle}: {data.description}" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<div class="relative min-h-dvh overflow-x-clip bg-zinc-50 text-zinc-900 antialiased">
	<div aria-hidden="true" class="pointer-events-none absolute inset-0">
		<div
			class="absolute -top-48 -left-40 h-[28rem] w-[28rem] rounded-full bg-rose-200/60 blur-3xl"
		></div>
		<div
			class="absolute -top-24 -right-40 h-[28rem] w-[28rem] rounded-full bg-sky-200/60 blur-3xl"
		></div>
	</div>
	<div class="relative flex min-h-dvh flex-col">
		<div class="flex-1">
			{@render children()}
		</div>
		<Footer title={data.siteTitle} audiences={data.audiences} />
	</div>
</div>
