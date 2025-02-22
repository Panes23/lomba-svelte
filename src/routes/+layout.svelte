<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
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
