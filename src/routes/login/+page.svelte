<!-- @format -->
<script>
  import { supabase } from "$lib/supabase";
  import { goto } from "$app/navigation";
  import { user } from "$lib/stores/authStore";
  import { fade } from "svelte/transition";

  let username = "";

  let password = "";
  let loading = false;
  let error = "";

  async function handleLogin() {
    let email = username + "@salesspaice.com";
    try {
      loading = true;
      error = "";

      const { data, error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (err) throw err;

      if (data?.user) {
        goto("/");
      }
    } catch (err) {
      error =
        err && typeof err === "object" && "message" in err
          ? err.message
          : "An unexpected error occurred";
    } finally {
      loading = false;
    }
  }

  async function handleSignInWithGoogle() {
    try {
      loading = true;
      error = "";

      const { data, error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });

      if (err) throw err;
    } catch (err) {
      error =
        err && typeof err === "object" && "message" in err
          ? err.message
          : "An unexpected error occurred";
    } finally {
      loading = false;
    }
  }
</script>

<div
  class="min-h-screen flex flex-col items-center justify-center bg-white px-4"
  in:fade
>
  <div class="w-full max-w-sm space-y-8">
    <div class="text-center">
      <h2 class="text-2xl font-semibold tracking-tight">Welcome back</h2>
      <p class="mt-2 text-sm text-gray-500">
        Sign in to your account to continue
      </p>
    </div>

    <form
      class="space-y-4"
      on:submit|preventDefault={handleLogin}
      method="POST"
      autocomplete="off"
    >
      {#if error}
        <div
          class="p-3 text-sm border rounded-lg bg-red-50 border-red-100 text-red-600"
        >
          {error}
        </div>
      {/if}

      <div class="space-y-4">
        <div>
          <label
            for="username"
            class="block text-sm font-medium text-gray-700 mb-1">Username</label
          >
          <input
            id="username"
            name="username"
            type="text"
            required
            bind:value={username}
            class="input"
            placeholder="rick123"
          />
        </div>

        <div>
          <label
            for="password"
            class="block text-sm font-medium text-gray-700 mb-1">Password</label
          >
          <input
            id="password"
            name="password"
            type="password"
            required
            bind:value={password}
            class="input"
            placeholder="Enter your password"
            autocomplete="new-password"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        class="btn btn-primary w-full flex items-center justify-center relative"
      >
        {#if loading}
          <div
            class="absolute left-4 h-5 w-5 animate-spin rounded-full border-2 border-white border-r-transparent"
          />
        {/if}
        Sign in
      </button>
    </form>
  </div>
</div>
