<script lang="ts">
  import { onMount } from 'svelte';
  let registration: ServiceWorkerRegistration | undefined;
  let offlineReady = false;
  let needRefresh = false;

  $: toast = offlineReady || needRefresh;

  function close() {
    offlineReady = false;
    needRefresh = false;
  }

  function handleRefresh() {
    if (!registration?.waiting) return;
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    needRefresh = false;
    window.location.reload();
  }

  onMount(() => {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      // Tunggu sampai halaman dimuat
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js', { 
            type: 'module',
            scope: '/'
          })
          .then(
            (reg) => {
              registration = reg;
              reg.addEventListener('updatefound', () => {
                needRefresh = true;
              });
              
              // Cek jika ada service worker yang menunggu
              if (reg.waiting) {
                needRefresh = true;
              }
            },
            (err) => {
              console.error('ServiceWorker registration failed:', err);
            }
          );

        navigator.serviceWorker.ready.then(() => {
          offlineReady = true;
        });
      });
    }
  });
</script>

{#if toast}
  <div class="fixed bottom-4 right-4 z-50 bg-[#222] rounded-lg shadow-lg border border-gray-800 p-4">
    <div class="flex items-center gap-4">
      {#if offlineReady}
        <p class="text-sm text-gray-300">
          App siap digunakan offline
        </p>
      {/if}
      {#if needRefresh}
        <p class="text-sm text-gray-300">
          Versi baru tersedia
        </p>
        <button
          class="px-4 py-2 bg-[#e62020] text-white rounded-lg text-sm hover:bg-[#ff0000] transition-colors"
          on:click={handleRefresh}
        >
          Perbarui
        </button>
      {/if}
      <button
        class="text-gray-400 hover:text-white"
        on:click={close}
      >
        <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
{/if} 