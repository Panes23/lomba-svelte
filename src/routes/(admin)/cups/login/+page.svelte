<script lang="ts">
  import { goto } from '$app/navigation';
  import { supabaseClient } from '$lib/supabaseClient';
  import Swal from '$lib/utils/swal';

  let loading = false;
  let usernameOrEmail = '';
  let password = '';

  // Fungsi untuk mendapatkan IP address
  async function getIPAddress() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error getting IP:', error);
      return null;
    }
  }

  async function handleLogin() {
    try {
      loading = true;

      // Dapatkan IP address
      const ipAddress = await getIPAddress();

      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          usernameOrEmail,
          password,
          ipAddress
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal login');
      }

      // Set cookie untuk menyimpan data login
      document.cookie = `admin_data=${JSON.stringify(result.data)}; path=/; max-age=86400; secure; samesite=strict`;

      // Redirect ke dashboard
      goto('/cups');
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Gagal login',
        icon: 'error',
        confirmButtonColor: '#e62020',
        background: '#222',
        color: '#fff'
      });
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-[#1a1a1a] flex justify-center p-4 pt-32">
  <div class="w-full max-w-sm">
    <!-- Logo & Title -->
    <div class="text-center mb-8">
      <a href="/">
        <img src="/favicon.svg" alt="Logo" class="w-16 h-16 mx-auto mb-4" />
      </a>
      <h1 class="text-2xl font-bold text-white">TEBAK ANGKA</h1>
      <p class="text-sm text-gray-400 mt-1">Dashboard Admin</p>
    </div>

    <!-- Login Form -->
    <form 
      on:submit|preventDefault={handleLogin}
      class="bg-[#222] rounded-xl border border-gray-800 p-6 space-y-4"
    >
      <div class="space-y-2">
        <label for="usernameOrEmail" class="block text-sm font-medium text-gray-400">
          Username / Email
        </label>
        <input
          type="text"
          id="usernameOrEmail"
          bind:value={usernameOrEmail}
          required
          class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
          placeholder="Enter your username or email"
        />
      </div>

      <div class="space-y-2">
        <label for="password" class="block text-sm font-medium text-gray-400">
          Password
        </label>
        <input
          type="password"
          id="password"
          bind:value={password}
          required
          class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
          placeholder="Enter your password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        class="w-full bg-[#e62020] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Loading...' : 'Login'}
      </button>

      <div class="text-center mt-4">
        <a 
          href="/lupa-password"
          class="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Lupa Password?
        </a>
      </div>
    </form>
  </div>
</div> 