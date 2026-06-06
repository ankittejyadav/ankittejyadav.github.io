---
pushedAt: "2026-05-28T02:12:16Z"
---
# 🚀 Calendar Sync

> *A premium, high-performance social calendar aggregator built with SvelteKit 2 and Svelte 5.*

## 🌟 Architecture & Overview
**Calendar Sync** is a sophisticated event management platform that consolidates fragmented social event feeds (Luma, Partiful, Meetup) into a single, high-performance dashboard. It solves the "calendar sprawl" problem by providing a unified, reactive interface for both personal schedules and social coordination.

The system is designed with a **persistence-first caching layer** using Neon Serverless Postgres, ensuring that even with multiple heavy external iCal feeds, the user experience remains instantaneous and fluid.

## 💻 Technical Stack & Proficiencies Showcase

### Backend & Core Systems
- **Framework:** SvelteKit 2 (Server-side rendering, Edge-ready loaders)
- **Language:** TypeScript (Strict type safety across the full stack)
- **Sync Logic:** Robust server-side background sync workers using `node-ical`
- **Security:** AES-256-GCM authenticated encryption for sensitive external feed URLs

### Frontend Engineering
- **Reactive Engine:** Svelte 5 (Leveraging **Runes** like `$state` and `$derived` for peak performance)
- **Calendar UI:** Integration with [Schedule-X](https://schedule-x.dev/) for a modern, accessible calendar experience
- **Styling:** Custom Vanilla CSS Design System featuring glassmorphism and micro-animations

### Databases & Caching
- **Relational (SQL):** Neon Serverless Postgres
- **ORM:** Drizzle ORM (Type-safe migrations and relational queries)
- **Data Modeling:** Complex social graph modeling for bilateral friendship and granular sharing permissions

## ⚙️ Engineering Best Practices
- **Security First:** End-to-end encryption for third-party tokens and strict server-side boundary isolation (`.server.ts`).
- **Data Integrity:** Normalization of disparate iCal data formats into a unified internal schema.
- **Privacy:** Bilateral sharing controls allowing users to selectively share specific event providers with specific friends.

## 📈 Scalability & Performance
- **Database Optimization:** Efficient indexing on event start times and external UIDs to support rapid dashboard rendering.
- **Efficient Reactivity:** Utilizing Svelte 5's fine-grained reactivity to handle dense event grids without UI lag.
- **Hybrid Persistence:** Combining real-time feed fetching with a durable database cache to mitigate external API latency.

## 🚀 Getting Started
```bash
# Clone the repository
git clone https://github.com/ankittejyadav/calendar_sync.git

# Navigate into the project
cd calendar_sync

# Install dependencies
npm install

# Setup database
npm run db:generate
npm run db:migrate

# Run the development server
npm run dev
```

## 🔗 Project Links
- [Live Deployment / Demo](#)
- [System Architecture Diagram](./docs/ARCHITECTURE.md)
- [Product Plan](./docs/PRODUCT_PLAN.md)

---
*This repository represents a sample of my technical capabilities. For a complete overview of my engineering portfolio, visit my [GitHub Profile](https://github.com/ankittejyadav).*
