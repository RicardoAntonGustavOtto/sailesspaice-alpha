<!-- @format -->
<script>
  import { page } from "$app/stores";
  import { supabase } from "$lib/supabase";
  import { ownCompany } from "$lib/stores/ownCompany";
  import { fade } from "svelte/transition";
  import { ChevronsUpDown } from "lucide-svelte";
  import { onMount } from "svelte";

  let masterData = null;
  let loading = true;
  let error = null;
  let isOpen = false;
  let companyName = "Loading...";

  async function loadData() {
    try {
      // Load company name
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.id) throw new Error("No user logged in");

      const { data: companyData, error: companyError } = await supabase
        .from("owncompany")
        .select("name, description")
        .eq("user_id", user.id)
        .single();

      if (companyError) throw companyError;

      companyName = companyData?.name || "Your Company";

      // Update the ownCompany store
      ownCompany.set({
        name: companyData.name,
        info: companyData.description || "",
      });
    } catch (err) {
      console.error("Error loading data:", err);
      error = err instanceof Error ? err.message : "Failed to load data";
      companyName = "Your Company";
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadData();
  });

  function toggleDropdown() {
    isOpen = !isOpen;
  }

  function handleClickOutside(event) {
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (!target.closest(".team-switcher")) {
      isOpen = false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="relative team-switcher">
  <button
    on:click={toggleDropdown}
    class="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50 transition-all duration-200"
  >
    <div class="font-medium">{companyName}</div>
    <ChevronsUpDown class="h-4 w-4 opacity-50" />
  </button>

  {#if isOpen}
    <div
      class="absolute left-0 top-full mt-1 w-56 rounded-lg bg-white shadow-lg border border-gray-200 p-1"
    >
      {#if error}
        <p class="text-red-600 p-2 text-sm">{error}</p>
      {:else}
        <div class="p-2">
          <div class="font-medium">{companyName}</div>
          <div class="text-xs text-gray-500">Currently viewing</div>
        </div>
      {/if}
    </div>
  {/if}
</div>
