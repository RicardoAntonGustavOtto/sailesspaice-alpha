<!-- @format -->
<script>
  import { page } from "$app/stores";
  import { fade } from "svelte/transition";
  import { writable } from "svelte/store";
  import { browser } from "$app/environment";
  import * as apiService from "$lib/services/apiService";
  import { marked } from "marked";
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabase";
  import { enhance } from "$app/forms";

  export let data;
  let company = data?.company || null;
  let loading = false;
  let error = null;
  let showResearchModal = false;
  let researchLoading = false;
  let researchResult = "";
  let editedResearch = "";
  let fileInput;
  let uploadError = null;
  let uploadLoading = false;
  let uploadProgress = 0;
  let showPreviewModal = false;
  let previewFile = null;
  let showProspectModal = false;
  let showEditModal = false;
  let editingCompany = {
    name: "",
    website: "",
  };

  // New prospect form data
  let newProspect = {
    name: "",
    title: "",
    email: "",
    phone: "",
    notes: "",
  };

  // Tabs for different sections
  const tabs = [
    { id: "research", label: "Research" },
    { id: "annual-reports", label: "Annual Reports" },
    { id: "prospects", label: "Prospects" },
    { id: "cold-calling", label: "Cold Calling Guides" },
  ];

  let activeTab = "research";

  // Initialize activeTab based on URL parameter
  $: activeTab = $page.url.searchParams.get("tab") || "research";

  // Configure marked to sanitize HTML
  marked.setOptions({
    sanitize: true,
    breaks: true,
  });

  // Function to safely render markdown
  function renderMarkdown(content) {
    try {
      return marked(content);
    } catch (e) {
      console.error("Markdown parsing error:", e);
      return content;
    }
  }

  async function handleAIResearch() {
    if (!company?.name || !company?.website) {
      error = "Company information is missing";
      return;
    }

    showResearchModal = true;
    researchLoading = true;
    error = null;

    try {
      // Generate research content
      const result = await apiService.generateCompanyResearch(
        company.name,
        company.website
      );

      // Save to database
      const { data, error: updateError } = await supabase
        .from("targetcompanies")
        .update({
          research_result: result,
        })
        .eq("id", company.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local state
      company = data;

      // Update sessionStorage
      sessionStorage.setItem("selectedCompany", JSON.stringify(company));

      researchResult = result;
      editedResearch = result;
    } catch (err) {
      error = "Failed to generate AI research. Please try again.";
      console.error("AI Research failed:", err);
    } finally {
      researchLoading = false;
    }
  }

  async function saveResearch() {
    if (!company || !editedResearch) return;

    try {
      // Update research directly in targetcompanies
      const { data, error: updateError } = await supabase
        .from("targetcompanies")
        .update({
          research_result: editedResearch,
        })
        .eq("id", company.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local state
      company = data;

      // Update sessionStorage
      sessionStorage.setItem("selectedCompany", JSON.stringify(company));

      // Close modal
      closeResearchModal();
    } catch (err) {
      console.error("Error saving research:", err);
      error = err.message;
    }
  }

  function closeResearchModal() {
    showResearchModal = false;
    researchResult = "";
    editedResearch = "";
  }

  async function handleFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    uploadLoading = true;
    uploadError = null;
    uploadProgress = 0;

    try {
      // Read file content as text
      const text = await file.text();

      // Update company record with file content
      const { data, error: updateError } = await supabase
        .from("targetcompanies")
        .update({
          annual_report: text,
        })
        .eq("id", company.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local state
      company = data;

      // Update sessionStorage
      sessionStorage.setItem("selectedCompany", JSON.stringify(company));

      uploadProgress = 100;
    } catch (err) {
      uploadError = err.message;
    } finally {
      uploadLoading = false;
      if (fileInput) fileInput.value = "";
    }
  }

  function deleteReport(index) {
    company.annualReports = company.annualReports.filter((_, i) => i !== index);
    companiesStore.update((companies) => {
      const updatedCompanies = companies.map((c) =>
        c?.name?.toLowerCase() === company?.name?.toLowerCase() ? company : c
      );
      return updatedCompanies;
    });
  }

  function previewReport(report) {
    previewFile = report;
    showPreviewModal = true;
  }

  function openProspectModal() {
    showProspectModal = true;
    newProspect = {
      name: "",
      title: "",
      email: "",
      phone: "",
      notes: "",
    };
  }

  function closeProspectModal() {
    showProspectModal = false;
  }

  async function saveProspect() {
    if (!company || !newProspect.name) return;

    try {
      const prospect = {
        ...newProspect,
        id: crypto.randomUUID(),
        dateAdded: new Date().toISOString(),
      };

      const { data, error: updateError } = await supabase
        .from("targetcompanies")
        .update({
          prospects: [...(company.prospects || []), prospect],
        })
        .eq("id", company.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local state
      company = data;

      // Update sessionStorage
      sessionStorage.setItem("selectedCompany", JSON.stringify(company));

      closeProspectModal();
    } catch (err) {
      console.error("Error saving prospect:", err);
      error = err.message;
    }
  }

  function openEditModal() {
    editingCompany = {
      name: company.name,
      website: company.website,
    };
    showEditModal = true;
  }

  function closeEditModal() {
    showEditModal = false;
  }

  function saveCompanyEdit() {
    if (editingCompany.name && editingCompany.website) {
      company = {
        ...company,
        name: editingCompany.name,
        website: editingCompany.website,
      };

      companiesStore.update((companies) => {
        const updatedCompanies = companies.map((c) =>
          c?.name?.toLowerCase() === company?.name?.toLowerCase()
            ? { ...company }
            : c
        );
        return updatedCompanies;
      });

      closeEditModal();
    }
  }

  // Add these new variables
  let showEditProspectModal = false;
  let editingProspect = null;

  // Add these new functions
  function openEditProspectModal(prospect) {
    editingProspect = { ...prospect };
    showEditProspectModal = true;
  }

  function closeEditProspectModal() {
    showEditProspectModal = false;
    editingProspect = null;
  }

  function saveProspectEdit() {
    if (!editingProspect?.name) return;

    company.prospects = company.prospects.map((p) =>
      p.id === editingProspect.id ? { ...editingProspect } : p
    );

    companiesStore.update((companies) => {
      const updatedCompanies = companies.map((c) =>
        c?.name?.toLowerCase() === company?.name?.toLowerCase()
          ? { ...company }
          : c
      );
      return updatedCompanies;
    });

    closeEditProspectModal();
  }

  // Add these new variables
  let showColdCallModal = false;
  let selectedProspect = null;
  let selectedResearch = null;
  let selectedReport = null;

  function openColdCallModal() {
    showColdCallModal = true;
    selectedProspect = null;
    selectedResearch = null;
    selectedReport = null;
  }

  function closeColdCallModal() {
    showColdCallModal = false;
  }

  async function generateColdCall() {
    if (!company?.research_result) {
      error = "No research available to generate guide";
      return;
    }

    try {
      const guide = {
        id: crypto.randomUUID(),
        prospect: selectedProspect,
        content: `# Cold Calling Guide for ${selectedProspect.name}

## Research Summary
${company.research_result}

## Key Points
- Position: ${selectedProspect.title}
- Contact: ${selectedProspect.email} / ${selectedProspect.phone}

## Notes
${selectedProspect.notes}`,
        generated_at: new Date().toISOString(),
      };

      const { data, error: updateError } = await supabase
        .from("targetcompanies")
        .update({
          cold_calling_guides: [...(company.cold_calling_guides || []), guide],
        })
        .eq("id", company.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local state
      company = data;

      // Update sessionStorage
      sessionStorage.setItem("selectedCompany", JSON.stringify(company));

      closeColdCallModal();
    } catch (err) {
      console.error("Error generating cold call guide:", err);
      error = err.message;
    }
  }
</script>

<div class="max-w-7xl mx-auto p-6">
  {#if loading}
    <div class="flex justify-center items-center h-64">
      <div
        class="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-b-black"
      ></div>
    </div>
  {:else if error}
    <div class="text-center text-red-600 p-4">
      {error}
    </div>
  {:else if !company}
    <div class="text-center text-gray-600 p-4">Company not found</div>
  {:else}
    <!-- Company Header -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">{company.name}</h1>
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-600 hover:text-gray-900 transition-all duration-200 mt-2 inline-block"
          >
            {company.website}
          </a>
          <div class="flex gap-4 mt-4">
            <div class="flex items-center gap-2">
              <div
                class={`w-3 h-3 rounded-full ${
                  company.research_result ? "bg-green-500" : "bg-orange-500"
                } animate-pulse`}
              ></div>
              <span class="text-sm text-gray-600">Research</span>
            </div>
            <div class="flex items-center gap-2">
              <div
                class={`w-3 h-3 rounded-full ${
                  company.annual_report ? "bg-green-500" : "bg-orange-500"
                } animate-pulse`}
              ></div>
              <span class="text-sm text-gray-600">Annual Report</span>
            </div>
          </div>
        </div>
        <button
          on:click={openEditModal}
          class="p-2 text-gray-600 hover:text-gray-900 transition-all duration-200"
          title="Edit Company"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"
            />
            <path
              fill-rule="evenodd"
              d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-8">
        {#each tabs as tab}
          <button
            class="py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
              {activeTab === tab.id
              ? 'border-black text-black'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'}"
            on:click={() => (activeTab = tab.id)}
          >
            {tab.label}
          </button>
        {/each}
      </nav>
    </div>

    <!-- Tab Content -->
    <div class="bg-white rounded-lg shadow-md p-6">
      {#if activeTab === "research"}
        <div class="space-y-4">
          {#if company.research_result}
            <div class="border rounded-lg p-6 bg-white">
              <div class="markdown-content">
                {@html renderMarkdown(company.research_result)}
              </div>
            </div>
          {:else}
            <p class="text-gray-500">No research available.</p>
          {/if}
          <button
            on:click={handleAIResearch}
            class="mt-4 px-4 py-2 border border-gray-200 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
          >
            Do AI Research
          </button>
        </div>
      {:else if activeTab === "annual-reports"}
        <div class="space-y-4">
          {#if company.annual_report}
            <div class="border rounded-lg p-6 bg-white">
              <pre class="whitespace-pre-wrap">{company.annual_report}</pre>
            </div>
          {:else}
            <p class="text-gray-500">No annual report available.</p>
          {/if}

          <div class="mt-6">
            <input
              type="file"
              accept=".txt"
              bind:this={fileInput}
              on:change={handleFileUpload}
              class="hidden"
              id="annual-report-upload"
            />
            <label
              for="annual-report-upload"
              class="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-200 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              {uploadLoading ? "Uploading..." : "Upload Annual Report"}
            </label>

            {#if uploadLoading}
              <div class="mt-4 relative">
                <div class="bg-gray-200 rounded-full h-2.5">
                  <div
                    class="bg-black h-2.5 rounded-full transition-all duration-300"
                    style="width: {uploadProgress}%"
                  />
                </div>
                <p class="text-sm text-gray-600 mt-1">
                  Upload Progress: {uploadProgress}%
                </p>
              </div>
            {/if}

            {#if uploadError}
              <p class="text-red-500 mt-2">{uploadError}</p>
            {/if}
          </div>
        </div>
      {:else if activeTab === "prospects"}
        <div class="space-y-4">
          {#if company.prospects && company.prospects.length > 0}
            {#each company.prospects as prospect}
              <div class="border rounded p-4">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <h4 class="font-semibold">{prospect.name}</h4>
                    <p class="text-sm text-gray-500">
                      {prospect.title || "No title"}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm text-gray-600">{prospect.email}</p>
                    <p class="text-sm text-gray-600">{prospect.phone}</p>
                    <p class="text-xs text-gray-400">
                      Added: {new Date(prospect.dateAdded).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p class="text-gray-600 mt-2">{prospect.notes || "No notes"}</p>
              </div>
            {/each}
          {:else}
            <p class="text-gray-500">No prospects added yet.</p>
          {/if}
          <button
            on:click={openProspectModal}
            class="mt-4 px-4 py-2 border border-gray-200 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-all duration-200"
          >
            Add Prospect
          </button>
        </div>
      {:else if activeTab === "cold-calling"}
        <div class="space-y-4">
          {#if company.cold_calling_guides && company.cold_calling_guides.length > 0}
            {#each company.cold_calling_guides as guide}
              <div class="border rounded p-4">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <h4 class="font-semibold">{guide.prospect.name}</h4>
                    <p class="text-sm text-gray-500">
                      Generated: {new Date(
                        guide.generated_at
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div class="markdown-content mt-4">
                  {@html renderMarkdown(guide.content)}
                </div>
              </div>
            {/each}
          {:else}
            <p class="text-gray-500">No cold calling guides available.</p>
          {/if}
          <button
            on:click={openColdCallModal}
            class="mt-4 px-4 py-2 border border-gray-200 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-all duration-200"
          >
            Generate Cold Calling Guide
          </button>
        </div>
      {/if}
    </div>
  {/if}

  {#if showResearchModal}
    <div
      class="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center"
      transition:fade={{ duration: 200 }}
      on:click|self={closeResearchModal}
    >
      <div
        class="bg-white p-6 rounded-lg w-full max-w-4xl mx-4 shadow-xl min-h-[80vh] flex flex-col"
        on:click|stopPropagation
      >
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-xl font-semibold">AI Research Results</h2>
          <button
            class="text-gray-500 hover:text-gray-700"
            on:click={closeResearchModal}
          >
            âœ•
          </button>
        </div>

        {#if researchLoading}
          <div class="flex flex-col items-center justify-center py-12">
            <div
              class="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-b-black mb-4"
            ></div>
            <p class="text-gray-600">Generating AI Research...</p>
          </div>
        {:else if error}
          <div class="text-red-600 p-4 text-center">
            {error}
          </div>
        {:else}
          <form
            method="POST"
            use:enhance={() => {
              return async ({ result }) => {
                if (result.type === "success") {
                  closeResearchModal();
                }
              };
            }}
          >
            <input type="hidden" name="action" value="updateResearch" />
            <textarea
              name="content"
              bind:value={editedResearch}
              class="w-full flex-grow p-4 border border-gray-200 rounded-lg mb-4 focus:outline-none focus:border-black focus:ring-1 focus:ring-black resize-none transition-all duration-200"
              placeholder="AI research results will appear here..."
            ></textarea>
            <div class="flex justify-end gap-3">
              <button
                type="button"
                class="px-4 py-2 border border-gray-200 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-all duration-200"
                on:click={closeResearchModal}
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200"
              >
                Save Research
              </button>
            </div>
          </form>
        {/if}
      </div>
    </div>
  {/if}

  {#if showPreviewModal}
    <div
      class="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center"
      transition:fade={{ duration: 200 }}
      on:click|self={() => (showPreviewModal = false)}
    >
      <div
        class="bg-white p-6 rounded-lg w-full max-w-4xl mx-4 shadow-xl max-h-[90vh] overflow-auto"
        on:click|stopPropagation
      >
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-xl font-semibold">
            Preview: {previewFile?.fileName}
          </h2>
          <button
            class="text-gray-500 hover:text-gray-700"
            on:click={() => (showPreviewModal = false)}
          >
            âœ•
          </button>
        </div>
        <div class="mt-4">
          {#if previewFile?.type.includes("pdf")}
            <iframe
              src={previewFile?.url}
              title={previewFile?.fileName}
              class="w-full h-[75vh]"
            ></iframe>
          {:else}
            <div class="text-center text-gray-600">
              Preview not available for this file type
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  {#if showProspectModal}
    <div
      class="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center"
      transition:fade={{ duration: 200 }}
      on:click|self={closeProspectModal}
    >
      <div
        class="bg-white p-6 rounded-lg w-full max-w-4xl mx-4 shadow-xl min-h-[80vh] flex flex-col"
        on:click|stopPropagation
      >
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-xl font-semibold">Add New Prospect</h2>
          <button
            class="text-gray-500 hover:text-gray-700"
            on:click={closeProspectModal}
          >
            âœ•
          </button>
        </div>

        <div class="flex-grow space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700"
              >Name</label
            >
            <input
              type="text"
              id="name"
              bind:value={newProspect.name}
              class="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-1 focus:ring-black p-2 transition-all duration-200"
            />
          </div>

          <div>
            <label for="title" class="block text-sm font-medium text-gray-700"
              >Title</label
            >
            <input
              type="text"
              id="title"
              bind:value={newProspect.title}
              class="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-1 focus:ring-black p-2 transition-all duration-200"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700"
              >Email</label
            >
            <input
              type="email"
              id="email"
              bind:value={newProspect.email}
              class="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-1 focus:ring-black p-2 transition-all duration-200"
            />
          </div>

          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700"
              >Phone</label
            >
            <input
              type="tel"
              id="phone"
              bind:value={newProspect.phone}
              class="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-1 focus:ring-black p-2 transition-all duration-200"
            />
          </div>

          <div>
            <label for="notes" class="block text-sm font-medium text-gray-700"
              >Notes</label
            >
            <textarea
              id="notes"
              bind:value={newProspect.notes}
              rows="3"
              class="w-full flex-grow p-4 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black resize-none transition-all duration-200"
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button
            class="px-4 py-2 border border-gray-200 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-all duration-200"
            on:click={closeProspectModal}
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200"
            on:click={saveProspect}
          >
            Save Prospect
          </button>
        </div>
      </div>
    </div>
  {/if}

  {#if showEditModal}
    <div
      class="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center"
      transition:fade={{ duration: 200 }}
      on:click|self={closeEditModal}
    >
      <div
        class="bg-white p-6 rounded-lg w-full max-w-md mx-4 shadow-xl"
        on:click|stopPropagation
      >
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-xl font-semibold">Edit Company</h2>
          <button
            class="text-gray-500 hover:text-gray-700"
            on:click={closeEditModal}
          >
            âœ•
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label
              for="editName"
              class="block text-sm font-medium text-gray-700"
              >Company Name</label
            >
            <input
              type="text"
              id="editName"
              bind:value={editingCompany.name}
              class="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-1 focus:ring-black p-2 transition-all duration-200"
            />
          </div>

          <div>
            <label
              for="editWebsite"
              class="block text-sm font-medium text-gray-700">Website</label
            >
            <input
              type="text"
              id="editWebsite"
              bind:value={editingCompany.website}
              class="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-1 focus:ring-black p-2 transition-all duration-200"
            />
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button
              class="px-4 py-2 border border-gray-200 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-all duration-200"
              on:click={closeEditModal}
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200"
              on:click={saveCompanyEdit}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  {#if showEditProspectModal}
    <div
      class="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center"
      transition:fade={{ duration: 200 }}
      on:click|self={closeEditProspectModal}
    >
      <div
        class="bg-white p-6 rounded-lg w-full max-w-md mx-4 shadow-xl"
        on:click|stopPropagation
      >
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-xl font-semibold">Edit Prospect</h2>
          <button
            class="text-gray-500 hover:text-gray-700"
            on:click={closeEditProspectModal}
          >
            âœ•
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label
              for="editProspectName"
              class="block text-sm font-medium text-gray-700">Name</label
            >
            <input
              type="text"
              id="editProspectName"
              bind:value={editingProspect.name}
              class="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-1 focus:ring-black p-2 transition-all duration-200"
            />
          </div>

          <div>
            <label
              for="editProspectTitle"
              class="block text-sm font-medium text-gray-700">Title</label
            >
            <input
              type="text"
              id="editProspectTitle"
              bind:value={editingProspect.title}
              class="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-1 focus:ring-black p-2 transition-all duration-200"
            />
          </div>

          <div>
            <label
              for="editProspectEmail"
              class="block text-sm font-medium text-gray-700">Email</label
            >
            <input
              type="email"
              id="editProspectEmail"
              bind:value={editingProspect.email}
              class="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-1 focus:ring-black p-2 transition-all duration-200"
            />
          </div>

          <div>
            <label
              for="editProspectPhone"
              class="block text-sm font-medium text-gray-700">Phone</label
            >
            <input
              type="tel"
              id="editProspectPhone"
              bind:value={editingProspect.phone}
              class="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-1 focus:ring-black p-2 transition-all duration-200"
            />
          </div>

          <div>
            <label
              for="editProspectNotes"
              class="block text-sm font-medium text-gray-700">Notes</label
            >
            <textarea
              id="editProspectNotes"
              bind:value={editingProspect.notes}
              rows="3"
              class="w-full flex-grow p-4 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black resize-none transition-all duration-200"
            ></textarea>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button
              class="px-4 py-2 border border-gray-200 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-all duration-200"
              on:click={closeEditProspectModal}
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200"
              on:click={saveProspectEdit}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  {#if showColdCallModal}
    <div
      class="fixed inset-0 bg-black/70 backdrop-blur-md z-20 flex items-center justify-center"
      transition:fade={{ duration: 200 }}
      on:click|self={closeColdCallModal}
    >
      <div
        class="bg-white p-6 rounded-lg w-full max-w-2xl mx-4 shadow-xl"
        on:click|stopPropagation
      >
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-xl font-semibold">Generate Cold Calling Guide</h2>
          <button
            class="text-gray-500 hover:text-gray-700"
            on:click={closeColdCallModal}
          >
            âœ•
          </button>
        </div>

        <div class="space-y-6">
          <!-- AI Research Section -->
          <div class="border rounded-lg p-4">
            <h3 class="font-semibold mb-3">AI Research</h3>
            {#if company.prospectResearch && company.prospectResearch.length > 0}
              <div class="space-y-2">
                {#each company.prospectResearch as research}
                  <label
                    class="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-transparent hover:border-gray-200 transition-all duration-200 {selectedResearch ===
                    research
                      ? 'bg-gray-50 border-gray-200'
                      : ''}"
                  >
                    <div
                      class="relative flex items-center justify-center w-5 h-5 mt-0.5"
                    >
                      <input
                        type="radio"
                        name="research"
                        class="peer absolute opacity-0 w-5 h-5 cursor-pointer"
                        bind:group={selectedResearch}
                        value={research}
                      />
                      <div
                        class="w-5 h-5 border-2 border-gray-300 rounded peer-checked:border-black peer-checked:bg-black transition-all duration-200"
                      ></div>
                      <svg
                        class="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                    </div>
                    <div class="flex-grow">
                      <div class="font-medium">{research.title}</div>
                      <div class="text-sm text-gray-500">
                        Added: {new Date(research.date).toLocaleDateString()}
                      </div>
                    </div>
                  </label>
                {/each}
              </div>
            {:else}
              <div class="text-gray-500 mb-3">No AI research available.</div>
              <button
                on:click={handleAIResearch}
                class="px-3 py-1 text-sm border border-gray-200 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                Generate AI Research First
              </button>
            {/if}
          </div>

          <!-- Annual Reports Section -->
          <div class="border rounded-lg p-4">
            <h3 class="font-semibold mb-3">Annual Reports</h3>
            {#if company.annualReports && company.annualReports.length > 0}
              <div class="space-y-2">
                {#each company.annualReports as report}
                  <label
                    class="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-transparent hover:border-gray-200 transition-all duration-200 {selectedReport ===
                    report
                      ? 'bg-gray-50 border-gray-200'
                      : ''}"
                  >
                    <div
                      class="relative flex items-center justify-center w-5 h-5 mt-0.5"
                    >
                      <input
                        type="radio"
                        name="report"
                        class="peer absolute opacity-0 w-5 h-5 cursor-pointer"
                        bind:group={selectedReport}
                        value={report}
                      />
                      <div
                        class="w-5 h-5 border-2 border-gray-300 rounded peer-checked:border-black peer-checked:bg-black transition-all duration-200"
                      ></div>
                      <svg
                        class="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                    </div>
                    <div class="flex-grow">
                      <div class="font-medium">{report.fileName}</div>
                      <div class="text-sm text-gray-500">
                        Added: {new Date(report.dateAdded).toLocaleDateString()}
                      </div>
                    </div>
                  </label>
                {/each}
              </div>
            {:else}
              <div class="text-gray-500 mb-3">No annual reports available.</div>
              <label
                for="annual-report-upload"
                class="inline-flex px-3 py-1 text-sm border border-gray-200 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                on:click={() => {
                  closeColdCallModal();
                  activeTab = "annual-reports";
                  setTimeout(
                    () =>
                      document.getElementById("annual-report-upload").click(),
                    100
                  );
                }}
              >
                Upload Annual Report First
              </label>
            {/if}
          </div>

          <!-- Prospects Section -->
          <div class="border rounded-lg p-4">
            <h3 class="font-semibold mb-3">Select Prospect</h3>
            {#if company.prospects && company.prospects.length > 0}
              <div class="space-y-2">
                {#each company.prospects as prospect}
                  <label
                    class="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-transparent hover:border-gray-200 transition-all duration-200 {selectedProspect ===
                    prospect
                      ? 'bg-gray-50 border-gray-200'
                      : ''}"
                  >
                    <div
                      class="relative flex items-center justify-center w-5 h-5 mt-0.5"
                    >
                      <input
                        type="radio"
                        name="prospect"
                        class="peer absolute opacity-0 w-5 h-5 cursor-pointer"
                        bind:group={selectedProspect}
                        value={prospect}
                      />
                      <div
                        class="w-5 h-5 border-2 border-gray-300 rounded peer-checked:border-black peer-checked:bg-black transition-all duration-200"
                      ></div>
                      <svg
                        class="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                    </div>
                    <div class="flex-grow">
                      <div class="font-medium">{prospect.name}</div>
                      <div class="text-sm text-gray-500">{prospect.title}</div>
                      <div class="text-sm text-gray-500 mt-1">
                        {prospect.email} â€¢ {prospect.phone}
                      </div>
                    </div>
                  </label>
                {/each}
              </div>
            {:else}
              <div class="text-gray-500 mb-3">No prospects available.</div>
              <button
                on:click={openProspectModal}
                class="px-3 py-1 text-sm border border-gray-200 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                Add Prospect First
              </button>
            {/if}
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end gap-3 mt-6">
            <button
              class="px-4 py-2 border border-gray-200 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-all duration-200"
              on:click={closeColdCallModal}
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              on:click={generateColdCall}
              disabled={!selectedProspect &&
                !selectedResearch &&
                !selectedReport}
            >
              Generate Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  :global(.markdown-content) {
    @apply space-y-4 text-gray-600;
  }

  :global(.markdown-content h1) {
    @apply text-2xl font-bold text-gray-900 mt-6 mb-4;
  }

  :global(.markdown-content h2) {
    @apply text-xl font-semibold text-gray-900 mt-5 mb-3;
  }

  :global(.markdown-content h3) {
    @apply text-lg font-semibold text-gray-900 mt-4 mb-2;
  }

  :global(.markdown-content p) {
    @apply leading-relaxed;
  }

  :global(.markdown-content ul) {
    @apply list-disc list-inside space-y-2 ml-4;
  }

  :global(.markdown-content ol) {
    @apply list-decimal list-inside space-y-2 ml-4;
  }

  :global(.markdown-content li) {
    @apply text-gray-600;
  }

  :global(.markdown-content a) {
    @apply text-gray-900 underline hover:text-gray-600 transition-colors duration-200;
  }

  :global(.markdown-content blockquote) {
    @apply pl-4 border-l-4 border-gray-200 italic text-gray-600;
  }

  :global(.markdown-content code) {
    @apply bg-gray-100 px-1 py-0.5 rounded font-mono text-sm;
  }

  :global(.markdown-content pre) {
    @apply bg-gray-100 p-4 rounded-lg overflow-x-auto;
  }

  :global(.markdown-content pre code) {
    @apply bg-transparent p-0;
  }

  :global(.markdown-content table) {
    @apply w-full border-collapse;
  }

  :global(.markdown-content th) {
    @apply border border-gray-200 px-4 py-2 bg-gray-50 text-left font-semibold;
  }

  :global(.markdown-content td) {
    @apply border border-gray-200 px-4 py-2;
  }

  :global(.markdown-content img) {
    @apply max-w-full rounded-lg;
  }

  :global(.markdown-content hr) {
    @apply my-8 border-gray-200;
  }
</style>
