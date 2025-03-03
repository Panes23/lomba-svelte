<script lang="ts">
  import { goto } from '$app/navigation';
  import { user } from '$lib/stores/authStore';
  import Swal from '$lib/utils/swal';

  const baseUrl = import.meta.env.VITE_BASE_URL;

  let identifier = '';
  let password = '';
  let loading = false;
  let errorMessage = '';
  let isEmailUnconfirmed = false;
  let showPassword = false;
  let loginAttempts = 0;

  async function handleLogin() {
    try {
      loading = true;
      errorMessage = '';
      isEmailUnconfirmed = false;

      // Gunakan endpoint lokal untuk login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error.includes('Email belum dikonfirmasi')) {
          isEmailUnconfirmed = true;
        }
        errorMessage = data.error;
        
        // Increment login attempts jika error username/password salah
        if (data.error === 'Username/Email atau password salah') {
          loginAttempts++;
          
          // Cek jika sudah 3x gagal
          if (loginAttempts >= 3) {
            const result = await Swal.fire({
              title: 'Login Gagal',
              text: 'Anda telah gagal login sebanyak 3 kali. Apakah Anda lupa password atau belum memiliki akun di tebakangka.com?',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#e62020',
              cancelButtonColor: '#3085d6',
              confirmButtonText: 'Lupa Password',
              cancelButtonText: 'Daftar Akun'
            });
            
            if (result.isConfirmed) {
              goto('/lupa-password');
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              goto('/register');
            }
          }
        }
        return;
      }

      // Set cookie dengan format yang benar
      const cookieData = {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        user: data.user
      };
      document.cookie = `sb-access-token=base64-${btoa(JSON.stringify(cookieData))}; path=/; max-age=3600; secure; samesite=strict`;

      // Update user store dan tunggu sampai selesai
      await Promise.all([
        // Update user store
        user.set(data.user),
        // Tunggu sebentar untuk memastikan store terupdate
        new Promise(resolve => setTimeout(resolve, 100))
      ]);

      // Navigasi ke halaman utama
      await goto('/');
    } catch (error) {
      errorMessage = error.message;
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <!-- Primary Meta Tags -->
  <title>TEBAK ANGKA | Login</title>
  <meta name="title" content="TEBAK ANGKA | Login">
  <meta name="description" content="Masuk ke akun Anda untuk mulai bermain dan menangkan hadiah jutaan rupiah dari berbagai pasaran yang tersedia di tebakangka.com">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content={`${baseUrl}/login`}>
  <meta property="og:title" content="TEBAK ANGKA | Login">
  <meta property="og:description" content="Masuk ke akun Anda untuk mulai bermain dan menangkan hadiah jutaan rupiah dari berbagai pasaran yang tersedia di tebakangka.com">
  <meta property="og:image" content={`${baseUrl}/og-image.png`}>
  <meta property="og:site_name" content="TEBAK ANGKA">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content={`${baseUrl}/login`}>
  <meta property="twitter:title" content="TEBAK ANGKA | Login">
  <meta property="twitter:description" content="Masuk ke akun Anda untuk mulai bermain dan menangkan hadiah jutaan rupiah dari berbagai pasaran yang tersedia di tebakangka.com">
  <meta property="twitter:image" content={`${baseUrl}/twitter-card.png`}>

  <!-- Additional SEO Meta Tags -->
  <meta name="keywords" content="login tebak angka, masuk tebak angka, tebak angka berhadiah, tebak angka online, togel online">
  <meta name="robots" content="index, follow">
  <meta name="language" content="Indonesian">
  <meta name="revisit-after" content="7 days">
  <meta name="author" content="TEBAK ANGKA">
  <meta name="theme-color" content="#e62020">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  <meta name="format-detection" content="telephone=no">
  
  <!-- Canonical URL -->
  <link rel="canonical" href={`${baseUrl}/login`}>
</svelte:head>

<div class="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
  <div class="container mx-auto px-4">
    <div class="max-w-md mx-auto">
      <h1 class="text-3xl font-bold text-white mb-8 text-center">Login</h1>

      <!-- Form Login -->
      <form on:submit|preventDefault={handleLogin} class="bg-[#222] rounded-xl p-6 border border-gray-800">
        {#if errorMessage}
          <div class="bg-red-500/10 text-red-500 p-4 rounded-lg mb-6">
            {errorMessage}
            {#if isEmailUnconfirmed}
              <p class="mt-2 text-sm">
                Silakan cek inbox email Anda untuk melakukan konfirmasi. 
                Jika email konfirmasi tidak ditemukan, periksa folder spam/junk.
              </p>
            {/if}
          </div>
        {/if}

        <div class="mb-6">
          <label for="identifier" class="block text-gray-400 mb-2">Username atau Email</label>
          <input
            type="text"
            id="identifier"
            bind:value={identifier}
            class="w-full bg-[#1a1a1a] text-white rounded-lg px-4 py-3 border border-gray-800 focus:outline-none focus:border-[#e62020]"
            required
          />
        </div>

        <div class="mb-6">
          <label for="password" class="block text-gray-400 mb-2">Password</label>
          <div class="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              bind:value={password}
              class="w-full bg-[#1a1a1a] text-white rounded-lg px-4 py-3 border border-gray-800 focus:outline-none focus:border-[#e62020]"
              required
            />
            <button 
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              on:click={() => showPassword = !showPassword}
            >
              {#if showPassword}
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              {:else}
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              {/if}
            </button>
          </div>
        </div>

        <div class="flex justify-end mb-6">
          <a 
            href="/lupa-password"
            class="text-sm text-[#e62020] hover:text-[#ff0000] transition-colors"
          >
            Lupa Password?
          </a>
        </div>

        <button
          type="submit"
          class="w-full bg-[#e62020] text-white py-3 rounded-lg font-medium hover:bg-[#ff0000] transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Login'}
        </button>

        <p class="text-center text-gray-400 mt-6">
          Belum punya akun?
          <a href="/register" class="text-[#e62020] hover:text-[#ff0000]">Daftar sekarang</a>
        </p>
      </form>

      <!-- Artikel Panduan -->
      <div class="bg-[#222] rounded-xl p-6 mt-8 border border-gray-800">
        <h2 class="text-xl font-semibold text-white mb-4">Panduan Login</h2>
        <ul class="list-disc list-inside text-gray-400 space-y-2">
          <li>Login menggunakan username atau email</li>
          <li>Pastikan email dan password yang dimasukkan benar</li>
          <li>Jika lupa password, gunakan fitur reset password</li>
          <li>Jaga kerahasiaan akun Anda</li>
          <li>Hindari menggunakan akun di perangkat umum</li>
        </ul>
      </div>
    </div>
  </div>
</div> 