<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { onMount } from 'svelte';
	import { supabaseClient } from '$lib/supabaseClient';
	import { user } from '$lib/stores/authStore';
	import { invalidate } from '$app/navigation';

	export let data;
	$: ({ supabase, session } = data);

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

<Navbar />

<main>
	<slot />
</main>

<Footer />

<style>
	:global(body) {
		background-color: #121212;
		margin: 0;
		padding: 0;
	}
</style>
