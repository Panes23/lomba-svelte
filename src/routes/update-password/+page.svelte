<script lang="ts">
  import { goto } from '$app/navigation';
  import { supabaseClient } from '$lib/supabaseClient';
  import Swal from '$lib/utils/swal';

  let loading = false;
  let password = '';
  let confirmPassword = '';

  async function handleUpdatePassword() {
    try {
      if (password !== confirmPassword) {
        throw new Error('Password tidak sama');
      }

      loading = true;

      const { error } = await supabaseClient.auth.updateUser({
        password: password
      });

      if (error) throw error;

      await Swal.fire({
        title: 'Berhasil!',
        text: 'Password berhasil diperbarui',
        icon: 'success',
        confirmButtonColor: '#e62020'
      });

      goto('/');
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
  </div>
</div> 