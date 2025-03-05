<script>
  import { page } from '$app/stores';
</script>

<svelte:head>
  <title>{$page.status} - {$page.error?.message || 'Error'}</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
  <div class="text-center">
    <!-- Error Code -->
    <h1 class="text-[120px] font-bold text-white leading-none mb-4">
      {$page.status}
    </h1>

    <!-- Error Message -->
    <p class="text-gray-400 text-xl mb-8">
      {$page.error?.message || 'Terjadi kesalahan pada sistem'}
    </p>

    <!-- Back Button -->
    <a
      href="/"
      class="inline-block bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-[#1a1a1a] transition-all duration-300"
    >
      Kembali ke Beranda
    </a>
  </div>
</div>

<style>
  :global(html) {
    background-color: #1a1a1a;
  }
  
  :global(body) {
    margin: 0;
    padding: 0;
    background-color: #1a1a1a;
    min-height: 100vh;
  }
  
  /* Animasi fade-in untuk konten */
  .text-center {
    animation: fadeIn 0.5s ease-in;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style> 