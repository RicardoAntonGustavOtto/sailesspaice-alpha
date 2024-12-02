<!-- @format -->
<script>
  import { PanelLeftClose, PanelLeft } from "lucide-svelte";

  import TeamSwitcher from "./TeamSwitcher.svelte";
  import NavMain from "./NavMain.svelte";
  import NavProjects from "./NavProjects.svelte";
  import NavUser from "./NavUser.svelte";

  let isCollapsed = false;

  function toggleSidebar() {
    isCollapsed = !isCollapsed;
  }
</script>

<div
  class="fixed inset-y-0 z-20 flex flex-col border-r bg-white {isCollapsed
    ? 'w-16'
    : 'w-64'} transition-all duration-300"
>
  <div class="flex h-14 items-center border-b px-3 justify-between">
    {#if !isCollapsed}
      <TeamSwitcher />
    {/if}
    <button
      class="p-2 hover:bg-gray-100 rounded-lg ml-auto"
      on:click={toggleSidebar}
    >
      {#if isCollapsed}
        <PanelLeft class="h-4 w-4" />
      {:else}
        <PanelLeftClose class="h-4 w-4" />
      {/if}
    </button>
  </div>

  <div class="flex-1 overflow-y-auto">
    <NavMain {isCollapsed} />
    <NavProjects {isCollapsed} />
  </div>
  <NavUser {isCollapsed} />
</div>

<!-- Spacer div to prevent content from going under the fixed sidebar -->
<div class={isCollapsed ? "w-16" : "w-64"} />
