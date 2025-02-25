<script lang="ts">
  import { supabaseClient } from '$lib/supabaseClient';
  import Swal from '$lib/utils/swal';

  let loading = false;
  let email = '';

  async function handleResetPassword() {
    try {
      loading = true;

      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:5173/update-password'
      });

      if (error) throw error;

      await Swal.fire({
        title: 'Berhasil!',
        text: 'Link reset password telah dikirim ke email Anda',
        icon: 'success',
        confirmButtonColor: '#e62020'
      });

    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Gagal mengirim reset password',
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
      <h1 class="text-2xl font-bold text-white">Reset Password</h1>
      <p class="text-sm text-gray-400 mt-1">Masukkan email Anda untuk reset password</p>
    </div>

    <form 
      on:submit|preventDefault={handleResetPassword}
      class="bg-[#222] rounded-xl border border-gray-800 p-6 space-y-4"
    >
      <div class="space-y-2">
        <label for="email" class="block text-sm font-medium text-gray-400">
          Email
        </label>
        <input
          type="email"
          id="email"
          bind:value={email}
          required
          class="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
          placeholder="Masukkan email Anda"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        class="w-full bg-[#e62020] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Loading...' : 'Reset Password'}
      </button>

      <div class="text-center mt-4">
        <a 
          href="/cups/login"
          class="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Kembali ke Login
        </a>
      </div>
    </form>
  </div>
</div> 