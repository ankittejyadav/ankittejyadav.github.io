<script>
  import "../app.css";
  import { page } from "$app/stores";
  import { onMount } from "svelte";

  let { children } = $props();
  let dark = $state(false);

  onMount(() => {
    dark = document.documentElement.classList.contains("dark");
  });

  function toggle() {
    dark = !dark;
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
  }
</script>

<div class="layout-container">
  <header>
    {#if $page.url.pathname !== "/"}
      <a href="/" class="logo">Ankit Yadav</a>
      <nav>
        <a href="/projects">projects</a>
        <a href="/blog">blog</a>
        <button onclick={toggle} aria-label="Toggle theme">
          {dark ? "☀" : "☾"}
        </button>
      </nav>
    {:else}
      <div class="spacer"></div>
      <button onclick={toggle} aria-label="Toggle theme">
        {dark ? "☀" : "☾"}
      </button>
    {/if}
  </header>

  <main>
    {@render children()}
  </main>

  {#if $page.url.pathname !== "/"}
    <footer>
      <span>© {new Date().getFullYear()}</span>
      <div class="footer-links">
        <a href="https://github.com/ankittejyadav" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="https://linkedin.com/in/ankittejyadav" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      </div>
    </footer>
  {/if}
</div>

<style>
  .layout-container {
    max-width: 640px;
    margin: 0 auto;
    padding: 2.5rem 1.5rem;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 3rem;
  }

  .logo {
    font-weight: 600;
    color: var(--text);
    font-size: 0.95rem;
  }

  nav {
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }

  nav a {
    color: var(--text-muted);
    font-size: 0.85rem;
  }

  button {
    background: none;
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0.3rem 0.6rem;
    cursor: pointer;
    color: var(--text-muted);
    font-size: 0.75rem;
    transition: border-color 0.2s, color 0.2s;
  }

  button:hover {
    border-color: var(--text-muted);
    color: var(--text);
  }

  .spacer {
    flex-grow: 1;
  }

  footer {
    margin-top: 4rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border);
    font-size: 0.75rem;
    color: var(--text-muted);
    display: flex;
    justify-content: space-between;
  }

  .footer-links {
    display: flex;
    gap: 1rem;
  }

  .footer-links a {
    color: var(--text-muted);
  }
  
  .footer-links a:hover {
    color: var(--text);
  }
</style>
