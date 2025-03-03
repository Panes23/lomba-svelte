<script lang="ts">
  import { supabaseClient } from '$lib/supabaseClient';
  import Swal from '$lib/utils/swal';
  import { onMount } from 'svelte';

  let loading = false;
  let searchQuery = '';
  let currentPage = 1;
  const itemsPerPage = 8;
  let selectedDate = '';
  let showModal = false;
  let showFakeGuessModal = false;
  let selectedLomba: any = null;
  let markets: any[] = [];
  let websites: any[] = [];
  let fakeUsers: any[] = [];
  let numberOfGuesses = 1;
  let selectedWebsiteIds: string[] = [];
  let websiteFakeUsers: { [key: string]: number } = {};
  let showWarning = false;
  let warningMessage = '';
  let showEditModal = false;
  let editLomba = {
    id: '',
    market_id: '',
    tanggal: '',
    prize_pool: '',
    result: '',
    guess_type: '',
    max_winner: ''
  };

  let newLomba = {
    market_id: '',
    tanggal: '',
    prize_pool: '',
    result: '',
    guess_type: '',
    max_winner: ''
  };

  let useAsumsiResult = false;
  let asumsiResult = '';

  let selectedStatus = 'Semua';

  let showGuessModal = false;
  let selectedGuesses: any[] = [];
  let loadingGuesses = false;
  let guessSearchQuery = '';
  let guessCurrentPage = 1;
  const guessItemsPerPage = 10;
  let filteredGuesses: any[] = [];
  let selectedGuessStatus = 'Semua';

  let showWinnerModal = false;
  let selectedWinners: any[] = [];
  let loadingWinners = false;

  let selectedLombaIds: string[] = [];
  let selectAll = false;

  // Fetch markets dan websites saat komponen dimount
  onMount(async () => {
    try {
      const [marketsResponse, websitesResponse] = await Promise.all([
        supabaseClient.from('markets').select('*'),
        supabaseClient.from('websites').select('*')
      ]);

      if (marketsResponse.error) throw marketsResponse.error;
      if (websitesResponse.error) throw websitesResponse.error;

      markets = marketsResponse.data;
      websites = websitesResponse.data;

      // Update jumlah peserta untuk setiap lomba
      if (lomba) {
        const updatedLomba = await Promise.all(
          lomba.map(async (item) => {
            const jumlahPeserta = await fetchJumlahPeserta(item.id);
            return { ...item, jumlah_peserta: jumlahPeserta };
          })
        );
        lomba = updatedLomba;
      }
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        title: 'Error!',
        text: 'Gagal memuat data',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    }
  });

  // Fetch available fake users (yang belum tebak) untuk setiap website
  async function fetchAvailableFakeUsers(lombaId: string) {
    try {
      // Ambil semua fake users beserta website mereka
      const { data: allFakeUsers, error: fakeUsersError } = await supabaseClient
        .from('fake_users')
        .select('userid_website, website_id');
      
      if (fakeUsersError) throw fakeUsersError;

      // Ambil tebakan yang sudah ada untuk lomba ini
      const { data: existingGuesses, error: guessesError } = await supabaseClient
        .from('tebakan')
        .select('userid_website, website_id')
        .eq('lomba_id', lombaId);

      if (guessesError) throw guessesError;

      // Buat Set untuk menyimpan userid_website yang sudah menebak
      const usedUserIds = new Set(
        existingGuesses?.map(guess => `${guess.userid_website}-${guess.website_id}`) || []
      );

      // Hitung fake users yang tersedia per website
      const availableUsers: { [key: string]: number } = {};
      
      // Inisialisasi counter untuk setiap website
      websites.forEach(website => {
        availableUsers[website.id] = 0;
      });

      // Hitung total fake users yang tersedia (belum menebak)
      allFakeUsers?.forEach(user => {
        const userKey = `${user.userid_website}-${user.website_id}`;
        if (!usedUserIds.has(userKey)) {
          availableUsers[user.website_id]++;
        }
      });

      return availableUsers;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  // Modifikasi fungsi ketika modal fake guess dibuka
  async function openFakeGuessModal(lomba: any) {
    try {
      loading = true;
      selectedLomba = lomba;
      showFakeGuessModal = true;
      
      // Fetch available fake users
      websiteFakeUsers = await fetchAvailableFakeUsers(lomba.id);
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        title: 'Error!',
        text: 'Gagal memuat data fake users',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    } finally {
      loading = false;
    }
  }

  // Modifikasi fetch fake users untuk hanya mengambil yang belum menebak
  async function fetchFakeUsers(websiteId: string) {
    try {
      // Ambil semua fake users untuk website tersebut
      const { data: allUsers, error: usersError } = await supabaseClient
        .from('fake_users')
        .select('*')
        .eq('website_id', websiteId);

      if (usersError) throw usersError;

      // Ambil userid_website yang sudah menebak
      const { data: existingGuesses, error: guessesError } = await supabaseClient
        .from('tebakan')
        .select('userid_website')
        .eq('lomba_id', selectedLomba.id)
        .eq('website_id', websiteId);

      if (guessesError) throw guessesError;

      // Filter out users yang sudah menebak
      const usedUserIds = new Set(existingGuesses?.map(g => g.userid_website));
      return allUsers?.filter(user => !usedUserIds.has(user.userid_website)) || [];
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  // Modifikasi fungsi generateRandomNumber untuk mendukung asumsi result
  function generateRandomNumber(guessType: string, useAsumsi: boolean = false, asumsi: string = '') {
    const length = parseInt(guessType[0]);
    const parts = [];
    
    if (useAsumsi && asumsi) {
      // Tentukan bagian angka yang harus digunakan berdasarkan tipe tebakan
      const targetNumber = asumsi.slice(-length);
      
      // Generate 3 bagian angka dengan salah satu bagian mengandung target number
      const randomPosition = Math.floor(Math.random() * 3); // 0, 1, atau 2
      
      for (let i = 0; i < 3; i++) {
        if (i === randomPosition) {
          parts.push(targetNumber);
        } else {
          let part = '';
          for (let j = 0; j < length; j++) {
            part += Math.floor(Math.random() * 10);
          }
          parts.push(part);
        }
      }
    } else {
      // Generate normal random numbers
      for (let i = 0; i < 3; i++) {
        let part = '';
        for (let j = 0; j < length; j++) {
          part += Math.floor(Math.random() * 10);
        }
        parts.push(part);
      }
    }
    
    // Gabungkan dengan separator
    return parts.join('-');
  }

  // Fetch jumlah peserta untuk setiap lomba
  async function fetchJumlahPeserta(lombaId: string) {
    try {
      const { data, error } = await supabaseClient
        .from('tebakan')
        .select('userid_website')
        .eq('lomba_id', lombaId);

      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      console.error('Error:', error);
      return 0;
    }
  }

  // Modifikasi fungsi untuk mencari tebakan dengan nomor yang sesuai asumsi
  async function findExistingGuessWithAsumsi(lombaId: string, guessType: string, asumsiResult: string) {
    try {
      const length = parseInt(guessType[0]);
      const targetNumber = asumsiResult.slice(-length);
      
      // Ambil semua tebakan untuk lomba ini
      const { data, error } = await supabaseClient
        .from('tebakan')
        .select('created_at, number')
        .eq('lomba_id', lombaId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Cari tebakan yang memiliki nomor yang sesuai dengan asumsi
      const matchingGuesses = data?.filter(guess => {
        const parts = guess.number.split('-');
        return parts.some(part => part === targetNumber);
      }) || [];

      // Ambil semua tebakan yang memiliki nomor yang sesuai
      return matchingGuesses;
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  }

  // Modifikasi fungsi generateRandomDateTime
  function generateRandomDateTime(buka: string, tutup: string, tanggal: string, existingGuesses: any[] = []) {
    // Parse waktu buka dan tutup
    const [bukaHour, bukaMinute] = buka.split(':').map(Number);
    const [tutupHour, tutupMinute] = tutup.split(':').map(Number);
    
    // Konversi ke timestamp (dalam detik sejak tengah malam)
    const bukaTimestamp = (bukaHour * 60 * 60) + (bukaMinute * 60);
    const tutupTimestamp = (tutupHour * 60 * 60) + (tutupMinute * 60);

    let maxTimestamp = tutupTimestamp;
    
    // Jika ada tebakan yang sesuai
    if (existingGuesses.length > 0) {
      // Ambil waktu tebakan pertama yang sesuai
      const referenceDate = new Date(existingGuesses[0].created_at);
      
      // Konversi ke timestamp lokal (dalam detik sejak tengah malam)
      const referenceHours = referenceDate.getUTCHours();
      const referenceMinutes = referenceDate.getUTCMinutes();
      const referenceSeconds = referenceDate.getUTCSeconds();
      const referenceTimestamp = (referenceHours * 60 * 60) + (referenceMinutes * 60) + referenceSeconds;
      
      // Jika waktu referensi sama dengan waktu buka, gunakan waktu buka
      if (referenceTimestamp === bukaTimestamp) {
        maxTimestamp = bukaTimestamp;
      } else {
        // Set maxTimestamp ke 1-5 detik sebelum tebakan yang ada
        const randomOffset = Math.floor(Math.random() * 4) + 1; // 1-5 detik
        maxTimestamp = Math.min(referenceTimestamp - randomOffset, tutupTimestamp);
      }
    }

    // Pastikan maxTimestamp tidak lebih kecil dari bukaTimestamp
    maxTimestamp = Math.max(bukaTimestamp, maxTimestamp);

    // Generate waktu random antara buka dan maxTimestamp
    const targetTimestamp = Math.floor(
      Math.random() * (maxTimestamp - bukaTimestamp) + bukaTimestamp
    );
    
    // Konversi kembali ke jam, menit, dan detik
    const targetHour = Math.floor(targetTimestamp / 3600);
    const targetMinute = Math.floor((targetTimestamp % 3600) / 60);
    const targetSecond = targetTimestamp % 60;
    
    // Buat date object dengan tanggal yang dipilih
    const date = new Date(tanggal);
    date.setUTCHours(targetHour, targetMinute, targetSecond, 0);
    
    // Format tanggal ke ISO string dan potong bagian Z
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }

  // Modifikasi handleGenerateFakeGuess
  async function handleGenerateFakeGuess() {
    try {
      loading = true;

      if (!selectedLomba || selectedWebsiteIds.length === 0 || !numberOfGuesses) {
        throw new Error('Data tidak lengkap');
      }

      if (useAsumsiResult && !asumsiResult) {
        throw new Error('Asumsi result harus diisi');
      }

      if (useAsumsiResult && asumsiResult) {
        const length = parseInt(selectedLomba.guess_type[0]);
        if (asumsiResult.length < length) {
          throw new Error(`Asumsi result harus minimal ${length} digit untuk tipe tebakan ${selectedLomba.guess_type}`);
        }
      }

      // Fetch market details
      const { data: marketData, error: marketError } = await supabaseClient
        .from('markets')
        .select('buka, tutup')
        .eq('id', selectedLomba.market_id)
        .single();

      if (marketError) throw marketError;

      // Validasi format waktu
      if (!marketData.buka || !marketData.tutup) {
        throw new Error('Data jam buka/tutup market tidak valid');
      }

      // Cari tebakan yang sudah ada dengan nomor yang sesuai asumsi
      let existingGuesses = [];
      if (useAsumsiResult) {
        existingGuesses = await findExistingGuessWithAsumsi(
          selectedLomba.id,
          selectedLomba.guess_type,
          asumsiResult
        );
      }

      // Fetch dan validasi ketersediaan fake users untuk semua website yang dipilih
      const websiteUsers: { [key: string]: any[] } = {};
      for (const websiteId of selectedWebsiteIds) {
        const availableUsers = await fetchFakeUsers(websiteId);
        websiteUsers[websiteId] = availableUsers;
      }

      // Validasi total fake users yang tersedia
      const totalAvailableUsers = Object.values(websiteUsers).reduce((total, users) => total + users.length, 0);
      if (totalAvailableUsers < numberOfGuesses) {
        throw new Error(`Total fake users tidak mencukupi. Tersedia: ${totalAvailableUsers}, Dibutuhkan: ${numberOfGuesses}`);
      }

      let allGuesses = [];
      let remainingGuesses = numberOfGuesses;
      let usedUserIds = new Set();

      while (remainingGuesses > 0) {
        // Randomly select a website
        const availableWebsites = selectedWebsiteIds.filter(websiteId => {
          const availableUsers = websiteUsers[websiteId].filter(user => !usedUserIds.has(`${user.userid_website}-${websiteId}`));
          return availableUsers.length > 0;
        });

        if (availableWebsites.length === 0) break;

        const randomWebsiteId = availableWebsites[Math.floor(Math.random() * availableWebsites.length)];
        const availableUsers = websiteUsers[randomWebsiteId].filter(user => !usedUserIds.has(`${user.userid_website}-${randomWebsiteId}`));
        
        // Select a random user from the website
        const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
        usedUserIds.add(`${randomUser.userid_website}-${randomWebsiteId}`);

        // Modifikasi pembuatan tebakan
        allGuesses.push({
          lomba_id: selectedLomba.id,
          website_id: randomWebsiteId,
          userid_website: randomUser.userid_website,
          number: generateRandomNumber(selectedLomba.guess_type, useAsumsiResult, asumsiResult),
          created_at: generateRandomDateTime(
            marketData.buka,
            marketData.tutup,
            selectedLomba.tanggal,
            existingGuesses
          )
        });

        remainingGuesses--;
      }

      // Sort berdasarkan created_at
      allGuesses.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      // Insert semua tebakan ke database
      const { error } = await supabaseClient
        .from('tebakan')
        .insert(allGuesses);

      if (error) throw error;

      // Update jumlah peserta di local state
      const newJumlahPeserta = await fetchJumlahPeserta(selectedLomba.id);
      lomba = lomba.map(item => 
        item.id === selectedLomba.id 
          ? { ...item, jumlah_peserta: newJumlahPeserta }
          : item
      );

      // Hitung distribusi tebakan per website
      const guessDistribution = allGuesses.reduce((acc, guess) => {
        const websiteName = websites.find(w => w.id === guess.website_id)?.nama || guess.website_id;
        acc[websiteName] = (acc[websiteName] || 0) + 1;
        return acc;
      }, {});

      const distributionText = Object.entries(guessDistribution)
        .map(([website, count]) => `${website} (${count})`)
        .join(', ');

      const lombaInfo = {
        name: selectedLomba.markets.name,
        type: selectedLomba.guess_type,
        totalGuesses: numberOfGuesses,
        distribution: distributionText
      };

      // Reset state
      showFakeGuessModal = false;
      selectedLomba = null;
      numberOfGuesses = 1;
      selectedWebsiteIds = [];
      useAsumsiResult = false;
      asumsiResult = '';

      await Swal.fire({
        title: 'Berhasil!',
        text: `${lombaInfo.totalGuesses} tebakan palsu berhasil ditambahkan untuk ${lombaInfo.name} (${lombaInfo.type}) dengan distribusi: ${lombaInfo.distribution}`,
        icon: 'success',
        confirmButtonColor: '#e62020'
      });
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Gagal menambahkan tebakan palsu',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    } finally {
      loading = false;
    }
  }

  // Handle delete lomba
  async function handleDelete(id: string) {
    try {
      const result = await Swal.fire({
        title: 'Apakah anda yakin?',
        text: 'Lomba akan dihapus',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e62020',
        cancelButtonColor: '#3f3f3f',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
      });

      if (result.isConfirmed) {
        loading = true;
        const { error } = await supabaseClient
          .from('lomba')
          .delete()
          .eq('id', id);

        if (error) throw error;

        // Update local data
        lomba = lomba.filter(item => item.id !== id);

        await Swal.fire({
          title: 'Berhasil!',
          text: 'Lomba berhasil dihapus',
          icon: 'success',
          confirmButtonColor: '#e62020'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Gagal menghapus lomba',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    } finally {
      loading = false;
    }
  }

  // Handle submit form
  async function handleAddLomba() {
    try {
      loading = true;

      // Cek apakah kombinasi Pasaran, Tanggal, dan Tipe Tebakan sudah ada
      const { data: existingLomba, error: checkError } = await supabaseClient
        .from('lomba')
        .select('id')
        .eq('market_id', newLomba.market_id)
        .eq('tanggal', newLomba.tanggal)
        .eq('guess_type', newLomba.guess_type)
        .single();

      if (existingLomba) {
        throw new Error('Lomba dengan kombinasi Pasaran, Tanggal, dan Tipe Tebakan yang sama sudah ada');
      }

      const { data, error } = await supabaseClient
        .from('lomba')
        .insert([{
          ...newLomba,
          prize_pool: parseInt(newLomba.prize_pool),
          max_winner: parseInt(newLomba.max_winner)
        }])
        .select(`
          *,
          markets (
            id,
            name
          )
        `);

      if (error) throw error;

      // Update local data
      lomba = [...(data || []), ...lomba];
      showModal = false;
      
      // Reset form
      newLomba = {
        market_id: '',
        tanggal: '',
        prize_pool: '',
        result: '',
        guess_type: '',
        max_winner: ''
      };

      await Swal.fire({
        title: 'Berhasil!',
        text: 'Lomba berhasil ditambahkan',
        icon: 'success',
        confirmButtonColor: '#e62020'
      });
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Gagal menambahkan lomba',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    } finally {
      loading = false;
    }
  }

  // Handle edit lomba
  function handleEditClick(item) {
    editLomba = {
      id: item.id,
      market_id: item.market_id,
      tanggal: item.tanggal,
      prize_pool: item.prize_pool.toString(),
      result: item.result || '',
      guess_type: item.guess_type,
      max_winner: item.max_winner.toString()
    };
    showEditModal = true;
  }

  // Handle submit edit form
  async function handleEditLomba() {
    try {
      loading = true;

      const { error } = await supabaseClient
        .from('lomba')
        .update({
          ...editLomba,
          prize_pool: parseInt(editLomba.prize_pool),
          max_winner: parseInt(editLomba.max_winner)
        })
        .eq('id', editLomba.id);

      if (error) throw error;

      // Update local data
      lomba = lomba.map(item => 
        item.id === editLomba.id 
          ? { ...item, ...editLomba, prize_pool: parseInt(editLomba.prize_pool), max_winner: parseInt(editLomba.max_winner) }
          : item
      );

      showEditModal = false;

      await Swal.fire({
        title: 'Berhasil!',
        text: 'Lomba berhasil diupdate',
        icon: 'success',
        confirmButtonColor: '#e62020'
      });
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Gagal mengupdate lomba',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    } finally {
      loading = false;
    }
  }

  export let data;
  $: lomba = data.lomba;

  // Format tanggal
  function formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  // Format prize pool
  function formatPrizePool(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  // Pagination logic
  $: totalPages = Math.ceil(filteredLomba.length / itemsPerPage);
  $: paginatedLomba = filteredLomba.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when search changes
  $: if (searchQuery) currentPage = 1;

  // Perbaiki fungsi untuk menghitung status lomba
  function calculateStatus(tanggal: string, buka: string, tutup: string, result: string | null = null) {
    // Jika result tidak kosong, langsung return status Result
    if (result) {
      return { status: 'Result', order: 0 };
    }

    const now = new Date();
    const [year, month, day] = tanggal.split('-').map(Number);
    const [bukaHour, bukaMinute] = buka.split(':').map(Number);
    const [tutupHour, tutupMinute] = tutup.split(':').map(Number);

    // Buat tanggal lomba dengan waktu buka dan tutup
    const lombaDate = new Date(year, month - 1, day);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Reset waktu ke 00:00:00
    today.setHours(0, 0, 0, 0);
    lombaDate.setHours(0, 0, 0, 0);

    // Jika tanggal lomba belum tiba
    if (lombaDate.getTime() > today.getTime()) {
      return { status: 'Belum Dimulai', order: 3 };
    }

    // Jika tanggal lomba sudah lewat
    if (lombaDate.getTime() < today.getTime()) {
      return { status: 'Tutup', order: 2 };
    }

    // Jika tanggal sama dengan hari ini, cek waktu
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = (currentHour * 60) + currentMinute;
    const bukaTimeInMinutes = (bukaHour * 60) + bukaMinute;
    const tutupTimeInMinutes = (tutupHour * 60) + tutupMinute;

    // Handle kasus khusus untuk waktu yang melewati tengah malam
    let adjustedTutupTimeInMinutes = tutupTimeInMinutes;
    if (tutupTimeInMinutes < bukaTimeInMinutes) {
      adjustedTutupTimeInMinutes += 24 * 60; // Tambah 24 jam dalam menit
    }

    // Jika waktu saat ini kurang dari waktu buka
    if (currentTimeInMinutes < bukaTimeInMinutes) {
      return { status: 'Belum Dimulai', order: 3 };
    }

    // Jika waktu saat ini antara waktu buka dan tutup
    const adjustedCurrentTimeInMinutes = currentTimeInMinutes < bukaTimeInMinutes ? currentTimeInMinutes + (24 * 60) : currentTimeInMinutes;
    if (adjustedCurrentTimeInMinutes >= bukaTimeInMinutes && adjustedCurrentTimeInMinutes < adjustedTutupTimeInMinutes) {
      const minutesUntilClose = adjustedTutupTimeInMinutes - adjustedCurrentTimeInMinutes;
      return { status: 'Buka', order: 1, minutesUntilClose };
    }

    // Jika sudah melewati waktu tutup
    return { status: 'Tutup', order: 2 };
  }

  // Modifikasi filter lomba untuk menambahkan status dan pengurutan
  $: filteredLomba = lomba
    .map(item => {
      // Temukan market yang sesuai berdasarkan market_id
      const market = markets.find(m => m.id === item.market_id);
      const { status, order, minutesUntilClose } = calculateStatus(
        item.tanggal,
        market?.buka || '00:00:00',
        market?.tutup || '23:59:59',
        item.result
      );
      return { ...item, status, order, minutesUntilClose };
    })
    .filter(item => {
      const matchesSearch = (
        item.guess_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.result?.toString().includes(searchQuery) ||
        item.markets?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      const matchesDate = !selectedDate || item.tanggal.startsWith(selectedDate);
      
      const matchesStatus = selectedStatus === 'Semua' || item.status === selectedStatus;
      
      return matchesSearch && matchesDate && matchesStatus;
    })
    .sort((a, b) => {
      // Prioritaskan status Buka
      if (a.status === 'Buka' && b.status !== 'Buka') return -1;
      if (b.status === 'Buka' && a.status !== 'Buka') return 1;
      
      // Jika keduanya Buka, urutkan berdasarkan waktu tersisa
      if (a.status === 'Buka' && b.status === 'Buka') {
        return (a.minutesUntilClose || 0) - (b.minutesUntilClose || 0);
      }
      
      // Prioritaskan status Tutup setelah Buka
      if (a.status === 'Tutup' && b.status !== 'Tutup') return -1;
      if (b.status === 'Tutup' && a.status !== 'Tutup') return 1;
      
      // Untuk status lainnya, urutkan berdasarkan tanggal terbaru
      return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
    });

  // Tambahkan reactive statement untuk validasi jumlah tebakan
  $: {
    if (selectedWebsiteIds.length > 0 && numberOfGuesses) {
      const totalAvailableUsers = selectedWebsiteIds.reduce((total, websiteId) => {
        return total + (websiteFakeUsers[websiteId] || 0);
      }, 0);

      showWarning = numberOfGuesses > totalAvailableUsers;
      warningMessage = showWarning ? 
        `Jumlah tebakan per website (${numberOfGuesses}) melebihi jumlah minimum fake users yang tersedia (${totalAvailableUsers})` : '';
    }
  }

  // Modifikasi fungsi fetchGuesses
  async function fetchGuesses(lombaId: string) {
    try {
      loadingGuesses = true;
      const { data: guessData, error: guessError } = await supabaseClient
        .from('tebakan')
        .select(`
          userid_website,
          number,
          created_at,
          website_id,
          websites (
            nama
          )
        `)
        .eq('lomba_id', lombaId)
        .order('created_at', { ascending: true });

      if (guessError) throw guessError;

      // Fetch fake users untuk pengecekan
      const { data: fakeUsers, error: fakeError } = await supabaseClient
        .from('fake_users')
        .select('userid_website, website_id');

      if (fakeError) throw fakeError;

      // Buat Set untuk menyimpan fake user IDs
      const fakeUserSet = new Set(
        fakeUsers?.map(user => `${user.userid_website}-${user.website_id}`) || []
      );

      // Tambahkan properti isFake ke setiap tebakan
      selectedGuesses = (guessData || []).map(guess => ({
        ...guess,
        isFake: fakeUserSet.has(`${guess.userid_website}-${guess.website_id}`)
      }));

      // Reset pagination dan search
      guessCurrentPage = 1;
      guessSearchQuery = '';
      updateFilteredGuesses();
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        title: 'Error!',
        text: 'Gagal memuat data tebakan',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    } finally {
      loadingGuesses = false;
    }
  }

  // Modifikasi fungsi untuk memfilter dan update tebakan
  function updateFilteredGuesses() {
    filteredGuesses = selectedGuesses.filter(guess => {
      const searchQuery = guessSearchQuery.toLowerCase();
      const matchesSearch = !searchQuery ? true : (
        guess.userid_website.toLowerCase().includes(searchQuery) ||
        guess.number.toLowerCase().includes(searchQuery) ||
        guess.websites?.nama.toLowerCase().includes(searchQuery)
      );
      
      const matchesStatus = selectedGuessStatus === 'Semua' ? true : (
        (selectedGuessStatus === 'Real' && !guess.isFake) ||
        (selectedGuessStatus === 'Fake' && guess.isFake)
      );
      
      return matchesSearch && matchesStatus;
    });

    // Reset halaman ke 1 ketika melakukan pencarian
    guessCurrentPage = 1;
  }

  // Reset filter saat modal ditutup
  function resetGuessFilters() {
    showGuessModal = false;
    selectedLomba = null;
    selectedGuesses = [];
    guessSearchQuery = '';
    guessCurrentPage = 1;
    selectedGuessStatus = 'Semua';
  }

  // Tambahkan reactive statement untuk search dan status
  $: {
    if (guessSearchQuery !== undefined || selectedGuessStatus !== undefined) {
      updateFilteredGuesses();
    }
  }

  // Reactive statement untuk pagination
  $: guessTotalPages = Math.ceil(filteredGuesses.length / guessItemsPerPage);
  $: paginatedGuesses = filteredGuesses.slice(
    (guessCurrentPage - 1) * guessItemsPerPage,
    guessCurrentPage * guessItemsPerPage
  );

  // Reset page ketika search berubah
  $: if (guessSearchQuery) guessCurrentPage = 1;

  // Fungsi untuk membuka modal tebakan
  async function openGuessModal(lomba: any) {
    selectedLomba = lomba;
    showGuessModal = true;
    await fetchGuesses(lomba.id);
  }

  // Tambahkan fungsi untuk mencari pemenang
  async function findWinners(lomba: any) {
    try {
      loadingWinners = true;
      const result = lomba.result;
      const guessType = lomba.guess_type;
      const maxWinner = lomba.max_winner;
      
      // Tentukan panjang angka yang harus dicocokkan berdasarkan tipe tebakan
      const targetLength = parseInt(guessType[0]);
      const targetNumber = result.slice(-targetLength);

      // Ambil semua tebakan untuk lomba ini
      const { data: guesses, error: guessError } = await supabaseClient
        .from('tebakan')
        .select(`
          userid_website,
          number,
          created_at,
          website_id,
          websites (
            nama
          )
        `)
        .eq('lomba_id', lomba.id)
        .order('created_at', { ascending: true });

      if (guessError) throw guessError;

      // Fetch fake users untuk pengecekan
      const { data: fakeUsers, error: fakeError } = await supabaseClient
        .from('fake_users')
        .select('userid_website, website_id');

      if (fakeError) throw fakeError;

      // Buat Set untuk menyimpan fake user IDs
      const fakeUserSet = new Set(
        fakeUsers?.map(user => `${user.userid_website}-${user.website_id}`) || []
      );

      // Filter tebakan yang memiliki angka yang cocok
      const winners = (guesses || [])
        .filter(guess => {
          const parts = guess.number.split('-');
          return parts.some(part => part.endsWith(targetNumber));
        })
        .map(guess => ({
          ...guess,
          isFake: fakeUserSet.has(`${guess.userid_website}-${guess.website_id}`),
          matchingPart: guess.number.split('-').find(part => part.endsWith(targetNumber))
        }))
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .slice(0, maxWinner);

      return winners;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  // Fungsi untuk membuka modal winner
  async function openWinnerModal(lomba: any) {
    try {
      selectedLomba = lomba;
      showWinnerModal = true;
      selectedWinners = await findWinners(lomba);
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        title: 'Error!',
        text: 'Gagal memuat data pemenang',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    } finally {
      loadingWinners = false;
    }
  }

  // Fungsi untuk handle select all
  function handleSelectAll(checked: boolean) {
    selectAll = checked;
    selectedLombaIds = checked ? paginatedLomba.map(item => item.id) : [];
  }

  // Fungsi untuk handle multi delete
  async function handleMultiDelete() {
    try {
      if (selectedLombaIds.length === 0) {
        await Swal.fire({
          title: 'Peringatan!',
          text: 'Pilih minimal satu lomba untuk dihapus',
          icon: 'warning',
          confirmButtonColor: '#e62020'
        });
        return;
      }

      const result = await Swal.fire({
        title: 'Apakah anda yakin?',
        text: `${selectedLombaIds.length} lomba akan dihapus`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e62020',
        cancelButtonColor: '#3f3f3f',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
      });

      if (result.isConfirmed) {
        loading = true;
        const { error } = await supabaseClient
          .from('lomba')
          .delete()
          .in('id', selectedLombaIds);

        if (error) throw error;

        // Update local data
        lomba = lomba.filter(item => !selectedLombaIds.includes(item.id));
        selectedLombaIds = [];
        selectAll = false;

        await Swal.fire({
          title: 'Berhasil!',
          text: 'Lomba berhasil dihapus',
          icon: 'success',
          confirmButtonColor: '#e62020'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Gagal menghapus lomba',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    } finally {
      loading = false;
    }
  }
</script>

<div class="space-y-6 px-6 py-10">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold text-white">List Lomba</h1>
    <div class="flex items-center gap-4">
      <!-- Delete Selected Button -->
      {#if selectedLombaIds.length > 0}
        <button
          on:click={handleMultiDelete}
          class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Hapus ({selectedLombaIds.length})
        </button>
      {/if}
      <!-- Add Lomba Button -->
      <button
        on:click={() => showModal = true}
        class="px-4 py-2 bg-[#e62020] text-white rounded-lg hover:bg-opacity-90 transition-colors"
      >
        Add Lomba
      </button>
      <!-- Date Filter -->
      <div class="w-48">
        <input
          type="date"
          bind:value={selectedDate}
          class="w-full bg-[#222] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
        />
      </div>
      <!-- Search -->
      <div class="w-64">
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Cari lomba..."
          class="w-full bg-[#222] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
        />
      </div>
    </div>
  </div>

  <!-- Reset Filters Button -->
  {#if searchQuery || selectedDate || selectedStatus !== 'Semua'}
    <div class="flex justify-end">
      <button
        on:click={() => {
          searchQuery = '';
          selectedDate = '';
          selectedStatus = 'Semua';
          currentPage = 1;
        }}
        class="text-sm text-gray-400 hover:text-white transition-colors"
      >
        Reset Filter
      </button>
    </div>
  {/if}

  <!-- Status Filter -->
  <div class="flex gap-2">
    {#each ['Semua', 'Buka', 'Tutup', 'Belum Dimulai', 'Result'] as status}
      <button
        class="px-4 py-2 rounded-lg text-sm font-medium transition-colors
          {selectedStatus === status ? 
            status === 'Buka' ? 'bg-green-500/20 text-green-500' :
            status === 'Tutup' ? 'bg-red-500/20 text-red-500' :
            status === 'Result' ? 'bg-blue-500/20 text-blue-500' :
            status === 'Belum Dimulai' ? 'bg-yellow-500/20 text-yellow-500' :
            'bg-[#e62020] text-white' :
            'bg-[#2a2a2a] text-gray-400 hover:text-white'}"
        on:click={() => {
          selectedStatus = status;
          currentPage = 1;
        }}
      >
        {status}
        <span class="ml-1">({lomba.filter(item => status === 'Semua' || calculateStatus(
          item.tanggal,
          markets.find(m => m.id === item.market_id)?.buka || '00:00:00',
          markets.find(m => m.id === item.market_id)?.tutup || '23:59:59',
          item.result
        ).status === status).length})</span>
      </button>
    {/each}
  </div>

  <div class="bg-[#222] rounded-xl border border-gray-800 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="bg-[#2a2a2a] text-gray-400 text-sm">
            <th class="px-4 py-3">
              <input
                type="checkbox"
                checked={selectAll}
                on:change={(e) => handleSelectAll((e.target as HTMLInputElement).checked)}
                class="form-checkbox text-[#e62020] rounded border-gray-600 bg-transparent focus:ring-[#e62020]"
              />
            </th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3">Pasaran</th>
            <th class="px-4 py-3">Tanggal</th>
            <th class="px-4 py-3">Total Hadiah</th>
            <th class="px-4 py-3">Result</th>
            <th class="px-4 py-3">Tipe Tebakan</th>
            <th class="px-4 py-3">Maksimal Pemenang</th>
            <th class="px-4 py-3">Jumlah Peserta</th>
            <th class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          {#if loading}
            {#each Array(5) as _}
              <tr class="animate-pulse">
                {#each Array(8) as _}
                  <td class="px-4 py-3">
                    <div class="h-4 bg-gray-800 rounded w-24"></div>
                  </td>
                {/each}
              </tr>
            {/each}
          {:else}
            {#each paginatedLomba as item}
              <tr class="text-gray-300 hover:bg-[#2a2a2a] transition-colors">
                <td class="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedLombaIds.includes(item.id)}
                    on:change={(e) => {
                      if ((e.target as HTMLInputElement).checked) {
                        selectedLombaIds = [...selectedLombaIds, item.id];
                      } else {
                        selectedLombaIds = selectedLombaIds.filter(id => id !== item.id);
                        selectAll = false;
                      }
                    }}
                    class="form-checkbox text-[#e62020] rounded border-gray-600 bg-transparent focus:ring-[#e62020]"
                  />
                </td>
                <td class="px-4 py-3">
                  <span class="px-2 py-1 rounded text-xs font-medium
                    {item.status === 'Buka' ? 'bg-green-500/20 text-green-500' :
                    item.status === 'Tutup' ? 'bg-red-500/20 text-red-500' :
                    item.status === 'Result' ? 'bg-blue-500/20 text-blue-500' :
                    'bg-yellow-500/20 text-yellow-500'}">
                    {item.status}
                  </span>
                </td>
                <td class="px-4 py-3">{item.markets?.name || '-'}</td>
                <td class="px-4 py-3">{formatDate(item.tanggal)}</td>
                <td class="px-4 py-3">{formatPrizePool(item.prize_pool)}</td>
                <td class="px-4 py-3">{item.result || '-'}</td>
                <td class="px-4 py-3">{item.guess_type || '-'}</td>
                <td class="px-4 py-3">{item.max_winner || '-'}</td>
                <td class="px-4 py-3">{item.jumlah_peserta}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center justify-end gap-2">
                    {#if item.status === 'Result'}
                      <button
                        class="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-[#2a2a2a] transition-colors"
                        on:click={() => openWinnerModal(item)}
                        title="View Winner"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                    {/if}
                    <button
                      class="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-[#2a2a2a] transition-colors"
                      on:click={() => openGuessModal(item)}
                      title="View Guess"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      class="p-1.5 rounded-lg text-gray-400 hover:text-green-500 hover:bg-[#2a2a2a] transition-colors"
                      on:click={() => openFakeGuessModal(item)}
                      title="Add Fake Guess"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    <button
                      class="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-colors"
                      on:click={() => handleEditClick(item)}
                      title="Edit"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      class="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-[#2a2a2a] transition-colors"
                      on:click={() => handleDelete(item.id)}
                      title="Delete"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>
  <!-- Pagination -->
  {#if totalPages > 1}
    <div class="px-4 py-3 border-t border-gray-800">
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-400">
          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredLomba.length)} of {filteredLomba.length} entries
        </div>
        <div class="flex gap-2">
          <!-- Previous Page -->
          <button
            on:click={() => currentPage = Math.max(1, currentPage - 1)}
            disabled={currentPage === 1}
            class="px-3 py-1 rounded-md text-sm {currentPage === 1 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:bg-[#2a2a2a]'} transition-colors"
          >
            Previous
          </button>
          
          <!-- Page Numbers -->
          {#each Array(totalPages) as _, i}
            <button
              on:click={() => currentPage = i + 1}
              class="px-3 py-1 rounded-md text-sm {currentPage === i + 1 ? 'bg-[#e62020] text-white' : 'text-gray-400 hover:bg-[#2a2a2a]'} transition-colors"
            >
              {i + 1}
            </button>
          {/each}
          
          <!-- Next Page -->
          <button
            on:click={() => currentPage = Math.min(totalPages, currentPage + 1)}
            disabled={currentPage === totalPages}
            class="px-3 py-1 rounded-md text-sm {currentPage === totalPages ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:bg-[#2a2a2a]'} transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Add Modal -->
  {#if showModal}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-[#222] rounded-xl w-full max-w-lg">
        <div class="p-6">
          <h2 class="text-xl font-bold text-white mb-4">Tambah Lomba</h2>
          <form on:submit|preventDefault={handleAddLomba} class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="market_id" class="block text-sm font-medium text-gray-400 mb-1">
                  Pasaran
                </label>
                <select
                  id="market_id"
                  bind:value={newLomba.market_id}
                  class="w-full bg-[#1a1a1a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
                  required
                >
                  <option value="">Pilih Pasaran</option>
                  {#each markets as market}
                    <option value={market.id}>
                      {market.name}
                    </option>
                  {/each}
                </select>
              </div>

              <div>
                <label for="tanggal" class="block text-sm font-medium text-gray-400 mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  id="tanggal"
                  bind:value={newLomba.tanggal}
                  class="w-full bg-[#1a1a1a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
                  required
                />
              </div>

              <div>
                <label for="prize_pool" class="block text-sm font-medium text-gray-400 mb-1">
                  Total Hadiah
                </label>
                <input
                  type="number"
                  id="prize_pool"
                  bind:value={newLomba.prize_pool}
                  placeholder="Contoh: 1000000"
                  class="w-full bg-[#1a1a1a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
                  required
                />
              </div>

              <div>
                <label for="result" class="block text-sm font-medium text-gray-400 mb-1">
                  Result
                </label>
                <input
                  type="text"
                  id="result"
                  bind:value={newLomba.result}
                  placeholder="Contoh: 1234"
                  class="w-full bg-[#1a1a1a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
                />
              </div>

              <div>
                <label for="guess_type" class="block text-sm font-medium text-gray-400 mb-1">
                  Tipe Tebakan
                </label>
                <select
                  id="guess_type"
                  bind:value={newLomba.guess_type}
                  class="w-full bg-[#1a1a1a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
                  required
                >
                  <option value="">Pilih Tipe</option>
                  <option value="2D">2D</option>
                  <option value="3D">3D</option>
                  <option value="4D">4D</option>
                </select>
              </div>

              <div>
                <label for="max_winner" class="block text-sm font-medium text-gray-400 mb-1">
                  Maksimal Pemenang
                </label>
                <input
                  type="number"
                  id="max_winner"
                  bind:value={newLomba.max_winner}
                  placeholder="Contoh: 3"
                  class="w-full bg-[#1a1a1a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
                  required
                />
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <button
                type="button"
                on:click={() => showModal = false}
                class="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-[#e62020] text-white rounded-lg hover:bg-opacity-90 transition-colors"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  {/if}

  <!-- Add Fake Guess Modal -->
  {#if showFakeGuessModal}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-[#222] rounded-xl w-full max-w-md">
        <div class="p-6">
          <h2 class="text-xl font-bold text-white mb-4">Generate Fake Guess</h2>
          <form on:submit|preventDefault={handleGenerateFakeGuess} class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">
                Lomba
              </label>
              <div class="text-white bg-[#1a1a1a] px-4 py-2 rounded-lg border border-gray-800">
                {selectedLomba?.markets?.name || '-'} ({selectedLomba?.guess_type})
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">
                Website
              </label>
              <div class="space-y-2 max-h-40 overflow-y-auto bg-[#1a1a1a] rounded-lg border border-gray-800 p-2">
                {#each websites as website}
                  {#if websiteFakeUsers[website.id] > 0}
                    <label class="flex items-center space-x-2 p-2 hover:bg-[#2a2a2a] rounded cursor-pointer">
                      <input
                        type="checkbox"
                        value={website.id}
                        bind:group={selectedWebsiteIds}
                        class="form-checkbox text-[#e62020] rounded border-gray-600 bg-transparent focus:ring-[#e62020]"
                      />
                      <span class="text-white">
                        {website.nama} ({websiteFakeUsers[website.id]})
                      </span>
                    </label>
                  {/if}
                {/each}
              </div>
              {#if selectedWebsiteIds.length > 0}
                <div class="mt-2 text-sm text-gray-400">
                  Website terpilih: {selectedWebsiteIds.length}
                </div>
              {/if}
            </div>

            <div>
              <label for="number_of_guesses" class="block text-sm font-medium text-gray-400 mb-1">
                Jumlah Tebakan
              </label>
              <div class="space-y-2">
                <input
                  type="number"
                  id="number_of_guesses"
                  bind:value={numberOfGuesses}
                  min="1"
                  class="w-full bg-[#1a1a1a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
                  required
                />
                {#if selectedWebsiteIds.length > 0}
                  <div class="text-sm">
                    <span class="text-gray-400">
                      Total fake users tersedia: 
                      <span class="text-white font-medium">
                        {selectedWebsiteIds.reduce((total, id) => total + (websiteFakeUsers[id] || 0), 0)}
                      </span>
                    </span>
                  </div>
                  <div class="text-sm">
                    <span class="text-gray-400">
                      Total tebakan yang akan dibuat: 
                      <span class="text-white font-medium">
                        {numberOfGuesses}
                      </span>
                    </span>
                  </div>
                {/if}
                {#if showWarning}
                  <div class="text-sm text-yellow-500">
                    ⚠️ {warningMessage}
                  </div>
                {/if}
              </div>
            </div>

            <!-- Tambahkan field Asumsi Result -->
            <div class="space-y-4">
              <div class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="use_asumsi_result"
                  bind:checked={useAsumsiResult}
                  class="form-checkbox text-[#e62020] rounded border-gray-600 bg-transparent focus:ring-[#e62020]"
                />
                <label for="use_asumsi_result" class="text-sm font-medium text-gray-400">
                  Gunakan Asumsi Result
                </label>
              </div>

              {#if useAsumsiResult}
                <div>
                  <label for="asumsi_result" class="block text-sm font-medium text-gray-400 mb-1">
                    Asumsi Result
                  </label>
                  <input
                    type="text"
                    id="asumsi_result"
                    bind:value={asumsiResult}
                    placeholder="Contoh: 4780"
                    pattern="[0-9]*"
                    class="w-full bg-[#1a1a1a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
                    required={useAsumsiResult}
                  />
                  <p class="mt-1 text-sm text-gray-400">
                    {#if selectedLomba?.guess_type === '2D'}
                      Untuk 2D, akan menggunakan 2 digit terakhir ({asumsiResult ? asumsiResult.slice(-2) : 'XX'})
                    {:else if selectedLomba?.guess_type === '3D'}
                      Untuk 3D, akan menggunakan 3 digit terakhir ({asumsiResult ? asumsiResult.slice(-3) : 'XXX'})
                    {:else if selectedLomba?.guess_type === '4D'}
                      Untuk 4D, akan menggunakan 4 digit ({asumsiResult ? asumsiResult.slice(-4) : 'XXXX'})
                    {/if}
                  </p>
                </div>
              {/if}
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <button
                type="button"
                on:click={() => {
                  showFakeGuessModal = false;
                  selectedLomba = null;
                  showWarning = false;
                }}
                class="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-[#e62020] text-white rounded-lg hover:bg-opacity-90 transition-colors"
                disabled={loading || showWarning}
              >
                {loading ? 'Loading...' : 'Generate'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  {/if}

  <!-- Edit Modal -->
  {#if showEditModal}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-[#222] rounded-xl w-full max-w-lg">
        <div class="p-6">
          <h2 class="text-xl font-bold text-white mb-4">Edit Lomba</h2>
          <form on:submit|preventDefault={handleEditLomba} class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="edit_market_id" class="block text-sm font-medium text-gray-400 mb-1">
                  Pasaran
                </label>
                <select
                  id="edit_market_id"
                  bind:value={editLomba.market_id}
                  class="w-full bg-[#1a1a1a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
                  required
                >
                  <option value="">Pilih Pasaran</option>
                  {#each markets as market}
                    <option value={market.id}>
                      {market.name}
                    </option>
                  {/each}
                </select>
              </div>

              <div>
                <label for="edit_tanggal" class="block text-sm font-medium text-gray-400 mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  id="edit_tanggal"
                  bind:value={editLomba.tanggal}
                  class="w-full bg-[#1a1a1a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
                  required
                />
              </div>

              <div>
                <label for="edit_prize_pool" class="block text-sm font-medium text-gray-400 mb-1">
                  Total Hadiah
                </label>
                <input
                  type="number"
                  id="edit_prize_pool"
                  bind:value={editLomba.prize_pool}
                  placeholder="Contoh: 1000000"
                  class="w-full bg-[#1a1a1a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
                  required
                />
              </div>

              <div>
                <label for="edit_result" class="block text-sm font-medium text-gray-400 mb-1">
                  Result
                </label>
                <input
                  type="text"
                  id="edit_result"
                  bind:value={editLomba.result}
                  placeholder="Contoh: 1234"
                  class="w-full bg-[#1a1a1a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
                />
              </div>

              <div>
                <label for="edit_guess_type" class="block text-sm font-medium text-gray-400 mb-1">
                  Tipe Tebakan
                </label>
                <select
                  id="edit_guess_type"
                  bind:value={editLomba.guess_type}
                  class="w-full bg-[#1a1a1a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
                  required
                >
                  <option value="">Pilih Tipe</option>
                  <option value="2D">2D</option>
                  <option value="3D">3D</option>
                  <option value="4D">4D</option>
                </select>
              </div>

              <div>
                <label for="edit_max_winner" class="block text-sm font-medium text-gray-400 mb-1">
                  Maksimal Pemenang
                </label>
                <input
                  type="number"
                  id="edit_max_winner"
                  bind:value={editLomba.max_winner}
                  placeholder="Contoh: 3"
                  class="w-full bg-[#1a1a1a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
                  required
                />
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <button
                type="button"
                on:click={() => showEditModal = false}
                class="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-[#e62020] text-white rounded-lg hover:bg-opacity-90 transition-colors"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  {/if}

  <!-- View Guess Modal -->
  {#if showGuessModal}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-[#222] rounded-xl w-full max-w-4xl">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-white">
              Daftar Tebakan - {selectedLomba?.markets?.name} ({selectedLomba?.guess_type})
            </h2>
            <button
              on:click={resetGuessFilters}
              class="text-gray-400 hover:text-white"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Filter Bar -->
          <div class="mb-4 flex gap-4">
            <!-- Search -->
            <div class="flex-1">
              <input
                type="text"
                bind:value={guessSearchQuery}
                placeholder="Cari berdasarkan User ID, Nomor Tebakan, atau Website..."
                class="w-full bg-[#1a1a1a] text-white px-4 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-[#e62020]"
              />
            </div>

            <!-- Status Filter -->
            <div class="flex gap-2">
              {#each ['Semua', 'Real', 'Fake'] as status}
                <button
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    {selectedGuessStatus === status ? 
                      status === 'Real' ? 'bg-green-500/20 text-green-500' :
                      status === 'Fake' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-[#e62020] text-white' :
                      'bg-[#2a2a2a] text-gray-400 hover:text-white'}"
                  on:click={() => {
                    selectedGuessStatus = status;
                    guessCurrentPage = 1;
                    updateFilteredGuesses();
                  }}
                >
                  {status}
                  <span class="ml-1">({selectedGuesses.filter(guess => 
                    status === 'Semua' ? true :
                    status === 'Real' ? !guess.isFake :
                    guess.isFake
                  ).length})</span>
                </button>
              {/each}
            </div>
          </div>

          <!-- Reset Filters Button -->
          {#if guessSearchQuery || selectedGuessStatus !== 'Semua'}
            <div class="flex justify-end mb-4">
              <button
                on:click={() => {
                  guessSearchQuery = '';
                  selectedGuessStatus = 'Semua';
                  guessCurrentPage = 1;
                  updateFilteredGuesses();
                }}
                class="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Reset Filter
              </button>
            </div>
          {/if}

          <div class="bg-[#1a1a1a] rounded-lg border border-gray-800 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead>
                  <tr class="bg-[#2a2a2a] text-gray-400 text-sm">
                    <th class="px-4 py-3">No</th>
                    <th class="px-4 py-3">Website</th>
                    <th class="px-4 py-3">User ID</th>
                    <th class="px-4 py-3">Status</th>
                    <th class="px-4 py-3">Nomor Tebakan</th>
                    <th class="px-4 py-3">Waktu Tebak</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-800">
                  {#if loadingGuesses}
                    {#each Array(5) as _}
                      <tr class="animate-pulse">
                        {#each Array(6) as _}
                          <td class="px-4 py-3">
                            <div class="h-4 bg-gray-800 rounded w-24"></div>
                          </td>
                        {/each}
                      </tr>
                    {/each}
                  {:else}
                    {#each paginatedGuesses as guess, i}
                      <tr class="text-gray-300 hover:bg-[#2a2a2a] transition-colors">
                        <td class="px-4 py-3">{(guessCurrentPage - 1) * guessItemsPerPage + i + 1}</td>
                        <td class="px-4 py-3">{guess.websites?.nama || '-'}</td>
                        <td class="px-4 py-3">{guess.userid_website}</td>
                        <td class="px-4 py-3">
                          <span class="px-2 py-1 rounded text-xs font-medium
                            {guess.isFake ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}">
                            {guess.isFake ? 'Fake' : 'Real'}
                          </span>
                        </td>
                        <td class="px-4 py-3">{guess.number}</td>
                        <td class="px-4 py-3">
                          {new Date(guess.created_at).toLocaleString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </td>
                      </tr>
                    {/each}
                  {/if}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Pagination -->
          {#if guessTotalPages > 1}
            <div class="mt-4 flex items-center justify-between">
              <div class="text-sm text-gray-400">
                Menampilkan {(guessCurrentPage - 1) * guessItemsPerPage + 1} sampai {Math.min(guessCurrentPage * guessItemsPerPage, filteredGuesses.length)} dari {filteredGuesses.length} data
              </div>
              <div class="flex gap-2">
                <button
                  on:click={() => guessCurrentPage = Math.max(1, guessCurrentPage - 1)}
                  disabled={guessCurrentPage === 1}
                  class="px-3 py-1 rounded-md text-sm {guessCurrentPage === 1 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:bg-[#2a2a2a]'} transition-colors"
                >
                  Sebelumnya
                </button>
                
                {#each Array(guessTotalPages) as _, i}
                  <button
                    on:click={() => guessCurrentPage = i + 1}
                    class="px-3 py-1 rounded-md text-sm {guessCurrentPage === i + 1 ? 'bg-[#e62020] text-white' : 'text-gray-400 hover:bg-[#2a2a2a]'} transition-colors"
                  >
                    {i + 1}
                  </button>
                {/each}
                
                <button
                  on:click={() => guessCurrentPage = Math.min(guessTotalPages, guessCurrentPage + 1)}
                  disabled={guessCurrentPage === guessTotalPages}
                  class="px-3 py-1 rounded-md text-sm {guessCurrentPage === guessTotalPages ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:bg-[#2a2a2a]'} transition-colors"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  <!-- Tambahkan Winner Modal -->
  {#if showWinnerModal}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-[#222] rounded-xl w-full max-w-5xl">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-white">
              Daftar Pemenang - {selectedLomba?.markets?.name} ({selectedLomba?.guess_type})
            </h2>
            <button
              on:click={() => {
                showWinnerModal = false;
                selectedLomba = null;
                selectedWinners = [];
              }}
              class="text-gray-400 hover:text-white"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="bg-[#1a1a1a] rounded-lg border border-gray-800 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead>
                  <tr class="bg-[#2a2a2a] text-gray-400 text-sm">
                    <th class="px-4 py-3">Peringkat</th>
                    <th class="px-4 py-3">Website</th>
                    <th class="px-4 py-3">User ID</th>
                    <th class="px-4 py-3">Status</th>
                    <th class="px-4 py-3">Nomor Tebakan</th>
                    <th class="px-4 py-3">Angka Cocok</th>
                    <th class="px-4 py-3">Waktu Tebak</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-800">
                  {#if loadingWinners}
                    {#each Array(3) as _}
                      <tr class="animate-pulse">
                        {#each Array(7) as _}
                          <td class="px-4 py-3">
                            <div class="h-4 bg-gray-800 rounded w-24"></div>
                          </td>
                        {/each}
                      </tr>
                    {/each}
                  {:else if selectedWinners.length === 0}
                    <tr>
                      <td colspan="7" class="px-4 py-8 text-center text-gray-400">
                        Tidak ada pemenang yang ditemukan
                      </td>
                    </tr>
                  {:else}
                    {#each selectedWinners as winner, i}
                      <tr class="text-gray-300 hover:bg-[#2a2a2a] transition-colors">
                        <td class="px-4 py-3">
                          <span class="px-2 py-1 rounded text-xs font-medium
                            {i === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                             i === 1 ? 'bg-gray-400/20 text-gray-400' :
                             i === 2 ? 'bg-orange-500/20 text-orange-500' :
                             'bg-blue-500/20 text-blue-500'}">
                            Juara {i + 1}
                          </span>
                        </td>
                        <td class="px-4 py-3">{winner.websites?.nama || '-'}</td>
                        <td class="px-4 py-3">{winner.userid_website}</td>
                        <td class="px-4 py-3">
                          <span class="px-2 py-1 rounded text-xs font-medium
                            {winner.isFake ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}">
                            {winner.isFake ? 'Fake' : 'Real'}
                          </span>
                        </td>
                        <td class="px-4 py-3">{winner.number}</td>
                        <td class="px-4 py-3">{winner.matchingPart}</td>
                        <td class="px-4 py-3">
                          {new Date(winner.created_at).toLocaleString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            timeZone: 'UTC'
                          })}
                        </td>
                      </tr>
                    {/each}
                  {/if}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>