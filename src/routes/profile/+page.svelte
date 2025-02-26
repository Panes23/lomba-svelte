<script lang="ts">
  import { supabaseClient } from '$lib/supabaseClient';
  import { user } from '$lib/stores/authStore';
  import Swal from '$lib/utils/swal';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let loading = false;
  let username = '';
  let email = '';
  let phone = '';
  let birth_date = '';
  let showPasswordForm = false;
  let currentPassword = '';
  let newPassword = '';
  let confirmPassword = '';

  onMount(async () => {
    // Cek cookie yang ada
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(c => c.trim().startsWith('sb-access-token='));
    
    if (!authCookie) {
      // Redirect ke halaman login jika tidak ada session
      goto('/');
      return;
    }

    try {
      // Parse cookie data
      const cookieValue = authCookie.split('=')[1].trim();
      const base64Data = cookieValue.replace('base64-', '');
      const data = JSON.parse(atob(base64Data));
      
      if (data.user) {
        loading = true;
        try {
          // Ambil data dari API endpoint
          const response = await fetch(`/api/profile?email=${data.user.email}`);
          const userData = await response.json();

          if (!response.ok) throw new Error('Failed to fetch profile data');

          if (userData) {
            username = userData.username;
            email = userData.email;
            phone = userData.phone || '';
            birth_date = userData.birth_date || '';
          }
        } catch (error) {
          console.error('Error:', error);
        } finally {
          loading = false;
        }
      }
    } catch (err) {
      console.error('Error parsing auth cookie:', err);
      goto('/');
    }
  });

  async function handleUpdateProfile() {
    try {
      loading = true;
      const { error } = await supabaseClient
        .from('users')
        .update({
          username,
          phone,
          birth_date,
          updated_at: new Date()
        })
        .eq('email', $user.email);

      if (error) throw error;

      await Swal.fire({
        title: 'Berhasil!',
        text: 'Profil berhasil diperbarui',
        icon: 'success',
        confirmButtonColor: '#e62020'
      });
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        title: 'Gagal!',
        text: 'Gagal memperbarui profil',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    } finally {
      loading = false;
    }
  }

  async function handleUpdatePassword() {
    // Cek password lama terlebih dahulu
    try {
      const { error: signInError } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: currentPassword
      });

      if (signInError) {
        await Swal.fire({
          title: 'Error!',
          text: 'Password lama tidak sesuai',
          icon: 'error',
          confirmButtonColor: '#e62020'
        });
        return;
      }
    } catch (error) {
      console.error('Error:', error);
      return;
    }

    if (newPassword !== confirmPassword) {
      await Swal.fire({
        title: 'Error!',
        text: 'Password baru tidak cocok',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
      return;
    }

    try {
      loading = true;
      const { error } = await supabaseClient.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      showPasswordForm = false;
      currentPassword = '';
      newPassword = '';
      confirmPassword = '';

      await Swal.fire({
        title: 'Berhasil!',
        text: 'Password berhasil diperbarui',
        icon: 'success',
        confirmButtonColor: '#e62020'
      });
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        title: 'Gagal!',
        text: 'Gagal memperbarui password',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-[#1a1a1a] pt-24 pb-12">
  <div class="container mx-auto px-4 max-w-2xl">
    <div class="bg-[#222] rounded-xl p-6">
      <h1 class="text-2xl font-bold text-white mb-6">Profil Saya</h1>

      <!-- Profile Info -->
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-2">Username</label>
          <input
            type="text"
            value={username}
            disabled
            class="w-full bg-[#1a1a1a] text-white rounded-lg border border-gray-800 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#e62020]"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-400 mb-2">Email</label>
          <input
            type="email"
            value={email}
            disabled
            class="w-full bg-[#1a1a1a] text-gray-400 rounded-lg border border-gray-800 px-4 py-3"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-400 mb-2">No. Telepon</label>
          <input
            type="tel"
            value={phone}
            disabled
            class="w-full bg-[#1a1a1a] text-white rounded-lg border border-gray-800 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#e62020]"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-400 mb-2">Tanggal Lahir</label>
          <input
            type="date"
            value={birth_date}
            disabled
            class="w-full bg-[#1a1a1a] text-white rounded-lg border border-gray-800 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#e62020]"
          />
        </div>
      </div>

      <!-- Password Section -->
      <div class="mt-8 pt-8 border-t border-gray-800">
        <button
          on:click={() => showPasswordForm = !showPasswordForm}
          class="text-[#e62020] hover:text-[#ff0000] transition-colors"
        >
          {showPasswordForm ? 'Batal Ubah Password' : 'Ubah Password'}
        </button>

        {#if showPasswordForm}
          <form on:submit|preventDefault={handleUpdatePassword} class="mt-4 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2">Password Lama</label>
              <input
                type="password"
                bind:value={currentPassword}
                required
                class="w-full bg-[#1a1a1a] text-white rounded-lg border border-gray-800 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#e62020]"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2">Password Baru</label>
              <input
                type="password"
                bind:value={newPassword}
                required
                class="w-full bg-[#1a1a1a] text-white rounded-lg border border-gray-800 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#e62020]"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2">Konfirmasi Password Baru</label>
              <input
                type="password"
                bind:value={confirmPassword}
                required
                class="w-full bg-[#1a1a1a] text-white rounded-lg border border-gray-800 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#e62020]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              class="w-full bg-gradient-to-r from-[#e62020] to-[#ff0000] text-white rounded-lg px-4 py-3 font-medium hover:from-[#ff0000] hover:to-[#e62020] transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Ubah Password'}
            </button>
          </form>
        {/if}
      </div>
    </div>
  </div>
</div> 