<script>
  import '../app.css';
  let { children } = $props();
  let dark = $state(false);

  function toggle() {
    dark = !dark;
    document.documentElement.classList.toggle('dark', dark);
  }
</script>

<div style="max-width: 640px; margin: 0 auto; padding: 2.5rem 1.5rem;">
  <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem;">
    <a href="/" style="font-weight: 600; color: var(--text); font-size: 0.95rem;">Ankit Yadav</a>
    <nav style="display: flex; align-items: center; gap: 1.25rem;">
      <a href="/blog" style="color: var(--text-muted); font-size: 0.85rem;">blog</a>
      <button onclick={toggle} style="background: none; border: 1px solid var(--border); border-radius: 6px; padding: 0.3rem 0.6rem; cursor: pointer; color: var(--text-muted); font-size: 0.75rem; transition: border-color 0.2s;">
        {dark ? '☀' : '☾'}
      </button>
    </nav>
  </header>

  <main>
    {@render children()}
  </main>

  <footer style="margin-top: 4rem; padding-top: 1.5rem; border-top: 1px solid var(--border); font-size: 0.75rem; color: var(--text-muted); display: flex; justify-content: space-between;">
    <span>© {new Date().getFullYear()}</span>
    <div style="display: flex; gap: 1rem;">
      <a href="https://github.com/ankittejyadav" target="_blank" rel="noopener noreferrer" style="color: var(--text-muted);">GitHub</a>
      <a href="https://linkedin.com/in/ankittejyadav" target="_blank" rel="noopener noreferrer" style="color: var(--text-muted);">LinkedIn</a>
    </div>
  </footer>
</div>
