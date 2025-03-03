<script lang="ts">
  import { goto } from '$app/navigation';
  import { supabaseClient } from '$lib/supabaseClient';
  import Swal from '$lib/utils/swal';

  const baseUrl = import.meta.env.VITE_BASE_URL;

  export let data;

  let loading = false;
  let password = '';
  let confirmPassword = '';

  async function handleUpdatePassword() {
    try {
      if (password !== confirmPassword) {
        throw new Error('Password tidak sama');
      }

      loading = true;

      let error;
      if (data.token_hash && data.type === 'recovery') {
        // Update password menggunakan token recovery
        const result = await supabaseClient.auth.updateUser({
          password: password
        });
        error = result.error;
      } else {
        // Update password biasa (user sudah login)
        const result = await supabaseClient.auth.updateUser({
          password: password
        });
        error = result.error;
      }

      if (error) throw error;

      await Swal.fire({
        title: 'Berhasil!',
        text: 'Password berhasil diperbarui',
        icon: 'success',
        confirmButtonColor: '#e62020'
      });

      // Redirect ke halaman login setelah berhasil
      goto('/login');
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Gagal memperbarui password',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <!-- Primary Meta Tags -->
  <title>TEBAK ANGKA | Update Password</title>
  <meta name="title" content="TEBAK ANGKA | Update Password">
  <meta name="description" content="Perbarui password akun Anda di tebakangka.com untuk meningkatkan keamanan. Pastikan menggunakan password yang kuat dan unik untuk melindungi akun Anda.">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content={`${baseUrl}/update-password`}>
  <meta property="og:title" content="TEBAK ANGKA | Update Password">
  <meta property="og:description" content="Perbarui password akun Anda di tebakangka.com untuk meningkatkan keamanan. Pastikan menggunakan password yang kuat dan unik untuk melindungi akun Anda.">
  <meta property="og:image" content={`${baseUrl}/og-image.png`}>
  <meta property="og:site_name" content="TEBAK ANGKA">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content={`${baseUrl}/update-password`}>
  <meta property="twitter:title" content="TEBAK ANGKA | Update Password">
  <meta property="twitter:description" content="Perbarui password akun Anda di tebakangka.com untuk meningkatkan keamanan. Pastikan menggunakan password yang kuat dan unik untuk melindungi akun Anda.">
  <meta property="twitter:image" content={`${baseUrl}/twitter-card.png`}>

  <!-- Additional SEO Meta Tags -->
  <meta name="keywords" content="update password tebak angka, ganti password tebak angka, ubah password tebak angka, keamanan akun tebak angka">
  <meta name="robots" content="noindex, nofollow">
  <meta name="language" content="Indonesian">
  <meta name="revisit-after" content="7 days">
  <meta name="author" content="TEBAK ANGKA">
  <meta name="theme-color" content="#e62020">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  <meta name="format-detection" content="telephone=no">
  
  <!-- Canonical URL -->
  <link rel="canonical" href={`${baseUrl}/update-password`}>
</svelte:head>

<div class="min-h-screen bg-[#1a1a1a] flex justify-center p-4 pt-32">
  <div class="w-full max-w-sm">
    <div class="text-center mb-8">
      <img src="/favicon.svg" alt="Logo" class="w-16 h-16 mx-auto mb-4" />
      <h1 class="text-2xl font-bold text-white">Update Password</h1>
      <p class="text-sm text-gray-400 mt-1">Masukkan password baru Anda</p>
    </div>

    <form 
      on:submit|preventDefault={handleUpdatePassword}
      class="bg-[#222] rounded-xl border border-gray-800 p-6 space-y-4"
    >
      <div class="space-y-2">
        <label for="password" class="block text-sm font-medium text-gray-400">
          Password Baru
        </label>
        <input
          type="password"
          id="password"
          bind:value={password}
          required
          minlength="6"
          class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
          placeholder="Masukkan password baru"
        />
      </div>

      <div class="space-y-2">
        <label for="confirmPassword" class="block text-sm font-medium text-gray-400">
          Konfirmasi Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          bind:value={confirmPassword}
          required
          minlength="6"
          class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
          placeholder="Konfirmasi password baru"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        class="w-full bg-[#e62020] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Loading...' : 'Update Password'}
      </button>
    </form>

    <!-- Informasi Update Password -->
    <div class="bg-[#222] rounded-xl border border-gray-800 p-6 mt-6">
      <h2 class="text-lg font-semibold text-white mb-4">Panduan Update Password</h2>
      <div class="space-y-3 text-gray-400">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-[#e62020] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p class="text-sm">Password minimal 6 karakter dan harus mengandung kombinasi huruf dan angka.</p>
        </div>

        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-[#e62020] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p class="text-sm">Hindari menggunakan password yang mudah ditebak seperti tanggal lahir atau nama pengguna.</p>
        </div>

        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-[#e62020] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm">Pastikan password baru berbeda dengan password lama untuk keamanan yang lebih baik.</p>
        </div>

        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-[#e62020] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <p class="text-sm">Jangan bagikan password Anda kepada siapapun dan selalu logout setelah menggunakan perangkat umum.</p>
        </div>
      </div>
    </div>
  </div>
</div> 