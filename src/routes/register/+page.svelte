<script lang="ts">
  import { supabaseClient } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import Swal from 'sweetalert2';

  const baseUrl = import.meta.env.VITE_BASE_URL;

  let username = '';
  let email = '';
  let phone = '';
  let birth_date = '';
  let password = '';
  let confirmPassword = '';
  let loading = false;
  let error = null;
  let successMessage = null;

  // Fungsi untuk validasi email
  function isValidEmail(email: string) {
    if (!email) {
      return { isValid: false, message: 'Alamat email wajib diisi' };
    }

    // Validasi panjang email
    if (email.length > 254) {
      return { isValid: false, message: 'Alamat email terlalu panjang (maksimal 254 karakter)' };
    }

    // Validasi format dasar email
    const emailRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Format alamat email tidak valid. Contoh format yang benar: nama@domain.com' };
    }

    // Validasi karakter khusus di local part
    const localPart = email.split('@')[0];
    if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
      return { isValid: false, message: 'Format email tidak valid (tidak boleh mengandung titik berurutan atau diawali/diakhiri dengan titik)' };
    }

    // Validasi panjang bagian local
    if (localPart.length > 64) {
      return { isValid: false, message: 'Bagian sebelum @ terlalu panjang (maksimal 64 karakter)' };
    }

    // Daftar domain email yang tidak diizinkan
    const blockedDomains = [
      'tempmail.com',
      'temp-mail.org',
      'disposablemail.com',
      'throwawaymail.com',
      'fakeinbox.com',
      'guerrillamail.com',
      'sharklasers.com',
      'spam4.me',
      'mailinator.com',
      'yopmail.com'
    ];

    // Cek domain yang diblokir
    const domain = email.split('@')[1].toLowerCase();
    if (blockedDomains.some(blockedDomain => domain.includes(blockedDomain))) {
      return { isValid: false, message: 'Mohon gunakan email pribadi Anda. Email sementara tidak diizinkan untuk pendaftaran' };
    }

    return { isValid: true, message: '' };
  }

  // Fungsi untuk mengecek data yang sudah ada
  async function checkExisting(field: string, value: string) {
    const response = await fetch('/api/check-existing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ field, value })
    });
    const data = await response.json();
    return data.exists;
  }

  async function handleRegister() {
    try {
      // Validasi password
      if (password !== confirmPassword) {
        throw new Error('Password tidak cocok');
      }

      // Validasi email
      const emailValidation = isValidEmail(email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.message);
      }

      loading = true;

      // Cek apakah nomor telepon sudah terdaftar
      const phoneExists = await checkExisting('phone', phone);
      if (phoneExists) {
        throw new Error('Nomor telepon tersebut sudah terdaftar');
      }

      // Cek apakah email sudah terdaftar
      const emailExists = await checkExisting('email', email);
      if (emailExists) {
        throw new Error('Email tersebut sudah terdaftar');
      }

      // Cek apakah username sudah dipakai
      const usernameExists = await checkExisting('username', username);
      if (usernameExists) {
        throw new Error('Username ini sudah digunakan. Silakan pilih username lain');
      }

      // Kirim data registrasi
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          username,
          phone,
          birth_date
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw { 
          message: result.error,
          code: result.code
        };
      }

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

    } catch (err) {
      console.error('Error:', err);
      let errorMessage = err.message;

      // Jika error dari Supabase Auth
      if (err.code) {
        errorMessage = translateSupabaseError({
          code: err.code,
          message: err.message
        });
      }

      await Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#e62020',
        confirmButtonText: 'OK'
      });
    } finally {
      loading = false;
    }
  }

  // Fungsi untuk menerjemahkan pesan error Supabase
  function translateSupabaseError(error: any) {
    const errorCode = error?.code;
    const errorMessage = error?.message;

    // Daftar pesan error dalam bahasa Indonesia
    const errorMessages: { [key: string]: string } = {
      'email_address_invalid': 'Alamat email tidak aktif, mohon gunakan email aktif',
      'invalid_email': 'Alamat email tidak valid, mohon periksa kembali',
      'email_taken': 'Email sudah terdaftar, silakan gunakan email lain',
      'user_exists': 'Pengguna sudah terdaftar',
      'weak_password': 'Password terlalu lemah, gunakan minimal 8 karakter',
      'passwordless_signup_not_allowed': 'Pendaftaran tanpa password tidak diizinkan',
      'unauthenticated': 'Silakan login terlebih dahulu',
      'unauthorized': 'Anda tidak memiliki akses',
      '23505': 'Nomor telepon tersebut sudah terdaftar',
      'default': 'Terjadi kesalahan, silakan coba lagi'
    };

    // Jika ada kode error spesifik
    if (errorCode && errorMessages[errorCode]) {
      return errorMessages[errorCode];
    }

    // Jika error berkaitan dengan unique constraint users_phone_key
    if (errorMessage && typeof errorMessage === 'string' &&
        errorMessage.includes('users_phone_key')) {
      return 'Nomor telepon tersebut sudah terdaftar';
    }

    // Jika error berkaitan dengan email invalid
    if (errorMessage && typeof errorMessage === 'string') {
      if (errorMessage.toLowerCase().includes('email address') && 
          errorMessage.toLowerCase().includes('is invalid')) {
        return errorMessages['email_address_invalid'];
      }
    }

    // Error default
    return errorMessages.default;
  }
</script>

<svelte:head>
  <!-- Primary Meta Tags -->
  <title>TEBAK ANGKA | Daftar Akun</title>
  <meta name="title" content="TEBAK ANGKA | Daftar Akun">
  <meta name="description" content="Daftar akun sekarang dan dapatkan kesempatan memenangkan hadiah jutaan rupiah dari berbagai pasaran yang tersedia di tebakangka.com">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content={`${baseUrl}/register`}>
  <meta property="og:title" content="TEBAK ANGKA | Daftar Akun">
  <meta property="og:description" content="Daftar akun sekarang dan dapatkan kesempatan memenangkan hadiah jutaan rupiah dari berbagai pasaran yang tersedia di tebakangka.com">
  <meta property="og:image" content={`${baseUrl}/og-image.png`}>
  <meta property="og:site_name" content="TEBAK ANGKA">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content={`${baseUrl}/register`}>
  <meta property="twitter:title" content="TEBAK ANGKA | Daftar Akun">
  <meta property="twitter:description" content="Daftar akun sekarang dan dapatkan kesempatan memenangkan hadiah jutaan rupiah dari berbagai pasaran yang tersedia di tebakangka.com">
  <meta property="twitter:image" content={`${baseUrl}/twitter-card.png`}>

  <!-- Additional SEO Meta Tags -->
  <meta name="keywords" content="daftar tebak angka, registrasi tebak angka, buat akun tebak angka, tebak angka berhadiah, tebak angka online">
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
  <link rel="canonical" href={`${baseUrl}/register`}>
</svelte:head>

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