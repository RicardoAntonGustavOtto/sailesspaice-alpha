<!-- @format -->
<script>
  import { fade } from "svelte/transition";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";

  // Data stores
  let companies = [];
  let recentActivities = [];
  let loading = true;

  function getCookie(name) {
    try {
      if (typeof document === "undefined") return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(";").shift();
        return cookieValue ? JSON.parse(cookieValue) : null;
      }
    } catch {
      return null;
    }
    return null;
  }

  onMount(() => {
    // Load data from cookies
    const storedCompanies = getCookie("targetCompanies") || [];
    companies = Array.isArray(storedCompanies) ? storedCompanies : [];
    loading = false;
  });

  // Computed statistics
  $: totalCompanies = companies.length;
  $: totalProspects = companies.reduce(
    (sum, company) => sum + (company.prospects?.length || 0),
    0
  );
  $: totalResearch = companies.reduce(
    (sum, company) => sum + (company.prospectResearch?.length || 0),
    0
  );
  $: companiesNeedingResearch = companies.filter(
    (company) => !company.prospectResearch?.length
  ).length;
  $: companiesWithoutProspects = companies.filter(
    (company) => !company.prospects?.length
  ).length;

  // Quick action handlers
  function goToAddCompany() {
    window.location.href = "/target-company";
  }

  function goToCompany(company) {
    window.location.href = `/target-company/${encodeURIComponent(
      company.name.toLowerCase()
    )}`;
  }
</script>

<div class="max-w-7xl mx-auto p-6 space-y-6">
  <h1 class="text-2xl font-bold mb-8">Dashboard</h1>

  <!-- Overview Cards -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 class="text-sm font-medium text-gray-500">Total Companies</h3>
      <p class="text-2xl font-semibold mt-2">{totalCompanies}</p>
    </div>
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 class="text-sm font-medium text-gray-500">Total Prospects</h3>
      <p class="text-2xl font-semibold mt-2">{totalProspects}</p>
    </div>
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 class="text-sm font-medium text-gray-500">Research Documents</h3>
      <p class="text-2xl font-semibold mt-2">{totalResearch}</p>
    </div>
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 class="text-sm font-medium text-gray-500">Completion Rate</h3>
      <p class="text-2xl font-semibold mt-2">
        {totalCompanies
          ? Math.round(
              ((totalCompanies - companiesNeedingResearch) / totalCompanies) *
                100
            )
          : 0}%
      </p>
    </div>
  </div>

  <!-- Quick Actions -->
  <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <h2 class="text-lg font-semibold mb-4">Quick Actions</h2>
    <div class="flex flex-wrap gap-3">
      <button
        on:click={goToAddCompany}
        class="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200"
      >
        Add Company
      </button>
    </div>
  </div>

  <!-- Status Overview -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Companies Needing Attention -->
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 class="text-lg font-semibold mb-4">Needs Attention</h2>
      <div class="space-y-4">
        {#if companiesNeedingResearch > 0}
          <button
            on:click={() => {
              const company = companies.find(
                (c) => !c.prospectResearch?.length
              );
              if (company) goToCompany(company);
            }}
            class="w-full flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-all duration-200"
          >
            <div>
              <p class="font-medium text-orange-800">Missing Research</p>
              <p class="text-sm text-orange-600">
                {companiesNeedingResearch}
                {companiesNeedingResearch === 1 ? "company" : "companies"} need research
              </p>
            </div>
            <span class="text-orange-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
          </button>
        {/if}
        {#if companiesWithoutProspects > 0}
          <button
            on:click={() => {
              const company = companies.find((c) => !c.prospects?.length);
              if (company) {
                window.location.href = `/target-company/${encodeURIComponent(
                  company.name.toLowerCase()
                )}?tab=prospects`;
              }
            }}
            class="w-full flex items-center justify-between p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-all duration-200"
          >
            <div>
              <p class="font-medium text-yellow-800">No Prospects</p>
              <p class="text-sm text-yellow-600">
                {companiesWithoutProspects}
                {companiesWithoutProspects === 1 ? "company" : "companies"} without
                prospects
              </p>
            </div>
            <span class="text-yellow-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
          </button>
        {/if}
      </div>
    </div>

    <!-- Recent Companies -->
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 class="text-lg font-semibold mb-4">Recent Companies</h2>
      <div class="space-y-3">
        {#if companies.length > 0}
          {#each companies.slice(0, 5) as company}
            <button
              on:click={() => goToCompany(company)}
              class="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 border border-gray-100"
            >
              <div class="flex items-center gap-3">
                <div>
                  <p class="font-medium text-gray-900">{company.name}</p>
                  <p class="text-sm text-gray-500">{company.website}</p>
                </div>
              </div>
              <div class="flex gap-2">
                {#if company.prospectResearch?.length}
                  <span
                    class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded"
                  >
                    Research Done
                  </span>
                {/if}
                {#if company.prospects?.length}
                  <span
                    class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                  >
                    {company.prospects.length} Prospects
                  </span>
                {/if}
              </div>
            </button>
          {/each}
        {:else}
          <p class="text-gray-500 text-center py-4">No companies added yet</p>
        {/if}
      </div>
    </div>
  </div>
</div>
