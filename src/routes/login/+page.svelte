<script lang="ts">
  import { MetaTags } from 'svelte-meta-tags';
  import { supabaseClient } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import Swal from '$lib/utils/swal';

  let identifier = '';
  let password = '';
  let loading = false;
  let errorMessage = '';
  let isEmailUnconfirmed = false;

  async function handleLogin() {
    try {
      loading = true;
      errorMessage = '';
      isEmailUnconfirmed = false;

      // Cek apakah input adalah email atau username
      const isEmail = identifier.includes('@');
      
      // Jika username, cari email dari database dulu
      let loginEmail = identifier;
      if (!isEmail) {
        const { data: userData, error: userError } = await supabaseClient
          .from('users')
          .select('email')
          .eq('username', identifier)
          .single();

        if (userError || !userData) {
          errorMessage = 'Username tidak ditemukan';
          return;
        }
        
        loginEmail = userData.email;
      }

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: loginEmail,
        password: password
      });

      if (error) {
        if (error.status === 400 && error.message === 'Email not confirmed') {
          isEmailUnconfirmed = true;
          errorMessage = 'Email belum dikonfirmasi';
          return;
        }
        if (error.status === 400 && error.message === 'Invalid login credentials') {
          errorMessage = 'Email atau password salah';
          return;
        }
        errorMessage = error.message;
        return;
      }

      goto('/');
    } catch (error) {
      errorMessage = error.message;
    } finally {
      loading = false;
    }
  }
</script>

<MetaTags
  title="Login - Tebak Angka Berhadiah"
  titleTemplate="%s | TEBAK ANGKA"
  description="Masuk ke akun Anda untuk mulai bermain dan menangkan hadiah jutaan rupiah dari berbagai pasaran yang tersedia."
  canonical="https://tebakangka.com/login"
  openGraph={{
    title: "Login - Tebak Angka Berhadiah",
    description: "Masuk ke akun Anda untuk mulai bermain dan menangkan hadiah jutaan rupiah.",
    url: "https://tebakangka.com/login",
    type: "website",
    siteName: "TEBAK ANGKA"
  }}
/>

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
          <input
            type="password"
            id="password"
            bind:value={password}
            class="w-full bg-[#1a1a1a] text-white rounded-lg px-4 py-3 border border-gray-800 focus:outline-none focus:border-[#e62020]"
            required
          />
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