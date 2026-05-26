<script>
  let { data } = $props();
</script>

<svelte:head>
  <title>Ankit Yadav</title>
</svelte:head>

<div class="home-container">
  <div class="hero-card">
    <h1 class="name-title">Ankit Yadav</h1>
    <div class="nav-links">
      <a href="/projects" class="nav-link">projects</a>
      <span class="divider">/</span>
      <a href="/blog" class="nav-link">blog</a>
    </div>
  </div>
</div>

<style>
  .home-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 55vh;
    padding: 2rem;
  }

  .hero-card {
    text-align: center;
    animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .name-title {
    font-size: 2.75rem;
    font-weight: 700;
    letter-spacing: -0.04em;
    color: var(--text);
    margin-bottom: 1rem;
    background: linear-gradient(
      135deg,
      var(--text) 30%,
      var(--text-secondary) 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .nav-links {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.25rem;
  }

  .nav-link {
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--text-secondary);
    text-decoration: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    padding: 0.2rem 0;
  }

  .nav-link::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: var(--link);
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .nav-link:hover {
    color: var(--text);
  }

  .nav-link:hover::after {
    transform: scaleX(1);
    transform-origin: left;
  }

  .divider {
    color: var(--text-muted);
    font-size: 0.85rem;
    opacity: 0.4;
    user-select: none;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
