<script lang="ts">
  import { MetaTags } from 'svelte-meta-tags';
  import { supabaseClient } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import Swal from 'sweetalert2';

  let username = '';
  let email = '';
  let phone = '';
  let birth_date = '';
  let password = '';
  let confirmPassword = '';
  let loading = false;
  let error = null;
  let successMessage = null;

  async function handleRegister() {
    try {
      if (password !== confirmPassword) {
        throw new Error('Password tidak cocok');
      }

      loading = true;

      // Cek apakah username sudah dipakai
      const { data: existingUser, error: checkError } = await supabaseClient
        .from('users')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUser) {
        throw new Error('Username sudah digunakan');
      }

      // Register dengan Supabase Auth
      const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            username,
            phone,
            birth_date
          }
        }
      });

      if (error) throw error;

      // Insert ke tabel users
      const { error: insertError } = await supabaseClient
        .from('users')
        .insert({
          id: data.user?.id,
          username,
          email,
          phone,
          birth_date,
          auth_uid: data.user?.id
        });

      if (insertError) throw insertError;

      // Tampilkan popup sukses
      await Swal.fire({
        title: 'Pendaftaran Berhasil!',
        text: 'Silakan cek email Anda untuk konfirmasi akun.',
        icon: 'success',
        confirmButtonColor: '#e62020',
        confirmButtonText: 'OK'
      }).then((result) => {
        if (result.isConfirmed) {
          goto('/login');
        }
      });

    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Gagal mendaftar',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    } finally {
      loading = false;
    }
  }
</script>

<MetaTags
  title="Daftar Akun - Tebak Angka Berhadiah"
  titleTemplate="%s | TEBAK ANGKA"
  description="Daftar sekarang dan dapatkan kesempatan memenangkan hadiah jutaan rupiah dari berbagai pasaran yang tersedia."
  canonical="https://tebakangka.com/register"
  openGraph={{
    title: "Daftar Akun - Tebak Angka Berhadiah",
    description: "Daftar sekarang dan dapatkan kesempatan memenangkan hadiah jutaan rupiah.",
    url: "https://tebakangka.com/register",
    type: "website",
    siteName: "TEBAK ANGKA"
  }}
/>

<div class="min-h-screen bg-[#1a1a1a] pt-24 pb-16">
  <div class="container mx-auto px-4">
    <div class="max-w-md mx-auto">
      <h1 class="text-3xl font-bold text-white mb-8 text-center">Daftar Akun</h1>

      <!-- Form Register -->
      <form on:submit|preventDefault={handleRegister} class="bg-[#222] rounded-xl p-6 border border-gray-800">
        {#if error}
          <div class="bg-red-500/10 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        {/if}
        {#if successMessage}
          <div class="bg-green-500/10 text-green-500 p-4 rounded-lg mb-6">
            {successMessage}
          </div>
        {/if}

        <div class="mb-6">
          <label for="username" class="block text-gray-400 mb-2">Username</label>
          <input
            type="text"
            id="username"
            bind:value={username}
            class="w-full bg-[#1a1a1a] text-white rounded-lg px-4 py-3 border border-gray-800 focus:outline-none focus:border-[#e62020]"
            required
          />
        </div>

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

        <div class="mb-6">
          <label for="phone" class="block text-gray-400 mb-2">Nomor Telepon</label>
          <input
            type="tel"
            id="phone"
            bind:value={phone}
            class="w-full bg-[#1a1a1a] text-white rounded-lg px-4 py-3 border border-gray-800 focus:outline-none focus:border-[#e62020]"
            required
          />
        </div>

        <div class="mb-6">
          <label for="birth_date" class="block text-gray-400 mb-2">Tanggal Lahir</label>
          <input
            type="date"
            id="birth_date"
            bind:value={birth_date}
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
            minlength="8"
          />
        </div>

        <div class="mb-6">
          <label for="confirmPassword" class="block text-gray-400 mb-2">Konfirmasi Password</label>
          <input
            type="password"
            id="confirmPassword"
            bind:value={confirmPassword}
            class="w-full bg-[#1a1a1a] text-white rounded-lg px-4 py-3 border border-gray-800 focus:outline-none focus:border-[#e62020]"
            required
          />
        </div>

        <button
          type="submit"
          class="w-full bg-[#e62020] text-white py-3 rounded-lg font-medium hover:bg-[#ff0000] transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Daftar'}
        </button>

        <p class="text-center text-gray-400 mt-6">
          Sudah punya akun?
          <a href="/login" class="text-[#e62020] hover:text-[#ff0000]">Login</a>
        </p>
      </form>

      <!-- Artikel Syarat Pendaftaran -->
      <div class="bg-[#222] rounded-xl p-6 mt-8 border border-gray-800">
        <h2 class="text-xl font-semibold text-white mb-4">Syarat Pendaftaran</h2>
        <ul class="list-disc list-inside text-gray-400 space-y-2">
          <li>Minimal berusia 18 tahun</li>
          <li>Email aktif dan valid</li>
          <li>Nomor telepon aktif</li>
          <li>Username unik dan tidak mengandung kata kasar</li>
          <li>Password minimal 8 karakter</li>
        </ul>
      </div>
    </div>
  </div>
</div> 