<!-- @format -->
<script>
  import { user } from "$lib/stores/authStore";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import AppSidebar from "$lib/components/AppSidebar.svelte";
  import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
  import "../app.css";

  let isCollapsed = false;

  onMount(() => {
    if (browser && !$user && !$page.url.pathname.startsWith("/login")) {
      goto("/login");
    }
  });

  $: if (browser && !$user && !$page.url.pathname.startsWith("/login")) {
    goto("/login");
  }
</script>

{#if !browser || $user || $page.url.pathname.startsWith("/login")}
  {#if $page.url.pathname.startsWith("/login")}
    <slot />
  {:else}
    <div class="flex min-h-screen bg-gray-50">
      <div class="transition-all duration-300 {isCollapsed ? 'collapsed' : ''}">
        <AppSidebar />
      </div>
      <div class="flex-1">
        <header class="flex h-14 items-center border-b bg-white px-4">
          <Breadcrumbs />
          <button
            class="ml-auto rounded-full p-2 text-gray-500 hover:bg-gray-100"
            on:click={() => (isCollapsed = !isCollapsed)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              {#if isCollapsed}
                <path d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              {:else}
                <path d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
              {/if}
            </svg>
          </button>
        </header>
        <main class="p-4">
          <slot />
        </main>
      </div>
    </div>
  {/if}
{/if}

<style>
  :global(body) {
    @apply antialiased text-gray-900;
  }

  :global(*) {
    @apply border-gray-200;
  }

  :global(input, textarea, select) {
    @apply bg-white;
  }

  :global(button, input, textarea, select) {
    @apply focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2;
  }

  :global(.btn) {
    @apply px-4 py-2 rounded-lg transition-all duration-200;
  }

  :global(.btn-primary) {
    @apply bg-black text-white hover:bg-gray-800;
  }

  :global(.btn-secondary) {
    @apply border border-gray-200 bg-white text-gray-900 hover:bg-gray-50;
  }

  :global(.card) {
    @apply bg-white rounded-lg border shadow-sm;
  }

  :global(.input) {
    @apply w-full px-4 py-2 rounded-lg border focus:border-black;
  }
</style>
