<script lang="ts">
  import { page } from '$app/stores';
  import { goto, invalidateAll, afterNavigate } from '$app/navigation';
  import { onMount } from 'svelte';
  import { supabaseClient } from '$lib/supabaseClient';
  import Swal from 'sweetalert2';

  let isSidebarOpen = true;
  let isAuthenticated = false;
  let userData = null;
  let userLevel = '';
  let userAccess = [];
  let loading = true;
  
  // Cek auth setiap kali navigasi
  afterNavigate(async () => {
    await checkAuth();
  });

  // Fungsi untuk cek auth
  async function checkAuth() {
    if ($page.url.pathname === '/cups/login') {
      loading = false;
      return;
    }

    try {
      // Ambil data admin dari cookie
      const adminCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('admin_data='));

      if (!adminCookie) {
        throw new Error('Not authenticated');
      }

      const adminData = JSON.parse(adminCookie.split('=')[1]);
      userLevel = adminData.level;

      // Ambil akses dari tabel privilage berdasarkan level
      const { data: privilageData, error: privilageError } = await supabaseClient
        .from('privilage')
        .select('akses')
        .eq('level', userLevel)
        .single();

      if (privilageError) throw privilageError;
      
      // Cek akses untuk current path
      const currentPath = $page.url.pathname;
      const requiredAccess = getRequiredAccessForPath(currentPath);
      
      if (requiredAccess && (!privilageData?.akses || !privilageData.akses.includes(requiredAccess))) {
        await Swal.fire({
          title: 'Akses Ditolak!',
          text: 'Anda tidak memiliki akses ke halaman ini',
          icon: 'error',
          confirmButtonColor: '#e62020'
        });
        goto('/cups');
        return;
      }

      if (privilageData) {
        userAccess = privilageData.akses;
      }

      isAuthenticated = true;
      userData = adminData;
    } catch (error) {
      console.error('Auth error:', error);
      goto('/cups/login');
    } finally {
      loading = false;
    }
  }

  // Helper function untuk mendapatkan required access berdasarkan path
  function getRequiredAccessForPath(path: string) {
    const pathAccessMap = {
      '/cups/users': 'list users',
      '/cups/lomba': 'list lomba',
      '/cups/markets': 'pasaran lomba',
      '/cups/websites': 'websites',
      '/cups/slides': 'slides',
      '/cups/contacts': 'contacts',
      '/cups/social-media': 'media social',
      '/cups/whitelist': 'white list ip',
      '/cups/user-agent': 'user agent',
      '/cups/privilage': 'privilage'
    };
    return pathAccessMap[path];
  }

  async function handleLogout() {
    try {
      // Hapus cookie admin_data
      document.cookie = 'admin_data=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      
      // Hapus semua cookie yang berkaitan dengan auth
      const cookies = document.cookie.split(';');
      cookies.forEach(cookie => {
        const [name] = cookie.trim().split('=');
        // Hapus cookie admin
        if (name === 'admin_data') {
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
        }
        // Hapus cookie supabase auth
        if (name.includes('-auth-token')) {
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
        }
      });

      await Swal.fire({
        title: 'Berhasil!',
        text: 'Anda telah berhasil logout',
        icon: 'success',
        confirmButtonColor: '#e62020'
      });

      goto('/cups/login');
    } catch (error) {
      console.error('Error logging out:', error);
      await Swal.fire({
        title: 'Error!',
        text: 'Gagal logout',
        icon: 'error',
        confirmButtonColor: '#e62020'
      });
    }
  }

  const menus = [
    {
      group: 'Main',
      items: [
        {
          name: 'Dashboard',
          path: '/cups',
          icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
          access: [] // Empty array means no specific access required
        }
      ]
    },
    {
      group: 'Master Lomba',
      items: [
        {
          name: 'Users Lomba',
          path: '/cups/users',
          icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
          access: ['list users']
        },
        {
          name: 'List Lomba',
          path: '/cups/lomba',
          icon: 'M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0',
          access: ['list lomba']
        }
      ]
    },
    {
      group: 'Settings',
      items: [
        {
          name: 'Websites',
          path: '/cups/websites',
          icon: 'M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418',
          access: ['websites']
        },
        {
          name: 'Markets',
          path: '/cups/markets',
          icon: 'M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605',
          access: ['pasaran lomba']
        },
        {
          name: 'Slides',
          path: '/cups/slides',
          icon: 'M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6',
          access: ['slides']
        },
        {
          name: 'Contacts',
          path: '/cups/contacts',
          icon: 'M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z',
          access: ['contacts']
        },
        {
          name: 'Social Media',
          path: '/cups/social-media',
          icon: 'M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244',
          access: ['media social']
        },
        {
          name: 'White List IP',
          path: '/cups/whitelist',
          icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
          access: ['white list ip']
        },
        {
          name: 'User Agent',
          path: '/cups/user-agent',
          icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
          access: ['user agent']
        },
        {
          name: 'Privilage',
          path: '/cups/privilage',
          icon: 'M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33',
          access: ['privilage']
        }
      ]
    }
  ];

  // Filter menu items based on user access
  $: filteredMenuGroups = menus.map(group => ({
    ...group,
    items: group.items.filter(item => 
      // Show if no access required or user has required access
      item.access.length === 0 || 
      item.access.some(access => userAccess.includes(access))
    )
  })).filter(group => group.items.length > 0);
</script>

