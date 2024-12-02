<!-- @format -->
<script>
  import { page } from "$app/stores";
  import { ChevronRight } from "lucide-svelte";

  $: pathSegments = $page.url.pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => ({
      name: segment.charAt(0).toUpperCase() + segment.slice(1),
      href: "/" + segment,
    }));
</script>
<div class="flex items-center gap-2 text-sm text-gray-500">
  <a href="/" class="hover:text-gray-900">Home</a>
  {#each pathSegments as segment}
    <ChevronRight class="h-4 w-4" />
    <a href={segment.href} class="hover:text-gray-900">
      {segment.name}
    </a>
  {/each}
</div>
