<script>
  export let variant = 'default';
  export let text;
  export let className = '';
  
  const variants = {
    default: 'bg-gray-800 hover:bg-gray-700',
    success: 'bg-[#4CAF50] hover:bg-green-600',
    primary: 'bg-[#e62020] hover:bg-red-700'
  };

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

<button 
  class="w-full text-white py-2.5 px-4 rounded-lg transition-all duration-300 {variants[variant]} {className}"
  on:click={() => dispatch('click')}
>
  {text}
</button> 