{#if $page.url.pathname === '/cups/login' || isAuthenticated}
<div class="flex h-screen bg-[#1a1a1a]">
  <!-- Sidebar -->
  {#if $page.url.pathname !== '/cups/login'}
    <aside class="fixed top-0 left-0 h-full bg-[#222] border-r border-gray-800 transition-all duration-300 z-20" class:w-64={isSidebarOpen} class:w-16={!isSidebarOpen}>
      <div class="h-full px-3 py-4 overflow-y-auto flex flex-col">
        <div class="mb-8 pl-2">
          <div class="flex items-center gap-3 mb-3 {!isSidebarOpen ? 'justify-center' : ''}">
            <img src="/favicon.svg" alt="Logo" class="{!isSidebarOpen ? 'w-10 h-10' : 'w-8 h-8'}" />
            {#if isSidebarOpen}
              <h1 class="text-2xl font-bold text-white">TEBAK ANGKA</h1>
            {/if}
          </div>
          {#if isSidebarOpen}
            <p class="text-sm text-gray-400">Dashboard Admin</p>
          {/if}
        </div>
        
        <nav class="space-y-4 flex-1">
          {#each filteredMenuGroups as group}
            <div>
              <div class="px-2 mb-4">
                {#if isSidebarOpen}
                  <span class="text-xs font-semibold uppercase tracking-wider text-gray-500">{group.group}</span>
                {/if}
              </div>
              
              <ul class="space-y-1">
                {#each group.items as item}
                  <li>
                    <a 
                      href={item.path}
                      class="flex items-center px-2 py-2 rounded-lg hover:bg-[#2a2a2a] transition-all duration-200 {$page.url.pathname === item.path ? 'bg-[#e62020] bg-opacity-10 text-[#e62020]' : 'text-gray-400 hover:text-white'} {!isSidebarOpen ? 'justify-center' : ''}"
                    >
                      <svg class="{!isSidebarOpen ? 'w-7 h-7' : 'w-5 h-5'}" fill="currentColor" viewBox="0 0 24 24">
                        <path d={item.icon} />
                      </svg>
                      {#if isSidebarOpen}
                        <span class="ml-3 font-medium">{item.name}</span>
                      {/if}
                    </a>
                  </li>
                {/each}
              </ul>
            </div>
          {/each}
        </nav>

        <!-- Logout & User Info -->
        {#if isSidebarOpen}
          <div class="pt-4 mt-8 border-t border-gray-800">
            <div class="px-2 mb-3">
              <p class="text-sm font-medium text-white">{userData?.username}</p>
              <p class="text-xs text-gray-400">{userLevel}</p>
            </div>
          </div>
        {/if}
        <button
          on:click={handleLogout}
          class="flex items-center px-2 py-2 rounded-lg text-gray-400 hover:bg-[#2a2a2a] hover:text-white transition-colors {!isSidebarOpen ? 'justify-center' : ''}"
        >
          <svg class="{!isSidebarOpen ? 'w-7 h-7' : 'w-5 h-5'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {#if isSidebarOpen}
            <span class="ml-3 font-medium">Logout</span>
          {/if}
        </button>
      </div>
    </aside>
  {/if}

  <!-- Content -->
  <div class="flex-1" style="margin-left: {$page.url.pathname === '/cups/login' ? '0' : (isSidebarOpen ? '16rem' : '4rem')}">
    <!-- Header -->
    {#if $page.url.pathname !== '/cups/login'}
      <header class="fixed top-0 right-0 bg-[#222] border-b border-gray-800 px-4 py-2.5 z-10" style="left: {isSidebarOpen ? '16rem' : '4rem'}">
        <div class="flex items-center justify-between">
          <button 
            on:click={() => isSidebarOpen = !isSidebarOpen}
            class="p-2 rounded-lg text-gray-400 hover:bg-[#2a2a2a] transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <!-- Breadcrumb -->
          <nav class="flex items-center space-x-2 text-sm">
            <a href="/cups" class="text-gray-400 hover:text-white transition-colors">Dashboard</a>
            {#if $page.url.pathname !== '/cups'}
              <span class="text-gray-600">/</span>
              {#if $page.url.pathname === '/cups/users'}
                <span class="text-white">Users Lomba</span>
              {:else if $page.url.pathname === '/cups/lomba'}
                <span class="text-white">List Lomba</span>
              {:else if $page.url.pathname === '/cups/markets'}
                <span class="text-white">Pasaran Lomba</span>
              {:else if $page.url.pathname === '/cups/websites'}
                <span class="text-white">Websites</span>
              {:else if $page.url.pathname === '/cups/slides'}
                <span class="text-white">Slides</span>
              {:else if $page.url.pathname === '/cups/contacts'}
                <span class="text-white">Contacts</span>
              {:else if $page.url.pathname === '/cups/social-media'}
                <span class="text-white">Media Social</span>
              {:else if $page.url.pathname === '/cups/whitelist'}
                <span class="text-white">White List IP</span>
              {:else if $page.url.pathname === '/cups/user-agent'}
                <span class="text-white">User Agent</span>
              {:else if $page.url.pathname === '/cups/privilage'}
                <span class="text-white">Privilage</span>
              {/if}
            {/if}
          </nav>
        </div>
      </header>
    {/if}

    <!-- Main Content -->
    <main class="{$page.url.pathname !== '/cups/login' && 'mt-[53px]'}">
      <slot />
    </main>
  </div>
</div>
{/if} 