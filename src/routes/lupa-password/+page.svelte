<script lang="ts">
  import { MetaTags } from 'svelte-meta-tags';
  import { supabaseClient } from '$lib/supabaseClient';
  import Swal from '$lib/utils/swal';

  let email = '';
  let loading = false;

  async function handleResetPassword() {
    try {
      loading = true;
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email);

      if (error) throw error;

      await Swal.fire({
        title: 'Berhasil!',
        text: 'Link reset password telah dikirim ke email Anda',
        icon: 'success',
        confirmButtonColor: '#e62020'
      });
    } catch (error) {
      await Swal.fire({
        title: 'Error!',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    } finally {
      loading = false;
    }
  }
</script>

<MetaTags
  title="Lupa Password - Tebak Angka"
  titleTemplate="%s | TEBAK ANGKA"
  description="Reset password akun Anda di TEBAK ANGKA dengan mudah dan aman."
  canonical="https://tebakangka.com/lupa-password"
/>

<div class="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
  <div class="container mx-auto px-4">
    <div class="max-w-md mx-auto">
      <h1 class="text-3xl font-bold text-white mb-8 text-center">Lupa Password</h1>

      <!-- Form Reset Password -->
      <form on:submit|preventDefault={handleResetPassword} class="bg-[#222] rounded-xl p-6 border border-gray-800">
        <div class="mb-6">
          <label for="email" class="block text-gray-400 mb-2">Email</label>
          <input
            type="email"
            id="email"
            bind:value={email}
            class="w-full bg-[#1a1a1a] text-white rounded-lg px-4 py-3 border border-gray-800 focus:outline-none focus:border-[#e62020]"
            required
          />
        </div>

        <button
          type="submit"
          class="w-full bg-[#e62020] text-white py-3 rounded-lg font-medium hover:bg-[#ff0000] transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Reset Password'}
        </button>
      </form>

      <!-- Informasi Reset Password -->
      <div class="bg-[#222] rounded-xl p-6 mt-8 border border-gray-800">
        <h2 class="text-xl font-semibold text-white mb-4">Informasi Reset Password</h2>
        <div class="space-y-4 text-gray-400">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-[#e62020] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Link reset password akan dikirim ke email yang terdaftar. Pastikan email yang Anda masukkan adalah email yang benar dan terdaftar di TEBAK ANGKA.</p>
          </div>

          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-[#e62020] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Link reset password hanya berlaku selama 24 jam. Jika sudah lebih dari 24 jam, Anda perlu meminta link reset password yang baru.</p>
          </div>

          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-[#e62020] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p>Periksa folder spam/junk jika email reset password tidak ditemukan di inbox utama.</p>
          </div>

          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-[#e62020] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p>Demi keamanan, jangan bagikan link reset password kepada siapapun.</p>
          </div>
        </div>

        <div class="mt-6 pt-6 border-t border-gray-800">
          <p class="text-center text-gray-400">
            Sudah ingat password Anda?
            <a href="/login" class="text-[#e62020] hover:text-[#ff0000] transition-colors">Login sekarang</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</div> 