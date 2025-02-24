<script lang="ts">
  import { goto } from '$app/navigation';
  import { supabaseClient } from '$lib/supabaseClient';
  import Swal from '$lib/utils/swal';

  let loading = false;
  let usernameOrEmail = '';
  let password = '';

  async function handleLogin() {
    try {
      loading = true;

      // Login dengan Supabase Auth
      const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
        email: usernameOrEmail.includes('@') ? usernameOrEmail : 'boss.rangga23@gmail.com',
        password: password
      });

      if (authError) throw authError;

      // Setelah login berhasil, ambil data dari coretax
      const { data: userData, error: userError } = await supabaseClient
        .from('coretax')
        .select('*')
        .or(`email.eq."${usernameOrEmail}",username.eq."${usernameOrEmail}"`)
        .single();

      if (userError || !userData) {
        throw new Error('Data user tidak ditemukan');
      }

      // Set cookie untuk menyimpan data login
      const cookieValue = JSON.stringify({
        id: userData.id,
        email: userData.email,
        username: userData.username,
        level: userData.level,
        access_token: authData.session?.access_token
      });
      document.cookie = `admin_data=${cookieValue}; path=/; max-age=86400; secure; samesite=strict`;

      // Redirect ke dashboard
      goto('/cups');
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Gagal login',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
  <div class="w-full max-w-sm">
    <!-- Logo & Title -->
    <div class="text-center mb-8">
      <img src="/favicon.svg" alt="Logo" class="w-16 h-16 mx-auto mb-4" />
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
    </form>
  </div>
</div> 