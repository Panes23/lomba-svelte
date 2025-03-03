<script lang="ts">
  import { onMount } from 'svelte';
  import { Chart } from 'chart.js/auto';
  import { goto } from '$app/navigation';
  
  export let data;
  
  $: ({ totalUsers, activeUsers, bannedUsers, onlineUsers, chartData, currentPeriod } = data);
  
  let chart: Chart;
  let chartCanvas: HTMLCanvasElement;
  
  // Fungsi untuk mengubah periode
  function changePeriod(period: string) {
    goto(`?period=${period}`, { keepFocus: true });
  }
  
  onMount(() => {
    // Inisialisasi chart
    chart = new Chart(chartCanvas, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'User Online',
          data: chartData.values,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#1f2937',
            titleColor: '#9ca3af',
            bodyColor: '#fff',
            borderColor: '#374151',
            borderWidth: 1,
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'normal'
            },
            bodyFont: {
              size: 14
            },
            callbacks: {
              title: function(context) {
                return context[0].label;
              },
              label: function(context) {
                return `${context.parsed.y} user online`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#9ca3af'
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: '#374151'
            },
            ticks: {
              color: '#9ca3af',
              stepSize: 1
            }
          }
        }
      }
    });
    
    return () => {
      chart.destroy();
    };
  });
</script>

<div class="p-6">
  <h1 class="text-2xl font-bold text-white mb-8">Dashboard</h1>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <!-- Total Users Card -->
    <div class="bg-[#222] rounded-xl border border-gray-800 p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-400">Total Users</p>
          <p class="text-3xl font-bold text-white mt-2">{totalUsers}</p>
        </div>
        <div class="w-12 h-12 bg-[#e62020] bg-opacity-10 rounded-lg flex items-center justify-center">
          <svg class="w-6 h-6 text-[#e62020]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Active Users Card -->
    <div class="bg-[#222] rounded-xl border border-gray-800 p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-400">Active</p>
          <p class="text-3xl font-bold text-green-500 mt-2">{activeUsers}</p>
        </div>
        <div class="w-12 h-12 bg-green-500 bg-opacity-10 rounded-lg flex items-center justify-center">
          <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Banned Users Card -->
    <div class="bg-[#222] rounded-xl border border-gray-800 p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-400">Banned</p>
          <p class="text-3xl font-bold text-red-500 mt-2">{bannedUsers}</p>
        </div>
        <div class="w-12 h-12 bg-red-500 bg-opacity-10 rounded-lg flex items-center justify-center">
          <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Online Users Card -->
    <div class="bg-[#222] rounded-xl border border-gray-800 p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-400">Online Today</p>
          <p class="text-3xl font-bold text-blue-500 mt-2">{onlineUsers}</p>
        </div>
        <div class="w-12 h-12 bg-blue-500 bg-opacity-10 rounded-lg flex items-center justify-center">
          <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        </div>
      </div>
    </div>
  </div>

  <!-- Chart Section -->
  <div class="mt-8 bg-[#222] rounded-xl border border-gray-800 p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-white">Statistik User Online</h2>
      
      <div class="flex gap-2">
        <button
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {currentPeriod === 'daily' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}"
          on:click={() => changePeriod('daily')}
        >
          Harian
        </button>
        <button
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {currentPeriod === 'monthly' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}"
          on:click={() => changePeriod('monthly')}
        >
          Bulanan
        </button>
        <button
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {currentPeriod === 'yearly' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}"
          on:click={() => changePeriod('yearly')}
        >
          Tahunan
        </button>
      </div>
    </div>
    
    <div class="h-[400px]">
      <canvas bind:this={chartCanvas}></canvas>
    </div>
  </div>
</div>

<style>
  :global(body) {
    background-color: #1a1a1a;
  }
</style> 