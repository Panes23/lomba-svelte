<script>
  export let size = 8; // Default size in Tailwind units (h-8 w-8)
  export let color = '[#e62020]'; // Default color
</script>

<div class="flex justify-center items-center py-12">
  <div 
    class="animate-spin rounded-full border-t-2 {`h-${size} w-${size}`}" 
    style="border-color: {color}"
  ></div>
</div> 