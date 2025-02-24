<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import ReloadPrompt from '$lib/components/ReloadPrompt.svelte';
	import { onMount } from 'svelte';
	import { supabaseClient } from '$lib/supabaseClient';
	import { user } from '$lib/stores/authStore';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';

	export let data;
	$: ({ supabase, session } = data);

	// Cek apakah route saat ini adalah /cups/*
	$: isAdminRoute = $page.url.pathname.startsWith('/cups') || $page.route.id?.includes('(admin)');

	onMount(() => {
		user.initialize();

		const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event, newSession) => {
			if (event === 'SIGNED_IN') {
				user.set(newSession?.user ?? null);
			} else if (event === 'SIGNED_OUT') {
				user.set(null);
			}

			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => subscription.unsubscribe();
	});
</script>

{#if !isAdminRoute}
	<Navbar />
{/if}

<main>
	<slot />
</main>

{#if !isAdminRoute}
	<Footer />
{/if}

<ReloadPrompt />

<style>
	:global(body) {
		background-color: #121212;
		margin: 0;
		padding: 0;
	}
</style>
