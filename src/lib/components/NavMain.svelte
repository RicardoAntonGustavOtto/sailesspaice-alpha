<!-- @format -->
<script>
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import {
    Home,
    Settings,
    Users,
    Building,
    // ... other icons
  } from "lucide-svelte";
  import { supabase } from "$lib/supabase";
  import { user } from "$lib/stores/authStore";

  export let isCollapsed = false;

  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/" },
    { icon: Building, label: "Target Company", href: "/target-company" },
    { icon: Settings, label: "Masterdata", href: "/masterdata" },
    // ... other menu items
  ];

  function handleNavigation(href) {
    goto(href);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    goto("/login");
  }
</script>

<nav class="grid gap-1 px-2 py-2">
  {#each menuItems as item}
    <button
      class="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100
        {$page.url.pathname === item.href ? 'bg-gray-100' : ''}"
      on:click={() => handleNavigation(item.href)}
    >
      <svelte:component this={item.icon} class="h-4 w-4" />
      {#if !isCollapsed}
        <span>{item.label}</span>
      {/if}
    </button>
  {/each}
  {#if $user}
    <button
      on:click={handleLogout}
      class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
    >
      Sign out
    </button>
  {/if}
</nav>
