<!-- @format -->
<script>
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { Frame, PieChart, Map } from "lucide-svelte";

  export let isCollapsed = false;

  const projects = [];

  function handleNavigation(href) {
    goto(href);
  }
</script>

<div class="px-2 py-2">
  {#if !isCollapsed}
    <div class="px-2 py-2 text-xs font-medium text-gray-500">Agents</div>
  {/if}
  <nav class="grid gap-1">
    {#each projects as project}
      <button
        class="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100
          {$page.url.pathname === project.href ? 'bg-gray-100' : ''}"
        on:click={() => handleNavigation(project.href)}
      >
        <svelte:component this={project.icon} class="h-4 w-4" />
        {#if !isCollapsed}
          <span>{project.name}</span>
        {/if}
      </button>
    {/each}
  </nav>
</div>
